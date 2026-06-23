import { fetchFbPageStats } from "./lib/fb-page-insights.mjs";
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
    const stats = await fetchFbPageStats();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(stats),
    };
  } catch (error) {
    console.error("admin-fb-stats failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        configured: true,
        error: error instanceof Error ? error.message : "Failed to load Facebook stats",
      }),
    };
  }
}
