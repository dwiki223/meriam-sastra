import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Eye,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Shield,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import type { Tank, TurnPhase } from '../types/game';

interface GameHudProps {
  tanks: Tank[];
  activeTankIndex: number;
  phase: TurnPhase;
  turnTimerRef: React.RefObject<HTMLSpanElement | null>;
  chargeBarRef: React.RefObject<HTMLDivElement | null>;
  chargeTextRef: React.RefObject<HTMLSpanElement | null>;
  isCharging: boolean;
  initialTurnTimer: number;
  wind: number;
  roundNumber: number;
  muted: boolean;
  overviewMode: boolean;
  onToggleMute: () => void;
  onToggleOverview: () => void;
  onPause: () => void;
  onRestart: () => void;
  onHoldMove: (dir: -1 | 0 | 1) => void;
  onHoldPan: (dir: -1 | 0 | 1) => void;
  onStartQuizFromScout: () => void;
  onAdjustAngle: (delta: number) => void;
  onStartCharge: () => void;
  onReleaseCharge: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  tanks,
  activeTankIndex,
  phase,
  turnTimerRef,
  chargeBarRef,
  chargeTextRef,
  isCharging,
  initialTurnTimer,
  wind,
  roundNumber,
  muted,
  overviewMode,
  onToggleMute,
  onToggleOverview,
  onPause,
  onRestart,
  onHoldMove,
  onHoldPan,
  onStartQuizFromScout,
  onAdjustAngle,
  onStartCharge,
  onReleaseCharge,
}) => {
  const activeTank = tanks[activeTankIndex];
  const isHumanAction = phase === 'action' && activeTank && activeTank.alive && !activeTank.isBot;
  const isHumanScout = phase === 'scout' && activeTank && activeTank.alive && !activeTank.isBot;

  const windAbs = Math.abs(wind).toFixed(1);
  const windLabel =
    Math.abs(wind) < 0.3
      ? 'Tenang 0.0'
      : wind > 0
        ? `Kanan → ${windAbs}`
        : `← Kiri ${windAbs}`;

  const weaponLabel =
    activeTank?.activeWeapon === 'heavy'
      ? 'Peluru Berat 2x'
      : activeTank?.activeWeapon === 'triple'
        ? 'Peluru Tiga 3x'
        : null;

  const timerText =
    phase === 'action'
      ? `${initialTurnTimer.toFixed(1)}s`
      : phase === 'scout'
        ? 'Melihat'
        : phase === 'quiz'
          ? 'Kuis'
          : 'Tembak';

  React.useEffect(() => {
    if (isCharging || phase !== 'action') return;
    const p = Math.round(activeTank?.lastPower ?? activeTank?.power ?? 50);
    if (chargeTextRef.current) {
      chargeTextRef.current.textContent = `${p}%`;
    }
    if (chargeBarRef.current) {
      const ratio = Math.max(0.03, (p - 5) / 95);
      chargeBarRef.current.style.transform = `scaleX(${ratio})`;
      chargeBarRef.current.style.backgroundColor =
        activeTank?.lastPower !== undefined ? '#64748B' : '#22C55E';
    }
  }, [activeTank?.lastPower, activeTank?.power, chargeBarRef, chargeTextRef, isCharging, phase]);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
      {/* Top Perimeter Bar */}
      <header className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Active Player + 5 Vitality Sockets */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-slate-900/90 border border-amber-400/30 px-3.5 py-2 shadow-lg">
          {activeTank && (
            <>
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center font-mono-num text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: activeTank.color }}
              >
                P{activeTankIndex + 1}
              </span>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-amber-50 whitespace-nowrap">
                    {activeTank.name}
                  </span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {activeTank.modelName} · Ronde {roundNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5" aria-label={`Nyawa ${activeTank.hp} dari ${activeTank.maxHp}`}>
                  {Array.from({ length: activeTank.maxHp }).map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block w-3.5 h-2 rounded-xs border ${
                        i < activeTank.hp
                          ? 'bg-emerald-400 border-emerald-200'
                          : 'bg-slate-800 border-slate-600'
                      }`}
                    />
                  ))}
                  <span className="font-mono-num text-xs font-bold text-emerald-300 ml-1">
                    {activeTank.hp}/{activeTank.maxHp}
                  </span>
                  {activeTank.hasShield && (
                    <span className="ml-1 inline-flex items-center gap-0.5 text-xs font-semibold text-violet-300">
                      <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Perisai</span>
                    </span>
                  )}
                  {weaponLabel && (
                    <span className="ml-1 text-xs font-semibold text-amber-300 whitespace-nowrap">
                      · {weaponLabel}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center: Turn Timer & Wind Vane */}
        <div className="pointer-events-auto flex items-center gap-4 rounded-xl bg-slate-900/90 border border-amber-400/30 px-4 py-2 shadow-lg">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {phase === 'scout' ? 'Mode' : 'Waktu'}
            </span>
            <span
              ref={turnTimerRef}
              data-testid="turn-timer"
              className="font-mono-num text-lg sm:text-xl font-bold text-amber-300 min-w-[3.8rem] text-right"
            >
              {timerText}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-700" aria-hidden="true" />

          <div className="flex items-center gap-1.5" data-testid="wind-indicator">
            <Wind className="w-4 h-4 text-sky-300 shrink-0" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Angin
            </span>
            <span className="font-mono-num text-sm font-bold text-sky-200 whitespace-nowrap">
              {windLabel}
            </span>
          </div>
        </div>

        {/* Right: Overview Toggle & Utility Icon Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleOverview();
            }}
            aria-label={overviewMode ? 'Fokus Tank Aktif [V]' : 'Lihat Peta Penuh [V]'}
            title={overviewMode ? 'Fokus Tank [V]' : 'Lihat Peta Penuh [V]'}
            className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              overviewMode
                ? 'bg-sky-500 border-sky-300 text-slate-950'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            {overviewMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{overviewMode ? 'Fokus Tank' : 'Peta Penuh'}</span>
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={muted ? 'Nyalakan Suara [M]' : 'Bisukan Suara [M]'}
            title="Suara [M]"
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label="Jeda Permainan [P]"
            title="Jeda [P / Esc]"
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Pause className="w-4 h-4" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            aria-label="Ulangi Pertandingan [R]"
            title="Ulangi [R]"
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bottom Perimeter Controls + 6-Player Vitality Strip */}
      <footer className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-2.5">
        {phase === 'scout' ? (
          /* Mode Melihat (Scouting Controls Before 10s Quiz) */
          <div className="pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-xl bg-slate-900/95 border border-sky-400/45 px-3.5 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-sky-200 font-medium pr-1">
              <Eye className="w-4 h-4 text-sky-300 shrink-0" aria-hidden="true" />
              <span>Mode Melihat · Amati medan &amp; angin</span>
            </div>

            <div className="flex items-center gap-1" role="group" aria-label="Geser Kamera">
              <button
                type="button"
                tabIndex={-1}
                disabled={!isHumanScout}
                onPointerDown={() => onHoldPan(-1)}
                onPointerUp={() => onHoldPan(0)}
                onPointerLeave={() => onHoldPan(0)}
                aria-label="Geser Kamera Kiri"
                className="h-9 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kiri</span>
              </button>
              <button
                type="button"
                tabIndex={-1}
                disabled={!isHumanScout}
                onPointerDown={() => onHoldPan(1)}
                onPointerUp={() => onHoldPan(0)}
                onPointerLeave={() => onHoldPan(0)}
                aria-label="Geser Kamera Kanan"
                className="h-9 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Kanan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              tabIndex={-1}
              disabled={!isHumanScout}
              onClick={(e) => {
                e.currentTarget.blur();
                onStartQuizFromScout();
              }}
              className="h-10 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-display font-bold text-sm flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Jawab Soal (10d) [Spasi]</span>
            </button>
          </div>
        ) : (
          /* Tactical Aim & Move Dock */
          <div className="pointer-events-auto flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-900/90 border border-amber-400/30 px-2.5 py-2 shadow-lg">
            <div className="flex items-center gap-1" role="group" aria-label="Gerak Tank">
              <button
                type="button"
                tabIndex={-1}
                disabled={!isHumanAction}
                onPointerDown={() => onHoldMove(-1)}
                onPointerUp={() => onHoldMove(0)}
                onPointerLeave={() => onHoldMove(0)}
                aria-label="Gerak Kiri"
                className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 flex items-center justify-center cursor-pointer disabled:cursor-default"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                disabled={!isHumanAction}
                onPointerDown={() => onHoldMove(1)}
                onPointerUp={() => onHoldMove(0)}
                onPointerLeave={() => onHoldMove(0)}
                aria-label="Gerak Kanan"
                className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 flex items-center justify-center cursor-pointer disabled:cursor-default"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-700" aria-hidden="true" />

            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-medium">Sudut</span>
              <button
                type="button"
                tabIndex={-1}
                disabled={!isHumanAction}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onAdjustAngle(-4);
                }}
                aria-label="Turunkan Sudut"
                className="h-9 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 flex items-center justify-center cursor-pointer disabled:cursor-default"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono-num text-sm font-bold text-amber-200 w-9 text-center">
                {Math.round(activeTank?.barrelAngle ?? 45)}°
              </span>
              <button
                type="button"
                tabIndex={-1}
                disabled={!isHumanAction}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onAdjustAngle(4);
                }}
                aria-label="Naikkan Sudut"
                className="h-9 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 flex items-center justify-center cursor-pointer disabled:cursor-default"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-700" aria-hidden="true" />

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Power</span>
              <div
                className="relative w-20 sm:w-24 h-3.5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden"
                aria-label="Pengukur Charge Tenaga Tembakan"
                title={
                  activeTank?.lastPower !== undefined
                    ? `Tembakan sebelumnya: ${activeTank.lastPower}%`
                    : 'Tahan tombol tembak untuk mengisi power (otomatis menembak di 100%)'
                }
              >
                <div
                  ref={chargeBarRef}
                  className="h-full bg-emerald-400 origin-left transition-none"
                />
                {activeTank?.lastPower !== undefined && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-xs"
                    style={{
                      left: `${Math.max(2, Math.min(98, ((activeTank.lastPower - 5) / 95) * 100))}%`,
                    }}
                  />
                )}
              </div>
              <span
                ref={chargeTextRef}
                data-testid="charge-power-text"
                className="font-mono-num text-sm font-bold text-sky-200 w-10 text-right"
              />
            </div>

            <button
              type="button"
              tabIndex={-1}
              disabled={!isHumanAction}
              onPointerDown={(e) => {
                if (!isHumanAction) return;
                e.preventDefault();
                e.currentTarget.blur();
                onStartCharge();
              }}
              onPointerUp={() => {
                if (isCharging) onReleaseCharge();
              }}
              onPointerCancel={() => {
                if (isCharging) onReleaseCharge();
              }}
              className={`h-9 px-3.5 rounded-lg font-display font-bold text-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-default transition-colors whitespace-nowrap shrink-0 select-none ${
                isCharging
                  ? 'bg-emerald-400 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950'
              }`}
            >
              <Crosshair className="w-4 h-4" aria-hidden="true" />
              <span>{isCharging ? 'Lepaskan Tembak!' : 'Tahan Tembak [Spasi]'}</span>
            </button>
          </div>
        )}

        {/* Compact All-Players Health Strip */}
        <div
          className="pointer-events-auto flex flex-wrap xl:flex-nowrap items-center gap-1 rounded-xl bg-slate-900/90 border border-slate-700/80 px-2.5 py-2 shadow-lg"
          aria-label="Status Semua Pemain"
        >
          {tanks.map((t, idx) => {
            const isCurrent = idx === activeTankIndex && t.alive;
            return (
              <div
                key={t.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  !t.alive
                    ? 'bg-slate-800/40 text-slate-500 line-through'
                    : isCurrent
                      ? 'bg-slate-800 text-amber-200 ring-1 ring-amber-400'
                      : 'bg-slate-800/70 text-slate-200'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: t.alive ? t.color : '#475569' }}
                />
                <span className="truncate max-w-[5.5rem]">{t.name}</span>
                <span className="font-mono-num font-bold text-[11px]">
                  {t.alive ? `${t.hp}♥` : 'KO'}
                </span>
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
