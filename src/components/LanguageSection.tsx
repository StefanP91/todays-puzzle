import type { GameLanguage } from "../lib/languages";
import { LANGUAGES_BY_REGION } from "../lib/languages";
import type { AuthContent } from "../lib/authContent";
import type { GameContent } from "../lib/gameContent";
import type { Stats } from "../lib/storage";
import type { SiteContent } from "../lib/siteContent";
import AccountSection from "./AccountSection";

interface LanguageSectionProps {
  content: SiteContent;
  activeCode: string;
  onSelect: (lang: GameLanguage) => void;
  authContent: AuthContent;
  gameContent: GameContent;
  stats: Stats;
}

function LanguageCard({
  lang,
  content,
  activeCode,
  onSelect,
}: {
  lang: GameLanguage;
  content: SiteContent;
  activeCode: string;
  onSelect: (lang: GameLanguage) => void;
}) {
  const isSelected = lang.code === activeCode;
  return (
    <button
      type="button"
      onClick={() => onSelect(lang)}
      className={`landing-lang-card ${lang.available ? "landing-lang-card--active" : ""} ${
        isSelected ? "landing-lang-card--selected" : ""
      }`}
    >
      <div className="landing-lang-head">
        <img
          className="landing-lang-flag"
          src={`https://flagcdn.com/w40/${lang.countryCode}.png`}
          srcSet={`https://flagcdn.com/w80/${lang.countryCode}.png 2x`}
          alt=""
          width={32}
          height={24}
          loading="lazy"
          decoding="async"
        />
        <span className="landing-lang-names">
          <span className="landing-lang-native">{lang.nativeName}</span>
          <span className="landing-lang-en">{lang.name}</span>
        </span>
      </div>
      <span
        className={`landing-lang-badge ${lang.available ? "landing-lang-badge--live" : ""}`}
      >
        {lang.available ? content.playNow : content.comingSoon}
      </span>
    </button>
  );
}

function LanguageGroup({
  title,
  languages,
  content,
  activeCode,
  onSelect,
}: {
  title: string;
  languages: GameLanguage[];
  content: SiteContent;
  activeCode: string;
  onSelect: (lang: GameLanguage) => void;
}) {
  return (
    <div className="landing-lang-group">
      <h3 className="landing-lang-group-title">{title}</h3>
      <div className="landing-lang-grid">
        {languages.map((lang) => (
          <LanguageCard
            key={lang.code}
            lang={lang}
            content={content}
            activeCode={activeCode}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default function LanguageSection({
  content,
  activeCode,
  onSelect,
  authContent,
  gameContent,
  stats,
}: LanguageSectionProps) {
  return (
    <section className="landing-section" id="languages">
      <h2 className="landing-section-title">{content.selectLanguage}</h2>
      <AccountSection
        authContent={authContent}
        gameContent={gameContent}
        stats={stats}
      />
      <LanguageGroup
        title={content.primaryLanguages}
        languages={LANGUAGES_BY_REGION.primary}
        content={content}
        activeCode={activeCode}
        onSelect={onSelect}
      />
      <LanguageGroup
        title={content.balkanLanguages}
        languages={LANGUAGES_BY_REGION.balkan}
        content={content}
        activeCode={activeCode}
        onSelect={onSelect}
      />
      <LanguageGroup
        title={content.europeanLanguages}
        languages={LANGUAGES_BY_REGION.european}
        content={content}
        activeCode={activeCode}
        onSelect={onSelect}
      />
    </section>
  );
}
