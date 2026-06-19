import type { Cell, LetterState } from "../types";
import { WORD_LENGTH } from "../types";
import { WORD_SET } from "./words";

export function isValidWord(word: string): boolean {
  return WORD_SET.has(word.toUpperCase());
}

export function evaluateGuess(guess: string, answer: string): Cell[] {
  const g = guess.toUpperCase();
  const a = answer.toUpperCase();
  const result: LetterState[] = Array(WORD_LENGTH).fill("absent");
  const answerCounts = new Map<string, number>();

  for (const ch of a) {
    answerCounts.set(ch, (answerCounts.get(ch) ?? 0) + 1);
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
      answerCounts.set(g[i], (answerCounts.get(g[i]) ?? 0) - 1);
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const remaining = answerCounts.get(g[i]) ?? 0;
    if (remaining > 0) {
      result[i] = "present";
      answerCounts.set(g[i], remaining - 1);
    }
  }

  return g.split("").map((letter, i) => ({
    letter,
    state: result[i],
  }));
}

export function mergeKeyboardState(
  current: Record<string, LetterState>,
  cells: Cell[]
): Record<string, LetterState> {
  const next = { ...current };
  const priority: Record<LetterState, number> = {
    correct: 3,
    present: 2,
    absent: 1,
    empty: 0,
    tbd: 0,
  };

  for (const cell of cells) {
    const prev = next[cell.letter];
    if (!prev || priority[cell.state] > priority[prev]) {
      next[cell.letter] = cell.state;
    }
  }

  return next;
}

export function buildFacebookQuote(
  puzzleNumber: number,
  won: boolean,
  guessCount: number,
  siteUrl: string
): string {
  const { headline, link } = buildShareImageCaption(
    puzzleNumber,
    won,
    guessCount,
    siteUrl
  );
  return `${headline} ${link}`;
}

export function buildShareImageCaption(
  puzzleNumber: number,
  won: boolean,
  guessCount: number,
  siteUrl: string
): { headline: string; link: string } {
  const link = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  if (won) {
    const attempts = guessCount === 1 ? "1 обид" : `${guessCount} обиди`;
    return {
      headline: `Погодив во ${attempts}! Пробај и ти:`,
      link,
    };
  }
  return {
    headline: `Не ја погодив загатка #${puzzleNumber}. Пробај и ти:`,
    link,
  };
}

export function buildShareText(
  puzzleNumber: number,
  guesses: Cell[][],
  won: boolean,
  siteUrl = "deneshnazagatka.mk"
): string {
  const emojiMap: Record<LetterState, string> = {
    correct: "🟩",
    present: "🟨",
    absent: "⬛",
    empty: "⬜",
    tbd: "⬜",
  };

  const rows = guesses
    .map((row) => row.map((c) => emojiMap[c.state]).join(""))
    .join("\n");

  const score = won ? `${guesses.length}/6` : "X/6";

  return `Денешна Загатка #${puzzleNumber} ${score}\n\n${rows}\n\n${siteUrl}`;
}
