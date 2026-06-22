import type { GameLangCode } from "./gameLanguage";
import { GAME_LANGUAGES } from "./languages";
import { getSiteContent } from "./siteContent";

export const SEO_LANGS = GAME_LANGUAGES.filter((l) => l.available).map((l) => l.code) as GameLangCode[];

export const DEFAULT_SEO_LANG: GameLangCode = "en";

export function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://today-puzzle.netlify.app";
}

export function pageUrlForLang(origin: string, lang: GameLangCode): string {
  const url = new URL(origin.endsWith("/") ? origin : `${origin}/`);
  url.searchParams.set("lang", lang);
  return url.toString();
}

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

export function htmlLangFor(code: GameLangCode): string {
  return HTML_LANG[code];
}

export const SEO_DESCRIPTION: Record<GameLangCode, string> = {
  mk: "Бесплатна дневна загатка на македонски — погоди го зборот за 6 обиди. Wordle на македонски, секој ден нова загатка!",
  en: "Free daily five-letter word puzzle. Guess today's word in six tries — a Wordle-style game in 21 languages.",
  sr: "Бесплатна дневна загонетка на српском — погоди реч за 6 покушаја. Wordle на српском, сваки дан нова загонетка!",
  hr: "Besplatna dnevna zagonetka na hrvatskom — pogodi riječ za 6 pokušaja. Wordle na hrvatskom, svaki dan nova zagonetka!",
  bs: "Besplatna dnevna zagonetka na bosanskom — pogodi riječ za 6 pokušaja. Wordle na bosanskom, svaki dan nova zagonetka!",
  sl: "Brezplačna dnevna uganka — ugani besedo v 6 poskusih. Wordle v slovenščini, vsak dan nova uganka!",
  sq: "Enigmë falas çdo ditë në shqip — gjej fjalën në 6 prova. Wordle në shqip, çdo ditë enigmë e re!",
  bg: "Безплатна дневна загадка на български — отгадай думата за 6 опита. Wordle на български, всеки ден нова загадка!",
  el: "Δωρεάν καθημερινό παζλ λέξης — βρες τη λέξη σε 6 προσπάθειες. Wordle στα ελληνικά, νέο παζλ κάθε μέρα!",
  ro: "Puzzle zilnic gratuit în română — ghicește cuvântul în 6 încercări. Wordle în română, puzzle nou în fiecare zi!",
  de: "Kostenloses tägliches Worträtsel — errate das Wort in 6 Versuchen. Wordle auf Deutsch, jeden Tag ein neues Rätsel!",
  fr: "Jeu de mots quotidien gratuit — devine le mot en 6 essais. Wordle en français, nouveau puzzle chaque jour !",
  es: "Puzzle de palabras diario gratis — adivina la palabra en 6 intentos. Wordle en español, ¡nuevo puzzle cada día!",
  it: "Puzzle di parole quotidiano gratuito — indovina la parola in 6 tentativi. Wordle in italiano, nuovo puzzle ogni giorno!",
  pt: "Puzzle de palavras diário grátis — adivinha a palavra em 6 tentativas. Wordle em português, novo puzzle todos os dias!",
  nl: "Gratis dagelijks woordpuzzel — raad het woord in 6 pogingen. Wordle in het Nederlands, elke dag een nieuwe puzzel!",
  pl: "Darmowa codzienna zagadka słowna — zgadnij słowo w 6 próbach. Wordle po polsku, nowa zagadka każdego dnia!",
  cs: "Bezplatná denní slovní hádanka — uhodni slovo za 6 pokusů. Wordle v češtině, každý den nová hádanka!",
  sv: "Gratis dagligt ordspel — gissa ordet på 6 försök. Wordle på svenska, nytt pussel varje dag!",
  hu: "Ingyenes napi szójáték — találd ki a szót 6 próbálkozás alatt. Wordle magyarul, minden nap új rejtvény!",
  uk: "Безкоштовна щоденна загадка — вгадай слово за 6 спроб. Wordle українською, нова загадка щодня!",
};

export const SEO_TITLE: Record<GameLangCode, string> = {
  mk: "Денешна Загатка — Wordle на македонски",
  en: "Today's Puzzle — Daily Wordle Game",
  sr: "Данашња Загонетка — Wordle на српском",
  hr: "Današnja zagonetka — Wordle na hrvatskom",
  bs: "Današnja zagonetka — Wordle na bosanskom",
  sl: "Dnevna uganka — Wordle v slovenščini",
  sq: "Enigma e ditës — Wordle në shqip",
  bg: "Дневна загадка — Wordle на български",
  el: "Ημερήσιο παζλ — Wordle στα ελληνικά",
  ro: "Puzzle zilnic — Wordle în română",
  de: "Tägliches Rätsel — Wordle auf Deutsch",
  fr: "Puzzle du jour — Wordle en français",
  es: "Puzzle diario — Wordle en español",
  it: "Puzzle del giorno — Wordle in italiano",
  pt: "Puzzle diário — Wordle em português",
  nl: "Dagelijkse puzzel — Wordle in het Nederlands",
  pl: "Codzienna zagadka — Wordle po polsku",
  cs: "Denní hádanka — Wordle v češtině",
  sv: "Dagligt pussel — Wordle på svenska",
  hu: "Napi rejtvény — Wordle magyarul",
  uk: "Щоденна загадка — Wordle українською",
};

export function buildJsonLd(lang: GameLangCode, origin: string) {
  const content = getSiteContent(lang);
  const pageUrl = pageUrlForLang(origin, lang);

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SEO_TITLE[lang],
    description: SEO_DESCRIPTION[lang],
    url: pageUrl,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    inLanguage: htmlLangFor(lang),
    image: `${origin}/api/og.png?lang=${lang}`,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return [webApp, faqPage];
}
