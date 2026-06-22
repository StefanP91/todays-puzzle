/** Validates that each playable language maps from its primary country code. */
const PRIMARY = {
  en: "gb",
  mk: "mk",
  sr: "rs",
  hr: "hr",
  bs: "ba",
  sl: "si",
  sq: "al",
  bg: "bg",
  el: "gr",
  ro: "ro",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  pt: "pt",
  nl: "nl",
  pl: "pl",
  cs: "cz",
  sv: "se",
  hu: "hu",
  uk: "ua",
};

const COUNTRY_TO_LANG = {
  mk: "mk",
  rs: "sr",
  hr: "hr",
  ba: "bs",
  si: "sl",
  al: "sq",
  bg: "bg",
  gr: "el",
  ro: "ro",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  pt: "pt",
  nl: "nl",
  pl: "pl",
  cz: "cs",
  sk: "cs",
  se: "sv",
  hu: "hu",
  ua: "uk",
  gb: "en",
};

let failed = 0;
for (const [lang, country] of Object.entries(PRIMARY)) {
  const mapped = COUNTRY_TO_LANG[country];
  if (mapped !== lang) {
    console.error(`FAIL ${lang}: country ${country} maps to ${mapped ?? "?"}`);
    failed++;
  } else {
    console.log(`OK   ${lang} <- ${country}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`\nAll ${Object.keys(PRIMARY).length} languages map correctly from primary country.`);
