import { ANSWER_WORDS } from "./words";

const EPOCH = new Date("2025-01-01T00:00:00+01:00");

export function getTodayKey(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

export function getPuzzleNumber(dateKey = getTodayKey()): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const epoch = new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate());
  const diff = Math.floor((date.getTime() - epoch.getTime()) / 86_400_000);
  return diff + 1;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDailyWord(dateKey = getTodayKey()): string {
  const puzzle = getPuzzleNumber(dateKey);
  const index = hashString(dateKey) % ANSWER_WORDS.length;
  const rotated = (index + puzzle * 7) % ANSWER_WORDS.length;
  return ANSWER_WORDS[rotated];
}
