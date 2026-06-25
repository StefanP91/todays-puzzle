/**
 * Build vertical TikTok promo slideshows per language.
 * Usage: node scripts/gen-tiktok-slideshow.mjs [lang ...]
 * Example: node scripts/gen-tiktok-slideshow.mjs mk sr hr
 * Output: public/promo/tiktok/videos/slideshow-{lang}.mp4
 * Frames: public/promo/tiktok/frames/{lang}-frame-*.png
 */
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

import { buildSlides, getTikTokContent } from "./tiktok-slideshow-content.mjs";

const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "promo", "tiktok", "videos");
const framesDir = join(root, "public", "promo", "tiktok", "frames");
const audioDir = join(root, "public", "promo", "tiktok", "audio");

const W = 1080;
const H = 1920;
const SLIDE_SEC = 3;
const FPS = 30;

const SITE = "today-puzzle.netlify.app";

const COLORS = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent: "#3a3a3c",
  emptyBorder: "#565758",
  filledBorder: "#9ca3af",
  filledBg: "rgba(255,255,255,0.1)",
  key: "#818384",
  accent: "#e94560",
  surface: "#1a1a2e",
  panel: "#16213e",
};

const CELL = 96;
const GAP = 14;
const ROWS = 6;
const COLS = 5;
const GRID_W = COLS * CELL + (COLS - 1) * GAP;
const GRID_X = (W - GRID_W) / 2;
const GRID_Y = 500;

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @typedef {{ letter: string; state: "correct" | "present" | "absent" | "empty" | "filled" }} GameCell */

/** @returns {GameCell[][]} */
function emptyGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ letter: "", state: "empty" })),
  );
}

/** @param {GameCell[][]} grid @param {number} row @param {string} word @param {GameCell["state"][]} states */
function setRow(grid, row, word, states) {
  for (let i = 0; i < COLS; i++) {
    grid[row][i] = {
      letter: word[i] ?? "",
      state: states?.[i] ?? (word[i] ? "filled" : "empty"),
    };
  }
}

/** @param {GameCell[][]} grid @param {number} row @param {string} partial */
function setTypingRow(grid, row, partial) {
  for (let i = 0; i < COLS; i++) {
    const letter = partial[i] ?? "";
    grid[row][i] = {
      letter,
      state: letter ? "filled" : "empty",
    };
  }
}

/** @param {string} guess @param {string} answer @returns {GameCell["state"][]} */
function evaluateGuess(guess, answer) {
  const g = [...guess];
  const a = [...answer];
  /** @type {GameCell["state"][]} */
  const result = Array(COLS).fill("absent");
  const counts = new Map();

  for (const ch of a) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }

  for (let i = 0; i < COLS; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
      counts.set(g[i], (counts.get(g[i]) ?? 0) - 1);
    }
  }

  for (let i = 0; i < COLS; i++) {
    if (result[i] === "correct") continue;
    const remaining = counts.get(g[i]) ?? 0;
    if (remaining > 0) {
      result[i] = "present";
      counts.set(g[i], remaining - 1);
    }
  }

  return result;
}

/** @param {"partial" | "won" | "progress"} scene @param {import("./tiktok-slideshow-content.mjs").TikTokLangContent["gameDemo"]} demo */
function buildGrid(scene, demo) {
  const grid = emptyGrid();
  const [guess1, guess2] = demo.guesses;

  if (scene === "partial") {
    setTypingRow(grid, 0, demo.partial);
    return grid;
  }

  if (scene === "won") {
    setRow(grid, 0, guess1, evaluateGuess(guess1, demo.answer));
    setRow(grid, 1, guess2, evaluateGuess(guess2, demo.answer));
    setRow(grid, 2, demo.answer, evaluateGuess(demo.answer, demo.answer));
    return grid;
  }

  setRow(grid, 0, guess1, evaluateGuess(guess1, demo.answer));
  setRow(grid, 1, guess2, evaluateGuess(guess2, demo.answer));
  setTypingRow(grid, 2, demo.progressTyping);
  return grid;
}

/** @param {import("./tiktok-slideshow-content.mjs").TikTokLangContent} content */
function keyboardRowsForRender(content) {
  const { keyboardRows, enterLabel } = content;
  return keyboardRows.map((row, index) => {
    if (index === keyboardRows.length - 1) {
      return [enterLabel, ...row, "⌫"];
    }
    return row;
  });
}

