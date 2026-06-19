import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from "./share-constants.mjs";
import { getShareImageCaption } from "./share-data.mjs";

const CELL_FILL = { 1: "#3a3a3c", 2: "#b59f3b", 3: "#538d4e" };
let regularFont = null;
let boldFont = null;

function getLibDir() {
  if (typeof import.meta !== "undefined" && import.meta.url) {
    return dirname(fileURLToPath(import.meta.url));
  }
  return join(process.cwd(), "netlify/functions/lib");
}

function readFontFile(name) {
  const libDir = getLibDir();
  const candidates = [
    join(libDir, "fonts", name),
    join(process.cwd(), "netlify/functions/lib/fonts", name),
    join(process.cwd(), "lib/fonts", name),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      return readFileSync(path);
    }
  }

  throw new Error(`Font not found: ${name}`);
}

function getRegularFont() {
  if (!regularFont) {
    regularFont = opentype.parse(readFontFile("NotoSans-Regular.ttf"));
  }
  return regularFont;
}

function getBoldFont() {
  if (!boldFont) {
    boldFont = opentype.parse(readFontFile("NotoSans-Bold.ttf"));
  }
  return boldFont;
}

function textToPaths(text, x, yTop, fontSize, fill, bold = false) {
  const font = bold ? getBoldFont() : getRegularFont();
  const scale = fontSize / font.unitsPerEm;
  const baseline = yTop + font.ascender * scale;
  let cursor = x;
  let paths = "";

  for (const char of text) {
    const glyph = font.charToGlyph(char);
    const path = glyph.getPath(cursor, baseline, fontSize);
    paths += `<path d="${path.toPathData(2)}" fill="${fill}"/>`;
    cursor += glyph.advanceWidth * scale;
  }

  return paths;
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
  ${textToPaths("Денешна Загатка", textX, 168, 42, "#ffffff", true)}
  ${textToPaths(`#${data.puzzleNumber}  ${scoreLabel}`, textX, 228, 30, "#9ca3af")}
  ${textToPaths(headline, textX, 308, 28, "#e5e7eb", true)}
  ${textToPaths(displayLink, textX, 358, 26, "#60a5fa")}
</svg>`;
}

export async function generateSharePng(data, origin) {
  const svg = buildShareSvg(data, origin);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
