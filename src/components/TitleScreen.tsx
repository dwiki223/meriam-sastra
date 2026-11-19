import React from 'react';
import { Bot, Play, User, Users } from 'lucide-react';
import type { DifficultyFilter, PlayerConfig } from '../types/game';

interface TitleScreenProps {
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  players: PlayerConfig[];
  onPlayerUpdate: (index: number, patch: Partial<PlayerConfig>) => void;
  difficulty: DifficultyFilter;
  onDifficultyChange: (diff: DifficultyFilter) => void;
  onStartGame: () => void;
}

const DIFFICULTIES: Array<{ value: DifficultyFilter; label: string; countLabel: string }> = [
  { value: 'Campuran', label: 'Campuran', countLabel: '60 Soal' },
  { value: 'Mudah', label: 'Mudah', countLabel: '20 Soal' },
  { value: 'Sedang', label: 'Sedang', countLabel: '20 Soal' },
  { value: 'Sulit', label: 'Sulit', countLabel: '20 Soal' },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  playerCount,
  onPlayerCountChange,
  players,
  onPlayerUpdate,
  difficulty,
  onDifficultyChange,
  onStartGame,
}) => {
  return (
    <main className="fixed inset-0 z-20 flex flex-col items-center justify-between px-4 py-5 md:py-7 pointer-events-none">
      {/* Top Title Emblem Lockup */}
      <div className="flex flex-col items-center text-center pointer-events-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-1">
          <svg
            viewBox="0 0 64 44"
            className="w-14 h-10 shrink-0 drop-shadow-md"
            aria-hidden="true"
          >
            {/* Nusantara Crest + Tank Silhouette + Scroll */}
            <rect x="6" y="24" width="52" height="12" rx="6" fill="#1E293B" stroke="#FBBF24" strokeWidth="2.5" />
            <path d="M14 24 L20 14 L44 14 L50 24 Z" fill="#DC2626" stroke="#0F172A" strokeWidth="2" />
            <path d="M24 14 A8 8 0 0 1 40 14 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
            <rect x="34" y="8" width="22" height="5" rx="2" transform="rotate(-18 34 10)" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="17" cy="30" r="2.5" fill="#94A3B8" />
            <circle cx="27" cy="30" r="2.5" fill="#94A3B8" />
            <circle cx="37" cy="30" r="2.5" fill="#94A3B8" />
            <circle cx="47" cy="30" r="2.5" fill="#94A3B8" />
          </svg>
          <h1
            className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-amber-50"
            style={{ textShadow: '0 3px 12px rgba(15, 23, 42, 0.85)' }}
          >
            Meriam Sastra
          </h1>
        </div>
        <p
          className="text-sm sm:text-base font-medium text-amber-100/95"
          style={{ textShadow: '0 2px 6px rgba(15, 23, 42, 0.85)' }}
        >
          Duel Tank Artileri Bergiliran · Kuis Pantun, Syair &amp; Gurindam Kelas 9
        </p>
      </div>

      {/* Central Setup Panel (opaque warm slate, zero backdrop-blur) */}
      <section
        aria-label="Pengaturan Pertandingan"
        className="pointer-events-auto w-full max-w-3xl max-h-[calc(100dvh-9.5rem)] overflow-y-auto rounded-2xl bg-slate-900/95 border border-amber-400/35 shadow-2xl p-3.5 sm:p-6 text-slate-100"
      >
        {/* Row 1: Player Count & Quiz Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-2">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>Jumlah Pemain (Maksimal 6)</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Pilih jumlah pemain">
              {[2, 3, 4, 5, 6].map((count) => {
                const active = playerCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onPlayerCountChange(count)}
                    className={`h-10 rounded-lg font-mono-num text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                    aria-pressed={active}
                  >
                    {count}P
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-amber-300 mb-2">
              Tingkat Kesulitan Soal (60 Soal)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5" role="group" aria-label="Pilih tingkat kesulitan">
              {DIFFICULTIES.map((item) => {
                const active = difficulty === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onDifficultyChange(item.value)}
                    className={`h-10 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      active
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                    aria-pressed={active}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Player Roster Slots */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-semibold text-amber-300">Daftar Tank &amp; Pemain (6 Bentuk Unik)</span>
            <span className="text-slate-400">3 Nyawa · 10d Jawab · 10d Jalan &amp; Tembak</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {players.slice(0, playerCount).map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl p-2"
              >
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-mono-num text-xs font-bold text-white"
                    style={{ backgroundColor: player.color }}
                  >
                    P{idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{player.modelName}</span>
                </div>
                <label className="sr-only" htmlFor={`player-name-${player.id}`}>
                  Nama Pemain {idx + 1}
                </label>
                <input
                  id={`player-name-${player.id}`}
                  type="text"
                  maxLength={14}
                  value={player.name}
                  onChange={(e) => onPlayerUpdate(idx, { name: e.target.value })}
                  placeholder={`Pemain ${idx + 1}`}
                  className="min-w-0 flex-1 bg-slate-900/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
                {idx > 0 ? (
                  <button
                    type="button"
                    onClick={() => onPlayerUpdate(idx, { isBot: !player.isBot })}
                    aria-label={`Ubah Pemain ${idx + 1} ke ${player.isBot ? 'Manusia' : 'Bot'}`}
                    title={player.isBot ? 'Mode Bot Komputer' : 'Mode Pemain Manusia'}
                    className={`h-8 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-colors ${
                      player.isBot
                        ? 'bg-violet-600 text-white hover:bg-violet-500'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    {player.isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    <span>{player.isBot ? 'Bot' : 'Orang'}</span>
                  </button>
                ) : (
                  <span className="h-8 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 bg-slate-700/70 text-slate-300">
                    <User className="w-3.5 h-3.5" />
                    <span>Orang</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Rules Summary & Primary Start Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-700/80">
          <div className="text-xs text-slate-300 leading-relaxed text-center sm:text-left">
            Terrain luas &amp; acak · 3 Nyawa per tank · Mode Melihat sebelum soal (10 detik) · Tahan Spasi isi power 5%–100% (lepas untuk menembak, penuh otomatis meluncur).
          </div>
          <button
            type="button"
            data-start="true"
            onClick={onStartGame}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-display font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Mulai Pertempuran</span>
          </button>
        </div>
      </section>

      {/* Single flat bottom control hint */}
      <p
        className="pointer-events-none text-xs font-medium text-amber-100/90 text-center"
        style={{ textShadow: '0 2px 6px rgba(15, 23, 42, 0.9)' }}
      >
        A/D Gerak · W/S Sudut · Tahan Spasi Charge &amp; Tembak · V Semua Pulau · Esc Jeda
      </p>
    </main>
  );
};
