import { decodeShareParam, getSiteOrigin } from "./lib/share-data.mjs";
import { generateSharePng } from "./lib/share-image.mjs";

export async function handler(event) {
  const encoded = event.queryStringParameters?.d;
  const data = decodeShareParam(encoded);

  if (!data) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Invalid share image",
    };
  }

  const origin = getSiteOrigin(event);
  const png = await generateSharePng(data, origin);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
    body: png.toString("base64"),
    isBase64Encoded: true,
  };
}
