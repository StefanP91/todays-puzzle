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

const en = parseDict("src/lib/dictionary-en.ts");
const mk = parseDict("src/lib/dictionary.ts");
const sr = parseDict("src/lib/dictionary-sr.ts");
const hr = parseDict("src/lib/dictionary-hr.ts");
const bs = parseDict("src/lib/dictionary-bs.ts");
const sl = parseDict("src/lib/dictionary-sl.ts");
const sq = parseDict("src/lib/dictionary-sq.ts");
const bg = parseDict("src/lib/dictionary-bg.ts");
const el = parseDict("src/lib/dictionary-el.ts");
const ro = parseDict("src/lib/dictionary-ro.ts");
const de = parseDict("src/lib/dictionary-de.ts");
const fr = parseDict("src/lib/dictionary-fr.ts");
const es = parseDict("src/lib/dictionary-es.ts");
const it = parseDict("src/lib/dictionary-it.ts");
const pt = parseDict("src/lib/dictionary-pt.ts");
const nl = parseDict("src/lib/dictionary-nl.ts");
const key = getTodayKey();
const enEntry = getDailyWord(en, key);
const mkEntry = getDailyWord(mk, key);
const srEntry = getDailyWord(sr, key);
const hrEntry = getDailyWord(hr, key);
const bsEntry = getDailyWord(bs, key);
const slEntry = getDailyWord(sl, key);
const sqEntry = getDailyWord(sq, key);
const bgEntry = getDailyWord(bg, key);
const elEntry = getDailyWord(el, key);
const roEntry = getDailyWord(ro, key);
const deEntry = getDailyWord(de, key);
const frEntry = getDailyWord(fr, key);
const esEntry = getDailyWord(es, key);
const itEntry = getDailyWord(it, key);
const ptEntry = getDailyWord(pt, key);
const nlEntry = getDailyWord(nl, key);

console.log("Date:", key, "| Puzzle #" + getPuzzleNumber(key));
console.log("EN:", enEntry.word, "—", enEntry.hint);
console.log("MK:", mkEntry.word, "—", mkEntry.hint);
console.log("SR:", srEntry.word, "—", srEntry.hint);
console.log("HR:", hrEntry.word, "—", hrEntry.hint);
console.log("BS:", bsEntry.word, "—", bsEntry.hint);
console.log("SL:", slEntry.word, "—", slEntry.hint);
console.log("SQ:", sqEntry.word, "—", sqEntry.hint);
console.log("BG:", bgEntry.word, "—", bgEntry.hint);
console.log("EL:", elEntry.word, "—", elEntry.hint);
console.log("RO:", roEntry.word, "—", roEntry.hint);
console.log("DE:", deEntry.word, "—", deEntry.hint);
console.log("FR:", frEntry.word, "—", frEntry.hint);
console.log("ES:", esEntry.word, "—", esEntry.hint);
console.log("IT:", itEntry.word, "—", itEntry.hint);
console.log("PT:", ptEntry.word, "—", ptEntry.hint);
console.log("NL:", nlEntry.word, "—", nlEntry.hint);
console.log(
  "Counts: EN", en.length, "MK", mk.length, "SR", sr.length, "HR", hr.length,
  "BS", bs.length, "SL", sl.length, "SQ", sq.length, "BG", bg.length,
  "EL", el.length, "RO", ro.length, "DE", de.length, "FR", fr.length,
  "ES", es.length, "IT", it.length, "PT", pt.length, "NL", nl.length,
);
