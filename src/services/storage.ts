/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LeaderboardEntry, CharacterSkin } from '../types/game';

const HIGH_SCORE_KEY = 'mc_runner_highscore';
const TOTAL_COINS_KEY = 'mc_runner_coins';
const LEADERBOARD_KEY = 'mc_runner_leaderboard';
const DAILY_STREAK_KEY = 'mc_runner_daily_streak';
const LAST_CLAIM_KEY = 'mc_runner_last_claim';
const SELECTED_SKIN_KEY = 'mc_runner_selected_skin';

export const SKINS_DATA: CharacterSkin[] = [
  {
    id: 'steve',
    name: 'ستيف المُسْتَكْشِف',
    description: 'شَخْصِيَّةٌ كِلَاسِيكِيَّةٌ شُجَاعَةٌ تَسْتَكْشِفُ الْعَالَمَ الرَّقْمِيَّ بِأَدَبٍ.',
    shirtColor: 0x00a8a8, // Cyan / Teal
    pantsColor: 0x223388, // Dark Blue
    skinColor: 0xdb9979, // Minecraft skin tone
    hairColor: 0x3d271d, // Dark Brown
    unlocked: true,
  },
  {
    id: 'alex',
    name: 'أليكس الْحَكِيمَة',
    description: 'ذَكِيَّةٌ تُفَكِّرُ مَلِيًّا قَبْلَ نَشْرِ أَيِّ شَيْءٍ عَلَى الإِنْتَرْنِت.',
    shirtColor: 0x5b8731, // Olive Green
    pantsColor: 0x58402b, // Brown
    skinColor: 0xe5a383,
    hairColor: 0xa8431b, // Ginger
    unlocked: true,
  },
  {
    id: 'diamond',
    name: 'فَارِسُ الأَلْمَاس',
    description: 'مُدَرَّعٌ بِأَلْمَاسِ النَّزَاهَةِ وَالأَخْلَاقِ الْفَاضِلَةِ.',
    shirtColor: 0x33ebcb, // Diamond Cyan
    pantsColor: 0x1f9485,
    skinColor: 0xdb9979,
    hairColor: 0x1c1a17,
    unlocked: false,
    requiredStreak: 2,
  },
  {
    id: 'cyber',
    name: 'بَطَلُ الْفَضَاءِ الرَّقْمِيِّ',
    description: 'حَامِي الْخُصُوصِيَّةِ وَمُرْشِدُ التَّوَاصُلِ الْحَضَارِيِّ.',
    shirtColor: 0x8b5cf6, // Cyber Purple
    pantsColor: 0x1e1b4b,
    skinColor: 0xf3c5a5,
    hairColor: 0xec4899,
    unlocked: false,
    requiredStreak: 3,
  },
];

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'أَمِيرُ التَّائِب', score: 3840, coins: 142, questionsAnswered: 10, date: 'الْيَوْم', avatar: '🛡️' },
  { id: '2', name: 'سَارَةُ صَاحِبَةُ الْخُلُق', score: 3520, coins: 128, questionsAnswered: 10, date: 'الْيَوْم', avatar: '🌸' },
  { id: '3', name: 'حَازِمُ الْحَكِيم', score: 3180, coins: 110, questionsAnswered: 9, date: 'أَمْس', avatar: '⚡' },
  { id: '4', name: 'فَرَحُ الْمُهَذَّبَة', score: 2890, coins: 95, questionsAnswered: 8, date: 'مُنْذُ يَوْمَيْن', avatar: '💎' },
  { id: '5', name: 'أَيْمَنُ الرَّقْمِيّ', score: 2450, coins: 82, questionsAnswered: 7, date: 'مُنْذُ ٣ أَيَّام', avatar: '🚀' },
];

export class StorageService {
  public static getHighScore(): number {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
  }

  public static setHighScore(score: number): void {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem(HIGH_SCORE_KEY, String(score));
    }
  }

  public static getTotalCoins(): number {
    return parseInt(localStorage.getItem(TOTAL_COINS_KEY) || '50', 10);
  }

  public static addCoins(amount: number): number {
    const current = this.getTotalCoins();
    const updated = current + amount;
    localStorage.setItem(TOTAL_COINS_KEY, String(updated));
    return updated;
  }

  public static getLeaderboard(): LeaderboardEntry[] {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_LEADERBOARD;
    }
  }

  public static addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry[] {
    const current = this.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Date.now().toString(),
      date: 'الْيَوْم',
    };
    const updated = [...current, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    return updated;
  }

  public static getDailyStreak(): { streak: number; canClaim: boolean; lastClaim: string | null } {
    const streak = parseInt(localStorage.getItem(DAILY_STREAK_KEY) || '1', 10);
    const lastClaim = localStorage.getItem(LAST_CLAIM_KEY);
    const today = new Date().toISOString().slice(0, 10);

    const canClaim = lastClaim !== today;
    return { streak, canClaim, lastClaim };
  }

  public static claimDailyReward(): { streak: number; bonusCoins: number; unlockedSkinName?: string } {
    const { streak, canClaim } = this.getDailyStreak();
    if (!canClaim) {
      return { streak, bonusCoins: 0 };
    }

    const today = new Date().toISOString().slice(0, 10);
    const nextStreak = streak + 1;
    const bonusCoins = 30 + (nextStreak * 15);

    localStorage.setItem(DAILY_STREAK_KEY, String(nextStreak));
    localStorage.setItem(LAST_CLAIM_KEY, today);
    this.addCoins(bonusCoins);

    let unlockedSkinName: string | undefined;
    if (nextStreak === 2) unlockedSkinName = 'فَارِسُ الأَلْمَاس';
    if (nextStreak === 3) unlockedSkinName = 'بَطَلُ الْفَضَاءِ الرَّقْمِيِّ';

    return { streak: nextStreak, bonusCoins, unlockedSkinName };
  }

  public static getSelectedSkinId(): string {
    return localStorage.getItem(SELECTED_SKIN_KEY) || 'steve';
  }

  public static setSelectedSkinId(id: string): void {
    localStorage.setItem(SELECTED_SKIN_KEY, id);
  }

  public static getAvailableSkins(): CharacterSkin[] {
    const { streak } = this.getDailyStreak();
    return SKINS_DATA.map((skin) => {
      if (skin.requiredStreak) {
        return {
          ...skin,
          unlocked: streak >= skin.requiredStreak,
        };
      }
      return skin;
    });
  }
}
