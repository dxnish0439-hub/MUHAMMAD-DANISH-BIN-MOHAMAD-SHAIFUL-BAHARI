/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, Trophy, Flame } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';
import { StorageService } from '../services/storage';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(StorageService.getLeaderboard());
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 animate-fade-in select-none font-cairo"
      dir="rtl"
    >
      <div className="mc-panel max-w-xl w-full max-h-[90vh] overflow-hidden p-5 sm:p-7 rounded-lg border-4 border-amber-600 shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-neutral-700 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-base sm:text-lg font-bold text-yellow-300 text-pixel-shadow">
              لَوْحَةُ الصَّدَارَةِ وَالتَّرْتِيبِ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mc-button p-1.5 text-neutral-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle */}
        <div className="flex items-center justify-between text-xs text-neutral-300 px-1">
          <span>أَفْضَلُ عَدَّائِي الآدَابِ الرَّقْمِيَّةِ</span>
          <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" /> تَحْدِيثٌ لَحْظِيٌّ
          </span>
        </div>

        {/* Table list */}
        <div className="overflow-y-auto no-scrollbar flex-1 space-y-2 pl-1">
          {entries.map((entry, index) => {
            const isTop3 = index < 3;
            let rankBadge = `${index + 1}`;
            let rankColor = 'text-neutral-400';
            if (index === 0) {
              rankBadge = '🥇';
              rankColor = 'text-yellow-400';
            } else if (index === 1) {
              rankBadge = '🥈';
              rankColor = 'text-slate-300';
            } else if (index === 2) {
              rankBadge = '🥉';
              rankColor = 'text-amber-600';
            }

            return (
              <div
                key={entry.id}
                className={`mc-card p-3 rounded flex items-center justify-between gap-3 border ${
                  isTop3 ? 'border-amber-500/60 bg-neutral-900/90' : 'border-neutral-800 bg-neutral-900/50'
                }`}
              >
                {/* Rank & Avatar & Name */}
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-bold text-sm sm:text-base ${rankColor}`}>
                    {rankBadge}
                  </span>
                  <span className="text-lg">{entry.avatar || '🏃'}</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white">
                      {entry.name}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-bold">
                      ✓ {entry.questionsAnswered} / ١٠ أَسْئِلَةٍ
                    </div>
                  </div>
                </div>

                {/* Score & Coins */}
                <div className="text-left font-cairo">
                  <div className="font-pixel text-xs sm:text-sm text-yellow-300 tabular-nums">
                    {entry.score.toLocaleString()} نُقْطَةٍ
                  </div>
                  <div className="text-[11px] text-neutral-400 font-bold">
                    🪙 {entry.coins} عُمْلَةٍ
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mc-button w-full py-2.5 px-4 font-bold text-xs text-white mt-1"
        >
          الْعَوْدَةُ إِلَى الْقَائِمَةِ
        </button>
      </div>
    </div>
  );
};
