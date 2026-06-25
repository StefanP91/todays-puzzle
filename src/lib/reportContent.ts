import type { GameLangCode } from "./gameLanguage";

export interface ReportContent {
  button: string;
  title: string;
  hint: string;
  placeholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  tooShort: string;
  close: string;
}

const EN: ReportContent = {
  button: "Report a problem",
  title: "Report a problem",
  hint: "Describe what went wrong — a bug, wrong word, display issue, or anything else.",
  placeholder: "What happened?",
  emailLabel: "Email (optional)",
  emailPlaceholder: "you@example.com — if you want a reply",
  submit: "Send report",
  sending: "Sending…",
  success: "Thanks! Your report was sent.",
  error: "Could not send. Please try again later.",
  tooShort: "Please write at least a few words.",
  close: "Close",
};

const MK: ReportContent = {
  button: "Пријави проблем",
  title: "Пријави проблем",
  hint: "Опиши што ти се случи — грешка, погрешен збор, приказ на екранот или нешто друго.",
  placeholder: "Што се случи?",
  emailLabel: "Е-пошта (опционално)",
  emailPlaceholder: "ti@primer.com — ако сакаш одговор",
  submit: "Испрати",
  sending: "Се испраќа…",
  success: "Фала! Пријавата е испратена.",
  error: "Не успеа да се испрати. Обиди се повторно подоцна.",
  tooShort: "Напиши барем неколку зборови.",
  close: "Затвори",
};

const BY_LANG: Partial<Record<GameLangCode, ReportContent>> = {
  en: EN,
  mk: MK,
  sr: {
    ...EN,
    button: "Prijavi problem",
    title: "Prijavi problem",
    hint: "Opiši šta se desilo — greška, pogrešna reč, prikaz ili nešto drugo.",
    placeholder: "Šta se desilo?",
    emailLabel: "Email (opciono)",
    submit: "Pošalji",
    sending: "Šaljem…",
    success: "Hvala! Prijava je poslata.",
    error: "Slanje nije uspelo. Pokušaj ponovo kasnije.",
    tooShort: "Napiši bar nekoliko reči.",
    close: "Zatvori",
  },
  hr: {
    ...EN,
    button: "Prijavi problem",
    title: "Prijavi problem",
    hint: "Opiši što se dogodilo — greška, pogrešna riječ, prikaz ili nešto drugo.",
    placeholder: "Što se dogodilo?",
    emailLabel: "Email (opcionalno)",
    submit: "Pošalji",
    sending: "Šaljem…",
    success: "Hvala! Prijava je poslana.",
    error: "Slanje nije uspjelo. Pokušaj ponovno kasnije.",
    tooShort: "Napiši barem nekoliko riječi.",
    close: "Zatvori",
  },
  bs: {
    ...EN,
    button: "Prijavi problem",
    title: "Prijavi problem",
    hint: "Opiši šta se desilo — greška, pogrešna riječ, prikaz ili nešto drugo.",
    placeholder: "Šta se desilo?",
    emailLabel: "Email (opcionalno)",
    submit: "Pošalji",
    sending: "Šaljem…",
    success: "Hvala! Prijava je poslata.",
    error: "Slanje nije uspjelo. Pokušaj ponovo kasnije.",
    tooShort: "Napiši bar nekoliko riječi.",
    close: "Zatvori",
  },
};

export function getReportContent(lang: GameLangCode): ReportContent {
  return BY_LANG[lang] ?? EN;
}
