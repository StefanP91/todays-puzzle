import { ogImageUrl } from "./og-image-url.mjs";
import { fbAppIdMeta } from "./fb-app-id.mjs";
import { VALID_LANGS } from "./share-content.mjs";
import { getSiteMeta } from "./site-meta.mjs";

const SEO_TITLE = {
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

const SEO_DESCRIPTION = {
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

export function buildSeoHead({ origin, lang, escapeAttr }) {
  const meta = getSiteMeta(lang);
  const seoTitle = SEO_TITLE[meta.lang] || meta.title;
  const seoDescription = SEO_DESCRIPTION[meta.lang] || meta.description;
  const pageUrl = pageUrlForLang(origin, meta.lang);
  const imageUrl = ogImageUrl(origin, meta.lang);

  const title = escapeAttr(seoTitle);
  const description = escapeAttr(seoDescription);

  const jsonLd = escapeAttr(
    JSON.stringify({
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
    }),
  );

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
