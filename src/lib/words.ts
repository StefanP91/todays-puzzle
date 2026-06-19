import { DICTIONARY_5 } from "./dictionary";

/** Зборови за дневни одговори — само речнички лексеми (5 букви) */
export const ANSWER_WORDS = DICTIONARY_5.map((e) => e.word);

export const VALID_WORDS = [...ANSWER_WORDS];

export const WORD_SET = new Set(VALID_WORDS.map((w) => w.toUpperCase()));
