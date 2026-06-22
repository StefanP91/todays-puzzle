import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { generateHomeOgPng } from "../netlify/functions/lib/home-og-image.mjs";
import { VALID_LANGS } from "../netlify/functions/lib/share-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "og");

const SITE_URL = (process.env.SITE_URL || process.env.URL || "https://today-puzzle.netlify.app").replace(
  /\/$/,
  "",
);

mkdirSync(outDir, { recursive: true });

const langs = [...VALID_LANGS].sort();

for (const lang of langs) {
  const png = await generateHomeOgPng(lang, SITE_URL);
  writeFileSync(join(outDir, `${lang}.png`), png);
  console.log(`og/${lang}.png`);
}

console.log(`Generated ${langs.length} Open Graph images for ${SITE_URL}`);
