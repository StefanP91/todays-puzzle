import { PNG } from "pngjs";

const GRID_SIZE = 30;
const PAYLOAD_RE = /^(\d{1,5})-([x\d])-([0123]{30})$/;

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

const CELL_COLORS = {
  0: null,
  1: [0x3a, 0x3a, 0x3c],
  2: [0xb5, 0x9f, 0x3b],
  3: [0x53, 0x8d, 0x4e],
};

const BG = [0x1a, 0x1a, 0x2e];
const CARD = [0x16, 0x21, 0x3e];
const BORDER = [0x3a, 0x3a, 0x3c];

function setPixel(png, x, y, rgb) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = rgb[0];
  png.data[idx + 1] = rgb[1];
  png.data[idx + 2] = rgb[2];
  png.data[idx + 3] = 255;
}

function fillRect(png, x, y, w, h, rgb) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      setPixel(png, px, py, rgb);
    }
  }
}

function strokeRect(png, x, y, w, h, rgb, thickness = 4) {
  fillRect(png, x, y, w, thickness, rgb);
  fillRect(png, x, y + h - thickness, w, thickness, rgb);
  fillRect(png, x, y, thickness, h, rgb);
  fillRect(png, x + w - thickness, y, thickness, h, rgb);
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

export function generateSharePng(data) {
  const scale = 2;
  const cell = 56 * scale;
  const gap = 6 * scale;
  const pad = 32 * scale;
  const gridW = 5 * cell + 4 * gap;
  const gridH = 6 * cell + 5 * gap;
  const width = gridW + pad * 2;
  const height = gridH + pad * 2;

  const png = new PNG({ width, height });
  fillRect(png, 0, 0, width, height, BG);
  fillRect(png, 12, 12, width - 24, height - 24, CARD);

  const startX = pad;
  const startY = pad;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 5; col++) {
      const x = startX + col * (cell + gap);
      const y = startY + row * (cell + gap);
      const value = data.grid[row * 5 + col];
      const color = CELL_COLORS[value];

      if (color) {
        fillRect(png, x, y, cell, cell, color);
      } else {
        strokeRect(png, x, y, cell, cell, BORDER);
      }
    }
  }

  return PNG.sync.write(png);
}

export function getSiteOrigin(event) {
  const host = event.headers.host || "deneshnazagatka.mk";
  const proto = event.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}
