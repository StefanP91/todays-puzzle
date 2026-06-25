export interface CountrySourceStat {
  country: string;
  source: string;
  count: number;
}

export interface DeviceStats {
  mobile: number;
  desktop: number;
}

export interface PeriodStats {
  total: number;
  byCountrySource: CountrySourceStat[];
  avgDurationSeconds: number | null;
  durationSessions: number;
  byDevice: DeviceStats;
}

export interface CountryStat {
  country: string;
  count: number;
}

export interface SourceTrafficStats {
  today: { date: string; total: number; byCountry: CountryStat[] };
  month: { month: string; total: number; byCountry: CountryStat[] };
  allTime: { total: number; byCountry: CountryStat[] };
  dailySeries: { date: string; total: number }[];
}

export interface AdminStats {
  today: PeriodStats & { date: string };
  month: PeriodStats & { month: string };
  allTime: PeriodStats;
  dailySeries: { date: string; total: number }[];
  tiktokTraffic: SourceTrafficStats;
}

const jsonHeaders = { "Content-Type": "application/json" };

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(
      "Admin API is not available on this server. For local development run «npm run dev:netlify», or sign in at https://today-puzzle.netlify.app/admin",
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    if (text.trimStart().startsWith("<!")) {
      throw new Error(
        "Admin API is not available on the Vite dev server. Run «npm run dev:netlify» or use https://today-puzzle.netlify.app/admin",
      );
    }
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "Request failed");
  }
  return data as T;
}

export async function checkAdminSession(): Promise<boolean> {
  const response = await fetch("/api/admin/session", { credentials: "include" });
  const data = await parseJson<{ authenticated: boolean }>(response);
  return data.authenticated;
}

export async function adminLogin(email: string, password: string): Promise<void> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });
  await parseJson(response);
}

export async function adminLogout(): Promise<void> {
  const response = await fetch("/api/admin/login", {
    method: "DELETE",
    credentials: "include",
  });
  await parseJson(response);
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/admin/stats", {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<AdminStats>(response);
}

export interface FbMetricBlock {
  pageViews: number | null;
  reach: number | null;
  engagements: number | null;
  newFollows: number | null;
}

export interface FbPageStatsConfigured {
  configured: true;
  lastFetched?: string;
  page?: {
    id: string;
    name: string;
    link: string;
    followersCount: number;
    fanCount: number | null;
  };
  today?: FbMetricBlock & { date: string };
  month?: FbMetricBlock & { month: string };
  days28?: FbMetricBlock;
  dailyPageViews?: { date: string; total: number }[];
  dailyReach?: { date: string; total: number }[];
  metricErrors?: { metric: string; message: string }[];
  tokenMeta?: {
    refreshedAt: string | null;
    pageExpiresAt: number | null;
    userExpiresAt: number | null;
    hasUserToken: boolean;
  } | null;
  tokenWarning?: string | null;
  refreshResult?: { ok: boolean; reason?: string; message?: string; source?: string } | null;
  envCheck?: {
    hasPageId: boolean;
    hasAppId: boolean;
    hasAppKey: boolean;
    hasUserToken: boolean;
    hasPageToken: boolean;
  };
  note?: string;
  error?: string;
}

export interface FbPageStatsUnconfigured {
  configured: false;
  setupHint: string;
}

export type FbPageStats = FbPageStatsConfigured | FbPageStatsUnconfigured;

export async function fetchFbPageStats(): Promise<FbPageStats> {
  const response = await fetch("/api/admin/fb-stats", {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<FbPageStats>(response);
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  provider: string;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export interface AdminUsersConfigured {
  configured: true;
  totalUsers: number;
  newToday: number;
  newThisMonth: number;
  signedInToday: number;
  signedInThisMonth: number;
  usersWithSyncedStats: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  recentUsers: AdminUserRow[];
  error?: string;
}

export interface AdminUsersUnconfigured {
  configured: false;
  setupHint: string;
}

export type AdminUsersStats = AdminUsersConfigured | AdminUsersUnconfigured;

export async function fetchAdminUsers(): Promise<AdminUsersStats> {
  const response = await fetch("/api/admin/users", {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<AdminUsersStats>(response);
}

export interface ProblemReport {
  id: string;
  createdAt: string;
  message: string;
  email: string | null;
  lang: string;
  pageUrl: string | null;
  country: string | null;
  userAgent: string | null;
  read: boolean;
}

export interface AdminReportsResponse {
  reports: ProblemReport[];
  unread: number;
}

export async function fetchAdminReports(): Promise<AdminReportsResponse> {
  const response = await fetch("/api/admin/reports", {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<AdminReportsResponse>(response);
}

export interface TikTokPromoLanguage {
  lang: string;
  hasPost: boolean;
  hasVideo: boolean;
  postText: string | null;
  videoUrl: string;
}

export interface TikTokPromoManifest {
  available: boolean;
  readyCount: number;
  totalLanguages: number;
  languages: TikTokPromoLanguage[];
  generateHint: string;
  note: string;
}

export async function fetchTikTokPromo(): Promise<TikTokPromoManifest> {
  const response = await fetch("/api/admin/tiktok-promo", {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<TikTokPromoManifest>(response);
}

export async function markReportRead(id: string, read: boolean): Promise<ProblemReport> {
  const response = await fetch("/api/admin/reports", {
    method: "PATCH",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify({ id, read }),
  });
  const data = await parseJson<{ report: ProblemReport }>(response);
  return data.report;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      timeZone: "Europe/Skopje",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryLabel(code: string): string {
  if (code === "ZZ") return "Unknown";
  try {
    return countryNames.of(code) || code;
  } catch {
    return code;
  }
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
}

/** Display stored YYYY-MM-DD keys as DD-MM-YYYY. */
export function formatDisplayDate(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct / bookmark",
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  bing: "Bing",
  yahoo: "Yahoo",
  duckduckgo: "DuckDuckGo",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  pinterest: "Pinterest",
  reddit: "Reddit",
  youtube: "YouTube",
  snapchat: "Snapchat",
  messenger: "Messenger",
  viber: "Viber",
  email: "Email",
  other: "Other websites",
  unknown: "Unknown source",
};

export function sourceLabel(key: string): string {
  return SOURCE_LABELS[key] || key;
}
