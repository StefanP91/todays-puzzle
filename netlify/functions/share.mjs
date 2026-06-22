import {
  decodeShareParam,
  getShareDescription,
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
  const ogImage = ogImageUrl(origin, data.lang);
  const resultImageUrl = `${origin}/api/share.png?d=${encodeURIComponent(encoded)}&v=6`;
  const title = escapeHtmlAttr(getShareTitle(data));
  const description = escapeHtmlAttr(getShareDescription(data));
  const content = getShareContent(data.lang);

  const html = `<!DOCTYPE html>
<html lang="${content.htmlLang}" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="image_src" href="${ogImage}" />
${fbAppIdMeta(escapeHtmlAttr)}  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtmlAttr(content.gameTitle)}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${origin}/api/share?d=${encodeURIComponent(encoded)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:secure_url" content="${ogImage}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${description}" />
  <meta property="og:locale" content="${content.ogLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImage}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${resultImageUrl}" alt="${title}" width="1200" height="630" />
  <p><a href="${origin}/">${escapeHtmlAttr(content.playLink)}</a></p>
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
