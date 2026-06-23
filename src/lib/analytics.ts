declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GTAG_RETRY_MS = 200;
const GTAG_MAX_ATTEMPTS = 75;

function getMeasurementId(): string | null {
  const fromMeta = document
    .querySelector('meta[name="ga-measurement-id"]')
    ?.getAttribute("content")
    ?.trim();
  if (fromMeta && /^G-/i.test(fromMeta)) return fromMeta;

  const fromEnv = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (fromEnv && /^G-/i.test(fromEnv)) return fromEnv;

  return null;
}

function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    import.meta.env.DEV ||
    new URLSearchParams(window.location.search).has("ga_debug")
  );
}

function cleanParams(
  params?: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  if (!params) return clean;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) clean[key] = value;
  }
  return clean;
}

function isAdminPage(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
}

function sendGtag(
  name: string,
  params: Record<string, string | number | boolean>,
  attempt = 0,
): void {
  if (typeof window === "undefined" || isAdminPage()) return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  const payload: Record<string, string | number | boolean> = {
    ...params,
    transport_type: "beacon",
  };

  if (isDebugMode()) {
    payload.debug_mode = true;
    console.info("[GA4]", name, payload);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
    return;
  }

  if (attempt < GTAG_MAX_ATTEMPTS) {
    window.setTimeout(() => sendGtag(name, params, attempt + 1), GTAG_RETRY_MS);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(["event", name, payload]);
}

export function trackPageView(lang?: string): void {
  const params: Record<string, string | number | boolean> = {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search,
  };
  if (lang) params.language = lang;
  sendGtag("page_view", params);
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (isAdminPage()) return;
  sendGtag(name, cleanParams(params));
}

/** GA4 Games recommended event + custom alias for reports. */
export function trackGameComplete(options: {
  result: "won" | "lost";
  game_mode: "daily" | "training";
  language: string;
  guess_count: number;
  puzzle_number: number;
}): void {
  const success = options.result === "won";
  const base = {
    language: options.language,
    game_mode: options.game_mode,
    guess_count: options.guess_count,
    puzzle_number: options.puzzle_number,
    result: options.result,
  };

  sendGtag("game_complete", base);
  sendGtag("level_end", {
    ...base,
    level: options.puzzle_number,
    level_name: options.game_mode,
    success,
  });
}

export function trackShare(options: {
  method: string;
  language: string;
  puzzle_number: number;
  result: "won" | "lost";
}): void {
  sendGtag("share", {
    method: options.method,
    language: options.language,
    puzzle_number: options.puzzle_number,
    result: options.result,
  });
}
