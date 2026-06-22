import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

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

function measureText(text, fontSize, bold = false) {
  const font = bold ? getBoldFont() : getRegularFont();
  const scale = fontSize / font.unitsPerEm;
  let width = 0;
  for (const char of text) {
    width += font.charToGlyph(char).advanceWidth * scale;
  }
  return width;
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

export function textToPathsCentered(text, centerX, yTop, fontSize, fill, bold = false) {
  const width = measureText(text, fontSize, bold);
  return textToPaths(text, centerX - width / 2, yTop, fontSize, fill, bold);
}