/** @param {Record<string, GameCell["state"]>} keyStates @param {number} startY @param {import("./tiktok-slideshow-content.mjs").TikTokLangContent} content */
function keyboardSvg(keyStates, startY, content) {
  const rows = keyboardRowsForRender(content);
  const keyH = 58;
  const keyGap = 6;
  const rowGap = 10;
  let y = startY;
  let svg = "";

  for (const row of rows) {
    const widths = row.map((k) => {
      if (k === "⌫") return 1.55;
      if (k === content.enterLabel) return k.length > 5 ? 1.85 : 1.55;
      return 1;
    });
    const totalUnits = widths.reduce((a, b) => a + b, 0);
    const avail = W - 48 - (row.length - 1) * keyGap;
    const unit = avail / totalUnits;
    let x = 24;

    for (let i = 0; i < row.length; i++) {
      const label = row[i];
      const w = Math.round(unit * widths[i]);
      const isEnter = label === content.enterLabel;
      const isBackspace = label === "⌫";
      const state = label.length === 1 ? keyStates[label] : undefined;
      let fill = COLORS.key;
      if (state === "correct") fill = COLORS.correct;
      else if (state === "present") fill = COLORS.present;
      else if (state === "absent") fill = COLORS.absent;
      else if (isEnter) fill = COLORS.accent;

      let fontSize = 22;
      if (isEnter) fontSize = label.length > 6 ? 15 : label.length > 4 ? 17 : 20;
      if (isBackspace) fontSize = 26;

      svg += `<rect x="${x}" y="${y}" width="${w}" height="${keyH}" rx="6" fill="${fill}"/>`;
      svg += `<text x="${x + w / 2}" y="${y + keyH / 2 + 8}" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700">${escapeXml(label)}</text>`;
      x += w + keyGap;
    }

    y += keyH + rowGap;
  }

  return svg;
}

/** @param {GameCell[][]} grid */
function gridKeyStates(grid) {
  /** @type {Record<string, GameCell["state"]>} */
  const states = {};
  const rank = { correct: 3, present: 2, absent: 1, filled: 0, empty: 0 };

  for (const row of grid) {
    for (const cell of row) {
      if (!cell.letter || cell.state === "filled" || cell.state === "empty") continue;
      const prev = states[cell.letter];
      if (!prev || rank[cell.state] > rank[prev]) {
        states[cell.letter] = cell.state;
      }
    }
  }
  return states;
}

function cellSvg(x, y, cell) {
  const { letter, state } = cell;
  let fill = "none";
  let stroke = COLORS.emptyBorder;
  const textFill = "#ffffff";

  if (state === "correct") {
    fill = COLORS.correct;
    stroke = COLORS.correct;
  } else if (state === "present") {
    fill = COLORS.present;
    stroke = COLORS.present;
  } else if (state === "absent") {
    fill = COLORS.absent;
    stroke = COLORS.absent;
  } else if (state === "filled") {
    fill = "rgba(255,255,255,0.1)";
    stroke = COLORS.filledBorder;
  }

  let out = `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  if (letter) {
    out += `<text x="${x + CELL / 2}" y="${y + CELL / 2 + 14}" text-anchor="middle" fill="${textFill}" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="700">${escapeXml(letter)}</text>`;
  }
  return out;
}

/** @param {GameCell[][]} grid */
function boardSvg(grid) {
  let svg = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = GRID_X + c * (CELL + GAP);
      const y = GRID_Y + r * (CELL + GAP);
      svg += cellSvg(x, y, grid[r][c]);
    }
  }
  return svg;
}

function customSlideSvg(lines, sub) {
  const titleSize = lines[0].length > 20 ? 58 : lines[0].length > 16 ? 64 : 76;
  const titleY = sub ? 780 : 860;
  const line2Y = titleY + (lines[1] ? 100 : 0);
  const subY = 1080;
  const line2Size = lines[1] && lines[1].length > 16 ? 58 : 68;

  let text = "";
  text += `<text x="540" y="${titleY}" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="${titleSize}" font-weight="700">${escapeXml(lines[0])}</text>`;
  if (lines[1]) {
    text += `<text x="540" y="${line2Y}" text-anchor="middle" fill="#6aaa64" font-family="Segoe UI, Arial, sans-serif" font-size="${line2Size}" font-weight="700">${escapeXml(lines[1])}</text>`;
  }
  if (sub) {
    text += `<text x="540" y="${subY}" text-anchor="middle" fill="#818384" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="400">${escapeXml(sub)}</text>`;
  }

  const decoCell = 88;
  const decoGap = 12;
  const decoW = 5 * decoCell + 4 * decoGap;
  const decoX = (W - decoW) / 2;
  const decoY = 1180;
  let cells = "";
  for (let i = 0; i < 5; i++) {
    const x = decoX + i * (decoCell + decoGap);
    cells += `<rect x="${x}" y="${decoY}" width="${decoCell}" height="${decoCell}" rx="10" fill="none" stroke="#3a3a3c" stroke-width="3"/>`;
  }

  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${COLORS.surface}"/>
  <rect x="32" y="32" width="${W - 64}" height="${H - 64}" rx="28" fill="${COLORS.panel}"/>
  ${text}
  ${cells}
  <text x="540" y="${H - 120}" text-anchor="middle" fill="#538d4e" font-family="Segoe UI, Arial, sans-serif" font-size="36" font-weight="600">${escapeXml(SITE)}</text>
</svg>`);
}

