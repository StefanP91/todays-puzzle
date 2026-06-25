/**
 * Write TikTok caption files with TITLE line for copy-paste.
 * Usage: node scripts/write-tiktok-posts.mjs [lang ...]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { TIKTOK_POST_LANGS, buildTikTokPostText } from "./tiktok-post-copy.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsDir = join(__dirname, "..", "public", "promo", "tiktok", "posts");

const arg = process.argv[2];
const langs = arg ? process.argv.slice(2) : TIKTOK_POST_LANGS;

mkdirSync(postsDir, { recursive: true });

for (const lang of langs) {
  const text = buildTikTokPostText(lang);
  const path = join(postsDir, `post-${lang}.txt`);
  writeFileSync(path, `${text}\n`, "utf8");
  console.log(`promo/tiktok/posts/post-${lang}.txt`);
}
