import { VALID_LANGS, resolveLang } from "./share-content.mjs";

export function ogImageUrl(origin, lang) {
  const base = String(origin || "https://today-puzzle.netlify.app").replace(/\/$/, "");
  const code = resolveLang(lang);
  return `${base}/og/${code}.png`;
}
