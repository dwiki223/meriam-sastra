import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_WORLD,
  MAX_SHOT_POWER,
  MIN_SHOT_POWER,
  PLAYER_PALETTE,
  QuizDeck,
  WORMS_CHARGE_DURATION_MS,
  applyExplosionDamage,
  applyPowerUpToTank,
  carveCrater,
  checkCratePickupByTanks,
  computeWormsCharge,
  createProjectilesFromTank,
  createTanks,
  findNextAliveTankIndex,
  generateTerrain,
  getTerrainY,
  isAboveWater,
  moveTank,
  stepProjectile,
  stepTankGravity,
} from './physics';
import { QUIZ_QUESTIONS } from '../data/questions';
import type { PlayerConfig, PowerUpCrate } from '../types/game';

function makePlayers(count: number): PlayerConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Pemain ${i + 1}`,
    color: PLAYER_PALETTE[i].color,
    accentColor: PLAYER_PALETTE[i].accent,
    shapeId: PLAYER_PALETTE[i].shapeId,
    modelName: PLAYER_PALETTE[i].modelName,
    isBot: false,
  }));
}

test('supports up to 6 players with distinct tank shapes, expansive 6000px random terrain, and 3 lives each', () => {
  assert.ok(DEFAULT_WORLD.width >= 6000, 'Terrain should be very expansive (>= 6000px)');
  assert.equal(DEFAULT_WORLD.maxHp, 3, 'Each tank should start with 3 lives');

  const terrainA = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, 42, DEFAULT_WORLD.waterLevelY);
  const terrainB = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, 913, DEFAULT_WORLD.waterLevelY);

  // Random seeds should produce genuinely different terrains
  let heightDiffSum = 0;
  for (let x = 200; x < DEFAULT_WORLD.width - 200; x += 50) {
    heightDiffSum += Math.abs(terrainA.heights[x] - terrainB.heights[x]);
  }
  assert.ok(heightDiffSum > 1500, `Expected distinct random terrains across seeds, got diffSum=${heightDiffSum}`);

  const tanks = createTanks(makePlayers(6), terrainA.heights, DEFAULT_WORLD, 42);
  assert.equal(tanks.length, 6);

  const shapeIds = new Set(tanks.map((t) => t.shapeId));
  assert.equal(shapeIds.size, 6, 'All 6 tanks should have distinct shapeIds');

  // Verify broad landmass above water (> 3200px total landmass across 6000px)
  let aboveWaterColumns = 0;
  for (let x = 0; x < terrainA.heights.length; x++) {
    if (terrainA.heights[x] < DEFAULT_WORLD.waterLevelY) aboveWaterColumns++;
  }
  assert.ok(aboveWaterColumns >= 3200, `Expected wide random terrain (>=3200px land), got ${aboveWaterColumns}`);

  for (let i = 0; i < tanks.length; i++) {
    assert.equal(tanks[i].hp, 3);
    assert.equal(tanks[i].maxHp, 3);
    assert.equal(tanks[i].alive, true);
    assert.ok(isAboveWater(terrainA.heights, tanks[i].x, DEFAULT_WORLD.waterLevelY), `Tank ${i + 1} should spawn above water`);
    if (i > 0) {
      assert.ok(tanks[i].x - tanks[i - 1].x >= 200, `Tanks ${i} and ${i + 1} should not overlap`);
    }
  }
});

test('Worms Armageddon charge ramps monotonically from min to 100% and triggers max auto-fire', () => {
  const start = computeWormsCharge(0);
  assert.equal(start.power, MIN_SHOT_POWER);
  assert.equal(start.maxedOut, false);

  const mid = computeWormsCharge(WORMS_CHARGE_DURATION_MS / 2);
  assert.ok(mid.power > 45 && mid.power < 60, `Expected mid charge ~52.5%, got ${mid.power}`);
  assert.equal(mid.maxedOut, false);

  const full = computeWormsCharge(WORMS_CHARGE_DURATION_MS);
  assert.equal(full.power, MAX_SHOT_POWER);
  assert.equal(full.maxedOut, true);

  const over = computeWormsCharge(WORMS_CHARGE_DURATION_MS + 400);
  assert.equal(over.power, MAX_SHOT_POWER, 'Should clamp at 100% rather than bouncing down');
  assert.equal(over.maxedOut, true);
});

test('higher charged power launches projectiles dramatically farther and records lastPower', () => {
  const { heights } = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, 11, DEFAULT_WORLD.waterLevelY);
  const tanks = createTanks(makePlayers(2), heights, DEFAULT_WORLD, 11);
  const lowTank = { ...tanks[0], barrelAngle: 45, power: 20, stats: { ...tanks[0].stats } };
  const highTank = { ...tanks[0], barrelAngle: 45, power: 95, stats: { ...tanks[0].stats } };

  const [lowProj] = createProjectilesFromTank(lowTank, { current: 1 });
  const [highProj] = createProjectilesFromTank(highTank, { current: 1 });
  assert.equal(lowTank.lastPower, 20);
  assert.equal(highTank.lastPower, 95);

  for (let i = 0; i < 50; i++) {
    stepProjectile(lowProj, 0, 0.03, DEFAULT_WORLD);
    stepProjectile(highProj, 0, 0.03, DEFAULT_WORLD);
  }
  assert.ok(highProj.x - lowProj.x > 1000, 'High charge power should travel much farther than low charge');
});

test('tanks can share the same continuous landmass without forced island separation', () => {
  // Seed 42 or scan seeds until we find a continuous landmass seed, verifying tanks share landmass cleanly
  let continuousSeed = -1;
  for (let s = 1; s < 50; s++) {
    const t = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, s, DEFAULT_WORLD.waterLevelY);
    let underwaterMid = 0;
    for (let x = 800; x <= DEFAULT_WORLD.width - 800; x += 20) {
      if (t.heights[x] >= DEFAULT_WORLD.waterLevelY) underwaterMid++;
    }
    if (underwaterMid === 0) {
      continuousSeed = s;
      break;
    }
  }
  assert.ok(continuousSeed !== -1, 'Generator should produce continuous wide continent terrains on some seeds');

  const { heights } = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, continuousSeed, DEFAULT_WORLD.waterLevelY);
  const tanks = createTanks(makePlayers(4), heights, DEFAULT_WORLD, continuousSeed);
  for (let i = 1; i < tanks.length; i++) {
    let dipsUnderwater = false;
    for (let x = Math.round(tanks[i - 1].x); x <= Math.round(tanks[i].x); x += 10) {
      if (heights[x] >= DEFAULT_WORLD.waterLevelY) {
        dipsUnderwater = true;
        break;
      }
    }
    assert.equal(dipsUnderwater, false, 'Tanks on continuous terrain share connected landmass without water gap');
  }
});

test('carveCrater destroys terrain surface downward and can sink tank into ocean', () => {
  const { heights, scorch } = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, 10, DEFAULT_WORLD.waterLevelY);
  const tanks = createTanks(makePlayers(2), heights, DEFAULT_WORLD, 10);
  const t1 = tanks[0];
  const beforeY = getTerrainY(heights, t1.x);

  carveCrater(heights, scorch, t1.x, beforeY, 45, DEFAULT_WORLD.height);
  const afterY = getTerrainY(heights, t1.x);
  assert.ok(afterY > beforeY, `Expected terrain Y to increase (lower surface), got ${beforeY} -> ${afterY}`);
  assert.ok(scorch[Math.round(t1.x)] > 0.5, 'Crater center should be scorched');

  // Deep crater below water level sinks the tank
  carveCrater(heights, scorch, t1.x, DEFAULT_WORLD.waterLevelY + 30, 80, DEFAULT_WORLD.height);
  const drowned = stepTankGravity(t1, 1.0, heights, DEFAULT_WORLD);
  assert.equal(drowned, true);
  assert.equal(t1.alive, false);
  assert.equal(t1.hp, 0);
});

test('wind shifts projectile horizontal trajectory', () => {
  const { heights } = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, 5, DEFAULT_WORLD.waterLevelY);
  const tanks = createTanks(makePlayers(2), heights, DEFAULT_WORLD, 5);
  tanks[0].barrelAngle = 60;
  tanks[0].power = 70;

  const idA = { current: 1 };
  const [projPosWind] = createProjectilesFromTank({ ...tanks[0], stats: { ...tanks[0].stats } }, idA);
  const idB = { current: 1 };
  const [projNegWind] = createProjectilesFromTank({ ...tanks[0], stats: { ...tanks[0].stats } }, idB);

  for (let i = 0; i < 40; i++) {
    stepProjectile(projPosWind, 10, 0.02, DEFAULT_WORLD);
    stepProjectile(projNegWind, -10, 0.02, DEFAULT_WORLD);
  }

  assert.ok(
    projPosWind.x > projNegWind.x + 25,
    `Positive wind (${projPosWind.x}) should carry shell farther right than negative wind (${projNegWind.x})`
  );
});

test('power-ups apply heal (capped at 3), shield absorption, heavy 2x damage, and triple shot', () => {
  const { heights } = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, 7, DEFAULT_WORLD.waterLevelY);
  const tanks = createTanks(makePlayers(2), heights, DEFAULT_WORLD, 7);
  const [t1, t2] = tanks;

  applyExplosionDamage(t1.x, t1.y - 12, 40, 2, [t1], t1.id);
  assert.equal(t1.hp, 1);

  applyPowerUpToTank(t1, 'heal');
  assert.equal(t1.hp, 2);
  applyPowerUpToTank(t1, 'heal');
  applyPowerUpToTank(t1, 'heal');
  assert.equal(t1.hp, 3);

  applyPowerUpToTank(t1, 'shield');
  assert.equal(t1.hasShield, true);
  const shieldEvents = applyExplosionDamage(t1.x, t1.y - 12, 40, 2, [t1], t1.id);
  assert.equal(shieldEvents[0].shieldBroken, true);
  assert.equal(t1.hp, 3);
  assert.equal(t1.hasShield, false);

  applyPowerUpToTank(t2, 'heavy');
  const idRef = { current: 1 };
  const heavyProjs = createProjectilesFromTank(t2, idRef);
  assert.equal(heavyProjs.length, 1);
  assert.equal(heavyProjs[0].damage, 2);

  applyPowerUpToTank(t2, 'triple');
  const tripleProjs = createProjectilesFromTank(t2, idRef);
  assert.equal(tripleProjs.length, 3);
});

test('tank driving over landed crate picks up power-up', () => {
  const { heights } = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, 9, DEFAULT_WORLD.waterLevelY);
  const tanks = createTanks(makePlayers(2), heights, DEFAULT_WORLD, 9);
  const t1 = tanks[0];
  const crate: PowerUpCrate = {
    id: 99,
    type: 'shield',
    x: t1.x + 12,
    y: getTerrainY(heights, t1.x + 12),
    vy: 0,
    landed: true,
    swayPhase: 0,
    collected: false,
  };

  moveTank(t1, 1, 0.1, heights, tanks, DEFAULT_WORLD);
  const pickups = checkCratePickupByTanks([crate], tanks);
  assert.equal(pickups.length, 1);
  assert.equal(t1.hasShield, true);
  assert.equal(crate.collected, true);
});

test('turn rotation skips eliminated tanks', () => {
  const { heights } = generateTerrain(DEFAULT_WORLD.width, DEFAULT_WORLD.height, 3, DEFAULT_WORLD.waterLevelY);
  const tanks = createTanks(makePlayers(3), heights, DEFAULT_WORLD, 3);
  tanks[1].alive = false;
  assert.equal(findNextAliveTankIndex(tanks, 0), 2);
  assert.equal(findNextAliveTankIndex(tanks, 2), 0);
});

test('QuizDeck draws all 60 questions without repetition before reshuffling', () => {
  const deck = new QuizDeck(QUIZ_QUESTIONS, 'Campuran');
  const seen = new Set<number>();
  for (let i = 0; i < 60; i++) {
    const { question } = deck.draw();
    seen.add(question.id);
  }
  assert.equal(seen.size, 60);
});
