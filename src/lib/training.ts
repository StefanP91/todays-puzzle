import { getDictionary } from "./dictionaries";
import type { GameLangCode } from "./gameLanguage";

export function pickRandomTrainingWord(
  lang: GameLangCode,
  exclude?: string
): {
  word: string;
  hint: string;
} {
  const pool = exclude
    ? getDictionary(lang).filter((e) => e.word !== exclude)
    : getDictionary(lang);
  const entry = pool[Math.floor(Math.random() * pool.length)];
  return { word: entry.word, hint: entry.hint };
}
