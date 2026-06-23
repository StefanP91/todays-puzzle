import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib");
const graphemeLen = (w) => [...w].length;

const files = readdirSync(dir).filter(
  (f) => (f === "dictionary.ts" || f.startsWith("dictionary-")) && f.endsWith(".ts"),
);

let exitCode = 0;

for (const file of files) {
  const path = join(dir, file);
  const text = readFileSync(path, "utf8");
  const words = [...text.matchAll(/word: "([^"]+)"/g)].map((m) => m[1]);
  const bad = words.filter((w) => graphemeLen(w) !== 5);
  const seen = new Set();
  const dups = words.filter((w) => (seen.has(w) ? true : (seen.add(w), false)));

  const ok = bad.length === 0 && dups.length === 0;
  console.log(
    `${file}: ${words.length} entries, valid5=${words.length - bad.length}` +
      (bad.length ? ` BAD(${bad.length}): ${bad.slice(0, 8).join(", ")}` : "") +
      (dups.length ? ` DUPES: ${[...new Set(dups)].join(", ")}` : "") +
      (ok ? " OK" : ""),
  );
  if (!ok) exitCode = 1;
}

process.exit(exitCode);
