import { readFileSync } from "fs";

const raw = readFileSync("src/lib/words.ts", "utf8");
const words = [...raw.matchAll(/"([^"]+)"/g)]
  .map((m) => m[1])
  .filter((w) => w.length === 5);
const ANSWER_WORDS = [...new Set(words)];

const EPOCH = new Date(2025, 0, 1);

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getPuzzleNumber(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
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

function getDailyWord(dateKey) {
  const puzzle = getPuzzleNumber(dateKey);
  const index = hashString(dateKey) % ANSWER_WORDS.length;
  const rotated = (index + puzzle * 7) % ANSWER_WORDS.length;
  return ANSWER_WORDS[rotated];
}

const key = getTodayKey();
console.log("Date:", key);
console.log("Puzzle #:", getPuzzleNumber(key));
console.log("TODAY:", getDailyWord(key));
