import { ensureBlobs, recordVisit } from "./lib/analytics-store.mjs";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method not allowed",
    };
  }

  const country = context?.geo?.country?.code ?? null;

  try {
    ensureBlobs(event);
    const result = await recordVisit(country);
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
