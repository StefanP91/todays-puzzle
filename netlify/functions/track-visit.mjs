import { ensureBlobs, recordDuration, recordVisit } from "./lib/analytics-store.mjs";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method not allowed",
    };
  }

  const country = context?.geo?.country?.code ?? null;

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  try {
    ensureBlobs(event);

    if (body.type === "duration") {
      const result = await recordDuration(body.seconds);
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({ ok: true, ...result }),
      };
    }

    const result = await recordVisit(country, body.device);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (error) {
    console.error("track-visit failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Failed to record visit" }),
    };
  }
}
