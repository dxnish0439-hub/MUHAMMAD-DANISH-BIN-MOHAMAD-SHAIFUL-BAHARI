/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Question } from '../types/game';

interface AnswerResultModalProps {
  isCorrect: boolean;
  question: Question;
  selectedOptionKey: 'A' | 'B' | 'C' | 'D';
  lives: number;
  onContinue: () => void;
  onTryAgain: () => void;
}

const ARABIC_LETTERS: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'أ',
  B: 'ب',
  C: 'ج',
  D: 'د',
};

export const AnswerResultModal: React.FC<AnswerResultModalProps> = ({
  isCorrect,
  question,
  selectedOptionKey,
  lives,
  onContinue,
  onTryAgain,
}) => {
  const selectedOption = question.options.find((o) => o.key === selectedOptionKey);
  const correctOption = question.options.find((o) => o.key === question.correctAnswer);

  if (isCorrect) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 animate-fade-in select-none"
        dir="rtl"
      >
        <div className="mc-panel max-w-xl w-full p-5 sm:p-7 rounded-lg border-4 border-green-500 shadow-2xl flex flex-col gap-4 text-white font-cairo">
          {/* Header */}
          <div className="flex items-center gap-3 border-b-2 border-neutral-700 pb-3">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-emerald-400 text-pixel-shadow leading-tight">
                تَهَانِينَا! إِجَابَتُكَ صَحِيحَةٌ
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-0.5">
                اخْتِيَارٌ سَدِيدٌ يُعَبِّرُ عَنِ الْوَعْيِ وَالأَخْلَاقِ الرَّقْمِيَّةِ النَّبِيلَةِ!
              </p>
            </div>
          </div>

          {/* Chosen answer block */}
          <div className="mc-card p-3 sm:p-4 rounded border-2 border-emerald-600/60 bg-emerald-950/30">
            <div className="text-[11px] font-bold text-emerald-300">إِجَابَتُكَ الْمُخْتَارَةُ:</div>
            <div className="text-sm sm:text-base font-bold text-white mt-1">
              {ARABIC_LETTERS[selectedOptionKey]}. {selectedOption?.text}
            </div>
          </div>

          {/* Educational Explanation */}
          <div className="mc-card p-4 sm:p-5 rounded border-2 border-neutral-600 bg-[#1c1c1c]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📚</span>
              <div className="text-xs font-bold text-amber-400">الشَّرْحُ وَالتَّوْجِيهُ التَّرْبَوِيُّ:</div>
            </div>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              {question.explanation}
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={onContinue}
            className="mc-button mc-button-green w-full py-3.5 px-4 rounded text-center flex items-center justify-center gap-2 text-white font-bold text-sm sm:text-base active:scale-98 mt-1"
          >
            <span>مُتَابَعَةُ الرَّكْضِ</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Fallback wrong answer view
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 animate-fade-in select-none"
      dir="rtl"
    >
      <div className="mc-panel max-w-xl w-full p-5 sm:p-7 rounded-lg border-4 border-red-600 shadow-2xl flex flex-col gap-4 text-white font-cairo">
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-neutral-700 pb-3">
          <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-red-500 text-pixel-shadow leading-tight">
              أَحْسَنْتَ الْمُحَاوَلَةَ، لَكِنَّ إِجَابَتَكَ خَاطِئَةٌ!
            </h2>
            <p className="text-xs sm:text-sm text-amber-300 mt-0.5">
              لَقَدْ فَقَدْتَ قَلْبًا وَاحِدًا!
            </p>
          </div>
        </div>

        {/* 7 Hearts Remaining */}
        <div className="mc-card p-3 rounded flex items-center justify-between border border-red-900 bg-red-950/40">
          <span className="text-xs font-bold text-red-200">الْقُلُوبُ الْمُتَبَقِّيَةُ:</span>
          <div className="flex gap-1 text-base sm:text-lg">
            {[1, 2, 3, 4, 5, 6, 7].map((h) => (
              <span
                key={h}
                className={h <= lives ? 'filter drop-shadow-[0_0_4px_rgba(239,68,68,0.9)]' : 'grayscale opacity-25'}
              >
                ❤️
              </span>
            ))}
            <span className="font-pixel text-xs text-yellow-300 mr-2 tabular-nums">
              ({lives}/٧)
            </span>
          </div>
        </div>

        {/* Selected answer */}
        <div className="mc-card p-3 rounded border border-neutral-700 bg-neutral-900/60">
          <div className="text-[11px] font-bold text-neutral-400">إِجَابَتُكَ الْمُخْتَارَةُ:</div>
          <div className="text-sm font-bold text-red-300 line-through mt-0.5">
            {ARABIC_LETTERS[selectedOptionKey]}. {selectedOption?.text}
          </div>
        </div>

        {/* Educational explanation */}
        <div className="mc-card p-4 rounded border-2 border-neutral-600 bg-[#1c1c1c]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💡</span>
            <div className="text-xs font-bold text-amber-400">الإِجَابَةُ الصَّحِيحَةُ وَالتَّوْجِيهُ:</div>
          </div>
          <p className="text-sm text-neutral-100 font-bold mb-2">
            الإِجَابَةُ الصَّوَابُ هِيَ: <strong className="text-emerald-400">{ARABIC_LETTERS[question.correctAnswer]}. {correctOption?.text}</strong>
          </p>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {question.explanation}
          </p>
        </div>

        {/* Try Again Button */}
        <button
          onClick={onTryAgain}
          className="mc-button mc-button-gold w-full py-3.5 px-4 rounded text-center flex items-center justify-center gap-2 text-white font-bold text-sm sm:text-base active:scale-98 mt-1"
        >
          <RotateCcw className="w-5 h-5" />
          <span>حَاوِلْ مَرَّةً أُخْرَى</span>
        </button>
      </div>
    </div>
  );
};
