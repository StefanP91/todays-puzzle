import { ensureBlobs, getAggregatedStats } from "./lib/analytics-store.mjs";
import { isAuthorizedAdmin, unauthorizedResponse } from "./lib/auth.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET" },
      body: "Method not allowed",
    };
  }

  if (!isAuthorizedAdmin(event)) {
    return unauthorizedResponse();
  }

  try {
    ensureBlobs(event);
    const stats = await getAggregatedStats();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(stats),
    };
  } catch (error) {
    console.error("admin-stats failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to load stats" }),
    };
  }
}
