import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { VALID_LANGS } from "../netlify/functions/lib/share-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const SITE_URL = (process.env.SITE_URL || process.env.URL || "https://today-puzzle.netlify.app").replace(
  /\/$/,
  "",
);

const today = new Date().toISOString().slice(0, 10);
const langs = [...VALID_LANGS].sort();

const urls = [
  { loc: `${SITE_URL}/`, priority: "1.0" },
  ...langs.map((lang) => ({
    loc: `${SITE_URL}/?lang=${lang}`,
    priority: lang === "en" || lang === "mk" ? "0.9" : "0.8",
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "sitemap.xml"), sitemap, "utf8");
writeFileSync(join(publicDir, "robots.txt"), robots, "utf8");

console.log(`SEO files generated for ${SITE_URL} (${urls.length} URLs)`);
