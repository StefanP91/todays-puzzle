import { createClient } from "@supabase/supabase-js";
import { isAuthorizedAdmin, unauthorizedResponse } from "./lib/auth.mjs";

const STATS_TIME_ZONE = "Europe/Skopje";

function getSupabaseAdmin() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function dateKeyInZone(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STATS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function monthKeyInZone(date) {
  return dateKeyInZone(date).slice(0, 7);
}

async function listAllUsers(admin) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const batch = data?.users ?? [];
    users.push(...batch);
    if (batch.length < 1000) break;
    page += 1;
  }

  return users;
}

function providerLabel(user) {
  const provider = user.app_metadata?.provider;
  if (provider === "google") return "Google";
  if (provider === "email") return "Email";
  return provider || "Unknown";
}

function displayName(user) {
  const meta = user.user_metadata ?? {};
  const name = meta.full_name || meta.name;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

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

  const admin = getSupabaseAdmin();
  if (!admin) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({
        configured: false,
        setupHint:
          "Add SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in Netlify environment variables.",
      }),
    };
  }

  try {
    const now = new Date();
    const todayKey = dateKeyInZone(now);
    const monthKey = monthKeyInZone(now);

    const [users, statsResult] = await Promise.all([
      listAllUsers(admin),
      admin.from("user_stats").select("user_id, played, won"),
    ]);

    if (statsResult.error) throw statsResult.error;

    const statsRows = statsResult.data ?? [];
    const usersWithSyncedStats = new Set(statsRows.map((row) => row.user_id)).size;
    const totalGamesPlayed = statsRows.reduce((sum, row) => sum + (row.played ?? 0), 0);
    const totalGamesWon = statsRows.reduce((sum, row) => sum + (row.won ?? 0), 0);

    let newToday = 0;
    let newThisMonth = 0;
    let signedInToday = 0;
    let signedInThisMonth = 0;

    const recentUsers = users
      .map((user) => {
        const createdAt = user.created_at ?? null;
        const lastSignInAt = user.last_sign_in_at ?? null;

        if (createdAt) {
          const createdDate = new Date(createdAt);
          if (dateKeyInZone(createdDate) === todayKey) newToday += 1;
          if (monthKeyInZone(createdDate) === monthKey) newThisMonth += 1;
        }

        if (lastSignInAt) {
          const signInDate = new Date(lastSignInAt);
          if (dateKeyInZone(signInDate) === todayKey) signedInToday += 1;
          if (monthKeyInZone(signInDate) === monthKey) signedInThisMonth += 1;
        }

        return {
          id: user.id,
          email: user.email ?? "",
          name: displayName(user),
          provider: providerLabel(user),
          createdAt,
          lastSignInAt,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastSignInAt || a.createdAt || "";
        const bTime = b.lastSignInAt || b.createdAt || "";
        return bTime.localeCompare(aTime);
      })
      .slice(0, 50);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({
        configured: true,
        totalUsers: users.length,
        newToday,
        newThisMonth,
        signedInToday,
        signedInThisMonth,
        usersWithSyncedStats,
        totalGamesPlayed,
        totalGamesWon,
        recentUsers,
      }),
    };
  } catch (error) {
    console.error("admin-users failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        configured: true,
        error: error instanceof Error ? error.message : "Failed to load user stats",
      }),
    };
  }
}
