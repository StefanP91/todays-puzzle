import { isAuthorizedAdmin, unauthorizedResponse } from "./lib/auth.mjs";
import { listReports, setReportRead } from "./lib/reports-store.mjs";

export async function handler(event) {
  if (!isAuthorizedAdmin(event)) {
    return unauthorizedResponse();
  }

  if (event.httpMethod === "GET") {
    try {
      const reports = await listReports(event);
      const unread = reports.filter((r) => !r.read).length;
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({ reports, unread }),
      };
    } catch (error) {
      console.error("admin-reports GET failed:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to load reports" }),
      };
    }
  }

  if (event.httpMethod === "PATCH") {
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

    const id = String(body.id || "").trim();
    if (!id) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing report id" }),
      };
    }

    try {
      const updated = await setReportRead(id, body.read, event);
      if (!updated) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Report not found" }),
        };
      }
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({ report: updated }),
      };
    } catch (error) {
      console.error("admin-reports PATCH failed:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to update report" }),
      };
    }
  }

  return {
    statusCode: 405,
    headers: { Allow: "GET, PATCH" },
    body: "Method not allowed",
  };
}
