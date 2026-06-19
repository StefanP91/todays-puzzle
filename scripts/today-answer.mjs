import { readFileSync } from "fs";

const raw = readFileSync("src/lib/dictionary.ts", "utf8");
const entries = [...raw.matchAll(/word: "([^"]+)", hint: "([^"]+)"/g)]
  .map((m) => ({ word: m[1], hint: m[2] }))
  .filter((e) => e.word.length === 5);
const words = entries.map((e) => e.word);

const EPOCH = new Date(2025, 0, 1);
const dateKey = "2026-06-19";

function getPuzzleNumber(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const epoch = new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate());
  return Math.floor((date - epoch) / 86400000) + 1;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getDailyWord(key) {
  const puzzle = getPuzzleNumber(key);
  const index = hashString(key) % words.length;
  const rotated = (index + puzzle * 7) % words.length;
  return words[rotated];
}

const answer = getDailyWord(dateKey);
const hint = entries.find((e) => e.word === answer)?.hint;
const puzzle = getPuzzleNumber(dateKey);

const wrong = [
  "СОНЦЕ",
  "КНИГА",
  "ВЕТЕР",
  "МАЈКА",
  "ДЕНЕС",
  "ШКОЛА",
  "ЗЕМЈА",
  "ТАТКО",
  "МЛЕКО",
  "ЖИВОТ",
].filter((w) => w !== answer);

console.log(JSON.stringify({ puzzle, answer, hint, wrong: wrong.slice(0, 6) }, null, 2));
