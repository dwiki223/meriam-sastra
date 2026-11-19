import React from 'react';
import { Home, Play, RotateCcw, Trophy } from 'lucide-react';
import type { MatchSummary } from '../types/game';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onExitToTitle,
}) => {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-400/35 p-6 text-slate-100 shadow-2xl space-y-5">
        <div className="text-center space-y-1">
          <h2 id="pause-title" className="font-display text-2xl font-bold text-amber-50">
            Permainan Dijeda
          </h2>
          <p className="text-xs text-slate-400">
            Tekan Esc atau P untuk melanjutkan pertarungan
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Lanjutkan</span>
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Ulangi Pertandingan</span>
          </button>
          <button
            type="button"
            onClick={onExitToTitle}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  summary: MatchSummary;
  onPlayAgain: () => void;
  onExitToTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  summary,
  onPlayAgain,
  onExitToTitle,
}) => {
  const quizAccuracy =
    summary.totalQuizAnswered > 0
      ? Math.round((summary.totalQuizCorrect / summary.totalQuizAnswered) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-400/40 p-6 text-slate-100 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 id="victory-title" className="font-display text-2xl sm:text-3xl font-extrabold text-amber-50">
            {summary.winner ? `${summary.winner.name} Menang!` : 'Pertempuran Seri!'}
          </h2>
          <p className="text-sm text-slate-300">
            {summary.winner
              ? `Tank bertahan dengan ${summary.winner.hp} nyawa tersisa setelah ${summary.roundsPlayed} ronde.`
              : `Semua tank gugur bersamaan pada ronde ke-${summary.roundsPlayed}.`}
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-xl bg-slate-800/90 border border-slate-700 p-3">
            <div className="text-xs text-slate-400">Ronde</div>
            <div className="font-mono-num text-xl font-bold text-amber-300">
              {summary.roundsPlayed}
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/90 border border-slate-700 p-3">
            <div className="text-xs text-slate-400">Akurasi Kuis</div>
            <div className="font-mono-num text-xl font-bold text-emerald-300">
              {quizAccuracy}%
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/90 border border-slate-700 p-3">
            <div className="text-xs text-slate-400">Soal Dijawab</div>
            <div className="font-mono-num text-xl font-bold text-sky-300">
              {summary.totalQuizCorrect}/{summary.totalQuizAnswered}
            </div>
          </div>
        </div>

        {/* Player Standings */}
        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {summary.rankings.map((t, i) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono-num text-slate-400 w-5">{i + 1}.</span>
                <span
                  className="w-3 h-3 rounded-xs shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span className="font-semibold text-slate-100">{t.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono-num text-xs text-slate-300">
                <span>Kuis {t.stats.quizCorrect}/{t.stats.quizTotal}</span>
                <span>Tepat {t.stats.hitsLanded}</span>
                <span className={t.alive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {t.alive ? `${t.hp}♥` : 'KO'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Main Lagi</span>
          </button>
          <button
            type="button"
            onClick={onExitToTitle}
            className="sm:w-40 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
