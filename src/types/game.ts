/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: number;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export type GameStatus =
  | 'menu'
  | 'playing'
  | 'paused'
  | 'quiz'
  | 'quiz_correct'
  | 'quiz_wrong'
  | 'quiz_creeper_wrong'
  | 'game_over'
  | 'victory';

export interface PlayerStats {
  score: number;
  coins: number;
  lives: number;
  currentQuestionIndex: number; // 0 to 9
  distance: number;
  highScore: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  coins: number;
  questionsAnswered: number;
  date: string;
  avatar: string;
}

export interface CharacterSkin {
  id: string;
  name: string;
  description: string;
  shirtColor: number;
  pantsColor: number;
  skinColor: number;
  hairColor: number;
  unlocked: boolean;
  requiredStreak?: number;
}
