const VISIT_KEY = "puzzle-visit-tracked";
const DURATION_KEY = "puzzle-duration-sent";
const START_KEY = "puzzle-visit-start";

type DeviceType = "mobile" | "desktop";

function getDevice(): DeviceType {
  if (typeof window.matchMedia === "function") {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (coarse && !fine) return "mobile";
    if (window.matchMedia("(max-width: 768px)").matches) return "mobile";
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent,
  )
    ? "mobile"
    : "desktop";
}

function postTrack(payload: Record<string, unknown>): void {
  const body = JSON.stringify(payload);

  if (typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/track", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body,
  }).catch(() => {});
}

async function fetchVisitorCountry(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3000);
    const res = await fetch("/api/geo", {
      credentials: "same-origin",
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { country?: string | null };
    const code = data.country?.trim().toUpperCase();
    return code && /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

function getTrafficContext(): {
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  pageUrl: string;
} {
  const params = new URLSearchParams(window.location.search);
  return {
    referrer: document.referrer || null,
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    pageUrl: window.location.href,
  };
}

/** Record one visit per browser session (server stores country from IP). */
export function trackVisitOnce(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;

  sessionStorage.setItem(START_KEY, String(Date.now()));

  if (!sessionStorage.getItem(VISIT_KEY)) {
    sessionStorage.setItem(VISIT_KEY, "1");
    void (async () => {
      const country = await fetchVisitorCountry();
      try {
        const res = await fetch("/api/track", {
          method: "POST",
          credentials: "same-origin",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "visit",
            device: getDevice(),
            country,
            ...getTrafficContext(),
          }),
        });
        if (!res.ok) sessionStorage.removeItem(VISIT_KEY);
      } catch {
        sessionStorage.removeItem(VISIT_KEY);
      }
    })();
  }

  function sendDuration(): void {
    if (sessionStorage.getItem(DURATION_KEY)) return;

    const raw = sessionStorage.getItem(START_KEY);
    if (!raw) return;

    const seconds = Math.round((Date.now() - Number(raw)) / 1000);
    if (seconds < 1) return;

    sessionStorage.setItem(DURATION_KEY, "1");
    postTrack({ type: "duration", seconds });
  }

  window.addEventListener("pagehide", sendDuration);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendDuration();
  });
}
