import sharp from "sharp";

const PAYLOAD_RE = /^(\d{1,5})-([x\d])-([0123]{30})$/;
const CELL_FILL = { 1: "#3a3a3c", 2: "#b59f3b", 3: "#538d4e" };
const FONT = "DejaVu Sans, Liberation Sans, Arial, sans-serif";
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

export function decodeShareParam(encoded) {
  if (!encoded || encoded.length > 80) return null;

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const payload = Buffer.from(base64, "base64").toString("utf8");
    const match = payload.match(PAYLOAD_RE);
    if (!match) return null;

    const puzzleNumber = Number(match[1]);
    const score = match[2];
    const grid = match[3];

    if (!Number.isFinite(puzzleNumber) || puzzleNumber < 1) return null;

    return { puzzleNumber, score, grid };
  } catch {
    return null;
  }
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getShareTitle(data) {
  const scoreLabel = data.score === "x" ? "X/6" : `${data.score}/6`;
  return `Денешна Загатка #${data.puzzleNumber} — ${scoreLabel}`;
}

export function getShareDescription(data) {
  const puzzle = data.puzzleNumber;
  if (data.score === "x") {
    return `Не ја погодив денешната загатка #${puzzle} за 6 обиди. Пробај и ти!`;
  }
  const n = Number(data.score);
  const attempts = n === 1 ? "1 обид" : `${n} обиди`;
  return `Погодив во ${attempts}! Пробај и ти на Денешна Загатка #${puzzle}.`;
}

export function getShareImageCaption(data, origin) {
  const link = origin.startsWith("http") ? origin : `https://${origin}`;
  if (data.score === "x") {
    return {
      headline: `Не ја погодив загатка #${data.puzzleNumber}. Пробај и ти:`,
      link,
    };
  }
  const n = Number(data.score);
  const attempts = n === 1 ? "1 обид" : `${n} обиди`;
  return {
    headline: `Погодив во ${attempts}! Пробај и ти:`,
    link,
  };
}

function buildShareSvg(data, origin) {
  const width = SHARE_IMAGE_WIDTH;
  const height = SHARE_IMAGE_HEIGHT;
  const cell = 44;
  const gap = 5;
  const gridW = 5 * cell + 4 * gap;
  const gridH = 6 * cell + 5 * gap;
  const gridX = 72;
  const gridY = Math.round((height - gridH) / 2);
  const textX = gridX + gridW + 56;

  const scoreLabel = data.score === "x" ? "X/6" : `${data.score}/6`;
  const { headline, link } = getShareImageCaption(data, origin);
  const displayLink = link.replace(/^https?:\/\//, "");

  let cells = "";
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 5; col++) {
      const x = gridX + col * (cell + gap);
      const y = gridY + row * (cell + gap);
      const value = Number(data.grid[row * 5 + col]);
      if (value === 0) {
        cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="6" fill="none" stroke="#3a3a3c" stroke-width="2"/>`;
      } else {
        cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="6" fill="${CELL_FILL[value]}"/>`;
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a2e"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="20" fill="#16213e"/>
  ${cells}
  <text x="${textX}" y="210" fill="#ffffff" font-size="42" font-weight="bold" font-family="${FONT}">Денешна Загатка</text>
  <text x="${textX}" y="260" fill="#9ca3af" font-size="30" font-family="${FONT}">#${data.puzzleNumber}  ${scoreLabel}</text>
  <text x="${textX}" y="340" fill="#e5e7eb" font-size="28" font-weight="bold" font-family="${FONT}">${escapeXml(headline)}</text>
  <text x="${textX}" y="390" fill="#60a5fa" font-size="26" font-family="${FONT}">${escapeXml(displayLink)}</text>
</svg>`;
}

export async function generateSharePng(data, origin) {
  const svg = buildShareSvg(data, origin);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export function getSiteOrigin(event) {
  const host = event.headers.host || "deneshnazagatka.mk";
  const proto = event.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}
