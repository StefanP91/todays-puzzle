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

function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
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

function sendGtagEvent(
  name: string,
  params: Record<string, string | number | boolean>,
  attempt = 0,
): void {
  if (typeof window === "undefined") return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  const payload = { ...params, send_to: measurementId };

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
    return;
  }

  if (attempt < GTAG_MAX_ATTEMPTS) {
    window.setTimeout(() => sendGtagEvent(name, params, attempt + 1), GTAG_RETRY_MS);
    return;
  }

  // Fallback: gtag command queue (processed when gtag.js loads)
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(["event", name, payload]);
}

/** GTM Google Tag handles page_view — only expose language on dataLayer for optional triggers. */
export function trackPageView(lang?: string): void {
  if (!lang) return;
  pushDataLayer({ page_language: lang });
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return;

  const clean = cleanParams(params);
  pushDataLayer({ event: name, ...clean });
  sendGtagEvent(name, clean);
}
