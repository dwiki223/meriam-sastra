import { useCallback, useEffect, useRef, useState } from 'react';
import { QUIZ_QUESTIONS } from './data/questions';
import { TitleScreen } from './components/TitleScreen';
import { QuizModal } from './components/QuizModal';
import { GameHud } from './components/GameHud';
import { PauseModal, VictoryModal } from './components/GameModals';
import { soundEngine } from './game/audio';
import {
  DEFAULT_WORLD,
  MAX_SHOT_POWER,
  MIN_SHOT_POWER,
  PLAYER_PALETTE,
  QuizDeck,
  applyExplosionDamage,
  applyPowerUpToTank,
  carveCrater,
  checkCratePickupByTanks,
  checkProjectileCollision,
  clamp,
  computeBotAim,
  computeWormsCharge,
  createProjectilesFromTank,
  createTanks,
  findNextAliveTankIndex,
  generateTerrain,
  getAliveTanks,
  moveTank,
  rollNextWind,
  spawnPowerUpCrate,
  stepPowerUpCrate,
  stepProjectile,
  stepTankGravity,
} from './game/physics';
import {
  createParticlePool,
  getCameraViewBounds,
  renderBattlefield,
  spawnParticleBurst,
  stepParticles,
} from './game/renderer';
import type {
  DifficultyFilter,
  FloatingText,
  GameScreenState,
  MatchSummary,
  PlayerConfig,
  PowerUpCrate,
  Projectile,
  QuizQuestion,
  QuizResolution,
  Tank,
  TurnPhase,
} from './types/game';

function createInitialPlayers(): PlayerConfig[] {
  return PLAYER_PALETTE.map((item, idx) => ({
    id: idx + 1,
    name: `Pemain ${idx + 1}`,
    color: item.color,
    accentColor: item.accent,
    shapeId: item.shapeId,
    modelName: item.modelName,
    isBot: false,
  }));
}

// Monotonic Worms Armageddon charge helper imported from ./game/physics

interface SimState {
  heights: Float32Array;
  scorch: Float32Array;
  terrainVersion: number;
  tanks: Tank[];
  activeTankIndex: number;
  projectiles: Projectile[];
  crates: PowerUpCrate[];
  particles: ReturnType<typeof createParticlePool>;
  particleCursor: { current: number };
  floatingTexts: FloatingText[];
  wind: number;
  turnTimer: number;
  turnDeadline: number;
  quizTimer: number;
  quizDeadline: number;
  pausedAt: number | null;
  quizTimedOutTriggered: boolean;
  cameraX: number;
  manualCameraOffset: number;
  roundNumber: number;
  turnsTaken: number;
  hitstopTimer: number;
  shakeTrauma: number;
  time: number;
  nextId: { current: number };
  resolveTimer: number;
  isCharging: boolean;
  chargePower: number;
  chargeStartedAt: number;
  chargeDir: 1 | -1;
  chargeToneStep: number;
  botPlan: {
    targetX: number;
    barrelAngle: number;
    power: number;
    actTimer: number;
    fired: boolean;
  } | null;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const turnTimerElRef = useRef<HTMLSpanElement | null>(null);
  const quizTimerElRef = useRef<HTMLSpanElement | null>(null);
  const quizBarElRef = useRef<HTMLDivElement | null>(null);
  const chargeBarElRef = useRef<HTMLDivElement | null>(null);
  const chargeTextElRef = useRef<HTMLSpanElement | null>(null);

  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<PlayerConfig[]>(createInitialPlayers);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('Campuran');

  const [screen, setScreen] = useState<GameScreenState>('title');
  const [phase, setPhase] = useState<TurnPhase>('scout');
  const [hudTanks, setHudTanks] = useState<Tank[]>([]);
  const [activeTankIndex, setActiveTankIndex] = useState<number>(0);
  const [windDisplay, setWindDisplay] = useState<number>(2.4);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [muted, setMuted] = useState<boolean>(false);
  const [overviewMode, setOverviewMode] = useState<boolean>(false);
  const [isCharging, setIsCharging] = useState<boolean>(false);

