import { isAuthorizedAdmin } from "./lib/auth.mjs";

/** Check whether the current browser session is logged in as admin. */
export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET" },
      body: "Method not allowed",
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({ authenticated: isAuthorizedAdmin(event) }),
  };
}
