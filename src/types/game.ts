export type SastraTopic = 'Pantun' | 'Syair' | 'Gurindam';
export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sulit';
export type DifficultyFilter = 'Campuran' | DifficultyLevel;

export type TankShapeId = 0 | 1 | 2 | 3 | 4 | 5;

export interface QuizQuestion {
  id: number;
  materi: SastraTopic;
  kesulitan: DifficultyLevel;
  pertanyaan: string;
  kutipan?: string;
  pilihan: [string, string, string, string];
  jawabanIndex: 0 | 1 | 2 | 3;
  pembahasan: string;
}

export type PowerUpType = 'heal' | 'heavy' | 'triple' | 'shield';

export interface PlayerConfig {
  id: number;
  name: string;
  color: string;
  accentColor: string;
  shapeId: TankShapeId;
  modelName: string;
  isBot: boolean;
}

export interface Tank {
  id: number;
  name: string;
  color: string;
  accentColor: string;
  shapeId: TankShapeId;
  modelName: string;
  isBot: boolean;
  x: number;
  y: number;
  slopeAngle: number;
  barrelAngle: number; // degrees: 0 = right, 90 = straight up, 180 = left
  power: number; // 5..100
  lastPower?: number; // Previous shot power marker (Worms style)
  hp: number; // 0..3
  maxHp: number;
  hasShield: boolean;
  activeWeapon: 'normal' | 'heavy' | 'triple';
  facing: 1 | -1;
  alive: boolean;
  hitFlashTimer: number;
  recoilOffset: number;
  koTimer: number; // 0..0.5s topple animation on death
  stats: {
    quizCorrect: number;
    quizTotal: number;
    shotsFired: number;
    hitsLanded: number;
    powerUpsCollected: number;
  };
}

export interface Projectile {
  id: number;
  ownerId: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  craterRadius: number;
  kind: 'normal' | 'heavy' | 'triple';
  trail: Array<{ x: number; y: number }>;
}

export interface PowerUpCrate {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  vy: number;
  landed: boolean;
  swayPhase: number;
  collected: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity: number;
}

export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';
export type TurnPhase = 'scout' | 'quiz' | 'action' | 'projectile' | 'resolving';

export interface QuizResolution {
  selectedIndex: number;
  isCorrect: boolean;
  timedOut?: boolean;
}

export interface MatchSummary {
  winner: Tank | null;
  isDraw: boolean;
  roundsPlayed: number;
  totalQuizAnswered: number;
  totalQuizCorrect: number;
  rankings: Tank[];
}

export interface WorldConfig {
  width: number;
  height: number;
  waterLevelY: number;
  gravity: number;
  maxHp: number;
  turnSeconds: number;
  quizSeconds: number;
}
