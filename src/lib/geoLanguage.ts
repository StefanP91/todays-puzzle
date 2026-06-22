import type { GameLangCode } from "./gameLanguage";

/** Fallback when country is unknown or not mapped to a playable language. */
export const DEFAULT_GEO_LANG: GameLangCode = "en";

/** ISO 3166-1 alpha-2 → playable game language. */
const COUNTRY_TO_LANG: Record<string, GameLangCode> = {
  mk: "mk",
  rs: "sr",
  me: "sr",
  hr: "hr",
  ba: "bs",
  si: "sl",
  al: "sq",
  xk: "sq",
  bg: "bg",
  gr: "el",
  cy: "el",
  ro: "ro",
  md: "ro",
  de: "de",
  at: "de",
  ch: "de",
  li: "de",
  fr: "fr",
  be: "fr",
  lu: "fr",
  mc: "fr",
  es: "es",
  mx: "es",
  ar: "es",
  co: "es",
  cl: "es",
  pe: "es",
  ve: "es",
  ec: "es",
  gt: "es",
  cu: "es",
  bo: "es",
  do: "es",
  hn: "es",
  py: "es",
  sv: "es",
  ni: "es",
  cr: "es",
  pa: "es",
  uy: "es",
  pr: "es",
  gq: "es",
  it: "it",
  sm: "it",
  va: "it",
  pt: "pt",
  br: "pt",
  ao: "pt",
  mz: "pt",
  cv: "pt",
  gw: "pt",
  st: "pt",
  tl: "pt",
  mo: "pt",
  nl: "nl",
  pl: "pl",
  cz: "cs",
  se: "sv",
  hu: "hu",
  ua: "uk",
  gb: "en",
  us: "en",
  au: "en",
  ca: "en",
  nz: "en",
  ie: "en",
  za: "en",
  in: "en",
  sg: "en",
  ph: "en",
};

export function languageFromCountry(countryCode: string | null | undefined): GameLangCode {
  if (!countryCode) return DEFAULT_GEO_LANG;
  return COUNTRY_TO_LANG[countryCode.toLowerCase()] ?? DEFAULT_GEO_LANG;
}

async function fetchCountryFromNetlify(): Promise<string | null> {
  const res = await fetch("/api/geo", { signal: AbortSignal.timeout(4000) });
  if (!res.ok) return null;
  const data = (await res.json()) as { country?: string | null };
  return data.country ?? null;
}

async function fetchCountryFromIpApi(): Promise<string | null> {
  const res = await fetch("https://ipapi.co/country_code/", {
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) return null;
  const text = (await res.text()).trim();
  return text.length === 2 ? text : null;
}

/** Resolve language from visitor IP; falls back to English. */
export async function detectLanguageFromIp(): Promise<GameLangCode> {
  for (const fetchCountry of [fetchCountryFromNetlify, fetchCountryFromIpApi]) {
    try {
      const country = await fetchCountry();
      if (country) return languageFromCountry(country);
    } catch {
      // try next provider
    }
  }
  return DEFAULT_GEO_LANG;
}
