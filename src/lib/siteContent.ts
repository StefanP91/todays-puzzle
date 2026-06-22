import type { GameLangCode } from "./gameLanguage";
import { isGameLangCode } from "./gameLanguage";

export type SiteLocale = GameLangCode;

const STORAGE_KEY = "todays-puzzle-site-locale";

export function loadSiteLocale(): SiteLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isGameLangCode(saved)) return saved;
  } catch {
    // ignore
  }
  return "en";
}

export interface SiteContent {
  selectLanguage: string;
  primaryLanguages: string;
  balkanLanguages: string;
  europeanLanguages: string;
  playNow: string;
  comingSoon: string;
  scrollToGame: string;
  bestTips: string;
  faq: string;
  tips: { title: string; body: string }[];
  faqItems: { q: string; a: string }[];
}

const CONTENT: Record<SiteLocale, SiteContent> = {
  en: {
    selectLanguage: "Select language",
    primaryLanguages: "Primary",
    balkanLanguages: "Balkan languages",
    europeanLanguages: "European languages",
    playNow: "Play now",
    comingSoon: "Coming soon",
    scrollToGame: "Scroll up to play today's puzzle",
    bestTips: "Best tips to win",
    faq: "Frequently asked questions",
    tips: [
      {
        title: "Start with common vowels",
        body: "Try a first word with A, E, I, O or U — English words use these often. Eliminate or confirm letters early.",
      },
      {
        title: "Use the hint wisely",
        body: "Tap 💡 for a clue about today's word. It won't give the answer, but it narrows your thinking.",
      },
      {
        title: "Watch yellow vs green",
        body: "Green means correct letter and spot. Yellow means the letter is in the word but somewhere else — don't move it to the same position.",
      },
      {
        title: "Avoid repeating gray letters",
        body: "Letters marked gray are not in the word. Skip them in later guesses to test new letters faster.",
      },
      {
        title: "Think about letter pairs",
        body: "Common pairs like TH, CH, SH, or double letters can help narrow your next guess.",
      },
      {
        title: "Practice in training mode",
        body: "Use training for unlimited random words without affecting your daily stats. Great for learning the keyboard.",
      },
    ],
    faqItems: [
      {
        q: "What is Today's Puzzle?",
        a: "A free daily word game. Guess the five-letter word in six tries. English, Macedonian, Serbian, Croatian, Bosnian, Slovenian, Albanian, Bulgarian, Greek, Romanian, German, French, Spanish, Italian, Portuguese and Dutch are available now; more languages are coming.",
      },
      {
        q: "How many guesses do I get?",
        a: "You have six attempts per puzzle. Each guess must be a valid five-letter word from the game's dictionary.",
      },
      {
        q: "Is there only one puzzle per day?",
        a: "Yes. Everyone gets the same daily word. Training mode offers unlimited practice words that don't count toward stats.",
      },
      {
        q: "What do the tile colors mean?",
        a: "Green: correct letter, correct spot. Yellow: correct letter, wrong spot. Gray: letter is not in the word.",
      },
      {
        q: "How do hints work?",
        a: "Press 💡 to see a short clue for the daily word. Hints are unique to each answer and meant to help, not spoil.",
      },
      {
        q: "Can I share my result?",
        a: "Yes. After solving (or failing), use the share buttons for WhatsApp, Facebook, Instagram, X, or Viber.",
      },
      {
        q: "When does the puzzle reset?",
        a: "A new puzzle is available at midnight GMT+2.",
      },
    ],
  },
  mk: {
    selectLanguage: "Избери јазик",
    primaryLanguages: "Примарен",
    balkanLanguages: "Балкански јазици",
    europeanLanguages: "Европски јазици",
    playNow: "Играј сега",
    comingSoon: "Наскоро",
    scrollToGame: "Скролни нагоре за денешната загатка",
    bestTips: "Најдобри совети за победа",
    faq: "Често поставувани прашања",
    tips: [
      {
        title: "Почни со чести самогласки",
        body: "Пробај прв збор со А, Е, О или И. Тие се чести во македонските зборови и брзо ги елиминираш или потврдуваш.",
      },
      {
        title: "Користи го наводот паметно",
        body: "Притисни 💡 за навод за денешниот збор. Не го открива одговорот, но те насочува.",
      },
      {
        title: "Разликувај жолто од зелено",
        body: "Зелено = точна буква на точно место. Жолто = буквата е во зборот, но на друго место.",
      },
      {
        title: "Не повторувај сиви букви",
        body: "Сивите букви не се во зборот. Избегнувај ги за да тестираш нови побрзо.",
      },
      {
        title: "Внимавај на Ѓ, Ќ, Џ, Љ, Њ",
        body: "Ако една од овие се појави жолто или зелено, пробај сродни форми во следниот обид.",
      },
      {
        title: "Вежбај во тренинг режим",
        body: "Тренингот нуди неограничени случајни зборови без влијание на дневната статистика.",
      },
    ],
    faqItems: [
      {
        q: "Што е Денешна Загатка?",
        a: "Бесплатна дневна збор-игра на македонски. Погоди го петбуквениот збор за шест обиди. Нова загатка секој ден.",
      },
      {
        q: "Колку обиди имам?",
        a: "Шест обиди по загатка. Секој обид мора да биде важечки петбуквен збор од речникот.",
      },
      {
        q: "Дали има само една загатка дневно?",
        a: "Да. Сите ја добиваат истата дневна збор. Тренинг режимот нуди неограничена пракса без статистика.",
      },
      {
        q: "Што значат боите на полињата?",
        a: "Зелено: точна буква, точно место. Жолто: точна буква, погрешно место. Сиво: буквата не е во зборот.",
      },
      {
        q: "Како работат наводите?",
        a: "Притисни 💡 за краток навод за денешниот збор. Секој збор има свој навод.",
      },
      {
        q: "Можам ли да го споделам резултатот?",
        a: "Да. По решавање користи WhatsApp, Facebook, Instagram, X или Viber.",
      },
      {
        q: "Кога се менува загатката?",
        a: "Нова загатка на полноќ по GMT+2.",
      },
    ],
  },
  sr: {
    selectLanguage: "Изабери језик",
    primaryLanguages: "Примарни",
    balkanLanguages: "Балкански језици",
    europeanLanguages: "Европски језици",
    playNow: "Играј сада",
    comingSoon: "Ускоро",
    scrollToGame: "Скролуј нагоре за данашњу загонетку",
    bestTips: "Најбољи савети за победу",
    faq: "Често постављана питања",
    tips: [
      {
        title: "Почни са честим самогласницима",
        body: "Пробај прву реч са А, Е, И, О или У. Брзо елиминишеш или потврдиш слова.",
      },
      {
        title: "Користи наговестај паметно",
        body: "Притисни 💡 за наговестај о данашњој речи. Не открива одговор, али те усмерава.",
      },
      {
        title: "Разликуј жуто од зеленог",
        body: "Зелено = тачно слово на тачном месту. Жуто = слово је у речи, али на другом месту.",
      },
      {
        title: "Не понављај сива слова",
        body: "Сива слова нису у речи. Избегавај их да брже тестираш нова.",
      },
      {
        title: "Пази на Ђ, Ћ, Џ, Љ, Њ",
        body: "Ако се неко појави жуто или зелено, пробај сродне облике у следећем покушају.",
      },
      {
        title: "Вежбај у тренинг режиму",
        body: "Тренинг нуди неограничене случајне речи без утицаја на дневну статистику.",
      },
    ],
    faqItems: [
      {
        q: "Шта је Данашња Загонетка?",
        a: "Бесплатна дневна игра речи на српском. Погоди петословну реч за шест покушаја. Нова загонетка сваког дана.",
      },
      {
        q: "Колико покушаја имам?",
        a: "Шест покушаја по загонетки. Сваки мора бити важећа петословна реч из речника.",
      },
      {
        q: "Да ли постоји само једна загонетка дневно?",
        a: "Да. Сви добијају исту дневну реч. Тренинг режим нуди неограничену праксу без статистике.",
      },
      {
        q: "Шта значе боје поља?",
        a: "Зелено: тачно слово, тачно место. Жуто: тачно слово, погрешно место. Сиво: слово није у речи.",
      },
      {
        q: "Како раде наговестаји?",
        a: "Притисни 💡 за кратак наговестај о данашњој речи. Свака реч има свој наговестај.",
      },
      {
        q: "Могу ли да поделим резултат?",
        a: "Да. После решавања користи WhatsApp, Facebook, Instagram, X или Viber.",
      },
      {
        q: "Када се мења загонетка?",
        a: "Нова загонетка у поноћ по GMT+2.",
      },
    ],
  },
  hr: {
    selectLanguage: "Odaberi jezik",
    primaryLanguages: "Primarni",
    balkanLanguages: "Balkanski jezici",
    europeanLanguages: "Europski jezici",
    playNow: "Igraj sada",
    comingSoon: "Uskoro",
    scrollToGame: "Pomakni se gore za današnju zagonetku",
    bestTips: "Najbolji savjeti za pobjedu",
    faq: "Često postavljana pitanja",
    tips: [
      {
        title: "Počni s čestim samoglasnicima",
        body: "Probaj prvu riječ s A, E, I, O ili U. Brzo eliminiraš ili potvrdiš slova.",
      },
      {
        title: "Koristi nagovjestaj pametno",
        body: "Pritisni 💡 za nagovjestaj o današnjoj riječi. Ne otkriva odgovor, ali te usmjerava.",
      },
      {
        title: "Razlikuj žuto od zelenog",
        body: "Zeleno = točno slovo na točnom mjestu. Žuto = slovo je u riječi, ali na drugom mjestu.",
      },
      {
        title: "Ne ponavljaj siva slova",
        body: "Siva slova nisu u riječi. Izbjegavaj ih da brže testiraš nova.",
      },
      {
        title: "Pazi na Č, Ć, Đ, Š, Ž",
        body: "Ako se neko pojavi žuto ili zeleno, probaj srodne oblike u sljedećem pokušaju.",
      },
      {
        title: "Vježbaj u trening načinu",
        body: "Trening nudi neograničene nasumične riječi bez utjecaja na dnevnu statistiku.",
      },
    ],
    faqItems: [
      {
        q: "Što je Današnja zagonetka?",
        a: "Besplatna dnevna igra riječi na hrvatskom. Pogodi petoslovnu riječ u šest pokušaja. Nova zagonetka svaki dan.",
      },
      {
        q: "Koliko pokušaja imam?",
        a: "Šest pokušaja po zagonetki. Svaki mora biti važeća petoslovna riječ iz rječnika.",
      },
      {
        q: "Postoji li samo jedna zagonetka dnevno?",
        a: "Da. Svi dobivaju istu dnevnu riječ. Trening način nudi neograničenu praksu bez statistike.",
      },
      {
        q: "Što znače boje polja?",
        a: "Zeleno: točno slovo, točno mjesto. Žuto: točno slovo, krivo mjesto. Sivo: slovo nije u riječi.",
      },
      {
        q: "Kako rade nagovjestaji?",
        a: "Pritisni 💡 za kratak nagovjestaj o današnjoj riječi. Svaka riječ ima svoj nagovjestaj.",
      },
      {
        q: "Mogu li podijeliti rezultat?",
        a: "Da. Nakon rješavanja koristi WhatsApp, Facebook, Instagram, X ili Viber.",
      },
      {
        q: "Kada se mijenja zagonetka?",
        a: "Nova zagonetka u ponoć po GMT+2.",
      },
    ],
  },
  bs: {
    selectLanguage: "Odaberi jezik",
    primaryLanguages: "Primarni",
    balkanLanguages: "Balkanski jezici",
    europeanLanguages: "Europski jezici",
    playNow: "Igraj sada",
    comingSoon: "Uskoro",
    scrollToGame: "Pomakni se gore za današnju zagonetku",
    bestTips: "Najbolji savjeti za pobjedu",
    faq: "Često postavljana pitanja",
    tips: [
      {
        title: "Počni s čestim samoglasnicima",
        body: "Probaj prvu riječ s A, E, I, O ili U. Brzo eliminišeš ili potvrdiš slova.",
      },
      {
        title: "Koristi nagovještaj pametno",
        body: "Pritisni 💡 za nagovještaj o današnjoj riječi. Ne otkriva odgovor, ali te usmjerava.",
      },
      {
        title: "Razlikuj žuto od zelenog",
        body: "Zeleno = tačno slovo na tačnom mjestu. Žuto = slovo je u riječi, ali na drugom mjestu.",
      },
      {
        title: "Ne ponavljaj siva slova",
        body: "Siva slova nisu u riječi. Izbjegavaj ih da brže testiraš nova.",
      },
      {
        title: "Pazi na Č, Ć, Đ, Š, Ž",
        body: "Ako se neko pojavi žuto ili zeleno, probaj srodne oblike u sljedećem pokušaju.",
      },
      {
        title: "Vježbaj u trening režimu",
        body: "Trening nudi neograničene nasumične riječi bez uticaja na dnevnu statistiku.",
      },
    ],
    faqItems: [
      {
        q: "Šta je Današnja zagonetka?",
        a: "Besplatna dnevna igra riječi na bosanskom. Pogodi petoslovnu riječ u šest pokušaja. Nova zagonetka svaki dan.",
      },
      {
        q: "Koliko pokušaja imam?",
        a: "Šest pokušaja po zagonetki. Svaki mora biti važeća petoslovna riječ iz rječnika.",
      },
      {
        q: "Postoji li samo jedna zagonetka dnevno?",
        a: "Da. Svi dobijaju istu dnevnu riječ. Trening režim nudi neograničenu praksu bez statistike.",
      },
      {
        q: "Šta znače boje polja?",
        a: "Zeleno: tačno slovo, tačno mjesto. Žuto: tačno slovo, pogrešno mjesto. Sivo: slovo nije u riječi.",
      },
      {
        q: "Kako rade nagovještaji?",
        a: "Pritisni 💡 za kratak nagovještaj o današnjoj riječi. Svaka riječ ima svoj nagovještaj.",
      },
      {
        q: "Mogu li podijeliti rezultat?",
        a: "Da. Nakon rješavanja koristi WhatsApp, Facebook, Instagram, X ili Viber.",
      },
      {
        q: "Kada se mijenja zagonetka?",
        a: "Nova zagonetka u ponoć po GMT+2.",
      },
    ],
  },
  sl: {
    selectLanguage: "Izberi jezik",
    primaryLanguages: "Primarni",
    balkanLanguages: "Balkanski jeziki",
    europeanLanguages: "Evropski jeziki",
    playNow: "Igraj zdaj",
    comingSoon: "Kmalu",
    scrollToGame: "Pomakni se gor za današnjo uganko",
    bestTips: "Najboljši nasveti za zmago",
    faq: "Pogosto zastavljena vprašanja",
    tips: [
      {
        title: "Začni s pogostimi samoglasniki",
        body: "Poskusi prvo besedo z A, E, I, O ali U. Hitro izločiš ali potrdiš črke.",
      },
      {
        title: "Pametno uporabi namig",
        body: "Pritisni 💡 za namig o današnji besedi. Ne razkrije odgovora, a te usmeri.",
      },
      {
        title: "Razlikuj rumeno od zelenega",
        body: "Zeleno = pravilna črka na pravem mestu. Rumeno = črka je v besedi, a na drugem mestu.",
      },
      {
        title: "Ne ponavljaj sivih črk",
        body: "Sive črke niso v besedi. Izogibaj se jim, da hitreje preizkušaš nove.",
      },
      {
        title: "Pazi na Č, Š, Ž",
        body: "Če se katera pojavi rumeno ali zeleno, poskusi sorodne oblike v naslednjem poskusu.",
      },
      {
        title: "Vadi v trening načinu",
        body: "Trening ponuja neomejene naključne besede brez vpliva na dnevno statistiko.",
      },
    ],
    faqItems: [
      {
        q: "Kaj je Današnja uganka?",
        a: "Brezplačna dnevna besedna igra v slovenščini. Ugani petčrkovno besedo v šestih poskusih. Nova uganka vsak dan.",
      },
      {
        q: "Koliko poskusov imam?",
        a: "Šest poskusov na uganko. Vsak mora biti veljavna petčrkovna beseda iz slovarja.",
      },
      {
        q: "Ali je samo ena uganka na dan?",
        a: "Da. Vsi dobijo isto dnevno besedo. Trening način ponuja neomejeno vadbo brez statistike.",
      },
      {
        q: "Kaj pomenijo barve polj?",
        a: "Zeleno: pravilna črka, pravo mesto. Rumeno: pravilna črka, napačno mesto. Sivo: črke ni v besedi.",
      },
      {
        q: "Kako delujejo namigi?",
        a: "Pritisni 💡 za kratek namig o današnji besedi. Vsaka beseda ima svoj namig.",
      },
      {
        q: "Ali lahko delim rezultat?",
        a: "Da. Po reševanju uporabi WhatsApp, Facebook, Instagram, X ali Viber.",
      },
      {
        q: "Kdaj se zamenja uganka?",
        a: "Nova uganka ob polnoči po GMT+2.",
      },
    ],
  },
  sq: {
    selectLanguage: "Zgjidh gjuhën",
    primaryLanguages: "Kryesore",
    balkanLanguages: "Gjuhët ballkanike",
    europeanLanguages: "Gjuhët evropiane",
    playNow: "Luaj tani",
    comingSoon: "Së shpejti",
    scrollToGame: "Lëviz lart për enigmën e sotme",
    bestTips: "Këshillat më të mira për fitore",
    faq: "Pyetjet më të shpeshta",
    tips: [
      {
        title: "Fillo me zanore të zakonshme",
        body: "Provo një fjalë të parë me A, E, I, O ose U. Eliminon ose konfirmon shkronjat shpejt.",
      },
      {
        title: "Përdor ndihmën me mençuri",
        body: "Shtyp 💡 për një ndihmë rreth fjalës së sotme. Nuk jep përgjigjen, por të udhëzon.",
      },
      {
        title: "Dallo të verdhën nga jeshile",
        body: "Jeshile = shkronjë e saktë në vendin e duhur. E verdhë = shkronja është në fjalë, por në vend tjetër.",
      },
      {
        title: "Mos përsërit shkronjat gri",
        body: "Shkronjat gri nuk janë në fjalë. Shmangji ato për të testuar të reja më shpejt.",
      },
      {
        title: "Kujdes për Ç dhe Ë",
        body: "Nëse shfaqen të verdha ose jeshile, provo forma të ngjashme në përpjekjen tjetër.",
      },
      {
        title: "Praktiko në modalitetin e stërvitjes",
        body: "Stërvitja ofron fjalë të rastësishme të pakufizuara pa ndikuar në statistikat ditore.",
      },
    ],
    faqItems: [
      {
        q: "Çfarë është Enigma e sotme?",
        a: "Një lojë falas ditore me fjalë në shqip. Gjej fjalën me pesë shkronja në gjashtë përpjekje. Enigmë e re çdo ditë.",
      },
      {
        q: "Sa përpjekje kam?",
        a: "Gjashtë përpjekje për enigmë. Çdo përpjekje duhet të jetë një fjalë e vlefshme me pesë shkronja nga fjalori.",
      },
      {
        q: "A ka vetëm një enigmë në ditë?",
        a: "Po. Të gjithë marrin të njëjtën fjalë ditore. Modaliteti i stërvitjes ofron praktikë të pakufizuar pa statistika.",
      },
      {
        q: "Çfarë nënkuptojnë ngjyrat e kutive?",
        a: "Jeshile: shkronjë e saktë, vend i saktë. E verdhë: shkronjë e saktë, vend i gabuar. Gri: shkronja nuk është në fjalë.",
      },
      {
        q: "Si funksionojnë ndihmat?",
        a: "Shtyp 💡 për një ndihmë të shkurtër për fjalën e sotme. Çdo fjalë ka ndihmën e vet.",
      },
      {
        q: "A mund ta ndaj rezultatin?",
        a: "Po. Pas zgjidhjes përdor WhatsApp, Facebook, Instagram, X ose Viber.",
      },
      {
        q: "Kur ndryshon enigma?",
        a: "Enigmë e re në mesnatë sipas GMT+2.",
      },
    ],
  },
  bg: {
    selectLanguage: "Избери език",
    primaryLanguages: "Основни",
    balkanLanguages: "Балкански езици",
    europeanLanguages: "Европейски езици",
    playNow: "Играй сега",
    comingSoon: "Скоро",
    scrollToGame: "Превърти нагоре за днешната загадка",
    bestTips: "Най-добри съвети за победа",
    faq: "Често задавани въпроси",
    tips: [
      {
        title: "Започни с чести гласни",
        body: "Опитай първа дума с А, Е, И, О или У. Бързо елиминираш или потвърждаваш букви.",
      },
      {
        title: "Използвай подсказката разумно",
        body: "Натисни 💡 за подсказка за днешната дума. Не дава отговора, но насочва мисълта ти.",
      },
      {
        title: "Различавай жълтото от зеленото",
        body: "Зелено = правилна буква на правилното място. Жълто = буквата е в думата, но на друго място.",
      },
      {
        title: "Не повтаряй сиви букви",
        body: "Сивите букви не са в думата. Избягвай ги, за да тестваш нови по-бързо.",
      },
      {
        title: "Внимавай на Ъ, Ь, Ю, Я",
        body: "Ако някоя се появи жълта или зелена, опитай свързани форми в следващия опит.",
      },
      {
        title: "Тренирай в режим тренировка",
        body: "Тренировката предлага неограничени случайни думи без влияние върху дневната статистика.",
      },
    ],
    faqItems: [
      {
        q: "Какво е Днешната загадка?",
        a: "Безплатна дневна игра с думи на български. Познай петбуквената дума за шест опита. Нова загадка всеки ден.",
      },
      {
        q: "Колко опита имам?",
        a: "Шест опита на загадка. Всеки трябва да е валидна петбуквена дума от речника.",
      },
      {
        q: "Има ли само една загадка на ден?",
        a: "Да. Всички получават една и съща дневна дума. Режимът тренировка предлага неограничена практика без статистика.",
      },
      {
        q: "Какво означават цветовете на полетата?",
        a: "Зелено: правилна буква, правилно място. Жълто: правилна буква, грешно място. Сиво: буквата не е в думата.",
      },
      {
        q: "Как работят подсказките?",
        a: "Натисни 💡 за кратка подсказка за днешната дума. Всяка дума има своя подсказка.",
      },
      {
        q: "Мога ли да споделя резултата?",
        a: "Да. След решаване използвай WhatsApp, Facebook, Instagram, X или Viber.",
      },
      {
        q: "Кога се сменя загадката?",
        a: "Нова загадка в полунощ по GMT+2.",
      },
    ],
  },
  el: {
    selectLanguage: "Επιλογή γλώσσας",
    primaryLanguages: "Κύριες",
    balkanLanguages: "Βαλκανικές γλώσσες",
    europeanLanguages: "Ευρωπαϊκές γλώσσες",
    playNow: "Παίξε τώρα",
    comingSoon: "Σύντομα",
    scrollToGame: "Κύλισε πάνω για το σημερινό παζλ",
    bestTips: "Καλύτερες συμβουλές για νίκη",
    faq: "Συχνές ερωτήσεις",
    tips: [
      {
        title: "Ξεκίνα με κοινά φωνήεντα",
        body: "Δοκίμασε μια πρώτη λέξη με Α, Ε, Η, Ι, Ο ή Υ. Εξαλείφεις ή επιβεβαιώνεις γράμματα γρήγορα.",
      },
      {
        title: "Χρησιμοποίησε την υπόδειξη έξυπνα",
        body: "Πάτα 💡 για μια υπόδειξη για τη σημερινή λέξη. Δεν δίνει την απάντηση, αλλά σε καθοδηγεί.",
      },
      {
        title: "Διάκρινε το κίτρινο από το πράσινο",
        body: "Πράσινο = σωστό γράμμα στη σωστή θέση. Κίτρινο = το γράμμα είναι στη λέξη, αλλά αλλού.",
      },
      {
        title: "Μην επαναλαμβάνεις γκρι γράμματα",
        body: "Τα γκρι γράμματα δεν είναι στη λέξη. Απόφυγέ τα για να δοκιμάζεις νέα πιο γρήγορα.",
      },
      {
        title: "Πρόσεξε τα διπλά σύμφωνα",
        body: "Συνδυασμοί όπως ΜΠ, ΝΤ, ΓΚ ή διπλά γράμματα μπορούν να περιορίσουν την επόμενη εικασία.",
      },
      {
        title: "Εξασκήσου στη λειτουργία προπόνησης",
        body: "Η προπόνηση προσφέρει απεριόριστες τυχαίες λέξεις χωρίς επίδραση στα ημερήσια στατιστικά.",
      },
    ],
    faqItems: [
      {
        q: "Τι είναι το Σημερινό παζλ;",
        a: "Ένα δωρεάν ημερήσιο παιχνίδι λέξεων στα ελληνικά. Βρες τη λέξη πέντε γραμμάτων σε έξι προσπάθειες. Νέο παζλ κάθε μέρα.",
      },
      {
        q: "Πόσες προσπάθειες έχω;",
        a: "Έξι προσπάθειες ανά παζλ. Κάθε μία πρέπει να είναι έγκυρη λέξη πέντε γραμμάτων από το λεξικό.",
      },
      {
        q: "Υπάρχει μόνο ένα παζλ την ημέρα;",
        a: "Ναι. Όλοι παίρνουν την ίδια ημερήσια λέξη. Η λειτουργία προπόνησης προσφέρει απεριόριστη εξάσκηση χωρίς στατιστικά.",
      },
      {
        q: "Τι σημαίνουν τα χρώματα των κουτιών;",
        a: "Πράσινο: σωστό γράμμα, σωστή θέση. Κίτρινο: σωστό γράμμα, λάθος θέση. Γκρι: το γράμμα δεν είναι στη λέξη.",
      },
      {
        q: "Πώς λειτουργούν οι υποδείξεις;",
        a: "Πάτα 💡 για μια σύντομη υπόδειξη για τη σημερινή λέξη. Κάθε λέξη έχει τη δική της υπόδειξη.",
      },
      {
        q: "Μπορώ να μοιραστώ το αποτέλεσμα;",
        a: "Ναι. Μετά την επίλυση χρησιμοποίησε WhatsApp, Facebook, Instagram, X ή Viber.",
      },
      {
        q: "Πότε αλλάζει το παζλ;",
        a: "Νέο παζλ τα μεσάνυχτα κατά GMT+2.",
      },
    ],
  },
  ro: {
    selectLanguage: "Selectează limba",
    primaryLanguages: "Principale",
    balkanLanguages: "Limbi balcanice",
    europeanLanguages: "Limbi europene",
    playNow: "Joacă acum",
    comingSoon: "În curând",
    scrollToGame: "Derulează în sus pentru puzzle-ul de azi",
    bestTips: "Cele mai bune sfaturi pentru victorie",
    faq: "Întrebări frecvente",
    tips: [
      {
        title: "Începe cu vocale comune",
        body: "Încearcă un prim cuvânt cu A, E, I, O sau U. Elimini sau confirmi litere rapid.",
      },
      {
        title: "Folosește indiciul cu înțelepciune",
        body: "Apasă 💡 pentru un indiciu despre cuvântul de azi. Nu dă răspunsul, dar te ghidează.",
      },
      {
        title: "Deosebește galbenul de verde",
        body: "Verde = literă corectă pe locul corect. Galben = litera e în cuvânt, dar în alt loc.",
      },
      {
        title: "Nu repeta literele gri",
        body: "Literele gri nu sunt în cuvânt. Evită-le ca să testezi altele mai repede.",
      },
      {
        title: "Ai grijă la Ș, Ț, Ă, Â, Î",
        body: "Dacă una apare galbenă sau verde, încearcă forme înrudite la următoarea încercare.",
      },
      {
        title: "Exersează în modul antrenament",
        body: "Antrenamentul oferă cuvinte aleatorii nelimitate fără a afecta statisticile zilnice.",
      },
    ],
    faqItems: [
      {
        q: "Ce este Puzzle-ul de azi?",
        a: "Un joc zilnic gratuit de cuvinte în română. Ghicește cuvântul de cinci litere în șase încercări. Puzzle nou în fiecare zi.",
      },
      {
        q: "Câte încercări am?",
        a: "Șase încercări per puzzle. Fiecare trebuie să fie un cuvânt valid de cinci litere din dicționar.",
      },
      {
        q: "Există doar un puzzle pe zi?",
        a: "Da. Toată lumea primește același cuvânt zilnic. Modul antrenament oferă practică nelimitată fără statistici.",
      },
      {
        q: "Ce înseamnă culorile casetelor?",
        a: "Verde: literă corectă, loc corect. Galben: literă corectă, loc greșit. Gri: litera nu e în cuvânt.",
      },
      {
        q: "Cum funcționează indiciile?",
        a: "Apasă 💡 pentru un indiciu scurt despre cuvântul de azi. Fiecare cuvânt are propriul indiciu.",
      },
      {
        q: "Pot distribui rezultatul?",
        a: "Da. După rezolvare folosește WhatsApp, Facebook, Instagram, X sau Viber.",
      },
      {
        q: "Când se schimbă puzzle-ul?",
        a: "Puzzle nou la miezul nopții (GMT+2).",
      },
    ],
  },
  de: {
    selectLanguage: "Sprache wählen",
    primaryLanguages: "Hauptsprachen",
    balkanLanguages: "Balkansprachen",
    europeanLanguages: "Europäische Sprachen",
    playNow: "Jetzt spielen",
    comingSoon: "Demnächst",
    scrollToGame: "Nach oben scrollen zum heutigen Rätsel",
    bestTips: "Die besten Tipps zum Gewinnen",
    faq: "Häufige Fragen",
    tips: [
      {
        title: "Starte mit häufigen Vokalen",
        body: "Probiere ein erstes Wort mit A, E, I, O oder U. So findest du schnell passende Buchstaben.",
      },
      {
        title: "Nutze den Hinweis klug",
        body: "Tippe 💡 für einen Hinweis zum heutigen Wort. Er verrät nicht die Lösung, hilft aber weiter.",
      },
      {
        title: "Gelb ist nicht grün",
        body: "Grün = Buchstabe richtig und an der richtigen Stelle. Gelb = Buchstabe ist im Wort, aber woanders.",
      },
      {
        title: "Graue Buchstaben meiden",
        body: "Graue Buchstaben sind nicht im Wort. Vermeide sie, um andere schneller zu testen.",
      },
      {
        title: "Achte auf Ä, Ö, Ü und ß",
        body: "Wenn ein Umlaut gelb oder grün ist, probiere verwandte Formen beim nächsten Versuch.",
      },
      {
        title: "Übe im Trainingsmodus",
        body: "Training bietet unbegrenzt zufällige Wörter ohne Einfluss auf die Tagesstatistik.",
      },
    ],
    faqItems: [
      {
        q: "Was ist Das heutige Rätsel?",
        a: "Ein kostenloses tägliches Wortspiel auf Deutsch. Errate das fünfbuchstabige Wort in sechs Versuchen. Jeden Tag ein neues Rätsel.",
      },
      {
        q: "Wie viele Versuche habe ich?",
        a: "Sechs Versuche pro Rätsel. Jeder Versuch muss ein gültiges fünfbuchstabiges Wort aus dem Wörterbuch sein.",
      },
      {
        q: "Gibt es nur ein Rätsel pro Tag?",
        a: "Ja. Alle bekommen dasselbe Tageswort. Der Trainingsmodus bietet unbegrenztes Üben ohne Statistik.",
      },
      {
        q: "Was bedeuten die Kastenfarben?",
        a: "Grün: richtiger Buchstabe, richtige Stelle. Gelb: richtiger Buchstabe, falsche Stelle. Grau: Buchstabe nicht im Wort.",
      },
      {
        q: "Wie funktionieren die Hinweise?",
        a: "Tippe 💡 für einen kurzen Hinweis zum heutigen Wort. Jedes Wort hat einen eigenen Hinweis.",
      },
      {
        q: "Kann ich mein Ergebnis teilen?",
        a: "Ja. Nach dem Lösen kannst du WhatsApp, Facebook, Instagram, X oder Viber nutzen.",
      },
      {
        q: "Wann wechselt das Rätsel?",
        a: "Ein neues Rätsel um Mitternacht (GMT+2).",
      },
    ],
  },
  fr: {
    selectLanguage: "Choisir la langue",
    primaryLanguages: "Principales",
    balkanLanguages: "Langues balkaniques",
    europeanLanguages: "Langues européennes",
    playNow: "Jouer maintenant",
    comingSoon: "Bientôt",
    scrollToGame: "Remonte pour jouer au puzzle du jour",
    bestTips: "Meilleurs conseils pour gagner",
    faq: "Questions fréquentes",
    tips: [
      {
        title: "Commence par des voyelles courantes",
        body: "Essaie un premier mot avec A, E, I, O ou U pour repérer les lettres rapidement.",
      },
      {
        title: "Utilise l'indice avec discernement",
        body: "Appuie sur 💡 pour un indice sur le mot du jour. Il ne donne pas la réponse mais guide.",
      },
      {
        title: "Jaune n'est pas vert",
        body: "Vert = bonne lettre au bon endroit. Jaune = lettre dans le mot mais ailleurs.",
      },
      {
        title: "Évite les lettres grises",
        body: "Les lettres grises ne sont pas dans le mot. Évite-les pour tester d'autres plus vite.",
      },
      {
        title: "Attention aux accents",
        body: "É, È, Ç, À, Ù… Si une lettre accentuée est jaune ou verte, pense aux variantes.",
      },
      {
        title: "Entraîne-toi en mode entraînement",
        body: "L'entraînement propose des mots aléatoires sans affecter les stats du jour.",
      },
    ],
    faqItems: [
      {
        q: "Qu'est-ce que Le puzzle du jour ?",
        a: "Un jeu de mots quotidien gratuit en français. Devine le mot de cinq lettres en six essais. Un nouveau puzzle chaque jour.",
      },
      {
        q: "Combien d'essais ai-je ?",
        a: "Six essais par puzzle. Chaque essai doit être un mot valide de cinq lettres du dictionnaire.",
      },
      {
        q: "Y a-t-il un seul puzzle par jour ?",
        a: "Oui. Tout le monde reçoit le même mot. Le mode entraînement permet de pratiquer sans limite.",
      },
      {
        q: "Que signifient les couleurs des cases ?",
        a: "Vert : bonne lettre, bonne place. Jaune : bonne lettre, mauvaise place. Gris : lettre absente.",
      },
      {
        q: "Comment fonctionnent les indices ?",
        a: "Appuie sur 💡 pour un court indice sur le mot du jour. Chaque mot a le sien.",
      },
      {
        q: "Puis-je partager mon résultat ?",
        a: "Oui. Après avoir résolu, utilise WhatsApp, Facebook, Instagram, X ou Viber.",
      },
      {
        q: "Quand le puzzle change-t-il ?",
        a: "Un nouveau puzzle à minuit (GMT+2).",
      },
    ],
  },
  es: {
    selectLanguage: "Elegir idioma",
    primaryLanguages: "Principales",
    balkanLanguages: "Idiomas balcánicos",
    europeanLanguages: "Idiomas europeos",
    playNow: "Jugar ahora",
    comingSoon: "Próximamente",
    scrollToGame: "Sube para jugar al puzzle de hoy",
    bestTips: "Mejores consejos para ganar",
    faq: "Preguntas frecuentes",
    tips: [
      {
        title: "Empieza con vocales comunes",
        body: "Prueba una primera palabra con A, E, I, O o U para descartar letras rápido.",
      },
      {
        title: "Usa la pista con cabeza",
        body: "Pulsa 💡 para una pista sobre la palabra de hoy. No da la respuesta pero orienta.",
      },
      {
        title: "Amarillo no es verde",
        body: "Verde = letra correcta en su sitio. Amarillo = letra en la palabra pero en otro lugar.",
      },
      {
        title: "Evita las letras grises",
        body: "Las letras grises no están en la palabra. Evítalas para probar otras más rápido.",
      },
      {
        title: "Cuidado con Ñ y acentos",
        body: "Á, É, Í, Ó, Ú, Ñ… Si una letra sale amarilla o verde, prueba variantes.",
      },
      {
        title: "Practica en modo entrenamiento",
        body: "El entrenamiento ofrece palabras aleatorias sin afectar las estadísticas diarias.",
      },
    ],
    faqItems: [
      {
        q: "¿Qué es El puzzle de hoy?",
        a: "Un juego diario gratuito de palabras en español. Adivina la palabra de cinco letras en seis intentos. Un puzzle nuevo cada día.",
      },
      {
        q: "¿Cuántos intentos tengo?",
        a: "Seis intentos por puzzle. Cada uno debe ser una palabra válida de cinco letras del diccionario.",
      },
      {
        q: "¿Solo hay un puzzle al día?",
        a: "Sí. Todos reciben la misma palabra diaria. El modo entrenamiento permite practicar sin límite.",
      },
      {
        q: "¿Qué significan los colores?",
        a: "Verde: letra correcta, posición correcta. Amarillo: letra correcta, posición incorrecta. Gris: letra ausente.",
      },
      {
        q: "¿Cómo funcionan las pistas?",
        a: "Pulsa 💡 para una pista breve sobre la palabra de hoy. Cada palabra tiene la suya.",
      },
      {
        q: "¿Puedo compartir mi resultado?",
        a: "Sí. Tras resolver, usa WhatsApp, Facebook, Instagram, X o Viber.",
      },
      {
        q: "¿Cuándo cambia el puzzle?",
        a: "Un puzzle nuevo a medianoche (GMT+2).",
      },
    ],
  },
  it: {
    selectLanguage: "Scegli la lingua",
    primaryLanguages: "Principali",
    balkanLanguages: "Lingue balcaniche",
    europeanLanguages: "Lingue europee",
    playNow: "Gioca ora",
    comingSoon: "In arrivo",
    scrollToGame: "Scorri in alto per il puzzle di oggi",
    bestTips: "Migliori consigli per vincere",
    faq: "Domande frequenti",
    tips: [
      {
        title: "Inizia con vocali comuni",
        body: "Prova una prima parola con A, E, I, O o U per scoprire le lettere in fretta.",
      },
      {
        title: "Usa il suggerimento con intelligenza",
        body: "Premi 💡 per un indizio sulla parola di oggi. Non dà la risposta ma aiuta.",
      },
      {
        title: "Giallo non è verde",
        body: "Verde = lettera giusta al posto giusto. Giallo = lettera nella parola ma altrove.",
      },
      {
        title: "Evita le lettere grigie",
        body: "Le lettere grigie non sono nella parola. Evitale per provarne altre più in fretta.",
      },
      {
        title: "Attenzione agli accenti",
        body: "À, È, É, Ì, Ò, Ù… Se una lettera è gialla o verde, prova varianti al tentativo successivo.",
      },
      {
        title: "Allenati in modalità allenamento",
        body: "L'allenamento offre parole casuali illimitate senza influire sulle statistiche giornaliere.",
      },
    ],
    faqItems: [
      {
        q: "Cos'è Il puzzle di oggi?",
        a: "Un gioco quotidiano gratuito di parole in italiano. Indovina la parola di cinque lettere in sei tentativi. Un nuovo puzzle ogni giorno.",
      },
      {
        q: "Quanti tentativi ho?",
        a: "Sei tentativi per puzzle. Ognuno deve essere una parola valida di cinque lettere dal dizionario.",
      },
      {
        q: "C'è un solo puzzle al giorno?",
        a: "Sì. Tutti ricevono la stessa parola giornaliera. La modalità allenamento permette di esercitarsi senza limiti.",
      },
      {
        q: "Cosa significano i colori delle caselle?",
        a: "Verde: lettera corretta, posizione corretta. Giallo: lettera corretta, posizione sbagliata. Grigio: lettera assente.",
      },
      {
        q: "Come funzionano i suggerimenti?",
        a: "Premi 💡 per un breve indizio sulla parola di oggi. Ogni parola ha il proprio.",
      },
      {
        q: "Posso condividere il mio risultato?",
        a: "Sì. Dopo aver risolto, usa WhatsApp, Facebook, Instagram, X o Viber.",
      },
      {
        q: "Quando cambia il puzzle?",
        a: "Un nuovo puzzle a mezzanotte (GMT+2).",
      },
    ],
  },
  pt: {
    selectLanguage: "Escolher idioma",
    primaryLanguages: "Principais",
    balkanLanguages: "Línguas balcânicas",
    europeanLanguages: "Línguas europeias",
    playNow: "Jogar agora",
    comingSoon: "Em breve",
    scrollToGame: "Deslize para cima para o puzzle de hoje",
    bestTips: "Melhores dicas para ganhar",
    faq: "Perguntas frequentes",
    tips: [
      {
        title: "Comece com vogais comuns",
        body: "Tente uma primeira palavra com A, E, I, O ou U para descobrir letras rapidamente.",
      },
      {
        title: "Use a dica com inteligência",
        body: "Prima 💡 para uma dica sobre a palavra de hoje. Não dá a resposta mas ajuda.",
      },
      {
        title: "Amarelo não é verde",
        body: "Verde = letra certa no lugar certo. Amarelo = letra na palavra mas noutro sítio.",
      },
      {
        title: "Evite letras cinzentas",
        body: "Letras cinzentas não estão na palavra. Evite-as para testar outras mais depressa.",
      },
      {
        title: "Atenção aos acentos",
        body: "Á, Ã, Ç, É, Í, Ó, Ú… Se uma letra fica amarela ou verde, tente variantes na próxima tentativa.",
      },
      {
        title: "Treine no modo treino",
        body: "O treino oferece palavras aleatórias ilimitadas sem afetar as estatísticas diárias.",
      },
    ],
    faqItems: [
      {
        q: "O que é O puzzle de hoje?",
        a: "Um jogo diário gratuito de palavras em português. Adivinhe a palavra de cinco letras em seis tentativas. Um novo puzzle todos os dias.",
      },
      {
        q: "Quantas tentativas tenho?",
        a: "Seis tentativas por puzzle. Cada uma deve ser uma palavra válida de cinco letras do dicionário.",
      },
      {
        q: "Há apenas um puzzle por dia?",
        a: "Sim. Todos recebem a mesma palavra diária. O modo treino permite praticar sem limites.",
      },
      {
        q: "O que significam as cores das caixas?",
        a: "Verde: letra correta, posição correta. Amarelo: letra correta, posição errada. Cinzento: letra ausente.",
      },
      {
        q: "Como funcionam as dicas?",
        a: "Prima 💡 para uma breve dica sobre a palavra de hoje. Cada palavra tem a sua.",
      },
      {
        q: "Posso partilhar o meu resultado?",
        a: "Sim. Depois de resolver, use WhatsApp, Facebook, Instagram, X ou Viber.",
      },
      {
        q: "Quando muda o puzzle?",
        a: "Um novo puzzle à meia-noite (GMT+2).",
      },
    ],
  },
  nl: {
    selectLanguage: "Kies taal",
    primaryLanguages: "Hoofd",
    balkanLanguages: "Balkan talen",
    europeanLanguages: "Europese talen",
    playNow: "Nu spelen",
    comingSoon: "Binnenkort",
    scrollToGame: "Scroll omhoog naar de puzzel van vandaag",
    bestTips: "Beste tips om te winnen",
    faq: "Veelgestelde vragen",
    tips: [
      {
        title: "Begin met veelvoorkomende klinkers",
        body: "Probeer een eerste woord met A, E, I, O of U om snel letters te ontdekken.",
      },
      {
        title: "Gebruik de hint slim",
        body: "Druk op 💡 voor een hint over het woord van vandaag. Het geeft niet het antwoord maar helpt wel.",
      },
      {
        title: "Geel is niet groen",
        body: "Groen = juiste letter op de juiste plek. Geel = letter in het woord maar ergens anders.",
      },
      {
        title: "Vermijd grijze letters",
        body: "Grijze letters zitten niet in het woord. Vermijd ze om sneller andere te proberen.",
      },
      {
        title: "Let op de ij-combinatie",
        body: "In het Nederlands telt IJ soms als één klank. Probeer varianten als een letter geel of groen wordt.",
      },
      {
        title: "Oefen in de trainingsmodus",
        body: "Training biedt onbeperkt willekeurige woorden zonder invloed op dagelijkse statistieken.",
      },
    ],
    faqItems: [
      {
        q: "Wat is De puzzel van vandaag?",
        a: "Een gratis dagelijks woordspel in het Nederlands. Raad het vijfletterwoord in zes pogingen. Elke dag een nieuwe puzzel.",
      },
      {
        q: "Hoeveel pogingen heb ik?",
        a: "Zes pogingen per puzzel. Elke poging moet een geldig vijfletterwoord uit het woordenboek zijn.",
      },
      {
        q: "Is er maar één puzzel per dag?",
        a: "Ja. Iedereen krijgt hetzelfde dagelijkse woord. De trainingsmodus laat je onbeperkt oefenen.",
      },
      {
        q: "Wat betekenen de kleuren van de vakjes?",
        a: "Groen: juiste letter, juiste plek. Geel: juiste letter, verkeerde plek. Grijs: letter niet aanwezig.",
      },
      {
        q: "Hoe werken hints?",
        a: "Druk op 💡 voor een korte hint over het woord van vandaag. Elk woord heeft er een.",
      },
      {
        q: "Kan ik mijn resultaat delen?",
        a: "Ja. Na het oplossen gebruik je WhatsApp, Facebook, Instagram, X of Viber.",
      },
      {
        q: "Wanneer verandert de puzzel?",
        a: "Een nieuwe puzzel om middernacht (GMT+2).",
      },
    ],
  },
  pl: {
    selectLanguage: "Wybierz język",
    primaryLanguages: "Główne",
    balkanLanguages: "Języki bałkańskie",
    europeanLanguages: "Języki europejskie",
    playNow: "Graj teraz",
    comingSoon: "Wkrótce",
    scrollToGame: "Przewiń w górę do dzisiejszej zagadki",
    bestTips: "Najlepsze wskazówki",
    faq: "Często zadawane pytania",
    tips: [
      {
        title: "Zacznij od popularnych samogłosek",
        body: "Spróbuj pierwszego słowa z A, E, I, O lub U — w polskim często się pojawiają.",
      },
      {
        title: "Mądrze używaj podpowiedzi",
        body: "Naciśnij 💡, aby zobaczyć wskazówkę do dzisiejszego słowa. Nie podaje odpowiedzi, ale pomaga.",
      },
      {
        title: "Żółte to nie zielone",
        body: "Zielone = dobra litera na właściwym miejscu. Żółte = litera jest w słowie, ale gdzie indziej.",
      },
      {
        title: "Unikaj szarych liter",
        body: "Szare litery nie występują w słowie. Pomiń je, aby szybciej testować inne.",
      },
      {
        title: "Pamiętaj o polskich znakach",
        body: "Ą, Ć, Ę, Ł, Ń, Ó, Ś, Ź, Ż — jeśli litera jest żółta lub zielona, spróbuj wariantów z ogonkami.",
      },
      {
        title: "Ćwicz w trybie treningowym",
        body: "Trening oferuje nielimitowane losowe słowa bez wpływu na statystyki dzienne.",
      },
    ],
    faqItems: [
      {
        q: "Czym jest Zagadka dnia?",
        a: "Darmowa codzienna gra słowna po polsku. Odgadnij pięcioliterowe słowo w sześciu próbach. Każdego dnia nowa zagadka.",
      },
      {
        q: "Ile mam prób?",
        a: "Sześć prób na zagadkę. Każda musi być prawidłowym pięcioliterowym słowem ze słownika.",
      },
      {
        q: "Czy jest tylko jedna zagadka dziennie?",
        a: "Tak. Wszyscy dostają to samo słowo. Tryb treningowy pozwala ćwiczyć bez limitu.",
      },
      {
        q: "Co oznaczają kolory pól?",
        a: "Zielony: dobra litera, dobre miejsce. Żółty: dobra litera, złe miejsce. Szary: litery nie ma w słowie.",
      },
      {
        q: "Jak działają podpowiedzi?",
        a: "Naciśnij 💡, aby zobaczyć krótką wskazówkę do dzisiejszego słowa. Każde słowo ma swoją.",
      },
      {
        q: "Czy mogę udostępnić wynik?",
        a: "Tak. Po rozwiązaniu użyj WhatsApp, Facebook, Instagram, X lub Viber.",
      },
      {
        q: "Kiedy zmienia się zagadka?",
        a: "Nowa zagadka o północy czasu GMT+2.",
      },
    ],
  },
  cs: {
    selectLanguage: "Vyberte jazyk",
    primaryLanguages: "Hlavní",
    balkanLanguages: "Balkánské jazyky",
    europeanLanguages: "Evropské jazyky",
    playNow: "Hrát nyní",
    comingSoon: "Již brzy",
    scrollToGame: "Přejděte nahoru k dnešní hádance",
    bestTips: "Nejlepší tipy",
    faq: "Často kladené otázky",
    tips: [
      {
        title: "Začněte běžnými samohláskami",
        body: "Zkuste první slovo s A, E, I, O nebo U — v češtině se často vyskytují.",
      },
      {
        title: "Chytře využijte nápovědu",
        body: "Stiskněte 💡 pro nápovědu k dnešnímu slovu. Neprozradí odpověď, ale pomůže.",
      },
      {
        title: "Žlutá není zelená",
        body: "Zelená = správné písmeno na správném místě. Žlutá = písmeno je ve slově, ale jinde.",
      },
      {
        title: "Vyhněte se šedým písmenům",
        body: "Šedá písmena ve slově nejsou. Vyhněte se jim, abyste rychleji zkoušeli jiná.",
      },
      {
        title: "Pozor na háčky a čárky",
        body: "Á, Č, Ď, É, Ě, Í, Ň, Ó, Ř, Š, Ť, Ú, Ů, Ý, Ž — zkuste varianty, pokud je písmeno žluté nebo zelené.",
      },
      {
        title: "Trénujte v tréninkovém režimu",
        body: "Trénink nabízí neomezená náhodná slova bez vlivu na denní statistiky.",
      },
    ],
    faqItems: [
      {
        q: "Co je Hádanka dne?",
        a: "Bezplatná denní slovní hra v češtině. Uhodněte pětipísmenné slovo v šesti pokusech. Každý den nová hádanka.",
      },
      {
        q: "Kolik mám pokusů?",
        a: "Šest pokusů na hádanku. Každý musí být platné pětipísmenné slovo ze slovníku.",
      },
      {
        q: "Je jen jedna hádanka denně?",
        a: "Ano. Všichni dostanou stejné denní slovo. Tréninkový režim umožňuje neomezené cvičení.",
      },
      {
        q: "Co znamenají barvy polí?",
        a: "Zelená: správné písmeno, správné místo. Žlutá: správné písmeno, špatné místo. Šedá: písmeno ve slově není.",
      },
      {
        q: "Jak fungují nápovědy?",
        a: "Stiskněte 💡 pro krátkou nápovědu k dnešnímu slovu. Každé slovo ji má.",
      },
      {
        q: "Mohu sdílet svůj výsledek?",
        a: "Ano. Po vyřešení použijte WhatsApp, Facebook, Instagram, X nebo Viber.",
      },
      {
        q: "Kdy se hádanka mění?",
        a: "Nová hádanka o půlnoci podle GMT+2.",
      },
    ],
  },
  sv: {
    selectLanguage: "Välj språk",
    primaryLanguages: "Huvud",
    balkanLanguages: "Balkanspråk",
    europeanLanguages: "Europeiska språk",
    playNow: "Spela nu",
    comingSoon: "Kommer snart",
    scrollToGame: "Scrolla upp till dagens pussel",
    bestTips: "Bästa tipsen",
    faq: "Vanliga frågor",
    tips: [
      {
        title: "Börja med vanliga vokaler",
        body: "Prova ett första ord med A, E, I, O eller U — de förekommer ofta på svenska.",
      },
      {
        title: "Använd ledtråden smart",
        body: "Tryck 💡 för en ledtråd om dagens ord. Den avslöjar inte svaret men hjälper.",
      },
      {
        title: "Gult är inte grönt",
        body: "Grönt = rätt bokstav på rätt plats. Gult = bokstaven finns men på annan plats.",
      },
      {
        title: "Undvik grå bokstäver",
        body: "Grå bokstäver finns inte i ordet. Hoppa över dem för att testa nya snabbare.",
      },
      {
        title: "Tänk på Å, Ä och Ö",
        body: "Om en bokstav blir gul eller grön, prova varianter med svenska tecken.",
      },
      {
        title: "Öva i träningsläge",
        body: "Träning ger obegränsade slumpord utan att påverka daglig statistik.",
      },
    ],
    faqItems: [
      {
        q: "Vad är Dagens pussel?",
        a: "Ett gratis dagligt ordspel på svenska. Gissa det fem bokstäver långa ordet på sex försök. Nytt pussel varje dag.",
      },
      {
        q: "Hur många gissningar får jag?",
        a: "Sex försök per pussel. Varje gissning måste vara ett giltigt ord på fem bokstäver.",
      },
      {
        q: "Finns det bara ett pussel per dag?",
        a: "Ja. Alla får samma dagliga ord. Träningsläge låter dig öva utan gräns.",
      },
      {
        q: "Vad betyder rutornas färger?",
        a: "Grönt: rätt bokstav, rätt plats. Gult: rätt bokstav, fel plats. Grått: bokstaven finns inte.",
      },
      {
        q: "Hur fungerar ledtrådar?",
        a: "Tryck 💡 för en kort ledtråd om dagens ord. Varje ord har en.",
      },
      {
        q: "Kan jag dela mitt resultat?",
        a: "Ja. Efter att du löst det, använd WhatsApp, Facebook, Instagram, X eller Viber.",
      },
      {
        q: "När byts pusslet?",
        a: "Nytt pussel vid midnatt GMT+2.",
      },
    ],
  },
  hu: {
    selectLanguage: "Válassz nyelvet",
    primaryLanguages: "Fő",
    balkanLanguages: "Balkáni nyelvek",
    europeanLanguages: "Európai nyelvek",
    playNow: "Játék most",
    comingSoon: "Hamarosan",
    scrollToGame: "Görgess fel a mai rejtvényhez",
    bestTips: "Legjobb tippek",
    faq: "Gyakori kérdések",
    tips: [
      {
        title: "Kezdj gyakori magánhangzókkal",
        body: "Próbálj egy első szót A, E, I, O vagy U betűkkel — ezek gyakoriak a magyarban.",
      },
      {
        title: "Használd okosan a segítséget",
        body: "Nyomd meg a 💡 gombot a mai szóhoz. Nem adja meg a választ, de segít.",
      },
      {
        title: "A sárga nem zöld",
        body: "Zöld = jó betű, jó helyen. Sárga = a betű benne van, de máshol.",
      },
      {
        title: "Kerüld a szürke betűket",
        body: "A szürke betűk nincsenek a szóban. Hagyd ki őket, hogy gyorsabban tesztelj újat.",
      },
      {
        title: "Figyelj az ékezetekre",
        body: "Ha egy betű sárga vagy zöld, próbáld az Á, É, Í, Ó, Ö, Ő, Ú, Ü, Ű változatokat.",
      },
      {
        title: "Gyakorolj edzés módban",
        body: "Az edzés korlátlan véletlenszerű szavakat ad, anélkül hogy befolyásolná a napi statisztikát.",
      },
    ],
    faqItems: [
      {
        q: "Mi a Mai rejtvény?",
        a: "Ingyenes napi szójáték magyarul. Találd ki az ötbetűs szót hat próbálkozás alatt. Minden nap új rejtvény.",
      },
      {
        q: "Hány próbálkozásom van?",
        a: "Hat próbálkozás rejtvényenként. Minden tipp érvényes ötbetűs szó kell legyen.",
      },
      {
        q: "Csak egy rejtvény van naponta?",
        a: "Igen. Mindenki ugyanazt a napi szót kapja. Az edzés mód korlátlan gyakorlást ad.",
      },
      {
        q: "Mit jelentenek a mezők színei?",
        a: "Zöld: jó betű, jó helyen. Sárga: jó betű, rossz helyen. Szürke: a betű nincs a szóban.",
      },
      {
        q: "Hogyan működnek a segítségek?",
        a: "Nyomd meg a 💡 gombot egy rövid segítségért a mai szóról. Minden szónak van egy.",
      },
      {
        q: "Megoszthatom az eredményemet?",
        a: "Igen. Megoldás után használd a WhatsAppot, Facebookot, Instagramot, X-et vagy Vibert.",
      },
      {
        q: "Mikor váltódik a rejtvény?",
        a: "Új rejtvény éjfélkor GMT+2 szerint.",
      },
    ],
  },
  uk: {
    selectLanguage: "Оберіть мову",
    primaryLanguages: "Основні",
    balkanLanguages: "Балканські мови",
    europeanLanguages: "Європейські мови",
    playNow: "Грати зараз",
    comingSoon: "Незабаром",
    scrollToGame: "Прокрутіть до загадки дня",
    bestTips: "Найкращі поради",
    faq: "Часті питання",
    tips: [
      {
        title: "Почніть із поширених голосних",
        body: "Спробуйте перше слово з А, Е, И, О або У — вони часто зустрічаються в українській мові.",
      },
      {
        title: "Розумно використовуйте підказку",
        body: "Натисніть 💡 для підказки до сьогоднішнього слова. Вона не дає відповідь, але допомагає.",
      },
      {
        title: "Жовте — не зелене",
        body: "Зелене = правильна літера на місці. Жовте = літера є в слові, але в іншому місці.",
      },
      {
        title: "Уникайте сірих літер",
        body: "Сірі літери відсутні в слові. Пропускайте їх, щоб швидше перевіряти нові.",
      },
      {
        title: "Звертайте увагу на Ї та Ґ",
        body: "Якщо літера жовта або зелена, спробуйте варіанти з українськими літерами Ї, Ґ, Є.",
      },
      {
        title: "Тренуйтеся в режимі тренування",
        body: "Тренування дає необмежені випадкові слова без впливу на денну статистику.",
      },
    ],
    faqItems: [
      {
        q: "Що таке Загадка дня?",
        a: "Безкоштовна щоденна гра в слова українською. Вгадайте п'ятилітерне слово за шість спроб. Нова загадка щодня.",
      },
      {
        q: "Скільки спроб я маю?",
        a: "Шість спроб на загадку. Кожна здогадка має бути дійсним п'ятилітерним словом.",
      },
      {
        q: "Чи лише одна загадка на день?",
        a: "Так. Усі отримують одне й те саме слово дня. Режим тренування дозволяє практикуватися без обмежень.",
      },
      {
        q: "Що означають кольори клітинок?",
        a: "Зелений: правильна літера, правильне місце. Жовтий: правильна літера, неправильне місце. Сірий: літери немає в слові.",
      },
      {
        q: "Як працюють підказки?",
        a: "Натисніть 💡 для короткої підказки до сьогоднішнього слова. Кожне слово має підказку.",
      },
      {
        q: "Чи можу я поділитися результатом?",
        a: "Так. Після розгадки використовуйте WhatsApp, Facebook, Instagram, X або Viber.",
      },
      {
        q: "Коли змінюється загадка?",
        a: "Нова загадка опівночі за GMT+2.",
      },
    ],
  },
};

export function getSiteContent(locale: SiteLocale): SiteContent {
  return CONTENT[locale];
}
