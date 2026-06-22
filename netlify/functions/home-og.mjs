import { getSiteOrigin, escapeHtmlAttr } from "./lib/share-data.mjs";
import { getSiteMeta } from "./lib/site-meta.mjs";
import { buildSeoHead } from "./lib/seo-head.mjs";
import { ogImageUrl } from "./lib/og-image-url.mjs";

export async function handler(event) {
  const lang = event.queryStringParameters?.lang ?? "en";
  const meta = getSiteMeta(lang);
  const origin = getSiteOrigin(event);
  const pageUrl = `${origin}/?lang=${meta.lang}`;
  const imageUrl = ogImageUrl(origin, meta.lang);
  const head = buildSeoHead({ origin, lang, escapeAttr: escapeHtmlAttr });

  const title = escapeHtmlAttr(meta.title);
  const description = escapeHtmlAttr(meta.description);

  const html = `<!DOCTYPE html>
<html lang="${meta.htmlLang}" prefix="og: https://ogp.me/ns#">
<head>
${head}
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${title}" width="1200" height="630" />
  <p><a href="${pageUrl}">${escapeHtmlAttr(meta.playLink)}</a></p>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
    body: html,
  };
}
