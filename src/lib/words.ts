import { getDictionary } from "./dictionaries";
import type { GameLangCode } from "./gameLanguage";

export function normalizeWord(word: string, lang: GameLangCode): string {
  const locale: Partial<Record<GameLangCode, string>> = {
    hr: "hr-HR",
    bs: "bs-BA",
    sl: "sl-SI",
    sq: "sq-AL",
    bg: "bg-BG",
    el: "el-GR",
    ro: "ro-RO",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
    it: "it-IT",
    pt: "pt-PT",
    nl: "nl-NL",
    pl: "pl-PL",
    cs: "cs-CZ",
    sv: "sv-SE",
    hu: "hu-HU",
    uk: "uk-UA",
  };
  if (locale[lang]) return word.toLocaleUpperCase(locale[lang]!);
  return word.toUpperCase();
}

export function normalizeKey(key: string, lang: GameLangCode): string {
  return normalizeWord(key, lang);
}

export function getAnswerWords(lang: GameLangCode): string[] {
  return getDictionary(lang).map((e) => e.word);
}

const wordSetCache = new Map<GameLangCode, Set<string>>();

export function getWordSet(lang: GameLangCode): Set<string> {
  let set = wordSetCache.get(lang);
  if (!set) {
    set = new Set(getAnswerWords(lang).map((w) => normalizeWord(w, lang)));
    wordSetCache.set(lang, set);
  }
  return set;
}
