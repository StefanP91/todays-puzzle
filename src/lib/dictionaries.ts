import type { DictionaryEntry } from "./dictionary";
import type { GameLangCode } from "./gameLanguage";

const dictionaryLoaders: Record<GameLangCode, () => Promise<DictionaryEntry[]>> = {
  mk: () => import("./dictionary").then((m) => m.DICTIONARY_5),
  en: () => import("./dictionary-en").then((m) => m.DICTIONARY_EN_5),
  sr: () => import("./dictionary-sr").then((m) => m.DICTIONARY_SR_5),
  hr: () => import("./dictionary-hr").then((m) => m.DICTIONARY_HR_5),
  bs: () => import("./dictionary-bs").then((m) => m.DICTIONARY_BS_5),
  sl: () => import("./dictionary-sl").then((m) => m.DICTIONARY_SL_5),
  sq: () => import("./dictionary-sq").then((m) => m.DICTIONARY_SQ_5),
  bg: () => import("./dictionary-bg").then((m) => m.DICTIONARY_BG_5),
  el: () => import("./dictionary-el").then((m) => m.DICTIONARY_EL_5),
  ro: () => import("./dictionary-ro").then((m) => m.DICTIONARY_RO_5),
  de: () => import("./dictionary-de").then((m) => m.DICTIONARY_DE_5),
  fr: () => import("./dictionary-fr").then((m) => m.DICTIONARY_FR_5),
  es: () => import("./dictionary-es").then((m) => m.DICTIONARY_ES_5),
  it: () => import("./dictionary-it").then((m) => m.DICTIONARY_IT_5),
  pt: () => import("./dictionary-pt").then((m) => m.DICTIONARY_PT_5),
  nl: () => import("./dictionary-nl").then((m) => m.DICTIONARY_NL_5),
  pl: () => import("./dictionary-pl").then((m) => m.DICTIONARY_PL_5),
  cs: () => import("./dictionary-cs").then((m) => m.DICTIONARY_CS_5),
  sv: () => import("./dictionary-sv").then((m) => m.DICTIONARY_SV_5),
  hu: () => import("./dictionary-hu").then((m) => m.DICTIONARY_HU_5),
  uk: () => import("./dictionary-uk").then((m) => m.DICTIONARY_UK_5),
};

const cache = new Map<GameLangCode, DictionaryEntry[]>();
const loading = new Map<GameLangCode, Promise<DictionaryEntry[]>>();

export async function ensureDictionary(lang: GameLangCode): Promise<DictionaryEntry[]> {
  const cached = cache.get(lang);
  if (cached) return cached;

  let pending = loading.get(lang);
  if (!pending) {
    pending = dictionaryLoaders[lang]().then((dict) => {
      cache.set(lang, dict);
      loading.delete(lang);
      return dict;
    });
    loading.set(lang, pending);
  }

  return pending;
}

export function getDictionary(lang: GameLangCode): DictionaryEntry[] {
  const dict = cache.get(lang);
  if (!dict) {
    throw new Error(`Dictionary not loaded for "${lang}"`);
  }
  return dict;
}

const FALLBACK_HINT: Record<GameLangCode, string> = {
  mk: "Петбуквен збор на македонски",
  en: "A five-letter English word",
  sr: "Петословна реч на српском",
  hr: "Petoslovna riječ na hrvatskom",
  bs: "Petoslovna riječ na bosanskom",
  sl: "Petčrkovna beseda v slovenščini",
  sq: "Fjalë me pesë shkronja në shqip",
  bg: "Петбуквена дума на български",
  el: "Λέξη πέντε γραμμάτων στα ελληνικά",
  ro: "Cuvânt de cinci litere în română",
  de: "Ein fünfbuchstabiges deutsches Wort",
  fr: "Un mot français de cinq lettres",
  es: "Una palabra española de cinco letras",
  it: "Una parola italiana di cinque lettere",
  pt: "Uma palavra portuguesa de cinco letras",
  nl: "Een Nederlands woord van vijf letters",
  pl: "Polskie słowo pięcioliterowe",
  cs: "České pětipísmenné slovo",
  sv: "Ett svenskt ord med fem bokstäver",
  hu: "Ötbetűs magyar szó",
  uk: "П'ятилітерне українське слово",
};

export function getHintForWord(word: string, lang: GameLangCode): string {
  const upper = word.toUpperCase();
  const entry = getDictionary(lang).find(
    (e) => e.word === word || e.word.toUpperCase() === upper,
  );
  return entry?.hint ?? FALLBACK_HINT[lang];
}
