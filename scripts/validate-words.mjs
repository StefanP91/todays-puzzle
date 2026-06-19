/**
 * Проверка на зборови — споредба со drmj.eu (Дигитален речник на МК јазик).
 * Пушти: node scripts/validate-words.mjs
 */
import { DICTIONARY_5 } from "../src/lib/dictionary.ts";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkWord(word) {
  const url = `http://drmj.eu/search/${encodeURIComponent(word.toLowerCase())}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    const found = html.includes(`>${word.toLowerCase()}<`) || html.includes(word);
    return { word, found };
  } catch (e) {
    return { word, found: null, error: String(e) };
  }
}

console.log(`Проверувам ${DICTIONARY_5.length} зборови на drmj.eu...\n`);

const missing = [];
for (const { word } of DICTIONARY_5) {
  const r = await checkWord(word);
  if (r.found === false) missing.push(word);
  process.stdout.write(r.found ? "." : "X");
  await sleep(200);
}

console.log("\n\nНе пронајдени (можен преглед):", missing.length ? missing.join(", ") : "нема");
