import type { Cell, GameStatus } from "../types";
import { getDailyWord, getPuzzleNumber, getTodayKey } from "./daily";
import { getHintForWord } from "./dictionaries";
import type { GameLangCode } from "./gameLanguage";

const LEGACY_STORAGE_KEY = "deneshna-zagatka-state";
const LEGACY_STATS_KEY = "deneshna-zagatka-stats";

function storageKey(lang: GameLangCode): string {
  return `todays-puzzle-state-${lang}`;
}

function statsKey(lang: GameLangCode): string {
  return `todays-puzzle-stats-${lang}`;
}

export interface SavedGame {
  dateKey: string;
  language: GameLangCode;
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

export function loadStats(lang: GameLangCode): Stats {
  try {
    let raw = localStorage.getItem(statsKey(lang));
    if (!raw && lang === "mk") {
      raw = localStorage.getItem(LEGACY_STATS_KEY);
      if (raw) {
        localStorage.setItem(statsKey(lang), raw);
        localStorage.removeItem(LEGACY_STATS_KEY);
      }
    }
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: Stats, lang: GameLangCode): void {
  localStorage.setItem(statsKey(lang), JSON.stringify(stats));
}

export function loadGame(lang: GameLangCode): SavedGame | null {
  try {
    let raw = localStorage.getItem(storageKey(lang));
    if (!raw && lang === "mk") {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(storageKey(lang), raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (!raw) return null;
    const game = JSON.parse(raw) as SavedGame;
    if (game.dateKey !== getTodayKey()) return null;
    return game;
  } catch {
    return null;
  }
}

export function saveGame(game: SavedGame, lang: GameLangCode): void {
  localStorage.setItem(storageKey(lang), JSON.stringify({ ...game, language: lang }));
}

export function updateStatsOnComplete(
  won: boolean,
  guessCount: number,
  lang: GameLangCode
): Stats {
  const stats = loadStats(lang);
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

  saveStats(stats, lang);
  return stats;
}

export function createNewGame(lang: GameLangCode): {
  answer: string;
  puzzleNumber: number;
  dateKey: string;
  hint: string;
  language: GameLangCode;
} {
  const dateKey = getTodayKey();
  const answer = getDailyWord(dateKey, lang);
  return {
    answer,
    puzzleNumber: getPuzzleNumber(dateKey),
    dateKey,
    hint: getHintForWord(answer, lang),
    language: lang,
  };
}
