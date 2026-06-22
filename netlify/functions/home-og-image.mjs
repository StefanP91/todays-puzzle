import { getSiteOrigin } from "./lib/share-data.mjs";
import { resolveLang } from "./lib/site-meta.mjs";
import { generateHomeOgPng } from "./lib/home-og-image.mjs";

export async function handler(event) {
  const lang = resolveLang(event.queryStringParameters?.lang ?? "en");
  const origin = getSiteOrigin(event);
  const png = await generateHomeOgPng(lang, origin);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, must-revalidate",
    },
    body: png.toString("base64"),
    isBase64Encoded: true,
  };
}
