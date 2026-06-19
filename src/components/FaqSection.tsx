import { useState } from "react";
import type { SiteContent } from "../lib/siteContent";

interface FaqSectionProps {
  content: SiteContent;
}

export default function FaqSection({ content }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="landing-section landing-section--last" id="faq">
      <h2 className="landing-section-title">{content.faq}</h2>
      <div className="landing-faq-list">
        {content.faqItems.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q} className="landing-faq-item">
              <button
                type="button"
                className="landing-faq-question"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className="landing-faq-chevron" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && <p className="landing-faq-answer">{item.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
