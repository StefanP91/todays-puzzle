declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GTAG_RETRY_MS = 200;
const GTAG_MAX_ATTEMPTS = 50;

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
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
    return;
  }

  if (attempt < GTAG_MAX_ATTEMPTS) {
    window.setTimeout(() => sendGtagEvent(name, params, attempt + 1), GTAG_RETRY_MS);
  }
}

/** Page views are handled by GTM Google Tag — only push dataLayer for optional GTM triggers. */
export function trackPageView(lang?: string): void {
  pushDataLayer({
    event: "page_view",
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_language: lang ?? "",
  });
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
