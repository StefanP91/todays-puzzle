import { getSiteOrigin, escapeHtmlAttr } from "./lib/share-data.mjs";
import { getSiteMeta } from "./lib/site-meta.mjs";

export async function handler(event) {
  const lang = event.queryStringParameters?.lang ?? "en";
  const meta = getSiteMeta(lang);
  const origin = getSiteOrigin(event);
  const pageUrl = `${origin}/?lang=${meta.lang}`;
  const imageUrl = `${origin}/api/og.png?lang=${meta.lang}`;

  const title = escapeHtmlAttr(meta.title);
  const description = escapeHtmlAttr(meta.description);

  const html = `<!DOCTYPE html>
<html lang="${meta.htmlLang}" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="image_src" href="${imageUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${title}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${description}" />
  <meta property="og:locale" content="${meta.ogLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="apple-mobile-web-app-title" content="${escapeHtmlAttr(meta.shortName)}" />
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
