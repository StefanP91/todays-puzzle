import { DEFAULT_LANG, VALID_LANGS, getShareContent } from "./share-content.mjs";

const PAYLOAD_RE = /^(\d{1,5})-([x\d])-([0123]{30})(?:-([a-z]{2}))?$/;

export function decodeShareParam(encoded) {
  if (!encoded || encoded.length > 84) return null;

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const payload = Buffer.from(base64, "base64").toString("utf8");
    const match = payload.match(PAYLOAD_RE);
    if (!match) return null;

    const puzzleNumber = Number(match[1]);
    const score = match[2];
    const grid = match[3];
    const langRaw = match[4] ?? DEFAULT_LANG;
    const lang = VALID_LANGS.has(langRaw) ? langRaw : DEFAULT_LANG;

    if (!Number.isFinite(puzzleNumber) || puzzleNumber < 1) return null;

    return { puzzleNumber, score, grid, lang };
  } catch {
    return null;
  }
}

function fillPuzzle(template, puzzle) {
  return template.replace(/\{puzzle\}/g, String(puzzle)).replace(/#\{n\}/g, `#${puzzle}`);
}

export function getShareTitle(data) {
  const c = getShareContent(data.lang);
  const scoreLabel = data.score === "x" ? "X/6" : `${data.score}/6`;
  return `${c.gameTitle} #${data.puzzleNumber} — ${scoreLabel}`;
}

export function getShareDescription(data) {
  const c = getShareContent(data.lang);
  const puzzle = data.puzzleNumber;

  if (data.score === "x") {
    return fillPuzzle(c.descLost, puzzle);
  }

  const n = Number(data.score);
  const template = n === 1 ? c.descWonOne : c.descWonMany;
  return fillPuzzle(template, puzzle).replace(/\{n\}/g, String(n));
}

export function getShareImageCaption(data, origin) {
  const c = getShareContent(data.lang);
  const link = origin.startsWith("http") ? origin : `https://${origin}`;
  const puzzle = data.puzzleNumber;

  if (data.score === "x") {
    return {
      headline: fillPuzzle(c.lost, puzzle),
      link,
      gameTitle: c.gameTitle,
    };
  }

  const n = Number(data.score);
  const headline = n === 1 ? c.wonOne : c.wonMany.replace(/\{n\}/g, String(n));
  return { headline, link, gameTitle: c.gameTitle };
}

export function getSiteOrigin(event) {
  const host = event.headers.host || "deneshnazagatka.mk";
  const proto = event.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeHtmlAttr(text) {
  return escapeHtml(text);
}
