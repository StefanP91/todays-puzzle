import sharp from "sharp";
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH } from "./share-constants.mjs";
import { getSiteMeta } from "./site-meta.mjs";
import { textToPathsCentered } from "./font-svg.mjs";

function buildHomeOgSvg(meta, origin) {
  const width = SHARE_IMAGE_WIDTH;
  const height = SHARE_IMAGE_HEIGHT;
  const centerX = width / 2;
  const cell = 44;
  const gap = 6;
  const gridW = 5 * cell + 4 * gap;
  const gridX = Math.round((centerX - gridW / 2));
  const gridY = 280;
  const displayHost = origin.replace(/^https?:\/\//, "");

  let cells = "";
  for (let col = 0; col < 5; col++) {
    const x = gridX + col * (cell + gap);
    cells += `<rect x="${x}" y="${gridY}" width="${cell}" height="${cell}" rx="8" fill="none" stroke="#3a3a3c" stroke-width="2"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a2e"/>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="20" fill="#16213e"/>
  ${textToPathsCentered(meta.title, centerX, 72, 44, "#ffffff", true)}
  ${textToPathsCentered(meta.description, centerX, 168, 26, "#d1d5db", false)}
  ${cells}
  ${textToPathsCentered(displayHost, centerX, 380, 24, "#60a5fa", false)}
</svg>`;
}

export async function generateHomeOgPng(lang, origin) {
  const meta = getSiteMeta(lang);
  const svg = buildHomeOgSvg(meta, origin);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
