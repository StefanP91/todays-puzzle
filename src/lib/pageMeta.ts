import type { GameLangCode } from "./gameLanguage";
import { getGameContent } from "./gameContent";

const HTML_LANG: Record<GameLangCode, string> = {
  mk: "mk",
  en: "en",
  sr: "sr",
  hr: "hr",
  bs: "bs",
  sl: "sl",
  sq: "sq",
  bg: "bg",
  el: "el",
  ro: "ro",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  pt: "pt",
  nl: "nl",
  pl: "pl",
  cs: "cs",
  sv: "sv",
  hu: "hu",
  uk: "uk",
};

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

const DESCRIPTION: Record<GameLangCode, string> = {
  mk: "Една македонска збор секој ден. Погоди ја за 6 обиди!",
  en: "One five-letter word every day. Guess it in six tries!",
  sr: "Једна српска реч дневно. Погоди је за 6 покушаја!",
  hr: "Jedna hrvatska riječ dnevno. Pogodi je za 6 pokušaja!",
  bs: "Jedna bosanska riječ dnevno. Pogodi je za 6 pokušaja!",
  sl: "Ena slovenska beseda na dan. Ugani jo v 6 poskusih!",
  sq: "Një fjalë shqipe në ditë. Gjeje me 6 prova!",
  bg: "Една българска дума всеки ден. Отгадай я за 6 опита!",
  el: "Μία ελληνική λέξη κάθε μέρα. Βρες τη σε 6 προσπάθειες!",
  ro: "Un cuvânt românesc în fiecare zi. Ghicește-l în 6 încercări!",
  de: "Ein deutsches Wort täglich. Errate es in 6 Versuchen!",
  fr: "Un mot français chaque jour. Devine-le en 6 essais !",
  es: "Una palabra española cada día. ¡Adivínala en 6 intentos!",
  it: "Una parola italiana al giorno. Indovinala in 6 tentativi!",
  pt: "Uma palavra portuguesa por dia. Adivinha em 6 tentativas!",
  nl: "Eén Nederlands woord per dag. Raad het in 6 pogingen!",
  pl: "Jedno polskie słowo dziennie. Zgadnij je w 6 próbach!",
  cs: "Jedno české slovo denně. Uhodni ho v 6 pokusech!",
  sv: "Ett svenskt ord varje dag. Gissa det på 6 försök!",
  hu: "Egy magyar szó minden nap. Találd ki 6 próbálkozás alatt!",
  uk: "Одне українське слово щодня. Вгадай його за 6 спроб!",
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

function syncLangInUrl(lang: GameLangCode): string {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);
  return url.toString();
}

/** Sync document title and head meta tags with the active game language. */
export function applyPageMeta(lang: GameLangCode): void {
  const { title } = getGameContent(lang);
  const description = DESCRIPTION[lang];
  const pageUrl = syncLangInUrl(lang);
  const imageUrl = `${window.location.origin}/api/og.png?lang=${lang}`;

  document.title = title;
  document.documentElement.lang = HTML_LANG[lang];

  setMeta('meta[name="description"]', description);
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
  setMeta('meta[name="twitter:card"]', "summary_large_image");
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);
  setMeta('meta[name="twitter:image"]', imageUrl);
  setMeta('meta[name="apple-mobile-web-app-title"]', SHORT_NAME[lang]);
}
