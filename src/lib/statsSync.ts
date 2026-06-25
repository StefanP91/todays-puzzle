import type { GameLangCode } from "./gameLanguage";
import { defaultStats, loadStats, saveStats, type Stats } from "./storage";
import { getSupabase } from "./supabase";

const ALL_LANGS: GameLangCode[] = [
  "mk", "en", "sr", "hr", "bs", "sl", "sq", "bg", "el", "ro",
  "de", "fr", "es", "it", "pt", "nl", "pl", "cs", "sv", "hu", "uk",
];

interface StatsRow {
  lang: string;
  played: number;
  won: number;
  current_streak: number;
  max_streak: number;
  distribution: number[];
}

function rowToStats(row: StatsRow): Stats {
  const distribution = Array.isArray(row.distribution) ? row.distribution : [];
  return {
    played: row.played ?? 0,
    won: row.won ?? 0,
    currentStreak: row.current_streak ?? 0,
    maxStreak: row.max_streak ?? 0,
    distribution: [...defaultStats().distribution.map((_, i) => distribution[i] ?? 0)],
  };
}

function statsToRow(lang: GameLangCode, stats: Stats) {
  return {
    lang,
    played: stats.played,
    won: stats.won,
    current_streak: stats.currentStreak,
    max_streak: stats.maxStreak,
    distribution: stats.distribution,
    updated_at: new Date().toISOString(),
  };
}

/** Prefer the higher totals so re-login does not double-count synced games. */
export function mergeStats(local: Stats, remote: Stats): Stats {
  return {
    played: Math.max(local.played, remote.played),
    won: Math.max(local.won, remote.won),
    currentStreak: Math.max(local.currentStreak, remote.currentStreak),
    maxStreak: Math.max(local.maxStreak, remote.maxStreak),
    distribution: local.distribution.map((value, index) =>
      Math.max(value, remote.distribution[index] ?? 0),
    ),
  };
}

export async function fetchCloudStats(userId: string): Promise<Partial<Record<GameLangCode, Stats>>> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("user_stats")
    .select("lang, played, won, current_streak, max_streak, distribution")
    .eq("user_id", userId);

  if (error) throw error;

  const result: Partial<Record<GameLangCode, Stats>> = {};
  for (const row of data ?? []) {
    if (ALL_LANGS.includes(row.lang as GameLangCode)) {
      result[row.lang as GameLangCode] = rowToStats(row as StatsRow);
    }
  }
  return result;
}

export async function upsertCloudStats(userId: string, lang: GameLangCode, stats: Stats): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("user_stats").upsert(
    { user_id: userId, ...statsToRow(lang, stats) },
    { onConflict: "user_id,lang" },
  );

  if (error) throw error;
}

/** Merge local + cloud stats for every language, save locally, then push to cloud. */
export async function mergeAndSyncAllStats(userId: string): Promise<void> {
  const cloud = await fetchCloudStats(userId);

  for (const lang of ALL_LANGS) {
    const local = loadStats(lang);
    const remote = cloud[lang];
    const merged = remote ? mergeStats(local, remote) : local;
    saveStats(merged, lang);
    await upsertCloudStats(userId, lang, merged);
  }
}

export async function pushStatsToCloud(userId: string, lang: GameLangCode, stats: Stats): Promise<void> {
  await upsertCloudStats(userId, lang, stats);
}
