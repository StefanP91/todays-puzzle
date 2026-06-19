import type { SiteContent } from "../lib/siteContent";

interface BestTipsSectionProps {
  content: SiteContent;
}

export default function BestTipsSection({ content }: BestTipsSectionProps) {
  return (
    <section className="landing-section" id="tips">
      <h2 className="landing-section-title">{content.bestTips}</h2>
      <ol className="landing-tips-list">
        {content.tips.map((tip, i) => (
          <li key={tip.title} className="landing-tip-item">
            <span className="landing-tip-num">{i + 1}</span>
            <div>
              <h3 className="landing-tip-title">{tip.title}</h3>
              <p className="landing-tip-body">{tip.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
