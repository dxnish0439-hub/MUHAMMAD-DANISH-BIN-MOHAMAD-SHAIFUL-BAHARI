/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Question } from '../types/game';

interface QuizModalProps {
  question: Question;
  lives: number;
  onSelectOption: (optionKey: 'A' | 'B' | 'C' | 'D') => void;
}

const ARABIC_LETTERS: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'أ',
  B: 'ب',
  C: 'ج',
  D: 'د',
};

export const QuizModal: React.FC<QuizModalProps> = ({
  question,
  lives,
  onSelectOption,
}) => {
  const [selectedKey, setSelectedKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  const handleChoose = (key: 'A' | 'B' | 'C' | 'D') => {
    if (selectedKey !== null) return;
    setSelectedKey(key);

    setTimeout(() => {
      onSelectOption(key);
      setSelectedKey(null);
    }, 320);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-fade-in select-none"
      dir="rtl"
    >
      <div className="mc-panel max-w-2xl w-full p-4 sm:p-7 rounded-lg border-4 border-amber-600 shadow-2xl flex flex-col gap-4 text-white font-cairo">
        {/* Header: Question Progress & 7 Lives */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-700 pb-3">
          <div>
            <div className="text-[11px] sm:text-xs font-bold text-amber-400 text-pixel-shadow">
              نُقْطَةُ التَّفَتُّشِ رَقْمُ #{question.id}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
              السُّؤَالُ {question.id} مِنْ ١٠
            </h2>
          </div>

          {/* 7 Lives Display */}
          <div className="mc-card px-3 py-1.5 rounded flex items-center gap-1.5 border border-neutral-600">
            <span className="text-xs font-bold text-neutral-300">الْقُلُوبُ:</span>
            <div className="flex gap-0.5 sm:gap-1 text-sm sm:text-base">
              {[1, 2, 3, 4, 5, 6, 7].map((h) => (
                <span
                  key={h}
                  className={
                    h <= lives
                      ? 'filter drop-shadow-[0_0_4px_rgba(239,68,68,0.8)] scale-100'
                      : 'grayscale opacity-25 scale-75'
                  }
                >
                  ❤️
                </span>
              ))}
            </div>
            <span className="font-pixel text-[10px] text-yellow-300 tabular-nums">
              ({lives}/٧)
            </span>
          </div>
        </div>

        {/* Progress Bar (1/10 to 10/10) */}
        <div className="w-full bg-neutral-900 h-3.5 border-2 border-neutral-700 rounded-sm overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-l from-emerald-500 via-green-400 to-teal-400 transition-all duration-500 rounded-xs"
            style={{ width: `${(question.id / 10) * 100}%` }}
          />
        </div>

        {/* Question Box */}
        <div className="mc-card p-4 sm:p-5 rounded-md border-2 border-neutral-600 bg-[#1c1c1c]">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">📜</span>
            <p className="text-base sm:text-lg font-bold text-neutral-100 leading-relaxed">
              {question.question}
            </p>
          </div>
        </div>

        {/* 4 Answer Options (أ, ب, ج, د) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {question.options.map((opt) => {
            const isSelected = selectedKey === opt.key;
            const arabicLetter = ARABIC_LETTERS[opt.key];

            return (
              <button
                key={opt.key}
                onClick={() => handleChoose(opt.key)}
                disabled={selectedKey !== null}
                className={`mc-button text-right p-3 sm:p-4 flex items-center gap-3 transition-transform ${
                  isSelected
                    ? 'mc-button-gold scale-98 bg-amber-600 border-amber-300 ring-2 ring-yellow-400'
                    : 'hover:border-amber-400'
                }`}
              >
                {/* Option badge */}
                <div
                  className={`w-8 h-8 shrink-0 flex items-center justify-center font-bold text-sm sm:text-base rounded border-2 ${
                    isSelected
                      ? 'bg-yellow-400 text-black border-white'
                      : 'bg-neutral-800 text-amber-300 border-neutral-600'
                  }`}
                >
                  {arabicLetter}
                </div>

                {/* Option text */}
                <span className="font-bold text-xs sm:text-sm text-neutral-100 leading-snug">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Educational Note */}
        <div className="text-center text-xs text-neutral-400 mt-1">
          💡 اخْتَرْ دَوْمًا الإِجَابَةَ الَّتِي تُجَسِّدُ الآدَابَ وَالأَخْلَاقَ الْفَاضِلَةَ فِي التَّوَاصُلِ الرَّقْمِيِّ.
        </div>
      </div>
    </div>
  );
};
