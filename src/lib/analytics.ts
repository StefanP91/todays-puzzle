declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let eventsGtagReady = false;

function getMeasurementId(): string | null {
  const fromEnv = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (fromEnv && /^G-/i.test(fromEnv)) return fromEnv;

  const fromMeta = document
    .querySelector('meta[name="ga-measurement-id"]')
    ?.getAttribute("content")
    ?.trim();
  if (fromMeta && /^G-/i.test(fromMeta)) return fromMeta;

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

/** Load gtag for custom events only (GTM keeps page views). */
export function initEventAnalytics(): void {
  if (typeof window === "undefined" || eventsGtagReady) return;
  if (window.location.pathname.startsWith("/admin")) return;

  const measurementId = getMeasurementId();
  if (!measurementId) return;

  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag("js", new Date());
  }

  window.gtag("config", measurementId, { send_page_view: false });

  if (!document.querySelector(`script[data-ga-events="${measurementId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.gaEvents = measurementId;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  eventsGtagReady = true;
}

function sendGtagEvent(name: string, params: Record<string, string | number | boolean>): void {
  initEventAnalytics();
  if (!eventsGtagReady || !window.gtag) return;
  window.gtag("event", name, params);
}

/** Virtual page view on language change (optional; GTM already tracks the initial load). */
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
  const clean = cleanParams(params);
  pushDataLayer({ event: name, ...clean });
  sendGtagEvent(name, clean);
}
