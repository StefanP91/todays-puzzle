import { ogImageUrl } from "./og-image-url.mjs";
import { fbAppIdMeta } from "./fb-app-id.mjs";
import { VALID_LANGS } from "./share-content.mjs";
import { getSiteMeta } from "./site-meta.mjs";

const SEO_TITLE = {
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

const SEO_DESCRIPTION = {
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

function pageUrlForLang(origin, lang) {
  const url = new URL(`${origin}/`);
  url.searchParams.set("lang", lang);
  return url.toString();
}

function hreflangLinks(origin, activeLang, escapeAttr) {
  const langs = [...VALID_LANGS].sort();
  const lines = langs.map((lang) => {
    const href = escapeAttr(pageUrlForLang(origin, lang));
    return `  <link rel="alternate" hreflang="${lang}" href="${href}" />`;
  });
  lines.push(
    `  <link rel="alternate" hreflang="x-default" href="${escapeAttr(pageUrlForLang(origin, "en"))}" />`,
  );
  return lines.join("\n");
}

function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildSeoHead({ origin, lang, escapeAttr }) {
  const meta = getSiteMeta(lang);
  const seoTitle = SEO_TITLE[meta.lang] || meta.title;
  const seoDescription = SEO_DESCRIPTION[meta.lang] || meta.description;
  const pageUrl = pageUrlForLang(origin, meta.lang);
  const imageUrl = ogImageUrl(origin, meta.lang);

  const title = escapeAttr(seoTitle);
  const description = escapeAttr(seoDescription);

  const jsonLd = safeJsonLd({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: seoTitle,
    description: seoDescription,
    url: pageUrl,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    inLanguage: meta.htmlLang,
    image: imageUrl,
  });

  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="index, follow" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${escapeAttr(pageUrl)}" />
${hreflangLinks(origin, meta.lang, escapeAttr)}
  <link rel="image_src" href="${imageUrl}" />
${fbAppIdMeta(escapeAttr)}  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${title}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${escapeAttr(pageUrl)}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${description}" />
  <meta property="og:locale" content="${meta.ogLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="apple-mobile-web-app-title" content="${escapeAttr(meta.shortName)}" />
  <script type="application/ld+json">${jsonLd}</script>`;
}
