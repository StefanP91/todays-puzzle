import { DICTIONARY_5, getHintForWord } from "./dictionary";

export function pickRandomTrainingWord(exclude?: string): {
  word: string;
  hint: string;
} {
  const pool = exclude
    ? DICTIONARY_5.filter((e) => e.word !== exclude)
    : DICTIONARY_5;
  const entry = pool[Math.floor(Math.random() * pool.length)];
  return { word: entry.word, hint: entry.hint };
}

export function getTrainingHint(word: string): string {
  return getHintForWord(word);
}
