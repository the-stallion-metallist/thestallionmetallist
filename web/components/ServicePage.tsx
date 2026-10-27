import SiteFrame from "@/components/SiteFrame";
import PageHero from "@/components/PageHero";
import FaqList from "@/components/FaqList";
import { site } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { AREAS, WHATSAPP_CA, WHATSAPP_IN, type ServiceData, type ServiceLink } from "@/lib/services";
import { RATES_AS_OF } from "@/lib/rates";

/**
 * One collection-service page (cans, PET bottles, venues). Same look as the rest
 * of the site; the words live in lib/services.ts. Structured data is built from
 * the same data so the markup always matches what visitors read.
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

export default function ServicePage({ d }: { d: ServiceData }) {
  const url = `${site.url}/${d.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: d.crumb, path: `/${d.slug}` },
      ]),
      {
        "@type": "Service",
        name: d.schemaName,
        serviceType: d.serviceType,
        description: d.description,
        url,
        provider: { "@id": `${site.url}/#organization` },
        areaServed: { "@type": "City", name: "Dehradun" },
        ...(d.offer
          ? { offers: { "@type": "Offer", price: "0", priceCurrency: "INR", description: d.offer } }
          : {}),
      },
      {
        "@type": "WebPage",
        name: d.h1,
        url,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#organization` },
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
        crumbs={[{ label: "Home", href: "/" }, { label: d.crumb }]}
      >
        <Cta link={d.cta.primary} kind="btn-primary" />
        <Cta link={d.cta.secondary} kind="btn-ghost" />
      </PageHero>

      <section className="sv">
        <div className="wrap">
          <div className="sv-intro">
            {d.intro.map((p) => (
              <p className="lead" key={p}>{p}</p>
            ))}
          </div>

          {d.rates && (
            <div className="sv-block">
              <h2>{d.rates.heading}</h2>
              <dl className="sv-rates">
                {d.rates.rows.map((r) => (
                  <div className="sv-rate" key={r.item}>
                    <dt>
                      {r.item}
                      <span>{r.note}</span>
                    </dt>
                    <dd>{r.rate}</dd>
                  </div>
                ))}
              </dl>
              <p className="sv-asof">Rates last updated {RATES_AS_OF}.</p>
            </div>
          )}

          <div className="sv-block">
            <h2>{d.stepsHeading}</h2>
            <ol className="sv-steps">
              {d.steps.map((s, i) => (
                <li className="sv-step" key={s.title}>
                  <span className="sv-n" aria-hidden="true">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="sv-lists">
            {d.lists.map((l) => (
              <div key={l.title}>
                <h2 className="sv-sm">{l.title}</h2>
                <ul className="sv-list">
                  {l.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="sv-block">
            <h2>Where we collect in Dehradun</h2>
            <p className="sv-areas">
              We collect across Dehradun, including {AREAS}. If your area is not listed, message us and we will tell
              you when we can reach it.
            </p>
          </div>

          {d.hindi && (
            <div className="sv-block sv-hi" lang="hi">
              <h2 lang="hi">{d.hindi.heading}</h2>
              {d.hindi.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}

          <div className="sv-block">
            <h2>{d.faqHeading}</h2>
            <FaqList items={d.faqs} />
          </div>

          <div className="sv-block">
            <h2>More ways to sell with us</h2>
            <ul className="sv-rel">
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

          <div className="sv-cta">
            <h2>{d.cta.heading}</h2>
            <p>{d.cta.sub}</p>
            <div className="sv-cta-row">
              <Cta link={d.cta.primary} kind="btn-primary" />
              <Cta link={d.cta.secondary} kind="btn-ghost" />
            </div>
            <div className="sv-cta-note">
              <span>Message us on WhatsApp:</span>
              <a href={WHATSAPP_IN} target="_blank" rel="noopener noreferrer">India +91 99973 48394</a>
              <a href={WHATSAPP_CA} target="_blank" rel="noopener noreferrer">Canada +1 (587) 893-3420</a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .sv { padding: clamp(3rem, 7vw, 5rem) 0 clamp(3.4rem, 8vw, 6rem); }
        .sv h2 { font-size: clamp(1.7rem, 3.4vw, 2.4rem); margin: 0 0 1.3rem; text-wrap: balance; }
        /* Clash Display's narrow spaces collapse at phone sizes under the global tight tracking. */
        .sv h2, .sv h3 { word-spacing: 0.1em; }
        .sv-intro { max-width: 68ch; display: flex; flex-direction: column; gap: 1.1rem; }
        .sv-block { margin-top: clamp(3rem, 6vw, 4.8rem); }

        .sv-rates { margin: 0; border-top: 1px solid var(--line); }
        .sv-rate { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between;
          gap: 0.3rem 1.5rem; padding: 1.15rem 0; border-bottom: 1px solid var(--line); }
        .sv-rate dt { font-family: var(--f-disp); font-weight: 600; font-size: 1.2rem; word-spacing: 0.1em; }
        .sv-rate dt span { display: block; margin-top: 0.15rem; font-family: var(--f-body); font-weight: 400;
          font-size: 0.95rem; color: var(--ink-soft); word-spacing: 0; }
        .sv-rate dd { margin: 0; font-family: var(--f-disp); font-weight: 700; font-size: clamp(1.5rem, 3.4vw, 1.9rem);
          color: var(--copper-dk); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .sv-asof { margin: 0.9rem 0 0; font-size: 0.9rem; color: var(--ink-soft); }

        .sv-steps { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
        .sv-step { display: grid; grid-template-columns: 2.4rem 1fr; column-gap: 1rem; align-items: baseline;
          padding: 1.2rem 0; border-bottom: 1px solid var(--line); }
        .sv-n { grid-row: 1 / span 2; font-family: var(--f-disp); font-weight: 700; font-size: 1.5rem;
          color: var(--copper); font-variant-numeric: tabular-nums; line-height: 1.2; }
        .sv-step h3 { font-size: 1.2rem; margin: 0 0 0.3rem; }
        .sv-step p { margin: 0; color: var(--ink-soft); line-height: 1.6; max-width: 60ch; }
        @media (min-width: 860px) {
          .sv-step { grid-template-columns: 3.2rem minmax(0, 17rem) 1fr; align-items: baseline; padding: 1.35rem 0; }
          .sv-n { grid-row: auto; }
          .sv-step h3 { margin: 0; }
        }

        .sv-lists { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.8rem 3rem;
          margin-top: clamp(3rem, 6vw, 4.8rem); padding: clamp(1.5rem, 3vw, 2.2rem);
          background: var(--paper-2); border-radius: var(--r); }
        .sv .sv-sm { font-size: 1.25rem; margin: 0 0 0.9rem; }
        .sv-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.65rem; }
        .sv-list li { position: relative; padding-left: 1.3rem; color: var(--ink-soft); line-height: 1.5; }
        .sv-list li::before { content: ""; position: absolute; left: 0; top: 0.68em; width: 0.6rem; height: 2px;
          background: var(--copper); }

        .sv-areas { max-width: 68ch; color: var(--ink-soft); line-height: 1.7; margin: 0; }

        .sv-hi { border-top: 1px solid var(--line); padding-top: clamp(1.8rem, 3.4vw, 2.6rem); max-width: 68ch; }
        .sv-hi h2, .sv-hi p { font-family: var(--f-body), "Noto Sans Devanagari", "Nirmala UI", "Kohinoor Devanagari", sans-serif; }
        .sv-hi h2 { font-weight: 700; line-height: 1.35; letter-spacing: 0; font-size: clamp(1.45rem, 2.9vw, 2rem); }
        .sv-hi p { margin: 0 0 0.9rem; color: var(--ink-soft); line-height: 1.8; }

        .sv-rel { list-style: none; margin: 0; padding: 0; display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); column-gap: 2.4rem; border-top: 1px solid var(--line); }
        .sv-rel a { display: flex; flex-direction: column; gap: 0.2rem; padding: 1.1rem 0;
          border-bottom: 1px solid var(--line); text-decoration: none; color: var(--ink); min-height: 44px; }
        .sv-rel b { font-family: var(--f-disp); font-weight: 600; font-size: 1.12rem; transition: color .2s; }
        .sv-rel span { color: var(--ink-soft); font-size: 0.95rem; }
        .sv-rel a:hover b { color: var(--copper); }
        .sv-rel a:focus-visible { outline: 2px solid var(--copper); outline-offset: 3px; border-radius: 4px; }

        .sv-cta { margin-top: clamp(3.4rem, 7vw, 5.5rem); background: var(--char); color: var(--on-char);
          border-radius: var(--r-lg); padding: clamp(2.2rem, 5vw, 3.4rem); }
        .sv .sv-cta h2 { color: var(--on-char); font-size: clamp(1.7rem, 3.6vw, 2.6rem); margin: 0; }
        .sv-cta p { color: var(--on-char-mut); margin: 0.6rem 0 0; }
        .sv-cta-row { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.4rem; }
        .sv-cta-row .btn-ghost { color: var(--on-char); border-color: rgba(243,237,228,0.28); }
        .sv-cta-row .btn-ghost:hover { color: var(--copper-lit); border-color: var(--copper-lit); }
        .sv-cta-note { margin-top: 1rem; font-size: 0.92rem; line-height: 1.4; display: flex; flex-wrap: wrap;
          align-items: center; gap: 0 1.4rem; }
        .sv-cta-note span { color: var(--on-char-mut); }
        .sv-cta-note a { display: inline-block; color: var(--on-char); text-decoration: underline;
          text-decoration-color: rgba(243,237,228,0.35); text-underline-offset: 3px; padding-block: 0.55rem;
          white-space: nowrap; transition: color .2s, text-decoration-color .2s; }
        .sv-cta-note a:hover { color: var(--copper-lit); text-decoration-color: var(--copper-lit); }
        .sv-cta-note a:focus-visible { outline: 2px solid var(--copper-lit); outline-offset: 3px; border-radius: 4px; }
      `}</style>
    </SiteFrame>
  );
}
