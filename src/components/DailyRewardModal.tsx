/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Gift, Sparkles, Check, Flame } from 'lucide-react';
import { StorageService } from '../services/storage';

interface DailyRewardModalProps {
  onClose: () => void;
  onRewardClaimed: (coinsAdded: number) => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  onClose,
  onRewardClaimed,
}) => {
  const [streakData, setStreakData] = useState(() => StorageService.getDailyStreak());
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const handleClaim = () => {
    const result = StorageService.claimDailyReward();
    if (result.bonusCoins > 0) {
      setStreakData(StorageService.getDailyStreak());
      onRewardClaimed(result.bonusCoins);
      if (result.unlockedSkinName) {
        setClaimMessage(`مَبْرُوكٌ! حَصَلْتَ عَلَى ${result.bonusCoins} عُمْلَةٍ وَتَمَّ فَتْحُ شَخْصِيَّةِ [${result.unlockedSkinName}]!`);
      } else {
        setClaimMessage(`مَبْرُوكٌ! لَقَدِ اسْتَلَمْتَ ${result.bonusCoins} عُمْلَةٍ إِضَافِيَّةٍ!`);
      }
    }
  };

  const days = [
    { day: 1, reward: '٤٥ عُمْلَةً ذَهَبِيَّةً', unlocked: true },
    { day: 2, reward: '٦٠ عُمْلَةً + فَارِسُ الأَلْمَاس', unlocked: streakData.streak >= 2 },
    { day: 3, reward: '٧٥ عُمْلَةً + بَطَلُ الْفَضَاءِ', unlocked: streakData.streak >= 3 },
    { day: 4, reward: '٩٠ عُمْلَةً ذَهَبِيَّةً', unlocked: streakData.streak >= 4 },
    { day: 5, reward: '١٢٠ عُمْلَةً كُبْرَى', unlocked: streakData.streak >= 5 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-fade-in select-none font-cairo"
      dir="rtl"
    >
      <div className="mc-panel max-w-lg w-full p-5 sm:p-7 rounded-lg border-4 border-amber-500 shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-neutral-700 pb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-yellow-300 text-pixel-shadow">
              الْمُكَافَأَةُ الْيَوْمِيَّةُ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mc-button p-1.5 text-neutral-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak banner */}
        <div className="mc-card p-3 rounded flex items-center justify-between border border-amber-500/50 bg-amber-950/20">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-bold text-xs sm:text-sm text-amber-300">
              التَّتَابُعُ الْيَوْمِيُّ: {streakData.streak} أَيَّام
            </span>
          </div>
          <span className="text-xs text-neutral-300">
            حَافِظْ عَلَى تَتَابُعِكَ يَوْمِيًّا!
          </span>
        </div>

        {/* Claim status message */}
        {claimMessage && (
          <div className="mc-card p-3 rounded border border-emerald-500 bg-emerald-950/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-yellow-400" />
            <span>{claimMessage}</span>
          </div>
        )}

        {/* Day reward cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-1">
          {days.map((item) => {
            const isCurrentDay = item.day === streakData.streak;
            const isCompleted = item.day < streakData.streak;

            return (
              <div
                key={item.day}
                className={`mc-card p-3 rounded text-center border relative ${
                  isCurrentDay
                    ? 'border-yellow-400 bg-neutral-800 ring-2 ring-yellow-400/50'
                    : isCompleted
                    ? 'border-emerald-600 bg-neutral-900/80 opacity-70'
                    : 'border-neutral-700 bg-neutral-900/40 opacity-50'
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-1.5 left-1.5 text-emerald-400">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className="text-xs font-bold text-neutral-300">الْيَوْمُ {item.day}</div>
                <div className="text-2xl my-1">🎁</div>
                <div className="text-[11px] font-bold text-amber-300 leading-tight">
                  {item.reward}
                </div>
              </div>
            );
          })}
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={!streakData.canClaim}
          className={`mc-button w-full py-3 px-4 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 ${
            streakData.canClaim ? 'mc-button-green' : 'opacity-60 cursor-not-allowed'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>
            {streakData.canClaim ? 'اسْتِلَامُ مُكَافَأَةِ الْيَوْمِ' : 'تَمَّ الِاسْتِلَامُ لِهَذَا الْيَوْمِ'}
          </span>
        </button>
      </div>
    </div>
  );
};
