import { faqs } from "@/lib/faq";

/**
 * Visible FAQ section. Native <details>/<summary> so it works with zero JS and
 * is accessible. The same questions/answers feed the FAQPage schema in
 * lib/jsonld.ts, so the structured data always matches what's on screen.
 * Styling is scoped here to keep it self-contained.
 */
export default function Faq() {
  return (
    <section className="block faq-sec" id="faq">
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">Questions</span>
          <h2 className="metal" style={{ fontSize: "clamp(2rem,4.2vw,3.3rem)" }}>
            Frequently asked
          </h2>
        </div>
        <div className="faq-list reveal">
          {faqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>
                <span>{f.q}</span>
                <span className="faq-mark" aria-hidden="true">+</span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <style>{`
        .faq-sec { padding-top: 0; }
        .faq-list { max-width: 780px; margin: 2.4rem auto 0; }
        .faq-item {
          border-bottom: 1px solid color-mix(in srgb, var(--ink, #131417) 12%, transparent);
        }
        .faq-item > summary {
          list-style: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 1.2rem;
          padding: 1.25rem 0.2rem;
          font-family: var(--font-display, inherit);
          font-size: clamp(1.05rem, 2.1vw, 1.28rem);
          font-weight: 600; line-height: 1.35;
        }
        .faq-item > summary::-webkit-details-marker { display: none; }
        .faq-mark {
          flex: 0 0 auto; font-size: 1.5rem; line-height: 1;
          color: var(--copper, #8f613a);
          transition: transform .25s ease;
        }
        .faq-item[open] > summary .faq-mark { transform: rotate(45deg); }
        .faq-item > p {
          margin: 0 0 1.35rem; padding-right: 2rem;
          max-width: 68ch; color: var(--muted, #55606b);
          font-size: 1rem; line-height: 1.7;
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-mark { transition: none; }
        }
      `}</style>
    </section>
  );
}
