import type { Cell, GameStatus } from "../types";
import { getDailyWord, getPuzzleNumber, getTodayKey } from "./daily";
import { getHintForWord } from "./dictionary";

const STORAGE_KEY = "deneshna-zagatka-state";
const STATS_KEY = "deneshna-zagatka-stats";

export interface SavedGame {
  dateKey: string;
  guesses: Cell[][];
  currentGuess: string;
  status: GameStatus;
}

export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
}

export function defaultStats(): Stats {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
  };
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: Stats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const game = JSON.parse(raw) as SavedGame;
    if (game.dateKey !== getTodayKey()) return null;
    return game;
  } catch {
    return null;
  }
}

export function saveGame(game: SavedGame): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

export function updateStatsOnComplete(won: boolean, guessCount: number): Stats {
  const stats = loadStats();
  stats.played += 1;

  if (won) {
    stats.won += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    if (guessCount >= 1 && guessCount <= 6) {
      stats.distribution[guessCount - 1] += 1;
    }
  } else {
    stats.currentStreak = 0;
  }

  saveStats(stats);
  return stats;
}

export function createNewGame(): {
  answer: string;
  puzzleNumber: number;
  dateKey: string;
  hint: string;
} {
  const dateKey = getTodayKey();
  const answer = getDailyWord(dateKey);
  return {
    answer,
    puzzleNumber: getPuzzleNumber(dateKey),
    dateKey,
    hint: getHintForWord(answer),
  };
}
