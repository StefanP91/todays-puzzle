import { readFileSync } from "fs";

function parseDict(file) {
  const raw = readFileSync(file, "utf8");
  const entries = [];
  const re = /\{\s*word:\s*"([^"]+)",\s*hint:\s*"([^"]+)"\s*\}/g;
  for (const m of raw.matchAll(re)) {
    if (m[1].length === 5) entries.push({ word: m[1], hint: m[2] });
  }
  return entries;
}

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

function getDailyWord(pool, dateKey) {
  const puzzle = getPuzzleNumber(dateKey);
  const index = hashString(dateKey) % pool.length;
  const rotated = (index + puzzle * 7) % pool.length;
  return pool[rotated];
}

const langs = [
  ["MK", "src/lib/dictionary.ts"],
  ["EN", "src/lib/dictionary-en.ts"],
  ["SR", "src/lib/dictionary-sr.ts"],
  ["HR", "src/lib/dictionary-hr.ts"],
  ["BS", "src/lib/dictionary-bs.ts"],
  ["SL", "src/lib/dictionary-sl.ts"],
  ["SQ", "src/lib/dictionary-sq.ts"],
  ["BG", "src/lib/dictionary-bg.ts"],
  ["EL", "src/lib/dictionary-el.ts"],
  ["RO", "src/lib/dictionary-ro.ts"],
  ["DE", "src/lib/dictionary-de.ts"],
  ["FR", "src/lib/dictionary-fr.ts"],
  ["ES", "src/lib/dictionary-es.ts"],
  ["IT", "src/lib/dictionary-it.ts"],
  ["PT", "src/lib/dictionary-pt.ts"],
  ["NL", "src/lib/dictionary-nl.ts"],
  ["PL", "src/lib/dictionary-pl.ts"],
  ["CS", "src/lib/dictionary-cs.ts"],
  ["SV", "src/lib/dictionary-sv.ts"],
  ["HU", "src/lib/dictionary-hu.ts"],
  ["UK", "src/lib/dictionary-uk.ts"],
];

const key = getTodayKey();
console.log("Date:", key, "| Puzzle #" + getPuzzleNumber(key));
console.log("");

for (const [code, file] of langs) {
  const pool = parseDict(file);
  const entry = getDailyWord(pool, key);
  console.log(`${code}: ${entry.word} — ${entry.hint}`);
}
