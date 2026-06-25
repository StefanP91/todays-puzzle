import type { GameLangCode } from "./gameLanguage";
import { GAME_LANGUAGES } from "./languages";
import { getSiteContent } from "./siteContent";
import { ogImageUrl } from "./ogImage";

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
  mk: "Погоди го денешниот збор од 5 букви за 6 обиди. Бесплатна дневна загатка на македонски — Wordle на македонски, нов збор секој ден, без регистрација.",
  en: "Guess today's five-letter word in six tries. Free daily Wordle-style puzzle — play in 21 languages including Macedonian, Serbian, German, and Spanish.",
  sr: "Погоди данашњу реч од 5 слова за 6 покушаја. Бесплатна дневна загонетка на српском — Wordle на српском, нова реч сваког дана, без пријаве.",
  hr: "Pogodi današnju riječ od 5 slova u 6 pokušaja. Besplatna dnevna zagonetka na hrvatskom — Wordle na hrvatskom, nova riječ svaki dan, bez registracije.",
  bs: "Pogodi današnju riječ od 5 slova u 6 pokušaja. Besplatna dnevna zagonetka na bosanskom — Wordle na bosanskom, nova riječ svaki dan, bez registracije.",
  sl: "Ugani današnjo besedo s 5 črkami v 6 poskusih. Brezplačna dnevna uganka — Wordle v slovenščini, nova beseda vsak dan, brez registracije.",
  sq: "Gjej fjalën e sotme me 5 shkronja në 6 prova. Enigmë falas çdo ditë në shqip — Wordle në shqip, fjalë e re çdo ditë, pa regjistrim.",
  bg: "Отгадай днешната дума от 5 букви за 6 опита. Безплатна дневна загадка на български — Wordle на български, нова дума всеки ден, без регистрация.",
  el: "Βρες τη σημερινή λέξη 5 γραμμάτων σε 6 προσπάθειες. Δωρεάν καθημερινό παζλ λέξης — Wordle στα ελληνικά, νέα λέξη κάθε μέρα, χωρίς εγγραφή.",
  ro: "Ghicește cuvântul de azi din 5 litere în 6 încercări. Puzzle zilnic gratuit în română — Wordle în română, cuvânt nou în fiecare zi, fără cont.",
  de: "Errate das heutige 5-Buchstaben-Wort in 6 Versuchen. Kostenloses tägliches Worträtsel — Wordle auf Deutsch, jeden Tag ein neues Rätsel, ohne Anmeldung.",
  fr: "Devine le mot du jour de 5 lettres en 6 essais. Jeu de mots quotidien gratuit — Wordle en français, nouveau mot chaque jour, sans inscription.",
  es: "Adivina la palabra de hoy de 5 letras en 6 intentos. Puzzle de palabras diario gratis — Wordle en español, palabra nueva cada día, sin registro.",
  it: "Indovina la parola di oggi da 5 lettere in 6 tentativi. Puzzle di parole quotidiano gratuito — Wordle in italiano, nuova parola ogni giorno, senza account.",
  pt: "Adivinha a palavra de hoje com 5 letras em 6 tentativas. Puzzle de palavras diário grátis — Wordle em português, palavra nova todos os dias, sem registo.",
  nl: "Raad het woord van vandaag van 5 letters in 6 pogingen. Gratis dagelijks woordpuzzel — Wordle in het Nederlands, elke dag een nieuw woord, zonder account.",
  pl: "Zgadnij dzisiejsze słowo z 5 liter w 6 próbach. Darmowa codzienna zagadka słowna — Wordle po polsku, nowe słowo każdego dnia, bez rejestracji.",
  cs: "Uhodni dnešní slovo z 5 písmen za 6 pokusů. Bezplatná denní slovní hádanka — Wordle v češtině, každý den nové slovo, bez registrace.",
  sv: "Gissa dagens ord med 5 bokstäver på 6 försök. Gratis dagligt ordspel — Wordle på svenska, nytt ord varje dag, utan registrering.",
  hu: "Találd ki a mai 5 betűs szót 6 próbálkozás alatt. Ingyenes napi szójáték — Wordle magyarul, minden nap új szó, regisztráció nélkül.",
  uk: "Вгадай сьогоднішнє слово з 5 літер за 6 спроб. Безкоштовна щоденна загадка — Wordle українською, нове слово щодня, без реєстрації.",
};

export const SEO_TITLE: Record<GameLangCode, string> = {
  mk: "Денешна Загатка — Бесплатен Wordle на македонски",
  en: "Today's Puzzle — Free Daily Wordle | 21 Languages",
  sr: "Данашња Загонетка — Бесплатан Wordle на српском",
  hr: "Današnja Zagonetka — Besplatan Wordle na hrvatskom",
  bs: "Današnja Zagonetka — Besplatan Wordle na bosanskom",
  sl: "Dnevna Uganka — Brezplačen Wordle v slovenščini",
  sq: "Enigma e Ditës — Wordle Falas në Shqip",
  bg: "Дневна Загадка — Безплатен Wordle на български",
  el: "Ημερήσιο Παζλ — Δωρεάν Wordle στα Ελληνικά",
  ro: "Puzzle Zilnic — Wordle Gratuit în Română",
  de: "Tägliches Worträtsel — Kostenloses Wordle auf Deutsch",
  fr: "Puzzle du Jour — Wordle Gratuit en Français",
  es: "Puzzle Diario — Wordle Gratis en Español",
  it: "Puzzle del Giorno — Wordle Gratis in Italiano",
  pt: "Puzzle Diário — Wordle Grátis em Português",
  nl: "Dagelijkse Puzzel — Gratis Wordle in het Nederlands",
  pl: "Codzienna Zagadka — Darmowy Wordle po Polsku",
  cs: "Denní Hádanka — Bezplatný Wordle v Češtině",
  sv: "Dagligt Pussel — Gratis Wordle på Svenska",
  hu: "Napi Rejtvény — Ingyenes Wordle Magyarul",
  uk: "Щоденна Загадка — Безкоштовний Wordle українською",
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
    image: ogImageUrl(origin, lang),
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

  return {
    "@context": "https://schema.org",
    "@graph": [webApp, faqPage],
  };
}
