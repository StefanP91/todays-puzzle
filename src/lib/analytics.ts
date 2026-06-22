declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
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

/**
 * Send GA4 events after GTM's Google Tag has initialized gtag.
 * Pushing a function to dataLayer runs it when GTM is ready.
 */
function sendGtagEvent(
  name: string,
  params: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(function gtagEventCallback() {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
  });
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
