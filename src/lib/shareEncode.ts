import type { Cell } from "../types";
import { MAX_GUESSES, WORD_LENGTH } from "../types";
import { GAME_SITE_URL, getShareUrl } from "./share";

const STATE_CHAR: Record<string, string> = {
  empty: "0",
  absent: "1",
  present: "2",
  correct: "3",
  tbd: "0",
};

export function buildSharePayload(
  puzzleNumber: number,
  guesses: Cell[][],
  won: boolean
): string {
  const score = won ? String(guesses.length) : "x";
  let grid = "";

  for (let row = 0; row < MAX_GUESSES; row++) {
    for (let col = 0; col < WORD_LENGTH; col++) {
      const state = guesses[row]?.[col]?.state ?? "empty";
      grid += STATE_CHAR[state] ?? "0";
    }
  }

  return `${puzzleNumber}-${score}-${grid}`;
}

export function encodeShareParam(payload: string): string {
  return btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function getSharePageUrl(
  puzzleNumber: number,
  guesses: Cell[][],
  won: boolean
): string {
  const site = getShareUrl() || GAME_SITE_URL;
  const payload = buildSharePayload(puzzleNumber, guesses, won);
  const encoded = encodeShareParam(payload);
  return `${site}/api/share?d=${encoded}`;
}

export function isLocalDev(): boolean {
  const site = getShareUrl();
  return /localhost|127\.0\.0\.1/.test(site);
}
