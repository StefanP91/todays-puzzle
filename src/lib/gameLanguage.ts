import { DEFAULT_GEO_LANG, detectLanguageFromIp } from "./geoLanguage";

export type GameLangCode = "mk" | "en" | "sr" | "hr" | "bs" | "sl" | "sq" | "bg" | "el" | "ro" | "de" | "fr" | "es" | "it" | "pt" | "nl" | "pl" | "cs" | "sv" | "hu" | "uk";

const STORAGE_KEY = "todays-puzzle-game-language";

const VALID: GameLangCode[] = ["mk", "en", "sr", "hr", "bs", "sl", "sq", "bg", "el", "ro", "de", "fr", "es", "it", "pt", "nl", "pl", "cs", "sv", "hu", "uk"];

export function isGameLangCode(code: string): code is GameLangCode {
  return VALID.includes(code as GameLangCode);
}

/** Read ?lang= from the current URL (for share previews and deep links). */
export function langFromUrl(): GameLangCode | null {
  if (typeof window === "undefined") return null;
  const lang = new URLSearchParams(window.location.search).get("lang");
  return lang && isGameLangCode(lang) ? lang : null;
}

export function hasSavedGameLanguage(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return !!(saved && isGameLangCode(saved));
  } catch {
    return false;
  }
}

export function loadGameLanguage(): GameLangCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isGameLangCode(saved)) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_GEO_LANG;
}

export async function resolveGameLanguage(): Promise<GameLangCode> {
  const fromUrl = langFromUrl();
  if (fromUrl) {
    saveGameLanguage(fromUrl);
    return fromUrl;
  }
  if (hasSavedGameLanguage()) return loadGameLanguage();
  const detected = await detectLanguageFromIp();
  saveGameLanguage(detected);
  return detected;
}

export function saveGameLanguage(lang: GameLangCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}
