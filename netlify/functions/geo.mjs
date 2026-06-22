import { countryFromContext } from "./lib/request-geo.mjs";

/** Returns ISO country code from the visitor IP (Netlify geo). */
export default async function handler(request, context) {
  const country = countryFromContext(request, context);

  return Response.json(
    { country },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
