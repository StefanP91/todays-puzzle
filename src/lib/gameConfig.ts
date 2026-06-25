import type { GameLangCode } from "./gameLanguage";

export const KEYBOARD_ROWS_MK = [
  ["Љ", "Њ", "Е", "Р", "Т", "Ѕ", "У", "И", "О", "П", "Ш"],
  ["А", "С", "Д", "Ф", "Г", "Х", "Ј", "К", "Л", "Ч", "Ќ"],
  ["В", "З", "Џ", "Ц", "Ж", "Б", "Н", "М", "Ѓ"],
] as const;

export const KEYBOARD_ROWS_EN = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
] as const;

export const KEYBOARD_ROWS_SR = [
  ["Љ", "Њ", "Е", "Р", "Т", "З", "У", "И", "О", "П", "Ш"],
  ["А", "С", "Д", "Ф", "Г", "Х", "Ј", "К", "Л", "Ч", "Ћ"],
  ["Ц", "В", "Б", "Н", "М", "Ђ", "Џ"],
] as const;

export const KEYBOARD_ROWS_HR = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Š", "Đ"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Č", "Ć"],
  ["Y", "X", "C", "V", "B", "N", "M", "Ž"],
] as const;

export const KEYBOARD_ROWS_SL = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Š"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Č", "Ž"],
  ["Y", "X", "C", "V", "B", "N", "M"],
] as const;

export const KEYBOARD_ROWS_SQ = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Ç"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ë"],
  ["Z", "X", "C", "V", "B", "N", "M"],
] as const;

export const KEYBOARD_ROWS_BG = [
  ["Й", "Ц", "У", "К", "Е", "Н", "Г", "Ш", "Щ", "З", "Х", "Ъ"],
  ["Ф", "В", "А", "П", "Р", "О", "Л", "Д", "Ж", "Ь"],
  ["Я", "Ч", "Ц", "С", "М", "И", "Т", "Б", "Ю"],
] as const;

export const KEYBOARD_ROWS_EL = [
  ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ"],
  ["Μ", "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ"],
  ["Χ", "Ψ", "Ω"],
] as const;

export const KEYBOARD_ROWS_RO = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ș", "Ț"],
  ["Z", "X", "C", "V", "B", "N", "M", "Ă", "Â", "Î"],
] as const;

export const KEYBOARD_ROWS_DE = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä"],
  ["Y", "X", "C", "V", "B", "N", "M", "ß"],
] as const;

export const KEYBOARD_ROWS_FR = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["W", "X", "C", "V", "B", "N", "É", "È", "Ç", "À", "Ù"],
] as const;

export const KEYBOARD_ROWS_ES = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["Z", "X", "C", "V", "B", "N", "M", "Á", "É", "Í", "Ó", "Ú"],
] as const;

export const KEYBOARD_ROWS_IT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "À", "È", "É", "Ì", "Ò", "Ù"],
] as const;

export const KEYBOARD_ROWS_NL = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
] as const;

export const KEYBOARD_ROWS_PT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
  ["Z", "X", "C", "V", "B", "N", "M", "Á", "Ã", "É", "Í", "Ó", "Ú"],
] as const;

export const KEYBOARD_ROWS_PL = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ł"],
  ["Z", "X", "C", "V", "B", "N", "M", "Ą", "Ć", "Ę", "Ń", "Ó", "Ś", "Ź", "Ż"],
] as const;

export const KEYBOARD_ROWS_CS = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ů"],
  ["Y", "X", "C", "V", "B", "N", "M", "Ř", "Š", "Č", "Ž"],
  ["Á", "Ď", "É", "Ě", "Í", "Ň", "Ó", "Ť", "Ú", "Ý"],
] as const;

export const KEYBOARD_ROWS_SV = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Å"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä"],
  ["Z", "X", "C", "V", "B", "N", "M"],
] as const;

export const KEYBOARD_ROWS_HU = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Í", "Y", "X", "C", "V", "B", "N", "M", "Á", "É", "Ó", "Ö", "Ő", "Ú", "Ü", "Ű"],
] as const;

export const KEYBOARD_ROWS_UK = [
  ["Й", "Ц", "У", "К", "Е", "Н", "Г", "Ш", "Щ", "З", "Х", "Ї"],
  ["Ф", "І", "В", "А", "П", "Р", "О", "Л", "Д", "Ж", "Є"],
  ["Ґ", "Я", "Ч", "С", "М", "И", "Т", "Ь", "Б", "Ю"],
] as const;

export type KeyboardRows = readonly (readonly string[])[];

export interface GameLangConfig {
  code: GameLangCode;
  keyboardRows: KeyboardRows;
  shareSiteLabel: string;
}

const CONFIG: Record<GameLangCode, GameLangConfig> = {
  mk: {
    code: "mk",
    keyboardRows: KEYBOARD_ROWS_MK,
    shareSiteLabel: "deneshnazagatka.mk",
  },
  en: {
    code: "en",
    keyboardRows: KEYBOARD_ROWS_EN,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  sr: {
    code: "sr",
    keyboardRows: KEYBOARD_ROWS_SR,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  hr: {
    code: "hr",
    keyboardRows: KEYBOARD_ROWS_HR,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  bs: {
    code: "bs",
    keyboardRows: KEYBOARD_ROWS_HR,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  sl: {
    code: "sl",
    keyboardRows: KEYBOARD_ROWS_SL,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  sq: {
    code: "sq",
    keyboardRows: KEYBOARD_ROWS_SQ,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  bg: {
    code: "bg",
    keyboardRows: KEYBOARD_ROWS_BG,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  el: {
    code: "el",
    keyboardRows: KEYBOARD_ROWS_EL,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  ro: {
    code: "ro",
    keyboardRows: KEYBOARD_ROWS_RO,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  de: {
    code: "de",
    keyboardRows: KEYBOARD_ROWS_DE,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  fr: {
    code: "fr",
    keyboardRows: KEYBOARD_ROWS_FR,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  es: {
    code: "es",
    keyboardRows: KEYBOARD_ROWS_ES,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  it: {
    code: "it",
    keyboardRows: KEYBOARD_ROWS_IT,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  pt: {
    code: "pt",
    keyboardRows: KEYBOARD_ROWS_PT,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  nl: {
    code: "nl",
    keyboardRows: KEYBOARD_ROWS_NL,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  pl: {
    code: "pl",
    keyboardRows: KEYBOARD_ROWS_PL,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  cs: {
    code: "cs",
    keyboardRows: KEYBOARD_ROWS_CS,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  sv: {
    code: "sv",
    keyboardRows: KEYBOARD_ROWS_SV,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  hu: {
    code: "hu",
    keyboardRows: KEYBOARD_ROWS_HU,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
  uk: {
    code: "uk",
    keyboardRows: KEYBOARD_ROWS_UK,
    shareSiteLabel: "today-puzzle.netlify.app",
  },
};

export function getGameConfig(lang: GameLangCode): GameLangConfig {
  return CONFIG[lang];
}

export function getKeyboardRows(lang: GameLangCode): KeyboardRows {
  return CONFIG[lang].keyboardRows;
}
