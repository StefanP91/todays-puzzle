import { getSiteOrigin } from "./lib/share-data.mjs";
import { buildSitemapXml } from "./lib/sitemap-xml.mjs";

export async function handler(event) {
  const origin = getSiteOrigin(event);
  const xml = buildSitemapXml(origin);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
    body: xml,
  };
}
