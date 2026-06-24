import { refreshFbTokens } from "./lib/fb-token-refresh.mjs";

export async function handler(event) {
  try {
    const result = await refreshFbTokens(event, { force: true });
    return {
      statusCode: result.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("scheduled-refresh-fb-token failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        reason: "unexpected_error",
        message: error instanceof Error ? error.message : "Token refresh failed",
      }),
    };
  }
}