  const [currentQuiz, setCurrentQuiz] = useState<{
    question: QuizQuestion;
    indexInCycle: number;
    totalInDeck: number;
  } | null>(null);
  const [quizResolution, setQuizResolution] = useState<QuizResolution | null>(null);
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);

  const screenRef = useRef<GameScreenState>('title');
  const phaseRef = useRef<TurnPhase>('scout');
  const overviewRef = useRef<boolean>(false);
  const currentQuizRef = useRef<{
    question: QuizQuestion;
    indexInCycle: number;
    totalInDeck: number;
  } | null>(null);
  const quizResolutionRef = useRef<QuizResolution | null>(null);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const touchMoveDirRef = useRef<-1 | 0 | 1>(0);
  const touchPanDirRef = useRef<-1 | 0 | 1>(0);
  const dragPanRef = useRef<{ active: boolean; lastClientX: number }>({ active: false, lastClientX: 0 });
  const quizDeckRef = useRef<QuizDeck>(new QuizDeck(QUIZ_QUESTIONS, 'Campuran'));
  const quizAutoTimerRef = useRef<number | null>(null);

  const initialTerrain = generateTerrain(
    DEFAULT_WORLD.width,
    DEFAULT_WORLD.height,
    17,
    DEFAULT_WORLD.waterLevelY
  );
  const simRef = useRef<SimState>({
    heights: initialTerrain.heights,
    scorch: initialTerrain.scorch,
    terrainVersion: 1,
    tanks: createTanks(
      createInitialPlayers().slice(0, 2),
      initialTerrain.heights,
      DEFAULT_WORLD,
      17
    ),
    activeTankIndex: 0,
    projectiles: [],
    crates: [],
    particles: createParticlePool(),
    particleCursor: { current: 0 },
    floatingTexts: [],
    wind: 2.4,
    turnTimer: DEFAULT_WORLD.turnSeconds,
    turnDeadline: 0,
    quizTimer: DEFAULT_WORLD.quizSeconds,
    quizDeadline: 0,
    pausedAt: null,
    quizTimedOutTriggered: false,
    cameraX: 0,
    manualCameraOffset: 0,
    roundNumber: 1,
    turnsTaken: 0,
    hitstopTimer: 0,
    shakeTrauma: 0,
    time: 0,
    nextId: { current: 100 },
    resolveTimer: 0,
    isCharging: false,
    chargePower: 50,
    chargeStartedAt: 0,
    chargeDir: 1,
    chargeToneStep: 0,
    botPlan: null,
  });

  const syncHudSnapshot = useCallback(() => {
    const sim = simRef.current;
    setHudTanks(sim.tanks.map((t) => ({ ...t, stats: { ...t.stats } })));
    setActiveTankIndex(sim.activeTankIndex);
    setWindDisplay(sim.wind);
    setRoundNumber(sim.roundNumber);
  }, []);

  const updateBodyAttributes = useCallback((nextScreen: GameScreenState, nextPhase: TurnPhase) => {
    document.body.dataset.state = nextScreen;
    document.body.dataset.phase = nextPhase;
  }, []);

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    const sim = simRef.current;
    sim.floatingTexts.push({
      id: sim.nextId.current++,
      x,
      y,
      vy: -38,
      text,
      color,
      life: 1.35,
      maxLife: 1.35,
    });
  }, []);

  const clearInputs = useCallback(() => {
    keysPressedRef.current.clear();
    touchMoveDirRef.current = 0;
    touchPanDirRef.current = 0;
    dragPanRef.current.active = false;
    simRef.current.isCharging = false;
    setIsCharging(false);
  }, []);

  const finishMatch = useCallback(() => {
    const sim = simRef.current;
    const alive = getAliveTanks(sim.tanks);
    const winner = alive.length === 1 ? alive[0] : null;
    const rankings = [...sim.tanks].sort((a, b) => {
      if (a.alive !== b.alive) return a.alive ? -1 : 1;
      if (b.hp !== a.hp) return b.hp - a.hp;
      return b.stats.hitsLanded - a.stats.hitsLanded;
    });

    const totalQuizAnswered = sim.tanks.reduce((acc, t) => acc + t.stats.quizTotal, 0);
    const totalQuizCorrect = sim.tanks.reduce((acc, t) => acc + t.stats.quizCorrect, 0);

    soundEngine.playVictory();
    screenRef.current = 'gameover';
    setScreen('gameover');
    updateBodyAttributes('gameover', phaseRef.current);
    currentQuizRef.current = null;
    setCurrentQuiz(null);
    quizResolutionRef.current = null;
    setQuizResolution(null);
    clearInputs();
    setMatchSummary({
      winner: winner ? { ...winner, stats: { ...winner.stats } } : null,
      isDraw: alive.length === 0,
      roundsPlayed: sim.roundNumber,
      totalQuizAnswered,
      totalQuizCorrect,
      rankings: rankings.map((t) => ({ ...t, stats: { ...t.stats } })),
    });
  }, [clearInputs, updateBodyAttributes]);

  const startActionPhase = useCallback(() => {
    const sim = simRef.current;
    const tank = sim.tanks[sim.activeTankIndex];
    if (!tank || !tank.alive) return;

    currentQuizRef.current = null;
    setCurrentQuiz(null);
    quizResolutionRef.current = null;
    setQuizResolution(null);
    overviewRef.current = false;
    setOverviewMode(false);
    sim.manualCameraOffset = 0;
    sim.turnTimer = DEFAULT_WORLD.turnSeconds;
    sim.turnDeadline = performance.now() + DEFAULT_WORLD.turnSeconds * 1000;
    phaseRef.current = 'action';
    setPhase('action');
    updateBodyAttributes(screenRef.current, 'action');
    clearInputs();

    if (turnTimerElRef.current) {
      turnTimerElRef.current.textContent = `${DEFAULT_WORLD.turnSeconds.toFixed(1)}s`;
    }

    if (tank.isBot) {
      const plan = computeBotAim(tank, sim.tanks, sim.heights, sim.wind, DEFAULT_WORLD);
      sim.botPlan = {
        ...plan,
        actTimer: 1.5,
        fired: false,
      };
    }

    syncHudSnapshot();
  }, [clearInputs, syncHudSnapshot, updateBodyAttributes]);

  const beginQuizForCurrentTank = useCallback(() => {
    const sim = simRef.current;
    const tank = sim.tanks[sim.activeTankIndex];
    if (!tank || !tank.alive) return;

    const drawn = quizDeckRef.current.draw();
    sim.quizTimer = DEFAULT_WORLD.quizSeconds;
    sim.quizDeadline = performance.now() + DEFAULT_WORLD.quizSeconds * 1000;
    sim.quizTimedOutTriggered = false;
    quizResolutionRef.current = null;
    setQuizResolution(null);
    currentQuizRef.current = drawn;
    setCurrentQuiz(drawn);

    phaseRef.current = 'quiz';
    setPhase('quiz');
    updateBodyAttributes(screenRef.current, 'quiz');
    clearInputs();
    syncHudSnapshot();

    if (tank.isBot) {
      if (quizAutoTimerRef.current) window.clearTimeout(quizAutoTimerRef.current);
      quizAutoTimerRef.current = window.setTimeout(() => {
        if (screenRef.current !== 'playing' || phaseRef.current !== 'quiz') return;
        const botCorrect = Math.random() < 0.75;
        const selected = botCorrect
          ? drawn.question.jawabanIndex
          : ((drawn.question.jawabanIndex + 1) % 4);
        tank.stats.quizTotal += 1;
        if (botCorrect) tank.stats.quizCorrect += 1;
        soundEngine.playQuizResult(botCorrect);

        const res: QuizResolution = { selectedIndex: selected, isCorrect: botCorrect };
        quizResolutionRef.current = res;
        setQuizResolution(res);
        quizAutoTimerRef.current = window.setTimeout(() => {
          if (screenRef.current !== 'playing') return;
          if (botCorrect) {
            startActionPhase();
          } else {
            addFloatingText(tank.x, tank.y - 54, 'Salah Kuis · Lewat!', '#F87171');
            advanceTurn();
          }
        }, 900);
      }, 650);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addFloatingText, clearInputs, startActionPhase, syncHudSnapshot, updateBodyAttributes]);

  const beginScoutForCurrentTank = useCallback(() => {
    const sim = simRef.current;
    const tank = sim.tanks[sim.activeTankIndex];
    if (!tank || !tank.alive) return;

    // Bots bypass human scouting directly to quiz
    if (tank.isBot) {
      beginQuizForCurrentTank();
      return;
    }

    sim.manualCameraOffset = 0;
    sim.cameraX = clamp(tank.x - 720, 0, DEFAULT_WORLD.width - 1440);
    overviewRef.current = false;
    setOverviewMode(false);
    currentQuizRef.current = null;
    setCurrentQuiz(null);
    quizResolutionRef.current = null;
    setQuizResolution(null);

    phaseRef.current = 'scout';
    setPhase('scout');
    updateBodyAttributes(screenRef.current, 'scout');
    clearInputs();
    syncHudSnapshot();
  }, [beginQuizForCurrentTank, clearInputs, syncHudSnapshot, updateBodyAttributes]);

  const advanceTurn = useCallback(() => {
    const sim = simRef.current;
    const alive = getAliveTanks(sim.tanks);
    if (alive.length <= 1) {
      finishMatch();
      return;
    }

    const nextIdx = findNextAliveTankIndex(sim.tanks, sim.activeTankIndex);
    if (nextIdx === -1) {
      finishMatch();
      return;
    }

    if (nextIdx <= sim.activeTankIndex) {
      sim.roundNumber += 1;
    }
    sim.activeTankIndex = nextIdx;
    sim.turnsTaken += 1;
    sim.wind = rollNextWind(sim.wind);
    sim.botPlan = null;

    const activeCrates = sim.crates.filter((c) => !c.collected).length;
    if (sim.turnsTaken % 2 === 1 && activeCrates < 3) {
      sim.crates.push(spawnPowerUpCrate(sim.nextId, sim.tanks, sim.heights, DEFAULT_WORLD));
    }

    beginScoutForCurrentTank();
  }, [beginScoutForCurrentTank, finishMatch]);

  const fireActiveTank = useCallback(() => {
    const sim = simRef.current;
    if (screenRef.current !== 'playing' || phaseRef.current !== 'action') return;
    const tank = sim.tanks[sim.activeTankIndex];
    if (!tank || !tank.alive) return;

    const wasHeavy = tank.activeWeapon === 'heavy';
    const spawned = createProjectilesFromTank(tank, sim.nextId);
    sim.projectiles.push(...spawned);

    soundEngine.playFire(wasHeavy);
    spawnParticleBurst(
      sim.particles,
      sim.particleCursor,
      spawned[0].x,
      spawned[0].y,
      10,
      ['#FEF08A', '#F97316', '#94A3B8'],
      40,
      160,
      120
    );

    overviewRef.current = false;
    setOverviewMode(false);
    phaseRef.current = 'projectile';
    setPhase('projectile');
    updateBodyAttributes('playing', 'projectile');
    clearInputs();
    syncHudSnapshot();
  }, [clearInputs, syncHudSnapshot, updateBodyAttributes]);

  const startChargeShot = useCallback(() => {
    const sim = simRef.current;
    if (screenRef.current !== 'playing' || phaseRef.current !== 'action') return;
    const tank = sim.tanks[sim.activeTankIndex];
    if (!tank || !tank.alive || tank.isBot || sim.isCharging) return;

    sim.isCharging = true;
    sim.chargeStartedAt = performance.now();
    sim.chargePower = MIN_SHOT_POWER;
    sim.chargeDir = 1;
    sim.chargeToneStep = 0;
    tank.power = MIN_SHOT_POWER;
    setIsCharging(true);
    soundEngine.playChargeStep(0);

    if (chargeTextElRef.current) {
      chargeTextElRef.current.textContent = `${MIN_SHOT_POWER}%`;
    }
    if (chargeBarElRef.current) {
      chargeBarElRef.current.style.transform = 'scaleX(0.03)';
      chargeBarElRef.current.style.backgroundColor = '#22C55E';
    }
  }, []);

  const releaseChargeAndFire = useCallback(
    (forceMaxPower = false) => {
      const sim = simRef.current;
      if (screenRef.current !== 'playing' || phaseRef.current !== 'action') return;
      const tank = sim.tanks[sim.activeTankIndex];
      if (!tank || !tank.alive) return;

      if (sim.isCharging) {
        const { power } = computeWormsCharge(performance.now() - sim.chargeStartedAt);
        const finalPower = forceMaxPower ? MAX_SHOT_POWER : power;
        sim.chargePower = finalPower;
        tank.power = Math.round(clamp(finalPower, MIN_SHOT_POWER, MAX_SHOT_POWER));
        sim.isCharging = false;
        setIsCharging(false);
      }
      fireActiveTank();
    },
    [fireActiveTank]
  );

  const startNewGame = useCallback(
    (overridePlayers?: PlayerConfig[], overrideCount?: number, overrideDiff?: DifficultyFilter) => {
      if (quizAutoTimerRef.current) {
        window.clearTimeout(quizAutoTimerRef.current);
        quizAutoTimerRef.current = null;
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      const activeCount = overrideCount ?? playerCount;
      const roster = (overridePlayers ?? players).slice(0, activeCount);
      const diff = overrideDiff ?? difficulty;

      quizDeckRef.current = new QuizDeck(QUIZ_QUESTIONS, diff);

      const matchSeed = Math.random() * 100000;
      const { heights, scorch } = generateTerrain(
        DEFAULT_WORLD.width,
        DEFAULT_WORLD.height,
        matchSeed,
        DEFAULT_WORLD.waterLevelY
      );
      const tanks = createTanks(roster, heights, DEFAULT_WORLD, matchSeed);
      const sim = simRef.current;

      sim.heights = heights;
      sim.scorch = scorch;
      sim.terrainVersion += 1;
      sim.tanks = tanks;
      sim.activeTankIndex = 0;
      sim.projectiles = [];
      sim.crates = [spawnPowerUpCrate(sim.nextId, tanks, heights, DEFAULT_WORLD)];
      sim.floatingTexts = [];
      sim.wind = rollNextWind(0);
      sim.turnTimer = DEFAULT_WORLD.turnSeconds;
      sim.quizTimer = DEFAULT_WORLD.quizSeconds;
      sim.quizTimedOutTriggered = false;
      sim.isCharging = false;
      sim.chargePower = 50;
      sim.chargeDir = 1;
      setIsCharging(false);
      sim.cameraX = clamp(tanks[0].x - 780, 0, DEFAULT_WORLD.width - 1560);
      sim.manualCameraOffset = 0;
      sim.roundNumber = 1;
      sim.turnsTaken = 0;
      sim.hitstopTimer = 0;
      sim.shakeTrauma = 0;
      sim.resolveTimer = 0;
      sim.botPlan = null;

      setMatchSummary(null);
      screenRef.current = 'playing';
      setScreen('playing');
      beginScoutForCurrentTank();
    },
    [beginScoutForCurrentTank, difficulty, playerCount, players]
  );

  const handleSelectQuizAnswer = useCallback(
    (optionIndex: number) => {
      const quiz = currentQuizRef.current;
      if (!quiz || quizResolutionRef.current) return;
      const sim = simRef.current;
      const tank = sim.tanks[sim.activeTankIndex];
      if (!tank || tank.isBot) return;

      const isCorrect = optionIndex === quiz.question.jawabanIndex;
      tank.stats.quizTotal += 1;
      if (isCorrect) tank.stats.quizCorrect += 1;

      soundEngine.playQuizResult(isCorrect);
      const res: QuizResolution = { selectedIndex: optionIndex, isCorrect };
      quizResolutionRef.current = res;
      setQuizResolution(res);

      if (quizAutoTimerRef.current) window.clearTimeout(quizAutoTimerRef.current);
      quizAutoTimerRef.current = window.setTimeout(() => {
        if (screenRef.current !== 'playing' || phaseRef.current !== 'quiz') return;
        if (isCorrect) {
          startActionPhase();
        } else {
          addFloatingText(tank.x, tank.y - 54, 'Salah · Giliran Lewat', '#F87171');
          advanceTurn();
        }
      }, isCorrect ? 1600 : 4500);
    },
    [addFloatingText, advanceTurn, startActionPhase]
  );

  const handleQuizTimeout = useCallback(() => {
    if (!currentQuizRef.current || quizResolutionRef.current) return;
    const sim = simRef.current;
    const tank = sim.tanks[sim.activeTankIndex];
    if (!tank) return;

    sim.quizTimedOutTriggered = true;
    tank.stats.quizTotal += 1;
    soundEngine.playQuizResult(false);
    const res: QuizResolution = { selectedIndex: -1, isCorrect: false, timedOut: true };
    quizResolutionRef.current = res;
    setQuizResolution(res);

    if (quizAutoTimerRef.current) window.clearTimeout(quizAutoTimerRef.current);
    quizAutoTimerRef.current = window.setTimeout(() => {
      if (screenRef.current !== 'playing' || phaseRef.current !== 'quiz') return;
      addFloatingText(tank.x, tank.y - 54, 'Waktu Habis · Lewat', '#F87171');
      advanceTurn();
    }, 4500);
  }, [addFloatingText, advanceTurn]);

  const handleContinueAfterQuiz = useCallback(() => {
    const res = quizResolutionRef.current;
    if (!res) return;
    if (quizAutoTimerRef.current) {
      window.clearTimeout(quizAutoTimerRef.current);
      quizAutoTimerRef.current = null;
    }
    const tank = simRef.current.tanks[simRef.current.activeTankIndex];
    if (res.isCorrect) {
      startActionPhase();
    } else {
      if (tank) {
        addFloatingText(
          tank.x,
          tank.y - 54,
          res.timedOut ? 'Waktu Habis · Lewat' : 'Salah · Giliran Lewat',
          '#F87171'
        );
      }
      advanceTurn();
    }
  }, [addFloatingText, advanceTurn, startActionPhase]);

  const togglePause = useCallback(() => {
    const sim = simRef.current;
    if (screenRef.current === 'playing') {
      clearInputs();
      sim.pausedAt = performance.now();
      screenRef.current = 'paused';
      setScreen('paused');
      updateBodyAttributes('paused', phaseRef.current);
    } else if (screenRef.current === 'paused') {
      if (sim.pausedAt !== null) {
        const pausedDuration = performance.now() - sim.pausedAt;
        sim.quizDeadline += pausedDuration;
        sim.turnDeadline += pausedDuration;
        sim.pausedAt = null;
      }
      screenRef.current = 'playing';
      setScreen('playing');
      updateBodyAttributes('playing', phaseRef.current);
    }
  }, [clearInputs, updateBodyAttributes]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const toggleOverview = useCallback(() => {
    overviewRef.current = !overviewRef.current;
    setOverviewMode(overviewRef.current);
  }, []);

  const exitToTitle = useCallback(() => {
    if (quizAutoTimerRef.current) {
      window.clearTimeout(quizAutoTimerRef.current);
      quizAutoTimerRef.current = null;
    }
    clearInputs();
    currentQuizRef.current = null;
    setCurrentQuiz(null);
    quizResolutionRef.current = null;
    setQuizResolution(null);
    setMatchSummary(null);
    screenRef.current = 'title';
    setScreen('title');
    updateBodyAttributes('title', 'scout');
  }, [clearInputs, updateBodyAttributes]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startNewGame();
    } else {
      updateBodyAttributes('title', 'scout');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global keyboard listeners + focus-loss hygiene
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (screenRef.current === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startNewGame();
        }
        return;
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (screenRef.current === 'playing' || screenRef.current === 'paused') {
          e.preventDefault();
          togglePause();
        }
        return;
      }

      if (e.key.toLowerCase() === 'm') {
        toggleMute();
        return;
      }

      if (e.key.toLowerCase() === 'v' && screenRef.current === 'playing' && phaseRef.current !== 'quiz') {
        e.preventDefault();
        toggleOverview();
        return;
      }

      if (e.key.toLowerCase() === 'r' && (screenRef.current === 'playing' || screenRef.current === 'paused')) {
        e.preventDefault();
        startNewGame();
        return;
      }

      if (screenRef.current === 'playing' && phaseRef.current === 'scout') {
        const tank = simRef.current.tanks[simRef.current.activeTankIndex];
        if (!tank || tank.isBot) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!e.repeat) beginQuizForCurrentTank();
          return;
        }
        keysPressedRef.current.add(e.key.toLowerCase());
        return;
      }

      if (screenRef.current === 'playing' && phaseRef.current === 'action') {
        const tank = simRef.current.tanks[simRef.current.activeTankIndex];
        if (!tank || tank.isBot) return;

        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!e.repeat) startChargeShot();
          return;
        }
        keysPressedRef.current.add(e.key.toLowerCase());
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.key.toLowerCase());
      if (
        (e.key === ' ' || e.key === 'Enter') &&
        screenRef.current === 'playing' &&
        phaseRef.current === 'action' &&
        simRef.current.isCharging
      ) {
        releaseChargeAndFire();
      }
    };

    const onBlurOrHide = () => {
      clearInputs();
    };

    const onGlobalPointerUp = () => {
      if (
        screenRef.current === 'playing' &&
        phaseRef.current === 'action' &&
        simRef.current.isCharging
      ) {
        releaseChargeAndFire();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerup', onGlobalPointerUp);
    window.addEventListener('pointercancel', onGlobalPointerUp);
    window.addEventListener('blur', onBlurOrHide);
    document.addEventListener('visibilitychange', onBlurOrHide);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointerup', onGlobalPointerUp);
      window.removeEventListener('pointercancel', onGlobalPointerUp);
      window.removeEventListener('blur', onBlurOrHide);
      document.removeEventListener('visibilitychange', onBlurOrHide);
    };
  }, [
    beginQuizForCurrentTank,
    clearInputs,
    releaseChargeAndFire,
    startChargeShot,
    startNewGame,
    toggleMute,
    toggleOverview,
    togglePause,
  ]);

  // Pointer drag panning or minimap jump on canvas during scout mode
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && screenRef.current === 'playing' && phaseRef.current === 'scout' && !overviewRef.current) {
      const rect = canvas.getBoundingClientRect();
      const dpr = canvas.width / Math.max(1, rect.width);
      const px = (e.clientX - rect.left) * dpr;
      const py = (e.clientY - rect.top) * dpr;
      const mw = Math.min(280, canvas.width * 0.36);
      const mh = 44;
      const mx = canvas.width / 2 - mw / 2;
      const my = 76;
      if (px >= mx && px <= mx + mw && py >= my && py <= my + mh) {
        const normX = clamp((px - mx) / mw, 0, 1);
        const targetWorldX = normX * DEFAULT_WORLD.width;
        const activeTank = simRef.current.tanks[simRef.current.activeTankIndex];
        const camInfo = getCameraViewBounds(canvas.width, canvas.height, DEFAULT_WORLD, simRef.current.cameraX, false);
        const baseCamX = activeTank ? activeTank.x - camInfo.viewWorldWidth * 0.5 : 0;
        const desiredCamX = clamp(targetWorldX - camInfo.viewWorldWidth * 0.5, 0, DEFAULT_WORLD.width - camInfo.viewWorldWidth);
        simRef.current.manualCameraOffset = desiredCamX - baseCamX;
        return;
      }
    }

    if (screenRef.current === 'playing' && (phaseRef.current === 'scout' || phaseRef.current === 'action')) {
      dragPanRef.current = { active: true, lastClientX: e.clientX };
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragPanRef.current.active) return;
    const dx = e.clientX - dragPanRef.current.lastClientX;
    dragPanRef.current.lastClientX = e.clientX;
    if (phaseRef.current === 'scout') {
      simRef.current.manualCameraOffset = clamp(
        simRef.current.manualCameraOffset - dx * 2.1,
        -DEFAULT_WORLD.width,
        DEFAULT_WORLD.width
      );
    }
  };

  const handleCanvasPointerUp = () => {
    dragPanRef.current.active = false;
  };

  const callbacksRef = useRef({
    addFloatingText,
    advanceTurn,
    fireActiveTank,
    releaseChargeAndFire,
    handleQuizTimeout,
    syncHudSnapshot,
    updateBodyAttributes,
  });
  callbacksRef.current = {
    addFloatingText,
    advanceTurn,
    fireActiveTank,
    releaseChargeAndFire,
    handleQuizTimeout,
    syncHudSnapshot,
    updateBodyAttributes,
  };

  // Main 60Hz Canvas simulation & rendering loop (mounted once)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas);

    let rafId = 0;
    let lastTs = performance.now();
    let hudSyncAccumulator = 0;

    const tick = (now: number) => {
      const cb = callbacksRef.current;
      const rawDt = (now - lastTs) / 1000;
      lastTs = now;
      const dt = Math.min(rawDt, 0.05);
      const sim = simRef.current;

      if (screenRef.current !== 'paused') {
        sim.time += dt;
      }

      if (sim.shakeTrauma > 0) {
        sim.shakeTrauma = Math.max(0, sim.shakeTrauma - dt * 2.2);
      }

      if (screenRef.current === 'playing') {
        if (sim.hitstopTimer > 0) {
          sim.hitstopTimer = Math.max(0, sim.hitstopTimer - dt);
        } else {
          for (const t of sim.tanks) {
            const drowned = stepTankGravity(t, dt, sim.heights, DEFAULT_WORLD);
            if (drowned) {
              soundEngine.playExplosion(true);
              addFloatingText(t.x, DEFAULT_WORLD.waterLevelY - 24, 'TENGGELAM!', '#38BDF8');
              spawnParticleBurst(
                sim.particles,
                sim.particleCursor,
                t.x,
                DEFAULT_WORLD.waterLevelY,
                18,
                ['#BAE6FD', '#38BDF8', '#FFFFFF'],
                60,
                210,
                300
              );
              syncHudSnapshot();
            }
          }

          for (const crate of sim.crates) {
            stepPowerUpCrate(crate, dt, sim.heights, DEFAULT_WORLD);
          }
          const pickups = checkCratePickupByTanks(sim.crates, sim.tanks);
          for (const pickup of pickups) {
            soundEngine.playPickup();
            addFloatingText(pickup.tank.x, pickup.tank.y - 54, pickup.label, '#34D399');
            spawnParticleBurst(
              sim.particles,
              sim.particleCursor,
              pickup.crate.x,
              pickup.crate.y - 12,
              14,
              ['#34D399', '#FBBF24', '#FFFFFF'],
              50,
              150,
              140
            );
            syncHudSnapshot();
          }
          sim.crates = sim.crates.filter((c) => !c.collected);

          stepParticles(sim.particles, dt);
          for (const ft of sim.floatingTexts) {
            ft.y += ft.vy * dt;
            ft.life -= dt;
          }
          sim.floatingTexts = sim.floatingTexts.filter((ft) => ft.life > 0);

          // Phase: Mode Melihat (Scouting camera pan before quiz)
          if (phaseRef.current === 'scout') {
            const keys = keysPressedRef.current;
            let panDir: -1 | 0 | 1 = touchPanDirRef.current;
            if (keys.has('a') || keys.has('arrowleft')) panDir = -1;
            else if (keys.has('d') || keys.has('arrowright')) panDir = 1;

            if (panDir !== 0) {
              sim.manualCameraOffset += panDir * 1350 * dt;
            }
            const activeTank = sim.tanks[sim.activeTankIndex];
            const camInfo = getCameraViewBounds(canvas.width, canvas.height, DEFAULT_WORLD, sim.cameraX, false);
            const maxCamX = Math.max(0, DEFAULT_WORLD.width - camInfo.viewWorldWidth);
            const baseCamX = activeTank ? activeTank.x - camInfo.viewWorldWidth * 0.5 : 0;
            const desiredX = clamp(baseCamX + sim.manualCameraOffset, 0, maxCamX);
            // Clamp manual offset so hitting edge doesn't accumulate windup
            sim.manualCameraOffset = desiredX - baseCamX;
            sim.cameraX += (desiredX - sim.cameraX) * Math.min(1, dt * 10);
          }

          // Phase: 10-Second Quiz Timer (wall-clock deadline)
          if (phaseRef.current === 'quiz') {
            const activeTank = sim.tanks[sim.activeTankIndex];
            if (activeTank && !activeTank.isBot && !quizResolutionRef.current) {
              const wallNow = performance.now();
              sim.quizTimer = Math.max(0, (sim.quizDeadline - wallNow) / 1000);
              if (quizTimerElRef.current) {
                quizTimerElRef.current.textContent = `${sim.quizTimer.toFixed(1)}s`;
                if (sim.quizTimer <= 2.5) {
                  quizTimerElRef.current.style.color = '#F87171';
                } else if (sim.quizTimer <= 5.0) {
                  quizTimerElRef.current.style.color = '#FBBF24';
                } else {
                  quizTimerElRef.current.style.color = '#FDE68A';
                }
              }
              if (quizBarElRef.current) {
                const ratio = clamp(sim.quizTimer / DEFAULT_WORLD.quizSeconds, 0, 1);
                quizBarElRef.current.style.transform = `scaleX(${ratio})`;
                quizBarElRef.current.style.backgroundColor =
                  sim.quizTimer <= 2.5 ? '#DC2626' : sim.quizTimer <= 5.0 ? '#F59E0B' : '#D97706';
              }

              if (sim.quizTimer <= 0 && !sim.quizTimedOutTriggered) {
                cb.handleQuizTimeout();
              }
            }
          }

          // Phase: 10-Second Walk & Aim Action Turn
          if (phaseRef.current === 'action') {
            const activeTank = sim.tanks[sim.activeTankIndex];
            if (activeTank && activeTank.alive) {
              if (activeTank.isBot && sim.botPlan) {
                const plan = sim.botPlan;
                const diffX = plan.targetX - activeTank.x;
                if (Math.abs(diffX) > 10 && plan.actTimer > 0.85) {
                  moveTank(activeTank, diffX > 0 ? 1 : -1, dt, sim.heights, sim.tanks, DEFAULT_WORLD);
                }
                activeTank.barrelAngle += (plan.barrelAngle - activeTank.barrelAngle) * Math.min(1, dt * 6);
                plan.actTimer -= dt;
                if (plan.actTimer <= 0.65 && !plan.fired) {
                  sim.isCharging = true;
                  const chargeProgress = clamp((0.65 - plan.actTimer) / 0.65, 0, 1);
                  sim.chargePower = 12 + (plan.power - 12) * chargeProgress;
                  activeTank.power = sim.chargePower;
                }
                if (plan.actTimer <= 0 && !plan.fired) {
                  plan.fired = true;
                  activeTank.power = plan.power;
                  sim.isCharging = false;
                  fireActiveTank();
                }
              } else {
                const keys = keysPressedRef.current;
                let moveDir: -1 | 0 | 1 = touchMoveDirRef.current;
                if (keys.has('a') || keys.has('arrowleft')) moveDir = -1;
                else if (keys.has('d') || keys.has('arrowright')) moveDir = 1;

                if (moveDir !== 0) {
                  moveTank(activeTank, moveDir, dt, sim.heights, sim.tanks, DEFAULT_WORLD);
                }

                if (keys.has('w') || keys.has('arrowup')) {
                  activeTank.barrelAngle = clamp(activeTank.barrelAngle + 52 * dt, 5, 175);
                }
                if (keys.has('s') || keys.has('arrowdown')) {
                  activeTank.barrelAngle = clamp(activeTank.barrelAngle - 52 * dt, 5, 175);
                }

                // Worms Armageddon monotonic charge ramp (5% -> 100%, auto-fires at 100%)
                if (sim.isCharging) {
                  const { power, ratio, maxedOut } = computeWormsCharge(
                    performance.now() - sim.chargeStartedAt
                  );
                  sim.chargePower = power;
                  activeTank.power = power;
                  const step = Math.floor(ratio * 15);
                  if (step !== sim.chargeToneStep) {
                    sim.chargeToneStep = step;
                    soundEngine.playChargeStep(ratio);
                  }
                  if (chargeTextElRef.current) {
                    chargeTextElRef.current.textContent = `${Math.round(power)}%`;
                  }
                  if (chargeBarElRef.current) {
                    chargeBarElRef.current.style.transform = `scaleX(${Math.max(0.03, ratio)})`;
                    chargeBarElRef.current.style.backgroundColor =
                      ratio > 0.78 ? '#EF4444' : ratio > 0.44 ? '#F59E0B' : '#22C55E';
                  }
                  if (maxedOut) {
                    cb.releaseChargeAndFire(true);
                  }
                }
              }

              // Camera follows active tank smoothly
              const camInfo = getCameraViewBounds(canvas.width, canvas.height, DEFAULT_WORLD, sim.cameraX, false);
              const maxCamX = Math.max(0, DEFAULT_WORLD.width - camInfo.viewWorldWidth);
              const desiredCamX = clamp(activeTank.x - camInfo.viewWorldWidth * 0.45, 0, maxCamX);
              sim.cameraX += (desiredCamX - sim.cameraX) * Math.min(1, dt * 6);

              sim.turnTimer = Math.max(0, (sim.turnDeadline - performance.now()) / 1000);
              if (turnTimerElRef.current) {
                const nextText = `${sim.turnTimer.toFixed(1)}s`;
                if (turnTimerElRef.current.textContent !== nextText) {
                  turnTimerElRef.current.textContent = nextText;
                  turnTimerElRef.current.style.color =
                    sim.turnTimer <= 2.5 ? '#F87171' : sim.turnTimer <= 5.0 ? '#FBBF24' : '#FDE68A';
                }
              }

              hudSyncAccumulator += dt;
              if (hudSyncAccumulator >= 0.12) {
                hudSyncAccumulator = 0;
                cb.syncHudSnapshot();
              }

              if (sim.turnTimer <= 0 && phaseRef.current === 'action') {
                if (sim.isCharging) {
                  cb.releaseChargeAndFire();
                } else {
                  cb.addFloatingText(activeTank.x, activeTank.y - 54, 'Waktu Habis!', '#FBBF24');
                  cb.advanceTurn();
                }
              }
            }
          } else if (phaseRef.current === 'projectile') {
            const remaining: Projectile[] = [];

            for (const proj of sim.projectiles) {
              stepProjectile(proj, sim.wind, dt, DEFAULT_WORLD);
              const hit = checkProjectileCollision(proj, sim.heights, sim.tanks, sim.crates, DEFAULT_WORLD);

              if (hit.type === 'none') {
                remaining.push(proj);
                continue;
              }

              if (hit.type === 'oob') {
                continue;
              }

              if (hit.type === 'water') {
                soundEngine.playExplosion(false);
                addFloatingText(hit.x, hit.y - 24, 'BYUR!', '#38BDF8');
                spawnParticleBurst(
                  sim.particles,
                  sim.particleCursor,
                  hit.x,
                  hit.y,
                  14,
                  ['#BAE6FD', '#38BDF8', '#FFFFFF'],
                  50,
                  180,
                  260
                );
                continue;
              }

              if (hit.type === 'crate') {
                const crate = sim.crates.find((c) => c.id === hit.crateId);
                const owner = sim.tanks.find((t) => t.id === proj.ownerId);
                if (crate && !crate.collected && owner) {
                  crate.collected = true;
                  const label = applyPowerUpToTank(owner, crate.type);
                  soundEngine.playPickup();
                  addFloatingText(crate.x, crate.y - 30, label, '#34D399');
                  spawnParticleBurst(
                    sim.particles,
                    sim.particleCursor,
                    crate.x,
                    crate.y - 12,
                    14,
                    ['#34D399', '#FBBF24', '#FFFFFF'],
                    60,
                    160,
                    140
                  );
                }
                continue;
              }

              const isHeavy = proj.kind === 'heavy';
              carveCrater(sim.heights, sim.scorch, hit.x, hit.y, proj.craterRadius, DEFAULT_WORLD.height);
              sim.terrainVersion += 1;
              const directTankId = hit.type === 'tank' ? hit.tankId : undefined;
              const events = applyExplosionDamage(
                hit.x,
                hit.y,
                proj.craterRadius + 10,
                proj.damage,
                sim.tanks,
                directTankId
              );

              const owner = sim.tanks.find((t) => t.id === proj.ownerId);
              for (const ev of events) {
                const target = sim.tanks.find((t) => t.id === ev.tankId);
                if (!target) continue;
                if (ev.shieldBroken) {
                  addFloatingText(target.x, target.y - 52, 'Perisai Pecah!', '#C4B5FD');
                } else if (ev.damageApplied > 0) {
                  if (owner && owner.id !== target.id) {
                    owner.stats.hitsLanded += 1;
                  }
                  addFloatingText(
                    target.x,
                    target.y - 52,
                    ev.eliminated ? 'HANCUR!' : `-${ev.damageApplied} Nyawa`,
                    '#F87171'
                  );
                }
              }

              soundEngine.playExplosion(isHeavy || events.length > 0);
              sim.hitstopTimer = events.length > 0 || isHeavy ? 0.05 : 0.025;
              sim.shakeTrauma = Math.min(1, sim.shakeTrauma + (isHeavy || events.length > 0 ? 0.72 : 0.42));

              spawnParticleBurst(
                sim.particles,
                sim.particleCursor,
                hit.x,
                hit.y,
                isHeavy ? 28 : 18,
                ['#FBBF24', '#EA580C', '#EF4444', '#78350F'],
                70,
                260,
                320
              );
            }

            sim.projectiles = remaining;

            // Camera smoothly tracks leading projectile across islands!
            if (sim.projectiles.length > 0) {
              const lead = sim.projectiles[0];
              const camInfo = getCameraViewBounds(canvas.width, canvas.height, DEFAULT_WORLD, sim.cameraX, false);
              const maxCamX = Math.max(0, DEFAULT_WORLD.width - camInfo.viewWorldWidth);
              const desiredCamX = clamp(lead.x - camInfo.viewWorldWidth * 0.5, 0, maxCamX);
              sim.cameraX += (desiredCamX - sim.cameraX) * Math.min(1, dt * 8);
            } else {
              phaseRef.current = 'resolving';
              setPhase('resolving');
              updateBodyAttributes('playing', 'resolving');
              sim.resolveTimer = 0.75;
              syncHudSnapshot();
            }
          } else if (phaseRef.current === 'resolving') {
            sim.resolveTimer -= dt;
            if (sim.resolveTimer <= 0) {
              advanceTurn();
            }
          }
        }
      } else if (screenRef.current === 'title') {
        for (const t of sim.tanks) {
          stepTankGravity(t, dt, sim.heights, DEFAULT_WORLD);
        }
      }

      const shakePower = sim.shakeTrauma * sim.shakeTrauma * 14;
      const shakeX = shakePower > 0.1 ? (Math.random() * 2 - 1) * shakePower : 0;
      const shakeY = shakePower > 0.1 ? (Math.random() * 2 - 1) * shakePower : 0;

      renderBattlefield(ctx, canvas.width, canvas.height, {
        world: DEFAULT_WORLD,
        heights: sim.heights,
        scorch: sim.scorch,
        terrainVersion: sim.terrainVersion,
        tanks: sim.tanks,
        activeTankIndex: sim.activeTankIndex,
        projectiles: sim.projectiles,
        crates: sim.crates,
        particles: sim.particles,
        floatingTexts: sim.floatingTexts,
        wind: sim.wind,
        time: sim.time,
        shakeX,
        shakeY,
        cameraX: sim.cameraX,
        overviewMode: screenRef.current === 'title' ? true : overviewRef.current,
        showAimGuide: screenRef.current === 'playing' && phaseRef.current === 'action',
        showMinimap: screenRef.current === 'playing' || screenRef.current === 'paused',
        isCharging: sim.isCharging,
        chargePower: sim.chargePower,
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  // Wall-clock 100ms backup timer so 10s quiz & 10s turn timers never drift or miss under rAF throttling
  useEffect(() => {
    if (screen !== 'playing' || (phase !== 'quiz' && phase !== 'action')) return;

    const intervalId = window.setInterval(() => {
      if (screenRef.current !== 'playing') return;
      const sim = simRef.current;
      const activeTank = sim.tanks[sim.activeTankIndex];
      if (!activeTank) return;

      const wallNow = performance.now();

      if (phaseRef.current === 'quiz' && !activeTank.isBot && !quizResolutionRef.current) {
        const remaining = Math.max(0, (sim.quizDeadline - wallNow) / 1000);
        sim.quizTimer = remaining;
        if (quizTimerElRef.current) {
          quizTimerElRef.current.textContent = `${remaining.toFixed(1)}s`;
          quizTimerElRef.current.style.color =
            remaining <= 2.5 ? '#F87171' : remaining <= 5.0 ? '#FBBF24' : '#FDE68A';
        }
        if (quizBarElRef.current) {
          const ratio = clamp(remaining / DEFAULT_WORLD.quizSeconds, 0, 1);
          quizBarElRef.current.style.transform = `scaleX(${ratio})`;
          quizBarElRef.current.style.backgroundColor =
            remaining <= 2.5 ? '#DC2626' : remaining <= 5.0 ? '#F59E0B' : '#D97706';
        }
        if (remaining <= 0 && !sim.quizTimedOutTriggered) {
          callbacksRef.current.handleQuizTimeout();
        }
      } else if (phaseRef.current === 'action' && activeTank.alive) {
        if (sim.isCharging && !activeTank.isBot) {
          const { power, ratio, maxedOut } = computeWormsCharge(wallNow - sim.chargeStartedAt);
          sim.chargePower = power;
          activeTank.power = power;
          if (chargeTextElRef.current) {
            chargeTextElRef.current.textContent = `${Math.round(power)}%`;
          }
          if (chargeBarElRef.current) {
            chargeBarElRef.current.style.transform = `scaleX(${Math.max(0.03, ratio)})`;
            chargeBarElRef.current.style.backgroundColor =
              ratio > 0.78 ? '#EF4444' : ratio > 0.44 ? '#F59E0B' : '#22C55E';
          }
          if (maxedOut) {
            callbacksRef.current.releaseChargeAndFire(true);
          }
        }
        const remaining = Math.max(0, (sim.turnDeadline - wallNow) / 1000);
        sim.turnTimer = remaining;
        if (turnTimerElRef.current) {
          const nextText = `${remaining.toFixed(1)}s`;
          if (turnTimerElRef.current.textContent !== nextText) {
            turnTimerElRef.current.textContent = nextText;
            turnTimerElRef.current.style.color =
              remaining <= 2.5 ? '#F87171' : remaining <= 5.0 ? '#FBBF24' : '#FDE68A';
          }
        }
        if (remaining <= 0) {
          if (sim.isCharging) {
            callbacksRef.current.releaseChargeAndFire();
          } else {
            callbacksRef.current.addFloatingText(activeTank.x, activeTank.y - 54, 'Waktu Habis!', '#FBBF24');
            callbacksRef.current.advanceTurn();
          }
        }
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [phase, screen]);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const sim = simRef.current;
    const previewSeed = 17 + count * 31;
    const { heights, scorch } = generateTerrain(
      DEFAULT_WORLD.width,
      DEFAULT_WORLD.height,
      previewSeed,
      DEFAULT_WORLD.waterLevelY
    );
    sim.heights = heights;
    sim.scorch = scorch;
    sim.terrainVersion += 1;
    sim.tanks = createTanks(players.slice(0, count), heights, DEFAULT_WORLD, previewSeed);
  };

  const handlePlayerUpdate = (index: number, patch: Partial<PlayerConfig>) => {
    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const handleAdjustAngle = (delta: number) => {
    const tank = simRef.current.tanks[simRef.current.activeTankIndex];
    if (!tank || phaseRef.current !== 'action') return;
    tank.barrelAngle = clamp(tank.barrelAngle + delta, 5, 175);
    syncHudSnapshot();
  };

  const activeTank = hudTanks[activeTankIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        data-testid="battlefield-canvas"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerLeave={handleCanvasPointerUp}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
      />

      {screen === 'title' && (
        <TitleScreen
          playerCount={playerCount}
          onPlayerCountChange={handlePlayerCountChange}
          players={players}
          onPlayerUpdate={handlePlayerUpdate}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onStartGame={() => startNewGame()}
        />
      )}

      {(screen === 'playing' || screen === 'paused') && (
        <GameHud
          tanks={hudTanks}
          activeTankIndex={activeTankIndex}
          phase={phase}
          turnTimerRef={turnTimerElRef}
          chargeBarRef={chargeBarElRef}
          chargeTextRef={chargeTextElRef}
          isCharging={isCharging}
          initialTurnTimer={DEFAULT_WORLD.turnSeconds}
          wind={windDisplay}
          roundNumber={roundNumber}
          muted={muted}
          overviewMode={overviewMode}
          onToggleMute={toggleMute}
          onToggleOverview={toggleOverview}
          onPause={togglePause}
          onRestart={() => startNewGame()}
          onHoldMove={(dir) => {
            touchMoveDirRef.current = dir;
          }}
          onHoldPan={(dir) => {
            touchPanDirRef.current = dir;
          }}
          onStartQuizFromScout={beginQuizForCurrentTank}
          onAdjustAngle={handleAdjustAngle}
          onStartCharge={startChargeShot}
          onReleaseCharge={releaseChargeAndFire}
        />
      )}

      {screen === 'playing' && phase === 'quiz' && currentQuiz && activeTank && (
        <QuizModal
          tank={activeTank}
          playerNumber={activeTankIndex + 1}
          question={currentQuiz.question}
          questionIndexInCycle={currentQuiz.indexInCycle}
          totalInDeck={currentQuiz.totalInDeck}
          quizTimerRef={quizTimerElRef}
          quizBarRef={quizBarElRef}
          initialQuizSeconds={DEFAULT_WORLD.quizSeconds}
          resolution={quizResolution}
          onSelectAnswer={handleSelectQuizAnswer}
          onContinue={handleContinueAfterQuiz}
        />
      )}

      {screen === 'paused' && (
        <PauseModal
          onResume={togglePause}
          onRestart={() => startNewGame()}
          onExitToTitle={exitToTitle}
        />
      )}

      {screen === 'gameover' && matchSummary && (
        <VictoryModal
          summary={matchSummary}
          onPlayAgain={() => startNewGame()}
          onExitToTitle={exitToTitle}
        />
      )}
    </div>
  );
}
