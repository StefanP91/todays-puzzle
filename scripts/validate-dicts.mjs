import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib");
const files = [
  "dictionary-sl.ts",
  "dictionary-sq.ts",
  "dictionary-bg.ts",
  "dictionary-el.ts",
  "dictionary-ro.ts",
];

for (const f of files) {
  const text = readFileSync(join(dir, f), "utf8");
  const words = [...text.matchAll(/word: "([^"]+)"/g)].map((m) => m[1]);
  const bad = words.filter((w) => w.length !== 5);
  const dup = words.filter((w, i) => words.indexOf(w) !== i);
  console.log(`${f}: ${words.length} words`);
  if (bad.length) console.log("  BAD LENGTH:", bad.map((w) => `${w}(${w.length})`).join(", "));
  if (dup.length) console.log("  DUPES:", [...new Set(dup)].join(", "));
  if (!bad.length && words.length >= 120 && words.length <= 135) console.log("  OK");
}
