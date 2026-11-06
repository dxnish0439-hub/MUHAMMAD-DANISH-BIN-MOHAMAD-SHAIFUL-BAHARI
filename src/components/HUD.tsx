/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pause, Play, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface HUDProps {
  score: number;
  coins: number;
  lives: number;
  currentQuestionIndex: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  showMobileControls: boolean;
  onToggleMobileControls: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  coins,
  lives,
  currentQuestionIndex,
  isPaused,
  onTogglePause,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
  showMobileControls,
  onToggleMobileControls,
}) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-10"
      dir="rtl"
    >
      {/* Top Bar: Stats & Controls */}
      <div className="flex items-start justify-between gap-2">
        {/* Right cluster (RTL start): Lives (7 hearts) & Checkpoints */}
        <div className="flex flex-col gap-2">
          {/* Lives (الْقُلُوبُ: ٧) */}
          <div className="mc-panel px-3 py-1.5 rounded flex items-center gap-2 shadow-lg border border-neutral-700 font-cairo">
            <span className="text-xs sm:text-sm font-bold text-neutral-200">الْقُلُوبُ:</span>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((heartIndex) => (
                <span
                  key={heartIndex}
                  className={`text-base sm:text-xl transition-transform duration-200 ${
                    heartIndex <= lives
                      ? 'scale-100 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                      : 'grayscale opacity-25 scale-75'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>
            <span className="font-pixel text-[11px] sm:text-xs text-yellow-300 mr-1 tabular-nums">
              ({lives} / ٧)
            </span>
          </div>

          {/* Quiz Checkpoint Progress */}
          <div className="mc-panel px-3 py-1.5 rounded flex items-center gap-2 shadow-lg border border-neutral-700 font-cairo">
            <span className="text-base sm:text-lg">🎯</span>
            <div>
              <div className="text-[10px] font-bold text-emerald-400">نُقْطَةُ التَّفَتُّشِ</div>
              <div className="text-xs sm:text-sm font-pixel text-white tabular-nums">
                {currentQuestionIndex} / ١٠
              </div>
            </div>
          </div>
        </div>

        {/* Center: Current Score */}
        <div className="mc-panel px-4 py-2 rounded text-center shadow-lg border border-neutral-700 font-cairo">
          <div className="text-[10px] sm:text-xs font-bold text-amber-400 text-pixel-shadow">النِّقَاطُ</div>
          <div className="text-base sm:text-xl font-pixel text-white tabular-nums tracking-wider text-pixel-shadow">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Left cluster (RTL end): Coins & Pause / Touch Toggle */}
        <div className="flex flex-col items-start gap-2">
          {/* Coins collected */}
          <div className="mc-panel px-3 py-1.5 rounded flex items-center gap-2 shadow-lg border border-neutral-700 font-cairo">
            <span className="text-lg animate-bounce">🪙</span>
            <div>
              <div className="text-[10px] font-bold text-yellow-400">الْعُمْلَاتُ</div>
              <div className="text-xs sm:text-sm font-pixel text-yellow-300 tabular-nums">
                {coins}
              </div>
            </div>
          </div>

          {/* Action buttons (Pause & Touch Pad toggle) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Pause Toggle */}
            <button
              onClick={onTogglePause}
              className="mc-button p-2 text-white hover:text-amber-300 active:scale-95"
              title={isPaused ? 'اسْتِئْنَاف' : 'إِيقَافٌ مُؤَقَّت'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4 text-yellow-400" />}
            </button>

            {/* Mobile Touch Pad Toggle */}
            <button
              onClick={onToggleMobileControls}
              className={`mc-button px-2.5 py-1.5 text-[10px] font-cairo font-bold ${
                showMobileControls ? 'bg-amber-600 text-white' : 'text-neutral-300'
              }`}
              title="أَزْرَارُ التَّحَكُّمِ بِاللَّمْسِ"
            >
              📱 اللَّمْسُ
            </button>
          </div>
        </div>
      </div>

      {/* Center Paused Overlay */}
      {isPaused && (
        <div className="self-center my-auto pointer-events-auto mc-panel p-6 rounded-lg text-center max-w-sm w-full mx-4 shadow-2xl animate-fade-in border-4 border-amber-500 font-cairo">
          <h2 className="text-lg sm:text-xl font-bold text-yellow-400 text-pixel-shadow mb-3">
            اللَّعْبُ مُتَوَقِّفٌ مُؤَقَّتًا
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200 mb-6 leading-relaxed">
            خُذِ اسْتِرَاحَةً قَصِيرَةً قَبْلَ مُتَابَعَةِ الرَّكْضِ وَتَعَلُّمِ آدَابِ التَّوَاصُلِ الرَّقْمِيِّ.
          </p>
          <button
            onClick={onTogglePause}
            className="mc-button mc-button-green w-full py-3 px-4 font-cairo font-bold text-sm text-white"
          >
            ▶️ اسْتِئْنَافُ اللَّعِبِ
          </button>
        </div>
      )}

      {/* Bottom On-Screen Touch Controls (Accessible for Android / touch devices) */}
      {showMobileControls && (
        <div className="pointer-events-auto flex justify-between items-end pb-2 px-1">
          {/* Movement Directional Buttons (Left/Right) */}
          <div className="flex gap-2">
            <button
              onClick={onMoveRight}
              className="mc-button w-14 h-14 flex items-center justify-center text-white active:bg-neutral-600"
              title="يَمِين"
            >
              <ArrowRight className="w-7 h-7" />
            </button>
            <button
              onClick={onMoveLeft}
              className="mc-button w-14 h-14 flex items-center justify-center text-white active:bg-neutral-600"
              title="يَسَار"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
          </div>

          {/* Jump / Slide Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onSlide}
              className="mc-button mc-button-gold w-14 h-14 flex flex-col items-center justify-center text-white active:scale-95"
              title="انْزِلَاق"
            >
              <ArrowDown className="w-5 h-5" />
              <span className="text-[9px] font-cairo font-bold mt-0.5">انْزِلَاق</span>
            </button>
            <button
              onClick={onJump}
              className="mc-button mc-button-green w-14 h-14 flex flex-col items-center justify-center text-white active:scale-95"
              title="قَفْز"
            >
              <ArrowUp className="w-5 h-5" />
              <span className="text-[9px] font-cairo font-bold mt-0.5">قَفْز</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
