export type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

export interface Cell {
  letter: string;
  state: LetterState;
}

export type GameStatus = "playing" | "won" | "lost";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
