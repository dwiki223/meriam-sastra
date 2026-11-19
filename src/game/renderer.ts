import type {
  FloatingText,
  Particle,
  PowerUpCrate,
  Projectile,
  Tank,
  TankShapeId,
  WorldConfig,
} from '../types/game';
import {
  BARREL_LENGTH,
  MAX_SHOT_POWER,
  MIN_SHOT_POWER,
  getPowerUpInfo,
} from './physics';

export interface RenderSceneState {
  world: WorldConfig;
  heights: Float32Array;
  scorch: Float32Array;
  terrainVersion: number;
  tanks: Tank[];
  activeTankIndex: number;
  projectiles: Projectile[];
  crates: PowerUpCrate[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  wind: number;
  time: number;
  shakeX: number;
  shakeY: number;
  cameraX: number;
  overviewMode: boolean;
  showAimGuide: boolean;
  showMinimap: boolean;
  isCharging: boolean;
  chargePower: number;
}

export const PARTICLE_POOL_SIZE = 240;

export function createParticlePool(): Particle[] {
  const pool: Particle[] = [];
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    pool.push({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 3,
      color: '#F59E0B',
      life: 0,
      maxLife: 1,
      gravity: 200,
    });
  }
  return pool;
}

export function spawnParticleBurst(
  pool: Particle[],
  cursorRef: { current: number },
  x: number,
  y: number,
  count: number,
  colors: string[],
  speedMin: number,
  speedMax: number,
  gravity = 240
): void {
  for (let i = 0; i < count; i++) {
    const p = pool[cursorRef.current % pool.length];
    cursorRef.current = (cursorRef.current + 1) % pool.length;

    const angle = Math.random() * Math.PI * 2;
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 45;
    p.size = 2.5 + Math.random() * 4.5;
    p.color = colors[i % colors.length];
    p.maxLife = 0.35 + Math.random() * 0.45;
    p.life = p.maxLife;
    p.gravity = gravity;
  }
}

export function stepParticles(pool: Particle[], dt: number): void {
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (!p.active) continue;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      p.active = false;
    }
  }
}

let cachedBgCanvas: HTMLCanvasElement | null = null;
let cachedTerrainCanvas: HTMLCanvasElement | null = null;
let cachedTerrainThumbCanvas: HTMLCanvasElement | null = null;
let cachedTerrainVersion = -1;

