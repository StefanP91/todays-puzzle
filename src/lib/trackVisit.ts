const TRACK_KEY = "puzzle-visit-tracked";

/** Record one visit per browser session (server stores country from IP). */
export function trackVisitOnce(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  if (sessionStorage.getItem(TRACK_KEY)) return;

  sessionStorage.setItem(TRACK_KEY, "1");

  fetch("/api/track", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {
    sessionStorage.removeItem(TRACK_KEY);
  });
}
