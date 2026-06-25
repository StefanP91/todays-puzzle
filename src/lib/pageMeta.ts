import type { GameLangCode } from "./gameLanguage";
import { getGameContent } from "./gameContent";
import { ogImageUrl } from "./ogImage";
import {
  buildJsonLd,
  DEFAULT_SEO_LANG,
  getSiteOrigin,
  htmlLangFor,
  pageUrlForLang,
  SEO_DESCRIPTION,
  SEO_LANGS,
  SEO_TITLE,
} from "./seo";

const OG_LOCALE: Record<GameLangCode, string> = {
  mk: "mk_MK",
  en: "en_US",
  sr: "sr_RS",
  hr: "hr_HR",
  bs: "bs_BA",
  sl: "sl_SI",
  sq: "sq_AL",
  bg: "bg_BG",
  el: "el_GR",
  ro: "ro_RO",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  it: "it_IT",
  pt: "pt_PT",
  nl: "nl_NL",
  pl: "pl_PL",
  cs: "cs_CZ",
  sv: "sv_SE",
  hu: "hu_HU",
  uk: "uk_UA",
};

const SHORT_NAME: Record<GameLangCode, string> = {
  mk: "Загатка",
  en: "Puzzle",
  sr: "Загонетка",
  hr: "Zagonetka",
  bs: "Zagonetka",
  sl: "Uganka",
  sq: "Enigma",
  bg: "Загадка",
  el: "Παζλ",
  ro: "Puzzle",
  de: "Rätsel",
  fr: "Puzzle",
  es: "Puzzle",
  it: "Puzzle",
  pt: "Puzzle",
  nl: "Puzzel",
  pl: "Zagadka",
  cs: "Hádanka",
  sv: "Pussel",
  hu: "Rejtvény",
  uk: "Загадка",
};

function setMeta(selector: string, content: string): void {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", content);
}

function setOrCreateLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(lang: GameLangCode, origin: string): void {
  const id = "seo-json-ld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(buildJsonLd(lang, origin)).replace(/</g, "\\u003c");
}

function syncLangInUrl(lang: GameLangCode): string {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);
  return url.toString();
}

function syncHreflang(origin: string, activeLang: GameLangCode): void {
  for (const lang of SEO_LANGS) {
    setOrCreateLink("alternate", pageUrlForLang(origin, lang), lang);
  }
  setOrCreateLink("alternate", pageUrlForLang(origin, DEFAULT_SEO_LANG), "x-default");
  void activeLang;
}

/** Sync document title and head meta tags with the active game language. */
export function applyPageMeta(lang: GameLangCode): void {
  const { title: gameTitle } = getGameContent(lang);
  const title = SEO_TITLE[lang] || gameTitle;
  const description = SEO_DESCRIPTION[lang];
  const origin = getSiteOrigin();
  const pageUrl = syncLangInUrl(lang);
  const imageUrl = ogImageUrl(origin, lang);

  document.title = title;
  document.documentElement.lang = htmlLangFor(lang);

  setOrCreateLink("canonical", pageUrl);
  syncHreflang(origin, lang);
  setJsonLd(lang, origin);

  setMeta('meta[name="description"]', description);
  setMeta('meta[name="robots"]', "index, follow");
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', pageUrl);
  setMeta('meta[property="og:locale"]', OG_LOCALE[lang]);
  setMeta('meta[property="og:image"]', imageUrl);
  setMeta('meta[property="og:image:secure_url"]', imageUrl);
  setMeta('meta[property="og:image:type"]', "image/png");
  setMeta('meta[property="og:image:width"]', "1200");
  setMeta('meta[property="og:image:height"]', "630");
  setMeta('meta[property="og:image:alt"]', description);
  const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID?.trim();
  if (fbAppId && /^\d+$/.test(fbAppId)) {
    setMeta('meta[property="fb:app_id"]', fbAppId);
  }
  setMeta('meta[name="twitter:card"]', "summary_large_image");
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);
  setMeta('meta[name="twitter:image"]', imageUrl);
  setMeta('meta[name="apple-mobile-web-app-title"]', SHORT_NAME[lang]);
}

export function applyAdminNoIndex(): void {
  document.title = "Admin — Today's Puzzle";
  setMeta('meta[name="robots"]', "noindex, nofollow");
}
