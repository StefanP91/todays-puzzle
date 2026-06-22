import {
  decodeShareParam,
  getShareDescription,
  getShareOgTitle,
  getShareTitle,
  getSiteOrigin,
  escapeHtmlAttr,
} from "./lib/share-data.mjs";
import { getShareContent } from "./lib/share-content.mjs";
import { ogImageUrl } from "./lib/og-image-url.mjs";
import { fbAppIdMeta } from "./lib/fb-app-id.mjs";

export async function handler(event) {
  const encoded = event.queryStringParameters?.d;
  const data = decodeShareParam(encoded);

  if (!data) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Invalid share link",
    };
  }

  const origin = getSiteOrigin(event);
  const sharePageUrl = `${origin}/share?d=${encodeURIComponent(encoded)}`;
  const staticOgImage = ogImageUrl(origin, data.lang);
  const resultImageUrl = `${origin}/share.png?d=${encodeURIComponent(encoded)}&v=7`;
  const pageTitle = escapeHtmlAttr(getShareTitle(data));
  const ogTitle = escapeHtmlAttr(getShareOgTitle(data));
  const ogDescription = escapeHtmlAttr(getShareDescription(data));
  const content = getShareContent(data.lang);
  const playUrl = `${origin}/?lang=${data.lang}`;

  const html = `<!DOCTYPE html>
<html lang="${content.htmlLang}" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <link rel="image_src" href="${staticOgImage}" />
${fbAppIdMeta(escapeHtmlAttr)}  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtmlAttr(content.gameTitle)}" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDescription}" />
  <meta property="og:url" content="${sharePageUrl}" />
  <meta property="og:image" content="${staticOgImage}" />
  <meta property="og:image:secure_url" content="${staticOgImage}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${ogDescription}" />
  <meta property="og:locale" content="${content.ogLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDescription}" />
  <meta name="twitter:image" content="${staticOgImage}" />
</head>
<body>
  <h1>${ogTitle}</h1>
  <p>${ogDescription}</p>
  <img src="${resultImageUrl}" alt="${ogTitle}" width="1200" height="630" />
  <p><a href="${playUrl}">${escapeHtmlAttr(content.playLink)}</a></p>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
    body: html,
  };
}
