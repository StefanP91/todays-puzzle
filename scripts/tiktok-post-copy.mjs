/** TikTok post title + caption per language (copy TITLE line separately when posting). */

const SITE = "today-puzzle.netlify.app";

/** @type {Record<string, { title: string; body: string }>} */
export const TIKTOK_POST_COPY = {
  en: {
    title: "Guess today's word in 6 tries 🧩",
    body: `One word. Six guesses. 21 languages.

Free in your browser — no app needed.

Link 👇
${SITE}/?lang=en

#wordle #puzzle #wordgame #dailygame #braingame #freegame #todayspuzzle #webgame`,
  },
  mk: {
    title: "Погоди го зборот за денес 🧩",
    body: `Една збор секој ден. Шест обиди. 21 јазик.

Бесплатно на телефон или прелистувач — без апликација.

Линк 👇
${SITE}/?lang=mk

#загатка #македонски #wordle #игра #мозок #дневнаигра #puzzle #braingame #mk`,
  },
  sr: {
    title: "Погоди реч за данас 🧩",
    body: `Једна реч дневно. Шест покушаја. 21 језик.

Бесплатно на телефону или прегледачу — без апликације.

Линк 👇
${SITE}/?lang=sr

#загонетка #српски #wordle #игра #мозак #дневнаигра #puzzle #braingame #sr`,
  },
  hr: {
    title: "Pogodi riječ dana 🧩",
    body: `Jedna riječ dnevno. Šest pokušaja. 21 jezika.

Besplatno na mobitelu ili pregledniku — bez aplikacije.

Link 👇
${SITE}/?lang=hr

#zagonetka #hrvatski #wordle #igra #mozak #dnevnaigra #puzzle #braingame #hr`,
  },
  bs: {
    title: "Pogodi riječ za danas 🧩",
    body: `Jedna riječ dnevno. Šest pokušaja. 21 jezik.

Besplatno na telefonu ili pregledniku — bez aplikacije.

Link 👇
${SITE}/?lang=bs

#zagonetka #bosanski #wordle #igra #mozak #dnevnaigra #puzzle #braingame #bs`,
  },
  bg: {
    title: "Познай думата за денес 🧩",
    body: `Една дума всеки ден. Шест опита. 21 езика.

Безплатно на телефон или браузър — без приложение.

Линк 👇
${SITE}/?lang=bg

#загадка #български #wordle #игра #мозък #дневнаигра #puzzle #braingame #bg`,
  },
  sl: {
    title: "Ugani današnjo besedo 🧩",
    body: `Ena beseda na dan. Šest poskusov. 21 jezikov.

Brezplačno na telefonu ali brskalniku — brez aplikacije.

Povezava 👇
${SITE}/?lang=sl

#uganka #slovenski #wordle #igra #mozgani #dnevnaigra #puzzle #braingame #sl`,
  },
  sq: {
    title: "Gjej fjalën e sotme 🧩",
    body: `Një fjalë në ditë. Gjashtë përpjekje. 21 gjuhë.

Falas në telefon ose shfletues — pa aplikacion.

Linku 👇
${SITE}/?lang=sq

#enigma #shqip #wordle #lojë #truri #lojëditore #puzzle #braingame #sq`,
  },
  el: {
    title: "Μάντεψε τη λέξη της ημέρας 🧩",
    body: `Μία λέξη κάθε μέρα. Έξι προσπάθειες. 21 γλώσσες.

Δωρεάν σε κινητό ή browser — χωρίς εφαρμογή.

Σύνδεσμος 👇
${SITE}/?lang=el

#παζλ #ελληνικά #wordle #παιχνίδι #μυαλό #καθημερινό #puzzle #braingame #el`,
  },
  ro: {
    title: "Ghicește cuvântul zilei 🧩",
    body: `Un cuvânt pe zi. Șase încercări. 21 de limbi.

Gratuit pe telefon sau browser — fără aplicație.

Link 👇
${SITE}/?lang=ro

#puzzle #română #wordle #joc #creier #zilnic #braingame #ro`,
  },
  de: {
    title: "Errate das Wort des Tages 🧩",
    body: `Ein Wort pro Tag. Sechs Versuche. 21 Sprachen.

Kostenlos am Handy oder im Browser — keine App nötig.

Link 👇
${SITE}/?lang=de

#rätsel #deutsch #wordle #spiel #gehirn #täglich #puzzle #braingame #de`,
  },
  fr: {
    title: "Devine le mot du jour 🧩",
    body: `Un mot par jour. Six essais. 21 langues.

Gratuit sur mobile ou navigateur — sans application.

Lien 👇
${SITE}/?lang=fr

#puzzle #français #wordle #jeu #cerveau #quotidien #braingame #fr`,
  },
  es: {
    title: "Adivina la palabra del día 🧩",
    body: `Una palabra al día. Seis intentos. 21 idiomas.

Gratis en móvil o navegador — sin aplicación.

Enlace 👇
${SITE}/?lang=es

#puzzle #español #wordle #juego #cerebro #diario #braingame #es`,
  },
  it: {
    title: "Indovina la parola di oggi 🧩",
    body: `Una parola al giorno. Sei tentativi. 21 lingue.

Gratis su telefono o browser — senza app.

Link 👇
${SITE}/?lang=it

#puzzle #italiano #wordle #gioco #cervello #quotidiano #braingame #it`,
  },
  pt: {
    title: "Adivinha a palavra do dia 🧩",
    body: `Uma palavra por dia. Seis tentativas. 21 idiomas.

Grátis no telemóvel ou browser — sem aplicação.

Link 👇
${SITE}/?lang=pt

#puzzle #português #wordle #jogo #cérebro #diário #braingame #pt`,
  },
  nl: {
    title: "Raad het woord van vandaag 🧩",
    body: `Eén woord per dag. Zes pogingen. 21 talen.

Gratis op telefoon of browser — geen app nodig.

Link 👇
${SITE}/?lang=nl

#puzzel #nederlands #wordle #spel #brein #dagelijks #braingame #nl`,
  },
  pl: {
    title: "Zgadnij słowo dnia 🧩",
    body: `Jedno słowo dziennie. Sześć prób. 21 języków.

Za darmo na telefonie lub w przeglądarce — bez aplikacji.

Link 👇
${SITE}/?lang=pl

#zagadka #polski #wordle #gra #mózg #codziennie #puzzle #braingame #pl`,
  },
  cs: {
    title: "Uhádni slovo dne 🧩",
    body: `Jedno slovo denně. Šest pokusů. 21 jazyků.

Zdarma na telefonu nebo v prohlížeči — bez aplikace.

Odkaz 👇
${SITE}/?lang=cs

#hádanka #česky #wordle #hra #mozek #denně #puzzle #braingame #cs`,
  },
  sv: {
    title: "Gissa dagens ord 🧩",
    body: `Ett ord per dag. Sex försök. 21 språk.

Gratis på mobil eller webbläsare — ingen app behövs.

Länk 👇
${SITE}/?lang=sv

#pussel #svenska #wordle #spel #hjärna #dagligen #puzzle #braingame #sv`,
  },
  hu: {
    title: "Találd ki a mai szót 🧩",
    body: `Egy szó naponta. Hat próbálkozás. 21 nyelv.

Ingyenes telefonon vagy böngészőben — alkalmazás nélkül.

Link 👇
${SITE}/?lang=hu

#rejtvény #magyar #wordle #játék #agy #napi #puzzle #braingame #hu`,
  },
  uk: {
    title: "Вгадай слово дня 🧩",
    body: `Одне слово на день. Шість спроб. 21 мова.

Безкоштовно на телефоні або в браузері — без додатку.

Посилання 👇
${SITE}/?lang=uk

#загадка #українська #wordle #гра #мозок #щоденна #puzzle #braingame #uk`,
  },
};

export const TIKTOK_POST_LANGS = Object.keys(TIKTOK_POST_COPY).sort();

/** @param {string} lang */
export function buildTikTokPostText(lang) {
  const copy = TIKTOK_POST_COPY[lang] ?? TIKTOK_POST_COPY.en;
  return `TITLE: ${copy.title}\n\n${copy.body}`;
}
