const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

let gtagInitialized = false;

export function isAnalyticsEnabled(): boolean {
  return /^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID);
}

function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

/** Optional direct GA4 (gtag). GTM in index.html works without this. */
export function initAnalytics(): void {
  if (typeof window === "undefined" || !isAnalyticsEnabled() || gtagInitialized) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args as unknown as Record<string, unknown>);
  };

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  gtagInitialized = true;
}

export function trackPageView(lang?: string): void {
  const payload = {
    event: "page_view",
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_language: lang,
  };

  pushDataLayer(payload);

  if (gtagInitialized && window.gtag) {
    window.gtag("event", "page_view", payload);
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  const clean: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) clean[key] = value;
    }
  }

  pushDataLayer({ event: name, ...clean });

  if (gtagInitialized && window.gtag) {
    window.gtag("event", name, clean);
  }
}
