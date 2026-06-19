export type LanguageRegion = "primary" | "balkan" | "european";

export interface GameLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: LanguageRegion;
  available: boolean;
}

export const GAME_LANGUAGES: GameLanguage[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", region: "primary", available: false },
  { code: "mk", name: "Macedonian", nativeName: "Македонски", flag: "🇲🇰", region: "balkan", available: true },
  { code: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸", region: "balkan", available: false },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷", region: "balkan", available: false },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski", flag: "🇧🇦", region: "balkan", available: false },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮", region: "balkan", available: false },
  { code: "sq", name: "Albanian", nativeName: "Shqip", flag: "🇦🇱", region: "balkan", available: false },
  { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬", region: "balkan", available: false },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", region: "balkan", available: false },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴", region: "balkan", available: false },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", region: "european", available: false },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", region: "european", available: false },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", region: "european", available: false },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", region: "european", available: false },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", region: "european", available: false },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", region: "european", available: false },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", region: "european", available: false },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿", region: "european", available: false },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", region: "european", available: false },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺", region: "european", available: false },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", region: "european", available: false },
];

export const LANGUAGES_BY_REGION: Record<LanguageRegion, GameLanguage[]> = {
  primary: GAME_LANGUAGES.filter((l) => l.region === "primary"),
  balkan: GAME_LANGUAGES.filter((l) => l.region === "balkan"),
  european: GAME_LANGUAGES.filter((l) => l.region === "european"),
};
