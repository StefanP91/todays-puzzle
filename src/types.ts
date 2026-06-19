export type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

export interface Cell {
  letter: string;
  state: LetterState;
}

export type GameStatus = "playing" | "won" | "lost";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export const KEYBOARD_ROWS = [
  ["Љ", "Њ", "Е", "Р", "Т", "Ѕ", "У", "И", "О", "П", "Ш"],
  ["А", "С", "Д", "Ф", "Г", "Х", "Ј", "К", "Л", "Ч", "Ќ"],
  ["В", "З", "Џ", "Ц", "Ж", "Б", "Н", "М", "Ѓ"],
] as const;
