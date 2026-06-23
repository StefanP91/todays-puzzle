import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib");
const graphemeLen = (w) => [...w].length;

const files = readdirSync(dir).filter(
  (f) => (f === "dictionary.ts" || f.startsWith("dictionary-")) && f.endsWith(".ts"),
);

for (const file of files) {
  const path = join(dir, file);
  let text = readFileSync(path, "utf8");
  const before = [...text.matchAll(/word: "([^"]+)"/g)].map((m) => m[1]);
  const bad = new Set(before.filter((w) => graphemeLen(w) !== 5));

  if (bad.size === 0) continue;

  for (const word of bad) {
    const re = new RegExp(
      `\\n  \\{ word: "${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}", hint: "[^"]*" \\},`,
      "g",
    );
    text = text.replace(re, "");
  }

  writeFileSync(path, text, "utf8");
  const after = [...text.matchAll(/word: "([^"]+)"/g)].map((m) => m[1]);
  console.log(`${file}: removed ${before.length - after.length} invalid (${[...bad].slice(0, 5).join(", ")}...)`);
}
