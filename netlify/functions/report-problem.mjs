import { countryFromEvent } from "./lib/request-geo.mjs";
import { saveReport, validateReportInput } from "./lib/reports-store.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method not allowed",
    };
  }

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

  const validated = validateReportInput(body);
  if (!validated.ok) {
    if (validated.honeypot) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ ok: true }),
      };
    }
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: validated.error }),
    };
  }

  const country = countryFromEvent(event, null) || body.country || null;
  const userAgent = event.headers["user-agent"] || event.headers["User-Agent"] || null;

  try {
    await saveReport(validated.report, { country, userAgent }, event);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error("report-problem failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to submit report" }),
    };
  }
}
