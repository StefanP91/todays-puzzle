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

/** Record one visit per browser session (server stores country from IP). */
export function trackVisitOnce(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;

  sessionStorage.setItem(START_KEY, String(Date.now()));

  if (!sessionStorage.getItem(VISIT_KEY)) {
    sessionStorage.setItem(VISIT_KEY, "1");
    fetch("/api/track", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "visit", device: getDevice() }),
    }).catch(() => {
      sessionStorage.removeItem(VISIT_KEY);
    });
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
