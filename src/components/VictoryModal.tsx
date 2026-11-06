/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Coins, Heart, RotateCcw, Home, Award } from 'lucide-react';
import { StorageService } from '../services/storage';

interface VictoryModalProps {
  score: number;
  coins: number;
  lives: number;
  onRestart: () => void;
  onExitMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  coins,
  lives,
  onRestart,
  onExitMenu,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Fireworks celebration effect using canvas-confetti
    const duration = 4.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const interval: number = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: 0.15, y: 0.5 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.85, y: 0.5 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.5, y: 0.3 } });
    }, 350);

    StorageService.setHighScore(score);
    StorageService.addCoins(coins);

    return () => clearInterval(interval);
  }, [score, coins]);

  const handleSaveToLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSaved) return;

    StorageService.addLeaderboardEntry({
      name: playerName.trim(),
      score,
      coins,
      questionsAnswered: 10,
      avatar: '👑',
    });
    setIsSaved(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 animate-fade-in select-none"
      dir="rtl"
    >
      <div className="mc-panel max-w-lg w-full p-5 sm:p-7 rounded-lg border-4 border-yellow-400 shadow-2xl flex flex-col gap-4 text-white text-center font-cairo">
        {/* Victory Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-yellow-400 flex items-center justify-center text-3xl animate-bounce">
            🏆
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-300 text-gold-shadow leading-tight">
            تَهَانِينَا! لَقَدْ فَزْتَ بِالْمَرْحَلَةِ!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-300 font-bold px-2 leading-relaxed">
            "تهانينا! لقد أتقنت آداب التواصل في العالم الرقمي بنجاح تام."
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-1">
          {/* Score */}
          <div className="mc-card p-3 rounded text-center border-amber-600/50">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-neutral-300">مَجْمُوعُ النِّقَاطِ</div>
            <div className="text-sm sm:text-base font-pixel text-yellow-300 tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>

          {/* Coins */}
          <div className="mc-card p-3 rounded text-center border-yellow-600/50">
            <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-[10px] font-bold text-neutral-300">الْعُمْلَاتُ</div>
            <div className="text-sm sm:text-base font-pixel text-yellow-200 tabular-nums">
              +{coins}
            </div>
          </div>

          {/* Remaining Lives out of 7 */}
          <div className="mc-card p-3 rounded text-center border-red-600/50">
            <Heart className="w-5 h-5 text-red-500 mx-auto mb-1 fill-red-500" />
            <div className="text-[10px] font-bold text-neutral-300">الْقُلُوبُ</div>
            <div className="text-sm sm:text-base font-pixel text-red-400 tabular-nums">
              {lives} / ٧
            </div>
          </div>
        </div>

        {/* Leaderboard Submission */}
        {!isSaved ? (
          <form onSubmit={handleSaveToLeaderboard} className="mc-card p-3 rounded border border-neutral-600 flex flex-col gap-2">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4" /> حِفْظُ النَّتِيجَةِ فِي لَوْحَةِ الصَّدَارَةِ
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="أَدْخِلِ اسْمَكَ الْكَرِيمَ..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="mc-card flex-1 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 font-cairo"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="mc-button mc-button-gold px-4 py-1.5 font-bold text-xs disabled:opacity-50"
              >
                حِفْظ
              </button>
            </div>
          </form>
        ) : (
          <div className="text-xs font-bold text-emerald-400">
            ✓ تَمَّ حِفْظُ نَتِيجَتِكَ فِي لَوْحَةِ الصَّدَارَةِ بِنَجَاحٍ!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
          <button
            onClick={onRestart}
            className="mc-button mc-button-green flex-1 py-3 px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إِعَادَةُ اللَّعِبِ</span>
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
