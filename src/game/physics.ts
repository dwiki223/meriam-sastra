import type {
  DifficultyFilter,
  PlayerConfig,
  PowerUpCrate,
  PowerUpType,
  Projectile,
  QuizQuestion,
  Tank,
  TankShapeId,
  WorldConfig,
} from '../types/game';

export const DEFAULT_WORLD: WorldConfig = {
  width: 6000,
  height: 920,
  waterLevelY: 775,
  gravity: 440,
  maxHp: 3,
  turnSeconds: 10,
  quizSeconds: 10,
};

export const WIND_ACCEL_SCALE = 15; // px/s^2 per wind unit
export const TANK_MOVE_SPEED = 165; // px/s
export const TANK_RADIUS_X = 24;
export const TANK_RADIUS_Y = 16;
export const BARREL_LENGTH = 32;
export const MIN_SHOT_POWER = 5;
export const MAX_SHOT_POWER = 100;
export const WORMS_CHARGE_DURATION_MS = 1500;
export const BASE_SHOT_SPEED = 175;
export const POWER_SPEED_SCALE = 14.4; // 5% -> 247 px/s (~138px lob); 100% -> 1615 px/s (~5928px across 6000px terrain)

export function computeWormsCharge(elapsedMs: number): {
  power: number;
  ratio: number;
  maxedOut: boolean;
} {
  const safeMs = Math.max(0, elapsedMs);
  const ratio = clamp(safeMs / WORMS_CHARGE_DURATION_MS, 0, 1);
  const power = MIN_SHOT_POWER + ratio * (MAX_SHOT_POWER - MIN_SHOT_POWER);
  return {
    power,
    ratio,
    maxedOut: safeMs >= WORMS_CHARGE_DURATION_MS,
  };
}

