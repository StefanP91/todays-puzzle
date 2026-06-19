import {
  decodeShareParam,
  generateSharePng,
} from "./lib/share-data.mjs";

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

  const png = generateSharePng(data);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
    body: png.toString("base64"),
    isBase64Encoded: true,
  };
}
