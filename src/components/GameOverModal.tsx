/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Skull, RotateCcw, Home, HelpCircle, Coins, Award } from 'lucide-react';
import { StorageService } from '../services/storage';

interface GameOverModalProps {
  score: number;
  coins: number;
  questionsAnswered: number;
  onRestart: () => void;
  onExitMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  coins,
  questionsAnswered,
  onRestart,
  onExitMenu,
}) => {
  React.useEffect(() => {
    StorageService.addCoins(coins);
    StorageService.setHighScore(score);
  }, [coins, score]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 animate-fade-in select-none"
      dir="rtl"
    >
      <div className="mc-panel max-w-md w-full p-5 sm:p-7 rounded-lg border-4 border-red-700 shadow-2xl flex flex-col gap-4 text-white text-center font-cairo">
        {/* Skull Icon & Game Over Title */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-red-950/60 border-2 border-red-500 flex items-center justify-center text-red-500">
            <Skull className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-red-500 text-pixel-shadow tracking-wide">
            انْتَهَتِ اللَّعْبَةُ
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
            نَفِدَتْ جَمِيعُ قُلُوبِكَ! لَا تَسْتَسْلِمْ، وَأَعِدِ الْمُحَاوَلَةَ لِتُتْقِنَ آدَابَ التَّوَاصُلِ الرَّقْمِيِّ.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 my-1">
          {/* Questions answered */}
          <div className="mc-card p-3 rounded text-center border-neutral-700">
            <HelpCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-neutral-400">الإِجَابَاتُ</div>
            <div className="text-sm sm:text-base font-pixel text-emerald-300 tabular-nums">
              {questionsAnswered} / ١٠
            </div>
          </div>

          {/* Coins */}
          <div className="mc-card p-3 rounded text-center border-neutral-700">
            <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-neutral-400">الْعُمْلَاتُ</div>
            <div className="text-sm sm:text-base font-pixel text-yellow-300 tabular-nums">
              +{coins}
            </div>
          </div>

          {/* Score */}
          <div className="mc-card p-3 rounded text-center border-neutral-700">
            <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-neutral-400">النِّقَاطُ</div>
            <div className="text-sm sm:text-base font-pixel text-amber-300 tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Motivation tip */}
        <div className="mc-card p-3 rounded text-xs text-neutral-200 text-right border border-neutral-700 leading-relaxed">
          💡 <strong className="text-amber-300">نَصِيحَةٌ قَيِّمَةٌ:</strong> فَكِّرْ دَوْمًا فِي مَشَاعِرِ صَدِيقِكَ قَبْلَ نَشْرِ أَيِّ صُورَةٍ لَهُ أَوْ كِتَابَةِ تَعْلِيقٍ عَلَى الإِنْتَرْنِت.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
          <button
            onClick={onRestart}
            className="mc-button mc-button-green flex-1 py-3 px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إِعَادَةُ اللَّعِبِ (٧ قُلُوبٍ)</span>
          </button>

          <button
            onClick={onExitMenu}
            className="mc-button flex-1 py-3 px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>الْقَائِمَةُ الرَّئِيسِيَّةُ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
