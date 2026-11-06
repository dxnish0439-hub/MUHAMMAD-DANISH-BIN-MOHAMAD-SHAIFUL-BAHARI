/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, HelpCircle, Info, Trophy, Gift, User, Sparkles } from 'lucide-react';
import { CharacterSkin } from '../types/game';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenCredits: () => void;
  onOpenLeaderboard: () => void;
  onOpenDailyReward: () => void;
  onOpenSkinSelector: () => void;
  currentSkin: CharacterSkin;
  highScore: number;
  totalCoins: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenCredits,
  onOpenLeaderboard,
  onOpenDailyReward,
  onOpenSkinSelector,
  currentSkin,
  highScore,
  totalCoins,
}) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20 select-none font-cairo"
      dir="rtl"
    >
      {/* Top Header Row: High Score & Total Coins */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* High Score Badge */}
          <div className="mc-panel px-3 py-1.5 rounded flex items-center gap-1.5 shadow-lg border border-neutral-700">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold text-neutral-300">أَعْلَى نَقْطَةٍ:</span>
            <span className="text-xs font-pixel text-yellow-300 tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>

          {/* Total Coins */}
          <div className="mc-panel px-3 py-1.5 rounded flex items-center gap-1.5 shadow-lg border border-neutral-700">
            <span className="text-base">🪙</span>
            <span className="text-xs font-pixel text-yellow-300 tabular-nums">
              {totalCoins}
            </span>
          </div>
        </div>
      </div>

      {/* Center Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto pointer-events-auto max-w-xl mx-auto">
        {/* Edition Badge */}
        <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 border border-amber-400/50 text-xs font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" /> إِصْدَارٌ تَعْلِيمِيٌّ ثُلَاثِيُّ الأَبْعَادِ
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-yellow-300 text-pixel-shadow tracking-wide leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          عَدَّاءُ مَاينكِرَافت
          <br />
          <span className="text-emerald-400">الرَّقْمِيُّ</span>
        </h1>

        {/* Subtitle */}
        <div className="mt-2.5 px-4 py-1.5 mc-panel rounded border border-amber-500/70 shadow-lg">
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-amber-300 text-pixel-shadow">
            آدَابُ التَّوَاصُلِ فِي الْعَالَمِ الرَّقْمِيِّ
          </h2>
        </div>

        {/* Game Specs Badges (10 Soalan, 7 Nyawa) */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5">
          <div className="mc-panel px-3.5 py-1.5 rounded flex items-center gap-2 border border-neutral-700">
            <span className="text-lg">🎯</span>
            <div className="text-right">
              <div className="text-[10px] font-bold text-emerald-400">الْمُسَابَقَةُ</div>
              <div className="text-xs font-bold text-white">١٠ أَسْئِلَةٍ</div>
            </div>
          </div>

          <div className="mc-panel px-3.5 py-1.5 rounded flex items-center gap-2 border border-neutral-700">
            <span className="text-lg">❤️</span>
            <div className="text-right">
              <div className="text-[10px] font-bold text-red-400">الْمُحَاوَلَاتُ</div>
              <div className="text-xs font-bold text-white">٧ قُلُوبٍ</div>
            </div>
          </div>
        </div>

        {/* Main CTA: MULA BERMAIN */}
        <div className="w-full max-w-sm mt-6">
          <button
            onClick={onStartGame}
            className="mc-button mc-button-green w-full py-4 px-6 rounded text-center flex items-center justify-center gap-3 text-white font-bold text-base sm:text-lg tracking-wide transition-all transform hover:scale-102 active:scale-95 shadow-2xl"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>ابْدَأِ اللَّعِبَ الآنَ</span>
          </button>
        </div>

        {/* Secondary Buttons: CARA BERMAIN, KREDIT */}
        <div className="flex gap-2.5 w-full max-w-sm mt-3">
          <button
            onClick={onOpenHowToPlay}
            className="mc-button flex-1 py-2.5 px-3 font-bold text-xs text-white flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>كَيْفِيَّةُ اللَّعِبِ</span>
          </button>

          <button
            onClick={onOpenCredits}
            className="mc-button flex-1 py-2.5 px-3 font-bold text-xs text-white flex items-center justify-center gap-1.5"
          >
            <Info className="w-4 h-4 text-teal-400" />
            <span>الأَهْدَافُ التَّرْبَوِيَّةُ</span>
          </button>
        </div>

        {/* Download Standalone HTML Button */}
        <div className="w-full max-w-sm mt-2">
          <a
            href="/minecraft_digital_runner.html"
            download="minecraft_digital_runner.html"
            className="mc-button mc-button-gold w-full py-2.5 px-3 font-bold text-xs text-white flex items-center justify-center gap-2 no-underline"
            title="تحميل اللعبة كملف HTML مستقل يعمل بدون إنترنت"
          >
            <span>📥 تَحْمِيلُ مِلَفِّ اللَّعْبَةِ (HTML)</span>
          </a>
        </div>
      </div>

      {/* Bottom Dock: Leaderboard, Daily Reward, Skin Chooser */}
      <div className="pointer-events-auto max-w-md mx-auto w-full flex items-center justify-center gap-2 pb-1 font-cairo">
        {/* Leaderboard button */}
        <button
          onClick={onOpenLeaderboard}
          className="mc-button flex-1 py-2 px-2.5 font-bold text-xs text-white flex items-center justify-center gap-1.5"
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>الصَّدَارَةُ</span>
        </button>

        {/* Daily Reward button */}
        <button
          onClick={onOpenDailyReward}
          className="mc-button mc-button-gold flex-1 py-2 px-2.5 font-bold text-xs text-white flex items-center justify-center gap-1.5"
        >
          <Gift className="w-4 h-4 text-white" />
          <span>الْمُكَافَأَةُ</span>
        </button>

        {/* Character Skin Selector */}
        <button
          onClick={onOpenSkinSelector}
          className="mc-button flex-1 py-2 px-2.5 font-bold text-xs text-white flex items-center justify-center gap-1.5"
        >
          <User className="w-4 h-4 text-cyan-400" />
          <span>الشَّخْصِيَّةُ: {currentSkin.name.split(' ')[0]}</span>
        </button>
      </div>
    </div>
  );
};
