import { recordDuration, recordVisit } from "./lib/analytics-store.mjs";
import { countryFromContext } from "./lib/request-geo.mjs";

export default async function handler(request, context) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const country = countryFromContext(request, context);

  let body = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.type === "duration") {
      const result = await recordDuration(body.seconds);
      return Response.json(
        { ok: true, ...result },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const result = await recordVisit(country, body.device);
    return Response.json(
      { ok: true, ...result, country },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("track-visit failed:", error);
    return Response.json({ ok: false, error: "Failed to record visit" }, { status: 500 });
  }
}
