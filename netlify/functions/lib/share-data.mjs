const PAYLOAD_RE = /^(\d{1,5})-([x\d])-([0123]{30})$/;

export function decodeShareParam(encoded) {
  if (!encoded || encoded.length > 80) return null;

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const payload = Buffer.from(base64, "base64").toString("utf8");
    const match = payload.match(PAYLOAD_RE);
    if (!match) return null;

    const puzzleNumber = Number(match[1]);
    const score = match[2];
    const grid = match[3];

    if (!Number.isFinite(puzzleNumber) || puzzleNumber < 1) return null;

    return { puzzleNumber, score, grid };
  } catch {
    return null;
  }
}

export function getShareTitle(data) {
  const scoreLabel = data.score === "x" ? "X/6" : `${data.score}/6`;
  return `Денешна Загатка #${data.puzzleNumber} — ${scoreLabel}`;
}

export function getShareDescription(data) {
  const puzzle = data.puzzleNumber;
  if (data.score === "x") {
    return `Не ја погодив денешната загатка #${puzzle} за 6 обиди. Пробај и ти!`;
  }
  const n = Number(data.score);
  const attempts = n === 1 ? "1 обид" : `${n} обиди`;
  return `Погодив во ${attempts}! Пробај и ти на Денешна Загатка #${puzzle}.`;
}

export function getShareImageCaption(data, origin) {
  const link = origin.startsWith("http") ? origin : `https://${origin}`;
  if (data.score === "x") {
    return {
      headline: `Не ја погодив загатка #${data.puzzleNumber}. Пробај и ти:`,
      link,
    };
  }
  const n = Number(data.score);
  const attempts = n === 1 ? "1 обид" : `${n} обиди`;
  return {
    headline: `Погодив во ${attempts}! Пробај и ти:`,
    link,
  };
}

export function getSiteOrigin(event) {
  const host = event.headers.host || "deneshnazagatka.mk";
  const proto = event.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeHtmlAttr(text) {
  return escapeHtml(text);
}
