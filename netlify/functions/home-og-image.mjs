import { getSiteOrigin } from "./lib/share-data.mjs";
import { resolveLang } from "./lib/site-meta.mjs";
import { ogImageUrl } from "./lib/og-image-url.mjs";

export async function handler(event) {
  const lang = resolveLang(event.queryStringParameters?.lang ?? "en");
  const origin = getSiteOrigin(event);

  return {
    statusCode: 302,
    headers: {
      Location: ogImageUrl(origin, lang),
      "Cache-Control": "public, max-age=86400",
    },
  };
}
