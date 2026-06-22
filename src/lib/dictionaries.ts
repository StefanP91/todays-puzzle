import type { DictionaryEntry } from "./dictionary";
import { DICTIONARY_5 as MK_DICTIONARY } from "./dictionary";
import { DICTIONARY_EN_5 } from "./dictionary-en";
import { DICTIONARY_SR_5 } from "./dictionary-sr";
import { DICTIONARY_HR_5 } from "./dictionary-hr";
import { DICTIONARY_BS_5 } from "./dictionary-bs";
import { DICTIONARY_SL_5 } from "./dictionary-sl";
import { DICTIONARY_SQ_5 } from "./dictionary-sq";
import { DICTIONARY_BG_5 } from "./dictionary-bg";
import { DICTIONARY_EL_5 } from "./dictionary-el";
import { DICTIONARY_RO_5 } from "./dictionary-ro";
import { DICTIONARY_DE_5 } from "./dictionary-de";
import { DICTIONARY_FR_5 } from "./dictionary-fr";
import { DICTIONARY_ES_5 } from "./dictionary-es";
import { DICTIONARY_IT_5 } from "./dictionary-it";
import { DICTIONARY_PT_5 } from "./dictionary-pt";
import { DICTIONARY_NL_5 } from "./dictionary-nl";
import { DICTIONARY_PL_5 } from "./dictionary-pl";
import { DICTIONARY_CS_5 } from "./dictionary-cs";
import { DICTIONARY_SV_5 } from "./dictionary-sv";
import { DICTIONARY_HU_5 } from "./dictionary-hu";
import { DICTIONARY_UK_5 } from "./dictionary-uk";
import type { GameLangCode } from "./gameLanguage";
import { normalizeWord } from "./words";

const BY_LANG: Record<GameLangCode, DictionaryEntry[]> = {
  mk: MK_DICTIONARY,
  en: DICTIONARY_EN_5,
  sr: DICTIONARY_SR_5,
  hr: DICTIONARY_HR_5,
  bs: DICTIONARY_BS_5,
  sl: DICTIONARY_SL_5,
  sq: DICTIONARY_SQ_5,
  bg: DICTIONARY_BG_5,
  el: DICTIONARY_EL_5,
  ro: DICTIONARY_RO_5,
  de: DICTIONARY_DE_5,
  fr: DICTIONARY_FR_5,
  es: DICTIONARY_ES_5,
  it: DICTIONARY_IT_5,
  pt: DICTIONARY_PT_5,
  nl: DICTIONARY_NL_5,
  pl: DICTIONARY_PL_5,
  cs: DICTIONARY_CS_5,
  sv: DICTIONARY_SV_5,
  hu: DICTIONARY_HU_5,
  uk: DICTIONARY_UK_5,
};

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

export function getDictionary(lang: GameLangCode): DictionaryEntry[] {
  return BY_LANG[lang];
}

export function getHintForWord(word: string, lang: GameLangCode): string {
  const key = normalizeWord(word, lang);
  const entry = BY_LANG[lang].find((e) => normalizeWord(e.word, lang) === key);
  return entry?.hint ?? FALLBACK_HINT[lang];
}
