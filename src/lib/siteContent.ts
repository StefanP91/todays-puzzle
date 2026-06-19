export type SiteLocale = "en" | "mk";

const STORAGE_KEY = "todays-puzzle-site-locale";

export function loadSiteLocale(): SiteLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "mk") return saved;
  } catch {
    // ignore
  }
  return "en";
}

export function saveSiteLocale(locale: SiteLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
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
  localeToggle: string;
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
    localeToggle: "МК",
    tips: [
      {
        title: "Start with common vowels",
        body: "Try a first word with A, E, O or И — Macedonian words often use these sounds. Eliminate or confirm letters early.",
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
        body: "Macedonian has Ѓ, Ќ, Џ, Љ, Њ — if one appears yellow or green, try related forms in your next guess.",
      },
      {
        title: "Practice in training mode",
        body: "Use training for unlimited random words without affecting your daily stats. Great for learning the keyboard.",
      },
    ],
    faqItems: [
      {
        q: "What is Today's Puzzle?",
        a: "A free daily word game in Macedonian. Guess the five-letter word in six tries. A new puzzle is released every day.",
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
        a: "A new puzzle is available at midnight in the Europe/Skopje timezone.",
      },
      {
        q: "Will other languages be available?",
        a: "Macedonian is live now. English and more Balkan and European languages are planned — select your language above to see status.",
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
    localeToggle: "EN",
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
        a: "Нова загатка на полноќ по временската зона Europe/Skopje.",
      },
      {
        q: "Дали ќе има други јазици?",
        a: "Македонскиот е достапен сега. Англиски и други балкански и европски јазици се планирани.",
      },
    ],
  },
};

export function getSiteContent(locale: SiteLocale): SiteContent {
  return CONTENT[locale];
}
