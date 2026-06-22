import { VALID_LANGS } from "./share-content.mjs";

export function buildSitemapXml(siteUrl, lastmod = new Date().toISOString().slice(0, 10)) {
  const base = siteUrl.replace(/\/$/, "");
  const langs = [...VALID_LANGS].sort();

  const urls = [
    { loc: `${base}/`, priority: "1.0" },
    ...langs.map((lang) => ({
      loc: `${base}/?lang=${lang}`,
      priority: lang === "en" || lang === "mk" ? "0.9" : "0.8",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}
