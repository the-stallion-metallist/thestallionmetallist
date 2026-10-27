import SiteFrame from "@/components/SiteFrame";
import PageHero from "@/components/PageHero";
import FaqList from "@/components/FaqList";
import { site } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { WHATSAPP_CA, WHATSAPP_IN, type ServiceLink } from "@/lib/services";
import type { GuideData } from "@/lib/guides";

/**
 * One how-to guide. Same look as the service pages; the words live in
 * lib/guides.ts. Structured data (Breadcrumb, Article, FAQ) is built from the
 * same data so the markup always matches what visitors read.
 */

function Cta({ link, kind }: { link: ServiceLink; kind: "btn-primary" | "btn-ghost" }) {
  const ext = link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a className={`btn ${kind}`} href={link.href} {...ext}>
      {link.label}
      {kind === "btn-primary" && <span className="circ">→</span>}
    </a>
  );
}

export default function GuidePage({ d }: { d: GuideData }) {
  const url = `${site.url}/${d.slug}`;
  const org = { "@id": `${site.url}/#organization` };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Guides", path: "/learn" },
        { name: d.crumb, path: `/${d.slug}` },
      ]),
      {
        "@type": "Article",
        headline: d.h1,
        description: d.description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: d.published,
        dateModified: d.published,
        author: org,
        publisher: org,
        image: `${url}/opengraph-image`,
        inLanguage: "en",
      },
      {
        "@type": "FAQPage",
        mainEntity: d.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <SiteFrame>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        h1={d.h1}
        sub={d.sub}
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides", href: "/learn" }, { label: d.crumb }]}
      />

      <article className="gd">
        <div className="wrap">
          <div className="gd-text">
            <p className="gd-meta">By The Stallion Metallist · Updated {d.updatedLabel}</p>
            <p className="lead gd-answer">
              <b>In short:</b> {d.answer}
            </p>

            {d.sections.map((s) => (
              <section className="gd-sec" key={s.heading}>
                <h2>{s.heading}</h2>
                {s.body?.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.list && (
                  <ul className="gd-list">
                    {s.list.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="gd-block">
            <h2>Common questions</h2>
            <FaqList items={d.faqs} />
          </div>

          {d.sources && d.sources.length > 0 && (
            <div className="gd-block">
              <h2>Sources</h2>
              <ul className="gd-src">
                {d.sources.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="gd-block">
            <h2>Next steps</h2>
            <ul className="gd-rel">
              {d.related.map((r) => (
                <li key={r.href}>
                  <a href={r.href}>
                    <b>{r.label}</b>
                    <span>{r.blurb}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="gd-cta">
            <h2>{d.cta.heading}</h2>
            <p>{d.cta.sub}</p>
            <div className="gd-cta-row">
              <Cta link={d.cta.primary} kind="btn-primary" />
              <Cta link={d.cta.secondary} kind="btn-ghost" />
            </div>
            <div className="gd-cta-note">
              <span>Message us on WhatsApp:</span>
              <a href={WHATSAPP_IN} target="_blank" rel="noopener noreferrer">India +91 99973 48394</a>
              <a href={WHATSAPP_CA} target="_blank" rel="noopener noreferrer">Canada +1 (587) 893-3420</a>
            </div>
          </div>
        </div>
      </article>

      <style>{`
        .gd { padding: clamp(3rem, 7vw, 5rem) 0 clamp(3.4rem, 8vw, 6rem); }
        .gd h2 { font-size: clamp(1.6rem, 3.2vw, 2.2rem); margin: 0 0 1.1rem; text-wrap: balance; word-spacing: 0.1em; }
        .gd-text { max-width: 68ch; }
        .gd-meta { margin: 0 0 1.2rem; font-size: 0.9rem; color: var(--ink-soft); }
        .gd-answer { margin: 0; color: var(--ink); }
        .gd-sec { margin-top: clamp(2.4rem, 5vw, 3.4rem); }
        .gd-sec p { margin: 0 0 1rem; color: var(--ink-soft); line-height: 1.75; font-size: 1.05rem; }
        .gd-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.7rem; }
        .gd-list li { position: relative; padding-left: 1.4rem; color: var(--ink-soft); line-height: 1.65; font-size: 1.05rem; }
        .gd-list li::before { content: ""; position: absolute; left: 0; top: 0.8em; width: 0.6rem; height: 2px; background: var(--copper); }

        .gd-block { margin-top: clamp(3rem, 6vw, 4.6rem); }
        .gd-src { list-style: none; margin: 0; padding: 0; max-width: 68ch; border-top: 1px solid var(--line); }
        .gd-src li { border-bottom: 1px solid var(--line); }
        .gd-src a { display: block; padding: 0.8rem 0; min-height: 44px; color: var(--ink-soft); font-size: 0.97rem;
          line-height: 1.45; text-decoration: none; transition: color .2s; overflow-wrap: anywhere; }
        .gd-src a:hover { color: var(--copper); }
        .gd-src a:focus-visible { outline: 2px solid var(--copper); outline-offset: 3px; border-radius: 4px; }
        .gd-rel { list-style: none; margin: 0; padding: 0; display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); column-gap: 2.4rem; border-top: 1px solid var(--line); }
        .gd-rel a { display: flex; flex-direction: column; gap: 0.2rem; padding: 1.1rem 0; min-height: 44px;
          border-bottom: 1px solid var(--line); text-decoration: none; color: var(--ink); }
        .gd-rel b { font-family: var(--f-disp); font-weight: 600; font-size: 1.12rem; word-spacing: 0.1em; transition: color .2s; }
        .gd-rel span { color: var(--ink-soft); font-size: 0.95rem; }
        .gd-rel a:hover b { color: var(--copper); }
        .gd-rel a:focus-visible { outline: 2px solid var(--copper); outline-offset: 3px; border-radius: 4px; }

        .gd-cta { margin-top: clamp(3.4rem, 7vw, 5.5rem); background: var(--char); color: var(--on-char);
          border-radius: var(--r-lg); padding: clamp(2.2rem, 5vw, 3.4rem); }
        .gd .gd-cta h2 { color: var(--on-char); font-size: clamp(1.7rem, 3.6vw, 2.6rem); margin: 0; }
        .gd-cta p { color: var(--on-char-mut); margin: 0.6rem 0 0; }
        .gd-cta-row { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.4rem; }
        .gd-cta-row .btn-ghost { color: var(--on-char); border-color: rgba(243,237,228,0.28); }
        .gd-cta-row .btn-ghost:hover { color: var(--copper-lit); border-color: var(--copper-lit); }
        .gd-cta-note { margin-top: 1rem; font-size: 0.92rem; line-height: 1.4; display: flex; flex-wrap: wrap;
          align-items: center; gap: 0 1.4rem; }
        .gd-cta-note span { color: var(--on-char-mut); }
        .gd-cta-note a { display: inline-block; color: var(--on-char); text-decoration: underline;
          text-decoration-color: rgba(243,237,228,0.35); text-underline-offset: 3px; padding-block: 0.55rem;
          white-space: nowrap; transition: color .2s, text-decoration-color .2s; }
        .gd-cta-note a:hover { color: var(--copper-lit); text-decoration-color: var(--copper-lit); }
        .gd-cta-note a:focus-visible { outline: 2px solid var(--copper-lit); outline-offset: 3px; border-radius: 4px; }
      `}</style>
    </SiteFrame>
  );
}
