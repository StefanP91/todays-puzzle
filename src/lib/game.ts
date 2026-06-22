import type { Cell, LetterState } from "../types";
import { WORD_LENGTH } from "../types";
import type { GameContent } from "./gameContent";
import type { GameLangCode } from "./gameLanguage";
import { getGameConfig } from "./gameConfig";
import { getWordSet, normalizeWord } from "./words";

export function isValidWord(word: string, lang: GameLangCode): boolean {
  return getWordSet(lang).has(normalizeWord(word, lang));
}

export function evaluateGuess(guess: string, answer: string, lang: GameLangCode): Cell[] {
  const g = normalizeWord(guess, lang);
  const a = normalizeWord(answer, lang);
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
  siteUrl: string,
  content: GameContent
): string {
  const { headline, link } = buildShareImageCaption(
    puzzleNumber,
    won,
    guessCount,
    siteUrl,
    content
  );
  return `${headline} ${link}`;
}

export function buildShareImageCaption(
  puzzleNumber: number,
  won: boolean,
  guessCount: number,
  siteUrl: string,
  content: GameContent
): { headline: string; link: string } {
  const link = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
  if (won) {
    const headline =
      guessCount === 1
        ? content.shareWonOne
        : content.shareWonMany.replace("{n}", String(guessCount));
    return { headline, link };
  }
  return {
    headline: content.shareLost.replace("{n}", String(puzzleNumber)),
    link,
  };
}

export function buildShareText(
  puzzleNumber: number,
  guesses: Cell[][],
  won: boolean,
  siteUrl: string,
  content: GameContent,
  lang: GameLangCode
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
  const label = content.shareGameTitle;
  const fallbackUrl = getGameConfig(lang).shareSiteLabel;

  return `${label} #${puzzleNumber} ${score}\n\n${rows}\n\n${siteUrl || fallbackUrl}`;
}
