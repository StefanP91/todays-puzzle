import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSitemapXml } from "../netlify/functions/lib/sitemap-xml.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const SITE_URL = (process.env.SITE_URL || process.env.URL || "https://today-puzzle.netlify.app").replace(
  /\/$/,
  "",
);

const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/api/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "sitemap.xml"), buildSitemapXml(SITE_URL), "utf8");
writeFileSync(join(publicDir, "robots.txt"), robots, "utf8");

console.log(`SEO files generated for ${SITE_URL}`);
