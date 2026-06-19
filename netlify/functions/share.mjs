import {
  decodeShareParam,
  getShareDescription,
  getShareTitle,
  getSiteOrigin,
} from "./lib/share-data.mjs";

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
  const imageUrl = `${origin}/api/share.png?d=${encodeURIComponent(encoded)}`;
  const title = getShareTitle(data);
  const description = getShareDescription(data);

  const html = `<!DOCTYPE html>
<html lang="mk" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="image_src" href="${imageUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Денешна Загатка" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${origin}/api/share?d=${encodeURIComponent(encoded)}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${description}" />
  <meta property="og:locale" content="mk_MK" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${title}" width="1200" height="630" />
  <p><a href="${origin}/">Играј Денешна Загатка</a></p>
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
