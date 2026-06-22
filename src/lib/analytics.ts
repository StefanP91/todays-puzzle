declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GTAG_RETRY_MS = 250;
const GTAG_MAX_ATTEMPTS = 40;

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

/** Wait for GTM Google Tag to expose window.gtag, then send the GA4 event. */
function sendGtagEvent(
  name: string,
  params: Record<string, string | number | boolean>,
  attempt = 0,
): void {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
    return;
  }

  if (attempt >= GTAG_MAX_ATTEMPTS) return;

  window.setTimeout(() => sendGtagEvent(name, params, attempt + 1), GTAG_RETRY_MS);
}

export function trackPageView(lang?: string): void {
  const params = {
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_language: lang ?? "",
  };

  pushDataLayer({ event: "page_view", ...params });
  sendGtagEvent("page_view", params);
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  const clean = cleanParams(params);

  pushDataLayer({ event: name, ...clean });
  sendGtagEvent(name, clean);
}
