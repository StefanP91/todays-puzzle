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
<html lang="mk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${origin}/api/share?d=${encodeURIComponent(encoded)}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="736" />
  <meta property="og:image:height" content="756" />
  <meta property="og:locale" content="mk_MK" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta http-equiv="refresh" content="0;url=${origin}/" />
</head>
<body>
  <p>${description}</p>
  <p><a href="${origin}/">Денешна Загатка</a></p>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
    body: html,
  };
}