function ensureBackgroundCache(world: WorldConfig): HTMLCanvasElement {
  const cacheW = Math.ceil(world.width * 0.5);
  const cacheH = Math.ceil(world.height * 0.5);
  if (
    cachedBgCanvas &&
    cachedBgCanvas.width === cacheW &&
    cachedBgCanvas.height === cacheH
  ) {
    return cachedBgCanvas;
  }

  const off = document.createElement('canvas');
  off.width = cacheW;
  off.height = cacheH;
  const ctx = off.getContext('2d');
  if (ctx) {
    ctx.scale(0.5, 0.5);
    const skyGrad = ctx.createLinearGradient(0, 0, 0, world.height);
    skyGrad.addColorStop(0, '#10213A');
    skyGrad.addColorStop(0.42, '#2B4C7E');
    skyGrad.addColorStop(0.72, '#D98A56');
    skyGrad.addColorStop(1, '#F3C68F');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, world.width, world.height);

    // Setting sun halo
    const sunX = world.width * 0.72;
    const sunY = world.height * 0.32;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 190);
    sunGrad.addColorStop(0, 'rgba(254, 243, 199, 0.92)');
    sunGrad.addColorStop(0.32, 'rgba(253, 211, 127, 0.38)');
    sunGrad.addColorStop(1, 'rgba(253, 211, 127, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 190, 0, Math.PI * 2);
    ctx.fill();

    // Distant volcanic island silhouettes across archipelago
    ctx.fillStyle = '#233B5D';
    ctx.beginPath();
    ctx.moveTo(0, world.height);
    for (let x = 0; x < world.width; x += 64) {
      const y = world.height * 0.56 - Math.sin(x * 0.0032) * 52 - Math.cos(x * 0.008) * 24;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(
      world.width,
      world.height * 0.56 - Math.sin(world.width * 0.0032) * 52 - Math.cos(world.width * 0.008) * 24
    );
    ctx.lineTo(world.width, world.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1E314B';
    ctx.beginPath();
    ctx.moveTo(0, world.height);
    for (let x = 0; x < world.width; x += 48) {
      const y = world.height * 0.65 - Math.sin(x * 0.0048 + 1.2) * 34 - Math.cos(x * 0.012) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(
      world.width,
      world.height * 0.65 - Math.sin(world.width * 0.0048 + 1.2) * 34 - Math.cos(world.width * 0.012) * 18
    );
    ctx.lineTo(world.width, world.height);
    ctx.closePath();
    ctx.fill();
  }

  cachedBgCanvas = off;
  return off;
}

function ensureTerrainCache(
  world: WorldConfig,
  heights: Float32Array,
  scorch: Float32Array,
  terrainVersion: number
): HTMLCanvasElement {
  if (
    cachedTerrainCanvas &&
    cachedTerrainVersion === terrainVersion &&
    cachedTerrainCanvas.width === world.width &&
    cachedTerrainCanvas.height === world.height
  ) {
    return cachedTerrainCanvas;
  }

  const off = cachedTerrainCanvas ?? document.createElement('canvas');
  off.width = world.width;
  off.height = world.height;
  const ctx = off.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, world.width, world.height);

    // 1. Background coastal foliage (palms & tropical shrubs on intact grassy ridges, clipped cleanly behind craters)
    for (let x = 80; x < heights.length - 80; x += 44) {
      const y = heights[x];
      const slope = Math.abs(heights[Math.min(heights.length - 1, x + 10)] - heights[Math.max(0, x - 10)]);
      if (y < world.waterLevelY - 40 && scorch[x] < 0.15 && slope < 11) {
        const hash = Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;
        if (hash > 0.68) {
          // Coastal coconut palm tree silhouette
          const lean = (hash - 0.84) * 34;
          const trunkH = 42 + hash * 26;
          const topX = x + lean;
          const topY = y - trunkH;
          ctx.strokeStyle = '#5C4033';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y + 3);
          ctx.quadraticCurveTo(x + lean * 0.35, y - trunkH * 0.55, topX, topY);
          ctx.stroke();

          // Lush palm fronds
          ctx.strokeStyle = '#2A6F37';
          ctx.lineWidth = 3;
          for (let f = 0; f < 6; f++) {
            const ang = -Math.PI * 0.92 + f * 0.37 + lean * 0.01;
            const flen = 18 + (f % 2) * 5;
            ctx.beginPath();
            ctx.moveTo(topX, topY);
            ctx.quadraticCurveTo(
              topX + Math.cos(ang) * flen * 0.65,
              topY + Math.sin(ang) * flen * 0.4 - 5,
              topX + Math.cos(ang) * flen,
              topY + Math.sin(ang) * flen + 6
            );
            ctx.stroke();
          }
        } else if (hash < 0.25) {
          // Low island shrub / fern cluster
          ctx.fillStyle = '#2D6A3E';
          ctx.beginPath();
          ctx.arc(x - 7, y - 3, 7, Math.PI, 0);
          ctx.arc(x + 2, y - 5, 9, Math.PI, 0);
          ctx.arc(x + 10, y - 2, 6, Math.PI, 0);
          ctx.fill();
        }
      }
    }

    // 2. Main Island Mass + Clipped Geological Strata
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, world.height);
    for (let x = 0; x < heights.length; x += 2) {
      ctx.lineTo(x, heights[x]);
    }
    ctx.lineTo(world.width, heights[heights.length - 1]);
    ctx.lineTo(world.width, world.height);
    ctx.closePath();
    ctx.clip();

    const soilGrad = ctx.createLinearGradient(0, world.height * 0.3, 0, world.height);
    soilGrad.addColorStop(0, '#6B4930');
    soilGrad.addColorStop(0.45, '#4B3324');
    soilGrad.addColorStop(0.78, '#2C2523');
    soilGrad.addColorStop(1, '#181A20');
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, 0, world.width, world.height);

    // Sedimentary strata bands following island contours
    const strataLayers = [
      { depth: 24, color: 'rgba(130, 88, 54, 0.42)', thickness: 18 },
      { depth: 58, color: 'rgba(92, 62, 42, 0.46)', thickness: 26 },
      { depth: 105, color: 'rgba(54, 48, 46, 0.55)', thickness: 38 },
      { depth: 168, color: 'rgba(31, 36, 44, 0.62)', thickness: 54 },
    ];
    for (const layer of strataLayers) {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.thickness;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let x = 0; x < heights.length; x += 8) {
        const wave = Math.sin(x * 0.017 + layer.depth) * 7 + Math.cos(x * 0.041) * 3;
        const sy = heights[x] + layer.depth + wave;
        if (x === 0) ctx.moveTo(x, sy);
        else ctx.lineTo(x, sy);
      }
      ctx.stroke();
    }

    // Chiseled rock facets & cliff crags on steeper terrain slopes
    for (let x = 6; x < heights.length - 6; x += 14) {
      const slope = heights[x + 6] - heights[x - 6];
      if (Math.abs(slope) > 4.5 && heights[x] < world.waterLevelY + 25) {
        const rockY = heights[x] + 18 + ((x * 13) % 34);
        ctx.fillStyle = slope > 0 ? 'rgba(20, 22, 28, 0.34)' : 'rgba(148, 134, 118, 0.16)';
        ctx.beginPath();
        ctx.moveTo(x - 10, rockY);
        ctx.lineTo(x + 4, rockY - 12);
        ctx.lineTo(x + 15, rockY + 8);
        ctx.lineTo(x - 4, rockY + 14);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Subsurface pebbles & stone flecks
    for (let x = 12; x < heights.length - 12; x += 22) {
      const gy = heights[x];
      if (gy >= world.height - 65) continue;
      const h = Math.abs(Math.sin(x * 37.1) * 913.7) % 1;
      const ry = gy + 14 + h * 75;
      ctx.fillStyle = h > 0.5 ? 'rgba(168, 146, 122, 0.22)' : 'rgba(24, 24, 27, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x, ry, 4 + h * 4, 2.5 + h * 2, h * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Seafloor bedrock band
    ctx.fillStyle = '#131A22';
    ctx.fillRect(0, world.height - 32, world.width, 32);
    ctx.restore();

    // 3. Layered Island Surface Crust: Reef Rock -> Wet Sand -> Dry Beach -> Humus -> Turf -> Grass Blades
    const buckets: Array<{
      color: string;
      width: number;
      yOff: number;
      pred: (x: number, y: number, s: number) => boolean;
    }> = [
      {
        color: '#3D352E', // Dark humus rim under grass
        width: 7,
        yOff: 5,
        pred: (_x, y, s) => s <= 0.25 && y < world.waterLevelY - 26,
      },
      {
        color: '#7D6846', // Wet tidal sand near water
        width: 9,
        yOff: 3,
        pred: (_x, y, s) => s <= 0.25 && y > world.waterLevelY - 6 && y <= world.waterLevelY + 22,
      },
      {
        color: '#D6B67C', // Sunlit golden coastal beach
        width: 8,
        yOff: 2,
        pred: (_x, y, s) => s <= 0.25 && y >= world.waterLevelY - 28 && y <= world.waterLevelY - 6,
      },
      {
        color: '#2F7A3A', // Rich emerald island turf
        width: 8.5,
        yOff: 2,
        pred: (_x, y, s) => s <= 0.25 && y < world.waterLevelY - 26,
      },
      {
        color: '#574335', // Crater warm scorch rim
        width: 8,
        yOff: 2,
        pred: (_x, _y, s) => s > 0.25 && s <= 0.65,
      },
      {
        color: '#292524', // Heavy char black crater
        width: 8,
        yOff: 2,
        pred: (_x, _y, s) => s > 0.65,
      },
      {
        color: '#6CD46E', // Top sunlit grass highlight
        width: 2.5,
        yOff: -0.5,
        pred: (_x, y, s) => s <= 0.25 && y < world.waterLevelY - 26,
      },
    ];

    ctx.lineCap = 'round';
    for (const bucket of buckets) {
      ctx.strokeStyle = bucket.color;
      ctx.lineWidth = bucket.width;
      ctx.beginPath();
      for (let x = 0; x < heights.length - 4; x += 4) {
        if (!bucket.pred(x, heights[x], scorch[x])) continue;
        ctx.moveTo(x, heights[x] + bucket.yOff);
        ctx.lineTo(x + 4, heights[x + 4] + bucket.yOff);
      }
      ctx.stroke();
    }

    // 4. Tiny Grass Tufts & Coastal Pebbles along intact surfaces
    ctx.strokeStyle = '#7CE87E';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 16; x < heights.length - 16; x += 14) {
      if (scorch[x] > 0.2 || heights[x] >= world.waterLevelY - 28) continue;
      const gx = x;
      const gy = heights[x];
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx - 2, gy - 5);
      ctx.moveTo(gx + 3, gy);
      ctx.lineTo(gx + 5, gy - 4.5);
    }
    ctx.stroke();

    // Small shore boulders near beachline
    for (let x = 20; x < heights.length - 20; x += 38) {
      const gy = heights[x];
      if (scorch[x] < 0.2 && gy >= world.waterLevelY - 30 && gy <= world.waterLevelY + 4) {
        ctx.fillStyle = '#57534E';
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(x, gy + 1, 6, 3.8, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  cachedTerrainCanvas = off;
  cachedTerrainVersion = terrainVersion;

  const thumb = cachedTerrainThumbCanvas ?? document.createElement('canvas');
  thumb.width = Math.ceil(world.width * 0.5);
  thumb.height = Math.ceil(world.height * 0.5);
  const tctx = thumb.getContext('2d');
  if (tctx) {
    tctx.clearRect(0, 0, thumb.width, thumb.height);
    tctx.drawImage(off, 0, 0, thumb.width, thumb.height);
  }
  cachedTerrainThumbCanvas = thumb;

  return off;
}

export function getCameraViewBounds(
  canvasWidth: number,
  canvasHeight: number,
  world: WorldConfig,
  cameraX: number,
  overviewMode: boolean
): { scale: number; offsetX: number; offsetY: number; viewWorldWidth: number; clampedCameraX: number } {
  if (overviewMode) {
    const scale = Math.min(canvasWidth / world.width, canvasHeight / world.height);
    const offsetX = (canvasWidth - world.width * scale) / 2;
    const offsetY = (canvasHeight - world.height * scale) / 2;
    return { scale, offsetX, offsetY, viewWorldWidth: world.width, clampedCameraX: 0 };
  }

  // Focused tactical scale: shows ~1560px horizontal slice of the 4800px vast terrain
  const targetViewWidth = 1560;
  const scaleByHeight = canvasHeight / world.height;
  const scaleByWidth = canvasWidth / targetViewWidth;
  const scale = Math.max(scaleByWidth, scaleByHeight * 0.94);
  const viewWorldWidth = canvasWidth / scale;
  const maxCamX = Math.max(0, world.width - viewWorldWidth);
  const clampedCameraX = Math.max(0, Math.min(maxCamX, cameraX));
  const offsetY = (canvasHeight - world.height * scale) / 2;

  return {
    scale,
    offsetX: -clampedCameraX * scale,
    offsetY,
    viewWorldWidth,
    clampedCameraX,
  };
}

export function renderBattlefield(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  scene: RenderSceneState
): void {
  const { world } = scene;
  ctx.save();

  const cam = getCameraViewBounds(
    canvasWidth,
    canvasHeight,
    world,
    scene.cameraX,
    scene.overviewMode
  );

  // Seamless top sky & bottom deep sea background fill
  ctx.fillStyle = '#10213A';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  const waterScreenY = Math.max(0, cam.offsetY + world.waterLevelY * cam.scale);
  ctx.fillStyle = '#0B2F4A';
  ctx.fillRect(0, waterScreenY, canvasWidth, canvasHeight - waterScreenY);

  ctx.save();
  ctx.translate(cam.offsetX + scene.shakeX, cam.offsetY + scene.shakeY);
  ctx.scale(cam.scale, cam.scale);

  ctx.beginPath();
  ctx.rect(0, 0, world.width, world.height);
  ctx.clip();

  const sx = scene.overviewMode ? 0 : Math.max(0, Math.floor(cam.clampedCameraX));
  const sw = scene.overviewMode
    ? world.width
    : Math.min(world.width - sx, Math.ceil(cam.viewWorldWidth) + 2);

  const bgCanvas = ensureBackgroundCache(world);
  ctx.drawImage(
    bgCanvas,
    sx * 0.5,
    0,
    sw * 0.5,
    bgCanvas.height,
    sx,
    0,
    sw,
    world.height
  );

  drawWindAndClouds(ctx, world, scene.wind, scene.time, sx, sw);

  // Back-layer ocean fill (translucent behind islands & craters)
  drawOceanBack(ctx, world, scene.time, sx, sw);

  const terrainCanvas = ensureTerrainCache(world, scene.heights, scene.scorch, scene.terrainVersion);
  if (scene.overviewMode && cachedTerrainThumbCanvas) {
    ctx.drawImage(cachedTerrainThumbCanvas, 0, 0, world.width, world.height);
  } else {
    ctx.drawImage(terrainCanvas, sx, 0, sw, world.height, sx, 0, sw, world.height);
  }

  drawCrates(ctx, scene.crates, scene.time);
  drawTanks(
    ctx,
    scene.tanks,
    scene.activeTankIndex,
    scene.time,
    scene.showAimGuide,
    scene.isCharging,
    scene.chargePower
  );
  drawProjectiles(ctx, scene.projectiles);

  // Foreground ocean crest, shallow reef shimmer & animated shoreline foam
  drawOceanFront(ctx, world, scene.heights, scene.time, sx, sw);

  drawParticles(ctx, scene.particles);
  drawFloatingTexts(ctx, scene.floatingTexts);

  ctx.restore();

  if (scene.showMinimap) {
    drawArchipelagoMinimap(ctx, canvasWidth, scene, cam.clampedCameraX, cam.viewWorldWidth);
  }

  ctx.restore();
}

let cachedWaterGrad: CanvasGradient | null = null;
let cachedWaterLevelY = -1;
let cachedWaterHeight = -1;

function drawOceanBack(
  ctx: CanvasRenderingContext2D,
  world: WorldConfig,
  time: number,
  sx: number,
  sw: number
): void {
  if (!cachedWaterGrad || cachedWaterLevelY !== world.waterLevelY || cachedWaterHeight !== world.height) {
    cachedWaterGrad = ctx.createLinearGradient(0, world.waterLevelY, 0, world.height);
    cachedWaterGrad.addColorStop(0, 'rgba(14, 116, 144, 0.72)');
    cachedWaterGrad.addColorStop(0.45, 'rgba(12, 74, 110, 0.88)');
    cachedWaterGrad.addColorStop(1, 'rgba(8, 47, 73, 0.96)');
    cachedWaterLevelY = world.waterLevelY;
    cachedWaterHeight = world.height;
  }
  ctx.fillStyle = cachedWaterGrad;
  ctx.fillRect(sx, world.waterLevelY, sw, world.height - world.waterLevelY);

  const x0 = Math.max(0, Math.floor(sx / 96) * 96);
  const x1 = Math.min(world.width, sx + sw + 96);

  // Gentle back wave highlight
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 96) {
    const wy = world.waterLevelY + Math.sin(x * 0.02 + time * 2.2) * 3;
    if (x === x0) ctx.moveTo(x, wy);
    else ctx.lineTo(x, wy);
  }
  ctx.stroke();
}

function drawOceanFront(
  ctx: CanvasRenderingContext2D,
  world: WorldConfig,
  heights: Float32Array,
  time: number,
  sx: number,
  sw: number
): void {
  const x0 = Math.max(0, Math.floor(sx / 80) * 80);
  const x1 = Math.min(world.width, sx + sw + 80);

  ctx.fillStyle = 'rgba(14, 116, 144, 0.24)';
  ctx.beginPath();
  ctx.moveTo(x0, world.height);
  for (let x = x0; x <= x1; x += 80) {
    const wy = world.waterLevelY + 3 + Math.cos(x * 0.025 - time * 2.6) * 3.5;
    ctx.lineTo(x, wy);
  }
  ctx.lineTo(x1, world.height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 80) {
    const wy = world.waterLevelY + 3 + Math.cos(x * 0.025 - time * 2.6) * 3.5;
    if (x === x0) ctx.moveTo(x, wy);
    else ctx.lineTo(x, wy);
  }
  ctx.stroke();

  // Animated seafoam where island shores meet waterLevelY
  const foamStart = Math.max(8, Math.floor(sx / 12) * 12);
  const foamEnd = Math.min(heights.length - 8, sx + sw + 12);
  ctx.strokeStyle = 'rgba(240, 249, 255, 0.68)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let x = foamStart; x < foamEnd; x += 12) {
    const d = heights[x] - world.waterLevelY;
    if (d > -10 && d < 16) {
      const foamY = world.waterLevelY + Math.sin(time * 3.2 + x * 0.05) * 2.2;
      ctx.moveTo(x - 4, foamY);
      ctx.lineTo(x + 4, foamY);
    }
  }
  ctx.stroke();
}

function drawWindAndClouds(
  ctx: CanvasRenderingContext2D,
  world: WorldConfig,
  wind: number,
  time: number,
  sx: number,
  sw: number
): void {
  ctx.fillStyle = 'rgba(255, 248, 235, 0.2)';
  for (let i = 0; i < 11; i++) {
    const baseCloudX =
      (((i * 510 + time * (10 + wind * 3.5)) % (world.width + 240)) + (world.width + 240)) %
        (world.width + 240) -
      120;
    if (baseCloudX < sx - 160 || baseCloudX > sx + sw + 160) continue;
    const cloudY = 88 + (i % 3) * 58;
    const w = 110 + (i % 2) * 45;
    ctx.beginPath();
    ctx.ellipse(baseCloudX, cloudY, w * 0.5, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(baseCloudX - w * 0.24, cloudY + 5, w * 0.3, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(baseCloudX + w * 0.24, cloudY + 6, w * 0.32, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (Math.abs(wind) >= 0.8) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const speed = wind * 28;
      const sx = (((i * 173 + time * speed) % world.width) + world.width) % world.width;
      const sy = 65 + ((i * 89) % (world.height * 0.42));
      const len = Math.min(48, Math.abs(wind) * 3.8) * Math.sign(wind);
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + len, sy);
    }
    ctx.stroke();
  }
}

function drawCrates(
  ctx: CanvasRenderingContext2D,
  crates: PowerUpCrate[],
  time: number
): void {
  for (const crate of crates) {
    if (crate.collected) continue;
    const info = getPowerUpInfo(crate.type);
    const sway = crate.landed ? 0 : Math.sin(crate.swayPhase) * 6;
    const cx = crate.x + sway;
    const cy = crate.y;

    ctx.save();
    ctx.translate(cx, cy);

    if (!crate.landed) {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-11, -24);
      ctx.lineTo(-17, -44);
      ctx.moveTo(11, -24);
      ctx.lineTo(17, -44);
      ctx.moveTo(0, -24);
      ctx.lineTo(0, -47);
      ctx.stroke();

      ctx.fillStyle = info.color;
      ctx.beginPath();
      ctx.arc(0, -44, 20, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const pulse = 0.75 + Math.sin(time * 4 + crate.id) * 0.25;
    ctx.fillStyle = `${info.color}33`;
    ctx.beginPath();
    ctx.arc(0, -12, 18 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-13, -24, 26, 24, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const glyph =
      crate.type === 'heal'
        ? '+1'
        : crate.type === 'heavy'
          ? '2X'
          : crate.type === 'triple'
            ? '3X'
            : 'SH';
    ctx.fillText(glyph, 0, -12);

    ctx.restore();
  }
}

function drawTankShape(
  ctx: CanvasRenderingContext2D,
  shapeId: TankShapeId,
  bodyColor: string,
  trimColor: string,
  barrelAngle: number,
  recoil: number,
  slopeAngle: number,
  facing: 1 | -1,
  poweredBarrel: boolean
): void {
  const barrelRad = (barrelAngle * Math.PI) / 180;
  const barrelTipColor = poweredBarrel ? '#FBBF24' : '#94A3B8';

  ctx.save();
  ctx.rotate(slopeAngle);

  // Chassis & treads per tank model
  if (shapeId === 0) {
    // Banteng: Heavy sloped glacis + armored skirts + wide cupola + thick muzzle brake
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-24, -11, 48, 11, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#64748B';
    for (let wx = -16; wx <= 16; wx += 8) {
      ctx.beginPath();
      ctx.arc(wx, -5.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-22, -10);
    ctx.lineTo(-15, -21);
    ctx.lineTo(15, -21);
    ctx.lineTo(23, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = trimColor;
    ctx.fillRect(-10, -16, 20, 3);
  } else if (shapeId === 1) {
    // Elang: Sleek wedge scout hull + twin bogies + whip antenna
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-21, -10, 42, 10, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#94A3B8';
    for (const wx of [-14, -5, 5, 14]) {
      ctx.beginPath();
      ctx.arc(wx, -5, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-22, -9);
    ctx.lineTo(-18, -17);
    ctx.lineTo(10, -17);
    ctx.lineTo(24, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Dual whip antenna at rear
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14 * facing, -17);
    ctx.lineTo(-19 * facing, -33);
    ctx.stroke();
  } else if (shapeId === 2) {
    // Badak: Tall boxy siege mortar hull + front dozer plow
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-22, -12, 44, 12, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.roundRect(-19, -24, 38, 13, 3);
    ctx.fill();
    ctx.stroke();
    // Front dozer blade
    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.moveTo(19 * facing, -16);
    ctx.lineTo(26 * facing, -14);
    ctx.lineTo(24 * facing, -2);
    ctx.lineTo(19 * facing, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shapeId === 3) {
    // Garuda: Twin-pod articulated crawler + angular chassis
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-24, -10, 19, 10, 4);
    ctx.roundRect(5, -10, 19, 10, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-21, -9);
    ctx.lineTo(-14, -20);
    ctx.lineTo(14, -20);
    ctx.lineTo(21, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(0, -19);
    ctx.lineTo(8, -14);
    ctx.closePath();
    ctx.fill();
  } else if (shapeId === 4) {
    // Komodo: Rounded cast hull + smooth cruiser profile
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-23, -10, 46, 10, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -12, 22, 8, 0, Math.PI, 0);
    ctx.lineTo(22, -9);
    ctx.lineTo(-22, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = trimColor;
    ctx.fillRect(-13, -13, 26, 2.5);
  } else {
    // Naga: Half-track front tread + large rear armored wheels + stealth hull
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-22, -10, 22, 10, 4);
    ctx.fill();
    ctx.stroke();
    for (const wx of [7, 17]) {
      ctx.beginPath();
      ctx.arc(wx * facing, -6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-22, -10);
    ctx.lineTo(-10, -21);
    ctx.lineTo(14, -19);
    ctx.lineTo(23, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  // Barrel & Turret (world-angle aligned)
  ctx.save();
  ctx.translate(0, -18);
  ctx.rotate(-barrelRad);

  if (shapeId === 2) {
    // Badak wide stubby mortar barrel
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(3 - recoil, -5, BARREL_LENGTH - 8, 10, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = barrelTipColor;
    ctx.fillRect(BARREL_LENGTH - 8 - recoil, -6, 6, 12);
  } else if (shapeId === 3) {
    // Garuda twin-rail launcher barrel
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(4 - recoil, -5, BARREL_LENGTH - 3, 4, 1.5);
    ctx.roundRect(4 - recoil, 1, BARREL_LENGTH - 3, 4, 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = barrelTipColor;
    ctx.fillRect(BARREL_LENGTH - 3 - recoil, -5, 5, 10);
  } else if (shapeId === 4) {
    // Komodo long rifle barrel with fume extractor
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(4 - recoil, -3, BARREL_LENGTH + 4, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = trimColor;
    ctx.fillRect(16 - recoil, -4.2, 7, 8.4);
    ctx.fillStyle = barrelTipColor;
    ctx.fillRect(BARREL_LENGTH + 3 - recoil, -3.5, 5, 7);
  } else {
    // Banteng / Elang / Naga standard & heavy cannon
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4 - recoil, -3.5, BARREL_LENGTH - 4, 7, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = barrelTipColor;
    ctx.fillRect(BARREL_LENGTH - 4 - recoil, -4.8, 6, 9.6);
  }
  ctx.restore();

  // Distinct turret silhouettes
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  if (shapeId === 1 || shapeId === 5) {
    // Angular stealth/hexagonal turret
    ctx.beginPath();
    ctx.moveTo(-12, -16);
    ctx.lineTo(-7, -26);
    ctx.lineTo(7, -26);
    ctx.lineTo(12, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shapeId === 3) {
    // Rocket/artillery box pod turret
    ctx.beginPath();
    ctx.roundRect(-12, -28, 22, 12, 3);
    ctx.fill();
    ctx.stroke();
  } else if (shapeId === 2) {
    // Heavy broad mortar turret
    ctx.beginPath();
    ctx.roundRect(-13, -27, 26, 11, 5);
    ctx.fill();
    ctx.stroke();
  } else {
    // Classic rounded dome cupola (Banteng & Komodo)
    ctx.beginPath();
    ctx.arc(0, -18, 10.5, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.arc(0, -22, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawTanks(
  ctx: CanvasRenderingContext2D,
  tanks: Tank[],
  activeIndex: number,
  time: number,
  showAimGuide: boolean,
  isCharging: boolean,
  chargePower: number
): void {
  tanks.forEach((tank, idx) => {
    if (!tank.alive && tank.koTimer <= 0) return;
    const isActive = idx === activeIndex && tank.alive;

    ctx.save();
    ctx.translate(tank.x, tank.y);

    if (!tank.alive) {
      const progress = 1 - tank.koTimer / 0.45;
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.rotate(progress * 0.45 * tank.facing);
    }

    if (isActive) {
      const bob = Math.sin(time * 6) * 4;
      ctx.fillStyle = isCharging ? '#34D399' : '#FBBF24';
      ctx.beginPath();
      ctx.moveTo(0, -60 + bob);
      ctx.lineTo(-7, -70 + bob);
      ctx.lineTo(7, -70 + bob);
      ctx.closePath();
      ctx.fill();
    }

    // Worms Armageddon-style aiming reticle + tapered muzzle power wedge
    if (isActive && showAimGuide) {
      const rad = (tank.barrelAngle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = -Math.sin(rad);
      const pivotX = 0;
      const pivotY = -18;
      const muzzleX = pivotX + cos * (BARREL_LENGTH + 4);
      const muzzleY = pivotY + sin * (BARREL_LENGTH + 4);

      if (!isCharging) {
        // Subtle 3-dot sight line + crisp Worms-style crosshair reticle orbiting at fixed radius
        for (let t = 1; t <= 3; t++) {
          const sx = muzzleX + cos * (t * 14);
          const sy = muzzleY + sin * (t * 14);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.5)';
          ctx.beginPath();
          ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        const rx = pivotX + cos * 88;
        const ry = pivotY + sin * 88;
        const pulseR = 11 + Math.sin(time * 7) * 1.4;

        ctx.save();
        ctx.translate(rx, ry);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-pulseR - 4, 0);
        ctx.lineTo(-4, 0);
        ctx.moveTo(4, 0);
        ctx.lineTo(pulseR + 4, 0);
        ctx.moveTo(0, -pulseR - 4);
        ctx.lineTo(0, -4);
        ctx.moveTo(0, 4);
        ctx.lineTo(0, pulseR + 4);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Tapered Worms Armageddon muzzle power wedge extending directly along the barrel line
        const ratio = Math.max(
          0.03,
          Math.min(1, (chargePower - MIN_SHOT_POWER) / (MAX_SHOT_POWER - MIN_SHOT_POWER))
        );
        const maxLen = 116;
        const fillLen = Math.max(10, maxLen * ratio);
        const startHalfW = 3;
        const endHalfW = 14;

        ctx.save();
        ctx.translate(muzzleX, muzzleY);
        ctx.rotate(-rad);

        // Full gauge outline shell (shows max 100% wedge boundary)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -startHalfW);
        ctx.lineTo(maxLen, -endHalfW);
        ctx.lineTo(maxLen, endHalfW);
        ctx.lineTo(0, startHalfW);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Active Worms gradient wedge filled up to current charge ratio
        const currentEndW = startHalfW + (endHalfW - startHalfW) * ratio;
        const grad = ctx.createLinearGradient(0, 0, maxLen, 0);
        grad.addColorStop(0, '#22C55E');
        grad.addColorStop(0.45, '#EAB308');
        grad.addColorStop(0.75, '#F97316');
        grad.addColorStop(1, '#EF4444');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -startHalfW + 0.5);
        ctx.lineTo(fillLen, -currentEndW + 0.5);
        ctx.lineTo(fillLen, currentEndW - 0.5);
        ctx.lineTo(0, startHalfW - 0.5);
        ctx.closePath();
        ctx.fill();

        // Previous shot marker tick on the tapered wedge
        if (tank.lastPower !== undefined) {
          const prevRatio = Math.max(
            0,
            Math.min(1, (tank.lastPower - MIN_SHOT_POWER) / (MAX_SHOT_POWER - MIN_SHOT_POWER))
          );
          const px = maxLen * prevRatio;
          const pw = startHalfW + (endHalfW - startHalfW) * prevRatio;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, -pw - 2);
          ctx.lineTo(px, pw + 2);
          ctx.stroke();
        }
        ctx.restore();

        // Clean high-contrast readout tag above tank
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(-38, -104, 76, 18, 5);
        ctx.fill();
        ctx.fillStyle = ratio > 0.8 ? '#FCA5A5' : ratio > 0.45 ? '#FDE68A' : '#6EE7B7';
        ctx.font = '800 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`POWER ${Math.round(chargePower)}%`, 0, -95);
      }
    }

    const flash = tank.hitFlashTimer > 0;
    const bodyColor = flash ? '#FFFFFF' : tank.color;
    const trimColor = flash ? '#FFFFFF' : tank.accentColor;

    drawTankShape(
      ctx,
      tank.shapeId,
      bodyColor,
      trimColor,
      tank.barrelAngle,
      tank.recoilOffset,
      tank.slopeAngle,
      tank.facing,
      tank.activeWeapon !== 'normal'
    );

    if (tank.hasShield && tank.alive) {
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.9)';
      ctx.fillStyle = 'rgba(139, 92, 246, 0.16)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -14, 31, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (tank.alive) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(-34, -52, 68, 17, 4);
      ctx.fill();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P${idx + 1} · ${tank.hp}/${tank.maxHp}`, 0, -44.5);

      const pipStep = 9;
      const startPipX = -((tank.maxHp - 1) * pipStep) / 2;
      for (let p = 0; p < tank.maxHp; p++) {
        const px = startPipX + p * pipStep;
        const py = -38;
        ctx.fillStyle = p < tank.hp ? '#10B981' : '#334155';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1;
        ctx.fillRect(px - 2.5, py - 2, 5, 4);
        ctx.strokeRect(px - 2.5, py - 2, 5, 4);
      }
    }

    ctx.restore();
  });
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const proj of projectiles) {
    if (proj.trail.length > 1) {
      for (let i = 1; i < proj.trail.length; i++) {
        const alpha = (i / proj.trail.length) * 0.55;
        ctx.strokeStyle =
          proj.kind === 'heavy'
            ? `rgba(245, 158, 11, ${alpha})`
            : `rgba(248, 250, 252, ${alpha})`;
        ctx.lineWidth = (i / proj.trail.length) * proj.radius * 1.4;
        ctx.beginPath();
        ctx.moveTo(proj.trail[i - 1].x, proj.trail[i - 1].y);
        ctx.lineTo(proj.trail[i].x, proj.trail[i].y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = proj.kind === 'heavy' ? '#F59E0B' : '#FEF08A';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, pool: Particle[]): void {
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (!p.active) continue;
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.4 + alpha * 0.6), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]): void {
  for (const ft of texts) {
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '800 15px "Bricolage Grotesque", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#0F172A';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

function drawArchipelagoMinimap(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  scene: RenderSceneState,
  clampedCameraX: number,
  viewWorldWidth: number
): void {
  const mw = Math.min(280, canvasWidth * 0.36);
  const mh = 44;
  const mx = canvasWidth / 2 - mw / 2;
  const my = 76;
  const { world, heights, tanks, crates, projectiles } = scene;

  ctx.save();
  ctx.translate(mx, my);

  // Frame
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(0, 0, mw, mh, 8);
  ctx.fill();
  ctx.stroke();

  // Water line
  const waterMiniY = (world.waterLevelY / world.height) * mh;
  ctx.fillStyle = 'rgba(14, 116, 144, 0.55)';
  ctx.fillRect(2, waterMiniY, mw - 4, mh - waterMiniY - 2);

  // Island terrain silhouette
  ctx.fillStyle = '#4D7C4D';
  ctx.beginPath();
  ctx.moveTo(2, mh - 2);
  for (let px = 0; px <= mw - 4; px += 3) {
    const wx = Math.min(world.width - 1, Math.floor((px / (mw - 4)) * world.width));
    const py = Math.min(mh - 2, (heights[wx] / world.height) * mh);
    ctx.lineTo(2 + px, py);
  }
  ctx.lineTo(mw - 2, mh - 2);
  ctx.closePath();
  ctx.fill();

  // Crates
  ctx.fillStyle = '#FBBF24';
  for (const c of crates) {
    if (c.collected) continue;
    const cx = 2 + (c.x / world.width) * (mw - 4);
    const cy = Math.max(4, (c.y / world.height) * mh - 2);
    ctx.fillRect(cx - 1.5, cy - 1.5, 3, 3);
  }

  // Tanks
  tanks.forEach((t, idx) => {
    if (!t.alive) return;
    const tx = 2 + (t.x / world.width) * (mw - 4);
    const ty = Math.max(4, (t.y / world.height) * mh - 2);
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.arc(tx, ty, idx === scene.activeTankIndex ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
    if (idx === scene.activeTankIndex) {
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  });

  // Flying projectiles
  ctx.fillStyle = '#FEF08A';
  for (const p of projectiles) {
    const px = 2 + (p.x / world.width) * (mw - 4);
    const py = Math.max(2, Math.min(mh - 2, (p.y / world.height) * mh));
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Current camera viewport box
  if (!scene.overviewMode) {
    const vx = 2 + (clampedCameraX / world.width) * (mw - 4);
    const vw = Math.max(10, (viewWorldWidth / world.width) * (mw - 4));
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, 2, vw, mh - 4);
  }

  ctx.restore();
}
