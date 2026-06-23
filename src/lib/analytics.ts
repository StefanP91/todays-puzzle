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
  command: "event" | "config",
  name: string,
  params: Record<string, string | number | boolean>,
  attempt = 0,
): void {
  if (typeof window === "undefined" || isAdminPage()) return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  const payload = { ...params, send_to: measurementId };

  if (typeof window.gtag === "function") {
    window.gtag(command, name, payload);
    return;
  }

  if (attempt < GTAG_MAX_ATTEMPTS) {
    window.setTimeout(() => sendGtag(command, name, params, attempt + 1), GTAG_RETRY_MS);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push([command, name, payload]);
}

/** Direct GA4 page_view (app sends explicitly on load and language change). */
export function trackPageView(lang?: string): void {
  const params: Record<string, string | number | boolean> = {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search,
  };
  if (lang) params.language = lang;
  sendGtag("event", "page_view", params);
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (isAdminPage()) return;
  sendGtag("event", name, cleanParams(params));
}
