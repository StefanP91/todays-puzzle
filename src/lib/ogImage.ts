import type { GameLangCode } from "./gameLanguage";

export function ogImageUrl(origin: string, lang: GameLangCode): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/og/${lang}.png`;
}

export function playUrlWithLang(origin: string, lang: GameLangCode): string {
  const url = new URL(origin.endsWith("/") ? origin : `${origin}/`);
  url.searchParams.set("lang", lang);
  return url.toString();
}
