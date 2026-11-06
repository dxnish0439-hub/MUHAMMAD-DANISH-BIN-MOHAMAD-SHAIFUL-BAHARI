/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { RotateCcw, Skull, AlertTriangle, Sparkles } from 'lucide-react';
import { Question } from '../types/game';
import { soundManager } from '../services/audio';

interface CreeperWrongAnswerModalProps {
  question: Question;
  selectedOptionKey: 'A' | 'B' | 'C' | 'D';
  lives: number;
  onTryAgain: () => void;
  onGameOver: () => void;
  onDeductLife: () => number; // returns remaining lives
}

export const CreeperWrongAnswerModal: React.FC<CreeperWrongAnswerModalProps> = ({
  question,
  selectedOptionKey,
  lives: initialLives,
  onTryAgain,
  onGameOver,
  onDeductLife,
}) => {
  // Stages: 'approaching' -> 'exploding' -> 'feedback'
  const [stage, setStage] = useState<'approaching' | 'exploding' | 'feedback'>('approaching');
  const [currentLives, setCurrentLives] = useState(initialLives);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);
  const hasDeductedRef = useRef(false);

  const selectedOption = question.options.find((o) => o.key === selectedOptionKey);
  const correctOption = question.options.find((o) => o.key === question.correctAnswer);

  useEffect(() => {
    // 1. Start authentic Creeper Hiss ("tsss...")
    const stopHiss = soundManager.playCreeperHiss();

    // 2. Explode after 1.8 seconds of swelling & flashing
    const explodeTimer = setTimeout(() => {
      stopHiss();
      setStage('exploding');
      soundManager.playCreeperExplosion();

      // Deduct exactly ONE life once!
      if (!hasDeductedRef.current) {
        hasDeductedRef.current = true;
        const remaining = onDeductLife();
        setCurrentLives(remaining);
      }

      // Generate burst particles
      const newParticles = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 450,
        y: (Math.random() - 0.5) * 450,
        color: ['#16a34a', '#22c55e', '#15803d', '#374151', '#1f2937', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 7)],
        size: 10 + Math.random() * 20,
      }));
      setParticles(newParticles);

      // 3. Move to Feedback stage after explosion flash settles
      const feedbackTimer = setTimeout(() => {
        setStage('feedback');
      }, 700);

      return () => clearTimeout(feedbackTimer);
    }, 1800);

    return () => {
      stopHiss();
      clearTimeout(explodeTimer);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 animate-fade-in select-none"
      dir="rtl"
    >
      {/* --- STAGE 1: CREEPER APPROACHING & EXPANDING & FLASHING --- */}
      {stage === 'approaching' && (
        <div className="relative flex flex-col items-center justify-center text-center">
          {/* Warning Banner */}
          <div className="mb-4 mc-panel px-4 py-2 rounded border-2 border-red-500 bg-red-950/80 animate-bounce">
            <span className="font-cairo font-bold text-sm sm:text-base text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              انْتَبِهْ! خَطَرُ الـ CREEPER!
            </span>
          </div>

          {/* Creeper 3D/Pixel Body Assembly */}
          <div className="relative w-48 h-64 sm:w-56 sm:h-76 flex flex-col items-center animate-[creeperPulse_0.22s_infinite_alternate]">
            {/* Creeper Head (8x8 pixel grid face) */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-[#2e7d32] border-4 border-[#1b5e20] shadow-2xl relative p-2 flex flex-col justify-between">
              {/* Head camouflage pixels */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#4caf50_2px,transparent_2px)] [background-size:8px_8px]" />

              {/* Eyes */}
              <div className="flex justify-between px-2 pt-2 z-10">
                <div className="w-6 h-6 bg-black border border-neutral-900" />
                <div className="w-6 h-6 bg-black border border-neutral-900" />
              </div>

              {/* Mouth & Nose classic sad Creeper shape */}
              <div className="self-center flex flex-col items-center z-10 pb-1">
                <div className="w-4 h-6 bg-black" />
                <div className="w-10 h-4 bg-black" />
                <div className="flex justify-between w-10">
                  <div className="w-3 h-5 bg-black" />
                  <div className="w-3 h-5 bg-black" />
                </div>
              </div>
            </div>

            {/* Creeper Body */}
            <div className="w-20 h-28 sm:w-24 sm:h-32 bg-[#256e29] border-4 border-[#1b5e20] relative">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#66bb6a_2px,transparent_2px)] [background-size:6px_6px]" />
            </div>

            {/* 4 Creeper Feet */}
            <div className="flex justify-between w-24 sm:w-28 -mt-1">
              <div className="w-10 h-10 bg-[#1b5e20] border-2 border-black" />
              <div className="w-10 h-10 bg-[#1b5e20] border-2 border-black" />
            </div>
          </div>

          {/* Sizzling smoke particles */}
          <div className="mt-4 text-xs font-pixel text-yellow-300 animate-pulse tracking-widest">
            TSSSSSSSSSS... !
          </div>
        </div>
      )}

      {/* --- STAGE 2: EXPLOSION FLASH & BLOCK PARTICLES --- */}
      {stage === 'exploding' && (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          {/* Intense flash */}
          <div className="absolute inset-0 bg-white/90 animate-ping" />

          {/* Debris particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-bounce border border-black shadow-lg"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                transform: `translate(${p.x}px, ${p.y}px)`,
                transition: 'all 0.5s ease-out',
              }}
            />
          ))}

          <div className="z-20 font-pixel text-2xl sm:text-4xl text-amber-300 text-gold-shadow animate-ping">
            BOOOOOOM!
          </div>
        </div>
      )}

      {/* --- STAGE 3: EDUCATIONAL WRONG ANSWER FEEDBACK --- */}
      {stage === 'feedback' && (
        <div className="mc-panel max-w-xl w-full max-h-[92vh] overflow-y-auto no-scrollbar p-5 sm:p-7 rounded-lg border-4 border-red-600 shadow-2xl flex flex-col gap-4 text-white">
          {/* Header */}
          <div className="flex items-center gap-3 border-b-2 border-neutral-700 pb-3">
            <div className="w-12 h-12 rounded bg-red-950/70 border-2 border-red-500 flex items-center justify-center text-2xl shrink-0">
              💥
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-cairo font-bold text-red-400 text-pixel-shadow leading-snug">
                أَحْسَنْتَ الْمُحَاوَلَةَ، لَكِنَّ إِجَابَتَكَ خَاطِئَةٌ!
              </h2>
              <p className="text-xs sm:text-sm font-cairo font-bold text-amber-300 mt-0.5">
                لَقَدْ فَقَدْتَ قَلْبًا وَاحِدًا!
              </p>
            </div>
          </div>

          {/* 7 Hearts Remaining Display */}
          <div className="mc-card p-3 rounded flex items-center justify-between border border-red-900 bg-red-950/40 font-cairo">
            <span className="text-xs font-bold text-red-200">الْقُلُوبُ الْمُتَبَقِّيَةُ:</span>
            <div className="flex items-center gap-1 text-base sm:text-lg">
              {[1, 2, 3, 4, 5, 6, 7].map((h) => (
                <span
                  key={h}
                  className={`transition-all duration-300 ${
                    h <= currentLives
                      ? 'filter drop-shadow-[0_0_5px_rgba(239,68,68,0.9)] scale-100'
                      : 'grayscale opacity-25 scale-75'
                  }`}
                >
                  ❤️
                </span>
              ))}
              <span className="font-pixel text-xs text-yellow-300 mr-2 tabular-nums">
                ({currentLives} / ٧)
              </span>
            </div>
          </div>

          {/* Selected Wrong Answer (Crossed out) */}
          <div className="mc-card p-3 rounded border border-neutral-700 bg-neutral-900/60 font-cairo">
            <div className="text-[11px] font-bold text-neutral-400">إِجَابَتُكَ الْمُخْتَارَةُ:</div>
            <div className="text-sm font-bold text-red-400 line-through mt-0.5">
              {selectedOptionKey}. {selectedOption?.text}
            </div>
          </div>

          {/* Correct Answer & Educational Explanation */}
          <div className="mc-card p-4 rounded border-2 border-neutral-600 bg-[#1c1c1c] font-cairo">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span>
              <div className="text-xs font-bold text-amber-400">الإِجَابَةُ الصَّحِيحَةُ وَالتَّوْجِيهُ:</div>
            </div>
            <p className="text-sm text-neutral-100 font-bold mb-2">
              الإِجَابَةُ الصَّوَابُ هِيَ: <strong className="text-emerald-400">{question.correctAnswer}. {correctOption?.text}</strong>
            </p>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {question.explanation}
            </p>
          </div>

          {/* Action Button: Try Again or Game Over */}
          {currentLives > 0 ? (
            <button
              onClick={onTryAgain}
              className="mc-button mc-button-gold w-full py-3.5 px-4 rounded text-center flex items-center justify-center gap-2 text-white font-cairo font-bold text-sm sm:text-base active:scale-98 mt-1"
            >
              <RotateCcw className="w-5 h-5" />
              <span>حَاوِلْ مَرَّةً أُخْرَى</span>
            </button>
          ) : (
            <button
              onClick={onGameOver}
              className="mc-button w-full py-3.5 px-4 rounded text-center flex items-center justify-center gap-2 text-white font-cairo font-bold text-sm bg-red-700 hover:bg-red-800 active:scale-98 mt-1 border-2 border-red-400"
            >
              <Skull className="w-5 h-5 text-red-200" />
              <span>نَفِدَتِ الْقُلُوبُ - انْتِهَاءُ اللَّعِبِ</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
