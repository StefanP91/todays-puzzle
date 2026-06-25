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

function getFont(bold = false) {
  return bold ? getBoldFont() : getRegularFont();
}

const RENDER_OPTIONS = { kerning: true, features: { liga: false, rlig: false, ccmp: false } };

function hasDrawablePath(path) {
  if (!path?.commands?.length) return false;
  return path.commands.some((cmd) => cmd.type !== "M" && cmd.type !== "Z");
}

function measureText(text, fontSize, bold = false) {
  const font = getFont(bold);
  const scale = fontSize / font.unitsPerEm;
  let width = 0;
  for (const char of text) {
    width += font.charToGlyph(char).advanceWidth * scale;
  }
  return width;
}

function textToPaths(text, x, yTop, fontSize, fill, bold = false) {
  const font = getFont(bold);
  const scale = fontSize / font.unitsPerEm;
  const baseline = yTop + font.ascender * scale;

  try {
    const path = font.getPath(text, x, baseline, fontSize, RENDER_OPTIONS);
    if (hasDrawablePath(path)) {
      return `<path d="${path.toPathData(2)}" fill="${fill}"/>`;
    }
  } catch {
    // Fall back to per-glyph rendering for scripts with unsupported GSUB rules.
  }

  let cursor = x;
  let paths = "";
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    const path = glyph.getPath(cursor, baseline, fontSize);
    if (hasDrawablePath(path)) {
      paths += `<path d="${path.toPathData(2)}" fill="${fill}"/>`;
    }
    cursor += glyph.advanceWidth * scale;
  }

  return paths;
}

export function measureTextWidth(text, fontSize, bold = false) {
  return measureText(text, fontSize, bold);
}

export function textLineHeight(fontSize, bold = false) {
  const font = getFont(bold);
  const scale = fontSize / font.unitsPerEm;
  return (font.ascender - font.descender) * scale;
}

export function textToPathsLeft(text, x, yTop, fontSize, fill, bold = false) {
  return textToPaths(text, x, yTop, fontSize, fill, bold);
}

export function textToPathsCentered(text, centerX, yTop, fontSize, fill, bold = false) {
  const width = measureText(text, fontSize, bold);
  return textToPaths(text, centerX - width / 2, yTop, fontSize, fill, bold);
}

export function textToPathsCenteredInRect(
  text,
  centerX,
  rectY,
  rectHeight,
  fontSize,
  fill,
  bold = false,
) {
  const font = getFont(bold);
  const scale = fontSize / font.unitsPerEm;
  const textHeight = (font.ascender - font.descender) * scale;
  const yTop = rectY + (rectHeight - textHeight) / 2;
  return textToPathsCentered(text, centerX, yTop, fontSize, fill, bold);
}
