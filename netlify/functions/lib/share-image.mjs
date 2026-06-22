import sharp from "sharp";
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from "./share-constants.mjs";
import { getShareImageCaption } from "./share-data.mjs";
import { textToPathsCentered } from "./font-svg.mjs";

const CELL_FILL = { 1: "#3a3a3c", 2: "#b59f3b", 3: "#538d4e" };

function buildShareSvg(data, origin) {
  const width = SHARE_IMAGE_WIDTH;
  const height = SHARE_IMAGE_HEIGHT;
  const centerX = width / 2;
  const cell = 38;
  const gap = 5;
  const gridW = 5 * cell + 4 * gap;
  const gridH = 6 * cell + 5 * gap;
  const gridX = Math.round((width - gridW) / 2);
  const gridY = 108;

  const scoreLabel = data.score === "x" ? "X/6" : `${data.score}/6`;
  const { headline, link, gameTitle } = getShareImageCaption(data, origin);
  const displayLink = link.replace(/^https?:\/\//, "");
  const footerY = gridY + gridH + 24;

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
  ${textToPathsCentered(gameTitle, centerX, 36, 38, "#ffffff", true)}
  ${textToPathsCentered(`#${data.puzzleNumber}  ${scoreLabel}`, centerX, 76, 24, "#9ca3af")}
  ${cells}
  ${textToPathsCentered(headline, centerX, footerY, 24, "#e5e7eb", true)}
  ${textToPathsCentered(displayLink, centerX, footerY + 38, 22, "#60a5fa")}
</svg>`;
}

export async function generateSharePng(data, origin) {
  const svg = buildShareSvg(data, origin);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
