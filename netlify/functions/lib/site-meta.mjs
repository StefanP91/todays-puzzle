import { VALID_LANGS, getShareContent } from "./share-content.mjs";

const DESCRIPTION = {
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

const SHORT_NAME = {
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

export function resolveLang(lang) {
  return VALID_LANGS.has(lang) ? lang : "en";
}

export function getSiteMeta(lang) {
  const code = resolveLang(lang);
  const share = getShareContent(code);
  return {
    lang: code,
    title: share.gameTitle,
    description: DESCRIPTION[code],
    shortName: SHORT_NAME[code],
    htmlLang: share.htmlLang,
    ogLocale: share.ogLocale,
    playLink: share.playLink,
  };
}