export const PLAYER_PALETTE: Array<{
  color: string;
  accent: string;
  defaultName: string;
  shapeId: TankShapeId;
  modelName: string;
}> = [
  { color: '#DC2626', accent: '#FCA5A5', defaultName: 'Merah', shapeId: 0, modelName: 'Banteng' },
  { color: '#2563EB', accent: '#93C5FD', defaultName: 'Biru', shapeId: 1, modelName: 'Elang' },
  { color: '#D97706', accent: '#FCD34D', defaultName: 'Emas', shapeId: 2, modelName: 'Badak' },
  { color: '#059669', accent: '#6EE7B7', defaultName: 'Zamrud', shapeId: 3, modelName: 'Garuda' },
  { color: '#7C3AED', accent: '#C4B5FD', defaultName: 'Ungu', shapeId: 4, modelName: 'Komodo' },
  { color: '#0891B2', accent: '#67E8F9', defaultName: 'Toska', shapeId: 5, modelName: 'Naga' },
];

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function createRng(seed: number): () => number {
  let s = Math.floor(Math.abs(seed) * 1000003) % 4294967296;
  if (s === 0) s = 0x6d2b79f5;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface TerrainResult {
  heights: Float32Array;
  scorch: Float32Array;
  landCenters: number[];
}

export function generateTerrain(
  width: number = DEFAULT_WORLD.width,
  height: number = DEFAULT_WORLD.height,
  seed: number = Math.random() * 10000,
  waterLevelY: number = DEFAULT_WORLD.waterLevelY
): TerrainResult {
  const rng = createRng(seed);
  const heights = new Float32Array(width);
  const scorch = new Float32Array(width);
  const seaFloorY = height - 42;
  const minSurfaceY = height * 0.22;

  // Randomize multi-octave harmonic waves for rolling hills, ridges, and rocky detail
  const macroWaves = Array.from({ length: 4 }, (_, idx) => ({
    freq: 0.0008 + idx * 0.0011 + rng() * 0.0009,
    amp: 28 + rng() * 44,
    phase: rng() * Math.PI * 2,
  }));
  const detailWaves = Array.from({ length: 4 }, (_, idx) => ({
    freq: 0.008 + idx * 0.013 + rng() * 0.007,
    amp: 6 + rng() * 12,
    phase: rng() * Math.PI * 2,
  }));

  // Stamp random landforms (alpine peaks, flat-top mesas, valleys/canyons)
  const featureCount = 7 + Math.floor(rng() * 6);
  const features: Array<{
    kind: 'peak' | 'mesa' | 'valley';
    cx: number;
    radius: number;
    deltaY: number; // negative raises elevation, positive carves valley
  }> = [];
  for (let i = 0; i < featureCount; i++) {
    const roll = rng();
    const kind = roll < 0.42 ? 'peak' : roll < 0.72 ? 'mesa' : 'valley';
    features.push({
      kind,
      cx: 180 + rng() * (width - 360),
      radius: 220 + rng() * 460,
      deltaY:
        kind === 'valley'
          ? 55 + rng() * 95
          : -(70 + rng() * 155),
    });
  }

  // Randomize occasional bays/straits (0 = giant continent, 1..2 = multi-landmass coastal channels)
  const channelRoll = rng();
  const channelCount = channelRoll < 0.35 ? 0 : channelRoll < 0.75 ? 1 : 2;
  const channels: Array<{ cx: number; halfW: number }> = [];
  for (let c = 0; c < channelCount; c++) {
    const minX = 750;
    const maxX = width - 750;
    let cx = minX + rng() * (maxX - minX);
    for (let retry = 0; retry < 8; retry++) {
      if (channels.every((existing) => Math.abs(existing.cx - cx) > 950)) break;
      cx = minX + rng() * (maxX - minX);
    }
    channels.push({
      cx,
      halfW: 115 + rng() * 135,
    });
  }

  const baseAltitudeAboveWater = 115 + rng() * 75;
  const baseElevationY = waterLevelY - baseAltitudeAboveWater;

  for (let x = 0; x < width; x++) {
    let y = baseElevationY;

    for (const w of macroWaves) {
      y += Math.sin(x * w.freq + w.phase) * w.amp;
    }
    for (const w of detailWaves) {
      y += Math.cos(x * w.freq + w.phase) * w.amp;
    }

    // Ridged crag texture
    const crag = (1 - Math.abs(Math.sin(x * 0.037 + macroWaves[0].phase))) * 12 - 6;
    y += crag;

    // Apply random peaks, mesas, and valleys
    for (const feat of features) {
      const dist = Math.abs(x - feat.cx);
      if (dist >= feat.radius) continue;
      const t = dist / feat.radius;
      if (feat.kind === 'mesa') {
        const flatMask = t < 0.45 ? 1 : Math.cos(((t - 0.45) / 0.55) * (Math.PI / 2));
        y += feat.deltaY * Math.pow(Math.max(0, flatMask), 0.75);
      } else {
        const bell = Math.exp(-Math.pow(t * 1.85, 2));
        y += feat.deltaY * bell;
      }
    }

    // Natural coastline taper at far world edges
    const edgeMargin = 140;
    if (x < edgeMargin) {
      const et = 1 - x / edgeMargin;
      y += et * et * 155;
    } else if (x > width - edgeMargin) {
      const et = 1 - (width - 1 - x) / edgeMargin;
      y += et * et * 155;
    }

    // Carve random ocean bays/straits if selected
    for (const ch of channels) {
      const dist = Math.abs(x - ch.cx);
      if (dist < ch.halfW) {
        const ct = Math.cos((dist / ch.halfW) * (Math.PI / 2));
        const depthBoost = Math.pow(ct, 0.72) * (seaFloorY - waterLevelY + 230);
        y += depthBoost;
      }
    }

    heights[x] = clamp(y, minSurfaceY, seaFloorY);
  }

  // Collect broad drivable land benches across the terrain for reference/minimap
  const landCenters: number[] = [];
  for (let x = 220; x < width - 220; x += 480) {
    if (heights[x] < waterLevelY - 32) {
      landCenters.push(x);
    }
  }

  return { heights, scorch, landCenters };
}

export function getTerrainY(heights: Float32Array, x: number): number {
  const ix = clamp(Math.round(x), 0, heights.length - 1);
  return heights[ix];
}

export function getTerrainSlope(heights: Float32Array, x: number): number {
  const x1 = clamp(Math.round(x - 10), 0, heights.length - 1);
  const x2 = clamp(Math.round(x + 10), 0, heights.length - 1);
  if (x2 === x1) return 0;
  return Math.atan2(heights[x2] - heights[x1], x2 - x1);
}

export function isAboveWater(heights: Float32Array, x: number, waterLevelY: number): boolean {
  return getTerrainY(heights, x) < waterLevelY - 8;
}

export function carveCrater(
  heights: Float32Array,
  scorch: Float32Array,
  cx: number,
  cy: number,
  radius: number,
  worldHeight: number = DEFAULT_WORLD.height
): void {
  const bedrockY = worldHeight - 36;
  const startX = Math.max(0, Math.floor(cx - radius));
  const endX = Math.min(heights.length - 1, Math.ceil(cx + radius));

  for (let x = startX; x <= endX; x++) {
    const dx = x - cx;
    const inside = radius * radius - dx * dx;
    if (inside <= 0) continue;
    const craterBottomY = cy + Math.sqrt(inside);
    if (craterBottomY > heights[x]) {
      heights[x] = Math.min(bedrockY, craterBottomY);
    }
    const edgeFactor = 1 - Math.abs(dx) / radius;
    scorch[x] = clamp(Math.max(scorch[x], 0.45 + edgeFactor * 0.55), 0, 1);
  }
}

export function createTanks(
  players: PlayerConfig[],
  heights: Float32Array,
  world: WorldConfig = DEFAULT_WORLD,
  spawnSeed: number = Math.random() * 10000
): Tank[] {
  const count = clamp(players.length, 2, 6);
  const rng = createRng(spawnSeed + 97);

  // Collect valid above-water, drivable spawn spots across the entire terrain
  const primarySpots: number[] = [];
  const fallbackSpots: number[] = [];
  for (let x = 140; x <= world.width - 140; x += 24) {
    const y = getTerrainY(heights, x);
    if (y >= world.waterLevelY - 14) continue;
    const slope = Math.abs(getTerrainY(heights, x + 16) - getTerrainY(heights, x - 16));
    if (y < world.waterLevelY - 34 && slope <= 24) {
      primarySpots.push(x);
    } else if (slope <= 36) {
      fallbackSpots.push(x);
    }
  }

  const pool = primarySpots.length >= count * 4 ? primarySpots : [...primarySpots, ...fallbackSpots];
  const minClearance = 210; // Tanks can share the same landmass/island without overlapping

  // Pick randomized positions (not forced onto separate islands or fixed slots)
  const chosenX: number[] = [];
  for (let i = 0; i < count; i++) {
    let picked: number | null = null;
    if (pool.length > 0) {
      for (let attempt = 0; attempt < 48; attempt++) {
        const candidate = pool[Math.floor(rng() * pool.length)];
        if (chosenX.every((otherX) => Math.abs(otherX - candidate) >= minClearance)) {
          picked = candidate;
          break;
        }
      }
      if (picked === null) {
        // Fallback: pick spot maximizing distance to closest already-placed tank
        let bestX = pool[0];
        let bestDist = -1;
        for (const candidate of pool) {
          const minD =
            chosenX.length === 0
              ? Infinity
              : Math.min(...chosenX.map((ox) => Math.abs(ox - candidate)));
          if (minD > bestDist) {
            bestDist = minD;
            bestX = candidate;
          }
        }
        picked = bestX;
      }
    } else {
      picked = 160 + ((world.width - 320) * i) / Math.max(1, count - 1);
    }
    chosenX.push(picked);
  }

  // Sort left-to-right so P1..PN turn order follows natural map progression cleanly
  chosenX.sort((a, b) => a - b);

  return players.slice(0, count).map((p, idx) => {
    const x = chosenX[idx];
    const groundY = getTerrainY(heights, x);

    // Face toward the nearest opponent (or map center) so barrels start aimed toward battle
    let nearestEnemyX = world.width / 2;
    let nearestDist = Infinity;
    for (let j = 0; j < chosenX.length; j++) {
      if (j === idx) continue;
      const d = Math.abs(chosenX[j] - x);
      if (d < nearestDist) {
        nearestDist = d;
        nearestEnemyX = chosenX[j];
      }
    }
    const facing: 1 | -1 = nearestEnemyX >= x ? 1 : -1;
    const barrelAngle = facing === 1 ? 45 : 135;

    return {
      id: p.id,
      name: p.name.trim() || `Pemain ${idx + 1}`,
      color: p.color,
      accentColor: p.accentColor,
      shapeId: p.shapeId,
      modelName: p.modelName,
      isBot: p.isBot,
      x,
      y: groundY,
      slopeAngle: clamp(getTerrainSlope(heights, x), -0.65, 0.65),
      barrelAngle,
      power: 50,
      hp: world.maxHp,
      maxHp: world.maxHp,
      hasShield: false,
      activeWeapon: 'normal',
      facing,
      alive: true,
      hitFlashTimer: 0,
      recoilOffset: 0,
      koTimer: 0,
      stats: {
        quizCorrect: 0,
        quizTotal: 0,
        shotsFired: 0,
        hitsLanded: 0,
        powerUpsCollected: 0,
      },
    };
  });
}

export function moveTank(
  tank: Tank,
  direction: -1 | 0 | 1,
  dt: number,
  heights: Float32Array,
  allTanks: Tank[],
  world: WorldConfig = DEFAULT_WORLD
): void {
  if (!tank.alive || direction === 0) return;

  const targetX = clamp(
    tank.x + direction * TANK_MOVE_SPEED * dt,
    36,
    world.width - 36
  );

  const currentY = getTerrainY(heights, tank.x);
  const nextY = getTerrainY(heights, targetX);

  // Prevent driving up sheer cliffs OR driving straight off an island edge into deep ocean
  if (currentY - nextY > 26) {
    return;
  }
  if (nextY >= world.waterLevelY - 4 && currentY < world.waterLevelY - 4) {
    return;
  }

  // Prevent overlapping another alive tank horizontally
  const minSep = TANK_RADIUS_X * 2 + 4;
  for (const other of allTanks) {
    if (other.id === tank.id || !other.alive) continue;
    if (Math.abs(targetX - other.x) < minSep && Math.abs(nextY - other.y) < 34) {
      return;
    }
  }

  tank.x = targetX;
  tank.y = nextY;
  tank.slopeAngle = clamp(getTerrainSlope(heights, tank.x), -0.65, 0.65);
  tank.facing = direction;
}

export function stepTankGravity(
  tank: Tank,
  dt: number,
  heights: Float32Array,
  world: WorldConfig = DEFAULT_WORLD
): boolean {
  let drowned = false;
  const groundY = getTerrainY(heights, tank.x);
  if (tank.y < groundY) {
    tank.y = Math.min(groundY, tank.y + world.gravity * 0.75 * dt);
  } else {
    tank.y = groundY;
  }

  // If terrain beneath a tank is blasted into the ocean, the tank sinks!
  if (tank.alive && tank.y >= world.waterLevelY + 10) {
    tank.hp = 0;
    tank.alive = false;
    tank.koTimer = 0.5;
    drowned = true;
  }

  tank.slopeAngle = clamp(getTerrainSlope(heights, tank.x), -0.65, 0.65);
  if (tank.hitFlashTimer > 0) {
    tank.hitFlashTimer = Math.max(0, tank.hitFlashTimer - dt);
  }
  if (tank.recoilOffset > 0) {
    tank.recoilOffset = Math.max(0, tank.recoilOffset - dt * 24);
  }
  if (!tank.alive && tank.koTimer > 0) {
    tank.koTimer = Math.max(0, tank.koTimer - dt);
  }
  return drowned;
}

export function getBarrelMuzzle(tank: Tank): { x: number; y: number } {
  const rad = (tank.barrelAngle * Math.PI) / 180;
  const turretPivotX = tank.x;
  const turretPivotY = tank.y - 17;
  return {
    x: turretPivotX + Math.cos(rad) * BARREL_LENGTH,
    y: turretPivotY - Math.sin(rad) * BARREL_LENGTH,
  };
}

export function createProjectilesFromTank(
  tank: Tank,
  nextIdRef: { current: number }
): Projectile[] {
  const muzzle = getBarrelMuzzle(tank);
  const baseSpeed = BASE_SHOT_SPEED + tank.power * POWER_SPEED_SCALE;
  const weapon = tank.activeWeapon;

  const angleOffsets = weapon === 'triple' ? [-6, 0, 6] : [0];
  const speedMultipliers = weapon === 'triple' ? [0.95, 1.0, 1.05] : [1.0];

  const created: Projectile[] = angleOffsets.map((offsetDeg, idx) => {
    const rad = ((tank.barrelAngle + offsetDeg) * Math.PI) / 180;
    const speed = baseSpeed * speedMultipliers[idx];
    return {
      id: nextIdRef.current++,
      ownerId: tank.id,
      x: muzzle.x,
      y: muzzle.y,
      vx: Math.cos(rad) * speed,
      vy: -Math.sin(rad) * speed,
      radius: weapon === 'heavy' ? 7.5 : 5.5,
      damage: weapon === 'heavy' ? 2 : 1,
      craterRadius: weapon === 'heavy' ? 56 : weapon === 'triple' ? 30 : 38,
      kind: weapon,
      trail: [{ x: muzzle.x, y: muzzle.y }],
    };
  });

  tank.lastPower = Math.round(clamp(tank.power, MIN_SHOT_POWER, MAX_SHOT_POWER));
  tank.activeWeapon = 'normal';
  tank.recoilOffset = 7;
  tank.stats.shotsFired += 1;
  return created;
}

export function stepProjectile(
  proj: Projectile,
  wind: number,
  dt: number,
  world: WorldConfig = DEFAULT_WORLD
): void {
  proj.vx += wind * WIND_ACCEL_SCALE * dt;
  proj.vy += world.gravity * dt;
  proj.x += proj.vx * dt;
  proj.y += proj.vy * dt;

  proj.trail.push({ x: proj.x, y: proj.y });
  if (proj.trail.length > 26) {
    proj.trail.shift();
  }
}

export type CollisionResult =
  | { type: 'none' }
  | { type: 'oob' }
  | { type: 'water'; x: number; y: number }
  | { type: 'terrain'; x: number; y: number }
  | { type: 'tank'; x: number; y: number; tankId: number }
  | { type: 'crate'; x: number; y: number; crateId: number };

export function checkProjectileCollision(
  proj: Projectile,
  heights: Float32Array,
  tanks: Tank[],
  crates: PowerUpCrate[],
  world: WorldConfig = DEFAULT_WORLD
): CollisionResult {
  if (proj.x < -120 || proj.x > world.width + 120 || proj.y > world.height + 80) {
    return { type: 'oob' };
  }

  for (const crate of crates) {
    if (crate.collected) continue;
    const dx = proj.x - crate.x;
    const dy = proj.y - (crate.y - 12);
    if (dx * dx + dy * dy <= 22 * 22) {
      return { type: 'crate', x: proj.x, y: proj.y, crateId: crate.id };
    }
  }

  for (const tank of tanks) {
    if (!tank.alive) continue;
    const cx = tank.x;
    const cy = tank.y - 13;
    const dx = (proj.x - cx) / (TANK_RADIUS_X + proj.radius);
    const dy = (proj.y - cy) / (TANK_RADIUS_Y + proj.radius);
    if (dx * dx + dy * dy <= 1) {
      return { type: 'tank', x: proj.x, y: proj.y, tankId: tank.id };
    }
  }

  if (proj.x >= 0 && proj.x < world.width) {
    const groundY = getTerrainY(heights, proj.x);
    if (proj.y >= groundY) {
      return { type: 'terrain', x: proj.x, y: groundY };
    }
    if (proj.y >= world.waterLevelY && groundY > world.waterLevelY) {
      return { type: 'water', x: proj.x, y: world.waterLevelY };
    }
  }

  return { type: 'none' };
}

export interface DamageEvent {
  tankId: number;
  damageApplied: number;
  shieldBroken: boolean;
  eliminated: boolean;
}

export function applyExplosionDamage(
  cx: number,
  cy: number,
  blastRadius: number,
  baseDamage: number,
  tanks: Tank[],
  directTankId?: number
): DamageEvent[] {
  const events: DamageEvent[] = [];

  for (const tank of tanks) {
    if (!tank.alive) continue;
    const tx = tank.x;
    const ty = tank.y - 12;
    const dist = Math.hypot(tx - cx, ty - cy);

    const isDirect = directTankId === tank.id;
    if (!isDirect && dist > blastRadius + 16) continue;

    if (tank.hasShield) {
      tank.hasShield = false;
      tank.hitFlashTimer = 0.2;
      events.push({
        tankId: tank.id,
        damageApplied: 0,
        shieldBroken: true,
        eliminated: false,
      });
      continue;
    }

    const dmg = isDirect
      ? baseDamage
      : dist <= blastRadius * 0.65
        ? baseDamage
        : 1;

    tank.hp = Math.max(0, tank.hp - dmg);
    tank.hitFlashTimer = 0.18;
    const eliminated = tank.hp <= 0;
    if (eliminated) {
      tank.alive = false;
      tank.koTimer = 0.45;
    }

    events.push({
      tankId: tank.id,
      damageApplied: dmg,
      shieldBroken: false,
      eliminated,
    });
  }

  return events;
}

export function rollNextWind(previousWind: number): number {
  const delta = (Math.random() - 0.5) * 9;
  const candidate = clamp(previousWind * 0.55 + delta, -12, 12);
  return Math.round(candidate * 10) / 10;
}

const POWERUP_TYPES: PowerUpType[] = ['heal', 'heavy', 'triple', 'shield'];

export function spawnPowerUpCrate(
  nextIdRef: { current: number },
  tanks: Tank[],
  heights?: Float32Array,
  world: WorldConfig = DEFAULT_WORLD
): PowerUpCrate {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  let x = 160 + Math.random() * (world.width - 320);

  // Prefer landing on an island above water and not directly atop a tank
  for (let attempt = 0; attempt < 18; attempt++) {
    const candidate = 160 + Math.random() * (world.width - 320);
    const onIsland = heights ? isAboveWater(heights, candidate, world.waterLevelY) : true;
    const tooClose = tanks.some((t) => t.alive && Math.abs(t.x - candidate) < 65);
    if (onIsland && !tooClose) {
      x = candidate;
      break;
    }
  }

  return {
    id: nextIdRef.current++,
    type,
    x,
    y: -36,
    vy: 76,
    landed: false,
    swayPhase: Math.random() * Math.PI * 2,
    collected: false,
  };
}

export function stepPowerUpCrate(
  crate: PowerUpCrate,
  dt: number,
  heights: Float32Array,
  world: WorldConfig = DEFAULT_WORLD
): void {
  if (crate.collected) return;
  const groundY = Math.min(getTerrainY(heights, crate.x), world.waterLevelY + 6);

  if (crate.y < groundY) {
    crate.swayPhase += dt * 2.8;
    crate.y = Math.min(groundY, crate.y + crate.vy * dt);
    crate.landed = crate.y >= groundY;
  } else {
    crate.y = groundY;
    crate.landed = true;
  }

  // If crate sank into water, remove it
  if (crate.landed && groundY >= world.waterLevelY) {
    crate.collected = true;
  }
}

export function applyPowerUpToTank(tank: Tank, type: PowerUpType): string {
  tank.stats.powerUpsCollected += 1;
  switch (type) {
    case 'heal': {
      const before = tank.hp;
      tank.hp = Math.min(tank.maxHp, tank.hp + 1);
      return tank.hp > before ? '+1 Nyawa!' : 'Nyawa Penuh!';
    }
    case 'heavy':
      tank.activeWeapon = 'heavy';
      return 'Peluru Berat (2x)!';
    case 'triple':
      tank.activeWeapon = 'triple';
      return 'Peluru Tiga!';
    case 'shield':
      tank.hasShield = true;
      return 'Perisai Aktif!';
  }
}

export function checkCratePickupByTanks(
  crates: PowerUpCrate[],
  tanks: Tank[]
): Array<{ tank: Tank; crate: PowerUpCrate; label: string }> {
  const pickups: Array<{ tank: Tank; crate: PowerUpCrate; label: string }> = [];

  for (const crate of crates) {
    if (crate.collected) continue;
    for (const tank of tanks) {
      if (!tank.alive) continue;
      const dx = Math.abs(tank.x - crate.x);
      const dy = Math.abs(tank.y - crate.y);
      if (dx <= TANK_RADIUS_X + 14 && dy <= 34) {
        crate.collected = true;
        const label = applyPowerUpToTank(tank, crate.type);
        pickups.push({ tank, crate, label });
        break;
      }
    }
  }

  return pickups;
}

export function findNextAliveTankIndex(tanks: Tank[], currentIndex: number): number {
  const len = tanks.length;
  for (let step = 1; step <= len; step++) {
    const idx = (currentIndex + step) % len;
    if (tanks[idx]?.alive) return idx;
  }
  return -1;
}

export function getAliveTanks(tanks: Tank[]): Tank[] {
  return tanks.filter((t) => t.alive);
}

export function computeBotAim(
  bot: Tank,
  tanks: Tank[],
  heights: Float32Array,
  wind: number,
  world: WorldConfig = DEFAULT_WORLD
): { targetX: number; barrelAngle: number; power: number } {
  const targets = tanks.filter((t) => t.alive && t.id !== bot.id);
  if (targets.length === 0) {
    return { targetX: bot.x, barrelAngle: bot.barrelAngle, power: bot.power };
  }

  const target = targets.reduce((best, curr) => {
    const scoreCurr = curr.hp * 120 + Math.abs(curr.x - bot.x) * 0.15;
    const scoreBest = best.hp * 120 + Math.abs(best.x - bot.x) * 0.15;
    return scoreCurr < scoreBest ? curr : best;
  }, targets[0]);

  const dirRight = target.x >= bot.x;
  let bestAngle = dirRight ? 48 : 132;
  let bestPower = 72;
  let bestDist = Infinity;

  const angleCandidates = dirRight
    ? [26, 34, 42, 50, 58, 68]
    : [154, 146, 138, 130, 122, 112];

  for (const angleDeg of angleCandidates) {
    for (let power = 15; power <= 100; power += 5) {
      const rad = (angleDeg * Math.PI) / 180;
      const speed = BASE_SHOT_SPEED + power * POWER_SPEED_SCALE;
      let sx = bot.x + Math.cos(rad) * BARREL_LENGTH;
      let sy = bot.y - 17 - Math.sin(rad) * BARREL_LENGTH;
      let vx = Math.cos(rad) * speed;
      let vy = -Math.sin(rad) * speed;

      for (let t = 0; t < 8.5; t += 0.045) {
        vx += wind * WIND_ACCEL_SCALE * 0.045;
        vy += world.gravity * 0.045;
        sx += vx * 0.045;
        sy += vy * 0.045;

        const d = Math.hypot(sx - target.x, sy - (target.y - 12));
        if (d < bestDist) {
          bestDist = d;
          bestAngle = angleDeg;
          bestPower = power;
        }
        if (sx < 0 || sx >= world.width) break;
        if (sy >= getTerrainY(heights, sx)) break;
      }
    }
  }

  return {
    targetX: clamp(bot.x + (Math.random() - 0.5) * 70, 60, world.width - 60),
    barrelAngle: clamp(bestAngle + (Math.random() - 0.5) * 3.5, 8, 172),
    power: clamp(bestPower + (Math.random() - 0.5) * 4, 12, 100),
  };
}

export class QuizDeck {
  private pool: QuizQuestion[] = [];
  private cursor = 0;
  private allQuestions: QuizQuestion[];

  constructor(questions: QuizQuestion[], filter: DifficultyFilter = 'Campuran') {
    const filtered =
      filter === 'Campuran'
        ? questions
        : questions.filter((q) => q.kesulitan === filter);
    this.allQuestions = filtered.length > 0 ? [...filtered] : [...questions];
    this.reshuffle();
  }

  private reshuffle(): void {
    this.pool = [...this.allQuestions];
    for (let i = this.pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pool[i], this.pool[j]] = [this.pool[j], this.pool[i]];
    }
    this.cursor = 0;
  }

  public draw(): { question: QuizQuestion; indexInCycle: number; totalInDeck: number } {
    if (this.cursor >= this.pool.length) {
      this.reshuffle();
    }
    const question = this.pool[this.cursor];
    this.cursor += 1;
    return {
      question,
      indexInCycle: this.cursor,
      totalInDeck: this.pool.length,
    };
  }

  public getTotalCount(): number {
    return this.allQuestions.length;
  }
}

export function getPowerUpInfo(type: PowerUpType): {
  title: string;
  shortLabel: string;
  color: string;
} {
  switch (type) {
    case 'heal':
      return { title: 'Perbaikan (+1 Nyawa)', shortLabel: '+1 HP', color: '#10B981' };
    case 'heavy':
      return { title: 'Peluru Berat (2x Damage)', shortLabel: '2X DMG', color: '#F59E0B' };
    case 'triple':
      return { title: 'Peluru Tiga (3x Spread)', shortLabel: '3X TEMBAK', color: '#3B82F6' };
    case 'shield':
      return { title: 'Perisai Baja (Tahan 1 Serangan)', shortLabel: 'PERISAI', color: '#8B5CF6' };
  }
}