/** @param {{ scene: string; puzzle: number; subtitle?: string }} slide @param {import("./tiktok-slideshow-content.mjs").TikTokLangContent} content */
function gameSlideSvg(slide, content) {
  const grid = buildGrid(slide.scene, content.gameDemo);
  const keyStates = gridKeyStates(grid);
  const keyboardY = GRID_Y + ROWS * (CELL + GAP) + 48;
  const score =
    slide.scene === "won"
      ? `${grid.filter((r) => r.some((c) => c.state === "correct")).length}/6`
      : "";

  const headerSub = score ? `#${slide.puzzle}  ${score}` : `#${slide.puzzle}`;
  const titleSize = content.gameTitle.length > 22 ? 36 : 44;

  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${COLORS.surface}"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="24" fill="${COLORS.panel}"/>
  <line x1="48" y1="200" x2="${W - 48}" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  <text x="120" y="130" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="36">📊</text>
  <text x="960" y="130" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="36">💡</text>
  <text x="540" y="115" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="${titleSize}" font-weight="700">${escapeXml(content.gameTitle)}</text>
  <text x="540" y="165" text-anchor="middle" fill="#9ca3af" font-family="Segoe UI, Arial, sans-serif" font-size="30">${escapeXml(headerSub)}</text>
  ${slide.subtitle ? `<text x="540" y="250" text-anchor="middle" fill="#6aaa64" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="600">${escapeXml(slide.subtitle)}</text>` : ""}
  ${boardSvg(grid)}
  ${keyboardSvg(keyStates, keyboardY, content)}
  <text x="540" y="${H - 72}" text-anchor="middle" fill="#538d4e" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="600">${escapeXml(SITE)}</text>
</svg>`);
}

/** @param {string} lang */
function cleanLangFrames(lang) {
  if (!existsSync(framesDir)) return;
  const prefix = `${lang}-`;
  for (const file of readdirSync(framesDir)) {
    if (file.startsWith(prefix)) {
      rmSync(join(framesDir, file), { force: true });
    }
  }
}

/** @param {ReturnType<typeof buildSlides>[number]} slide @param {number} index @param {string} lang @param {import("./tiktok-slideshow-content.mjs").TikTokLangContent} content */
async function buildFrame(slide, index, lang, content) {
  const svg =
    slide.type === "custom"
      ? customSlideSvg(slide.lines, slide.sub)
      : gameSlideSvg(slide, content);

  const buf = await sharp(svg).png().toBuffer();
  const out = join(framesDir, `${lang}-frame-${String(index + 1).padStart(2, "0")}.png`);
  await sharp(buf).png().toFile(out);
  return out;
}

async function generateBackgroundMusic(outputPath, durationSec) {
  const noteDur = durationSec / 6;
  const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
  const args = ["-y"];

  for (const freq of melody) {
    args.push("-f", "lavfi", "-i", `sine=frequency=${freq}:duration=${noteDur}:sample_rate=44100`);
  }
  args.push("-f", "lavfi", "-i", `sine=frequency=261.63:duration=${durationSec}:sample_rate=44100`);
  args.push("-f", "lavfi", "-i", `sine=frequency=329.63:duration=${durationSec}:sample_rate=44100`);

  const padA = melody.length;
  const padB = melody.length + 1;
  const fadeOut = Math.max(0, durationSec - 0.8);
  const melodyInputs = melody.map((_, i) => `[${i}:a]`).join("");

  const filter = [
    `${melodyInputs}concat=n=${melody.length}:v=0:a=1,volume=0.16[melody]`,
    `[${padA}:a][${padB}:a]amix=inputs=2:duration=first,volume=0.05[pad]`,
    "[melody][pad]amix=inputs=2:duration=first",
    "lowpass=f=3200",
    "acompressor=threshold=-20dB:ratio=2:attack=10:release=80",
    "afade=t=in:st=0:d=0.6",
    `afade=t=out:st=${fadeOut}:d=0.8`,
  ].join(",");

  await execFileAsync(
    ffmpegPath,
    [...args, "-filter_complex", filter, "-c:a", "aac", "-b:a", "128k", outputPath],
    { maxBuffer: 10 * 1024 * 1024 },
  );
}

async function resolveBackgroundMusic(durationSec, lang) {
  mkdirSync(audioDir, { recursive: true });

  const customCandidates = ["background.mp3", "background.m4a", "background.wav"];
  for (const name of customCandidates) {
    const customPath = join(audioDir, name);
    if (existsSync(customPath)) {
      return customPath;
    }
  }

  const generatedPath = join(framesDir, `${lang}-background.m4a`);
  await generateBackgroundMusic(generatedPath, durationSec);
  return generatedPath;
}

async function muxVideoWithAudio(videoPath, audioPath, outputPath, durationSec) {
  await execFileAsync(
    ffmpegPath,
    [
      "-y",
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-filter_complex",
      `[1:a]atrim=0:${durationSec},asetpts=PTS-STARTPTS,volume=0.85[a]`,
      "-map",
      "0:v:0",
      "-map",
      "[a]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-shortest",
      "-movflags",
      "+faststart",
      outputPath,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );
}

/** @param {string} lang */
async function buildVideo(lang) {
  const content = getTikTokContent(lang);
  const slides = buildSlides(lang);

  mkdirSync(framesDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });
  cleanLangFrames(lang);

  console.log(`\n[${lang}] building ${slides.length} frames…`);

  const framePaths = [];
  for (let i = 0; i < slides.length; i++) {
    framePaths.push(await buildFrame(slides[i], i, lang, content));
    console.log(`[${lang}] frame ${i + 1}/${slides.length}`);
  }

  const listPath = join(framesDir, `${lang}-list.txt`);
  const listLines = [];
  for (const p of framePaths) {
    const escaped = p.replace(/\\/g, "/").replace(/'/g, "'\\''");
    listLines.push(`file '${escaped}'`);
    listLines.push(`duration ${SLIDE_SEC}`);
  }
  const last = framePaths[framePaths.length - 1].replace(/\\/g, "/").replace(/'/g, "'\\''");
  listLines.push(`file '${last}'`);
  writeFileSync(listPath, listLines.join("\n"), "utf8");

  const durationSec = slides.length * SLIDE_SEC;
  const silentMp4 = join(framesDir, `${lang}-silent.mp4`);
  const outMp4 = join(outDir, `slideshow-${lang}.mp4`);

  await execFileAsync(
    ffmpegPath,
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-vf",
      `fps=${FPS},format=yuv420p`,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-an",
      silentMp4,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );

  const audioPath = await resolveBackgroundMusic(durationSec, lang);
  console.log(`[${lang}] audio: ${audioPath.replace(/\\/g, "/")}`);
  await muxVideoWithAudio(silentMp4, audioPath, outMp4, durationSec);

  console.log(`[${lang}] done: ${outMp4.replace(/\\/g, "/")} (~${durationSec}s)`);
}

async function main() {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary not found");
  }

  const langs = process.argv.slice(2);
  const targets = langs.length > 0 ? langs : ["en"];

  for (const lang of targets) {
    await buildVideo(lang);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
