export interface CountryStat {
  code: string;
  count: number;
}

export interface DeviceStats {
  mobile: number;
  desktop: number;
}

export interface PeriodStats {
  total: number;
  byCountry: CountryStat[];
  avgDurationSeconds: number | null;
  durationSessions: number;
  byDevice: DeviceStats;
}

export interface AdminStats {
  today: PeriodStats & { date: string };
  month: PeriodStats & { month: string };
  allTime: PeriodStats;
  dailySeries: { date: string; total: number }[];
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
