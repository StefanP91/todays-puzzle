import {
  clearSessionCookieHeader,
  createSessionToken,
  isAdminConfigured,
  sessionCookieHeader,
  verifyAdminCredentials,
} from "./lib/auth.mjs";

export async function handler(event) {
  if (event.httpMethod === "DELETE") {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearSessionCookieHeader(),
      },
      body: JSON.stringify({ ok: true }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST, DELETE" },
      body: "Method not allowed",
    };
  }

  if (!isAdminConfigured()) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Admin is not configured on the server" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!verifyAdminCredentials(body.email, body.password)) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid email or password" }),
    };
  }

  const token = createSessionToken();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": sessionCookieHeader(token),
    },
    body: JSON.stringify({ ok: true }),
  };
}
