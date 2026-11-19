import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { QuizQuestion, QuizResolution, Tank } from '../types/game';

interface QuizModalProps {
  tank: Tank;
  playerNumber: number;
  question: QuizQuestion;
  questionIndexInCycle: number;
  totalInDeck: number;
  quizTimerRef: React.RefObject<HTMLSpanElement | null>;
  quizBarRef: React.RefObject<HTMLDivElement | null>;
  initialQuizSeconds: number;
  resolution: QuizResolution | null;
  onSelectAnswer: (optionIndex: number) => void;
  onContinue: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export const QuizModal: React.FC<QuizModalProps> = ({
  tank,
  playerNumber,
  question,
  questionIndexInCycle,
  totalInDeck,
  quizTimerRef,
  quizBarRef,
  initialQuizSeconds,
  resolution,
  onSelectAnswer,
  onContinue,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (resolution) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onContinue();
        }
        return;
      }

      if (e.key === '1' || e.key.toLowerCase() === 'a') onSelectAnswer(0);
      if (e.key === '2' || e.key.toLowerCase() === 'b') onSelectAnswer(1);
      if (e.key === '3' || e.key.toLowerCase() === 'c') onSelectAnswer(2);
      if (e.key === '4' || e.key.toLowerCase() === 'd') onSelectAnswer(3);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resolution, onSelectAnswer, onContinue]);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-heading"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[#FAF7F0] text-stone-900 border-2 border-amber-700/40 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-stone-900 text-amber-50 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center font-mono-num text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: tank.color }}
            >
              P{playerNumber}
            </span>
            <div>
              <h2 id="quiz-heading" className="font-display font-bold text-base leading-tight">
                Giliran {tank.name} — Jawab dalam 10 Detik
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-amber-200/85 mt-0.5">
                <span>{question.materi}</span>
                <span aria-hidden="true">·</span>
                <span>Tingkat {question.kesulitan}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">
                  {questionIndexInCycle}/{totalInDeck}
                </span>
              </div>
            </div>
          </div>

          {/* 10s Quiz Countdown */}
          <div className="flex items-center gap-2 rounded-lg bg-stone-800 border border-amber-400/30 px-3 py-1.5">
            <Clock className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
            <span
              ref={quizTimerRef}
              data-testid="quiz-timer"
              className="font-mono-num text-lg font-bold text-amber-300 min-w-[3rem] text-right"
            >
              {resolution ? '0.0s' : `${initialQuizSeconds.toFixed(1)}s`}
            </span>
          </div>
        </div>

        {/* 10s Progress Bar */}
        <div className="w-full h-1.5 bg-stone-200 overflow-hidden">
          <div
            ref={quizBarRef}
            className="h-full bg-amber-500 origin-left"
            style={{ transform: 'scaleX(1)' }}
          />
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {question.kutipan && (
            <blockquote className="rounded-xl bg-amber-100/70 border border-amber-300/80 px-4 py-3 text-sm sm:text-base text-stone-800 whitespace-pre-line font-medium leading-relaxed">
              {question.kutipan}
            </blockquote>
          )}

          <p className="text-base sm:text-lg font-semibold text-stone-900 leading-snug">
            {question.pertanyaan}
          </p>

          {/* 4 Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {question.pilihan.map((option, idx) => {
              const isSelected = resolution?.selectedIndex === idx;
              const isCorrectOption = question.jawabanIndex === idx;

              let btnStyle =
                'bg-white border-stone-300 text-stone-900 hover:bg-amber-50 hover:border-amber-500';
              if (resolution) {
                if (isCorrectOption) {
                  btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold';
                } else if (isSelected && !resolution.isCorrect) {
                  btnStyle = 'bg-red-50 border-red-600 text-red-950';
                } else {
                  btnStyle = 'bg-stone-100 border-stone-200 text-stone-500';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={resolution !== null}
                  onClick={() => onSelectAnswer(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors flex items-start gap-3 cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-amber-600 ${btnStyle}`}
                >
                  <span className="w-7 h-7 rounded-lg bg-stone-200/80 text-stone-800 font-mono-num text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="text-sm sm:text-base leading-snug whitespace-pre-line flex-1">
                    {option}
                  </span>
                  {resolution && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-label="Jawaban benar" />
                  )}
                  {resolution && isSelected && !resolution.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-label="Jawaban salah" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Continue */}
          {resolution ? (
            <div
              className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                resolution.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-display font-bold text-sm sm:text-base">
                  {resolution.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                      <span>Benar! Tank siap bergerak selama 10 detik.</span>
                    </>
                  ) : resolution.timedOut ? (
                    <>
                      <Clock className="w-5 h-5 text-red-700 shrink-0" aria-hidden="true" />
                      <span>Waktu habis (10 detik)! Giliran {tank.name} dilewati.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-700 shrink-0" aria-hidden="true" />
                      <span>Salah! Giliran {tank.name} dilewati.</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  {question.pembahasan}
                </p>
              </div>
              <button
                type="button"
                onClick={onContinue}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <span>{resolution.isCorrect ? 'Mulai 10 Detik' : 'Giliran Berikutnya'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-stone-500 text-center">
              Pilih jawaban A–D atau tekan 1–4 sebelum 10 detik habis · Salah / habis waktu = giliran dilewati
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
