export type LanguageRegion = "primary" | "balkan" | "european";

export interface GameLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  countryCode: string;
  region: LanguageRegion;
  available: boolean;
}

export const GAME_LANGUAGES: GameLanguage[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", countryCode: "gb", region: "primary", available: true },
  { code: "mk", name: "Macedonian", nativeName: "Македонски", flag: "🇲🇰", countryCode: "mk", region: "balkan", available: true },
  { code: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸", countryCode: "rs", region: "balkan", available: true },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷", countryCode: "hr", region: "balkan", available: true },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski", flag: "🇧🇦", countryCode: "ba", region: "balkan", available: true },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮", countryCode: "si", region: "balkan", available: true },
  { code: "sq", name: "Albanian", nativeName: "Shqip", flag: "🇦🇱", countryCode: "al", region: "balkan", available: true },
  { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬", countryCode: "bg", region: "balkan", available: true },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", countryCode: "gr", region: "balkan", available: true },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴", countryCode: "ro", region: "balkan", available: true },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", countryCode: "de", region: "european", available: true },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", countryCode: "fr", region: "european", available: true },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", countryCode: "es", region: "european", available: true },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", countryCode: "it", region: "european", available: true },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", countryCode: "pt", region: "european", available: true },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", countryCode: "nl", region: "european", available: true },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", countryCode: "pl", region: "european", available: true },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿", countryCode: "cz", region: "european", available: true },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", countryCode: "se", region: "european", available: true },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺", countryCode: "hu", region: "european", available: true },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", countryCode: "ua", region: "european", available: true },
];

export const LANGUAGES_BY_REGION: Record<LanguageRegion, GameLanguage[]> = {
  primary: GAME_LANGUAGES.filter((l) => l.region === "primary"),
  balkan: GAME_LANGUAGES.filter((l) => l.region === "balkan"),
  european: GAME_LANGUAGES.filter((l) => l.region === "european"),
};
