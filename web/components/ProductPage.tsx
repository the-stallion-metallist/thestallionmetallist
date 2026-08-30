import { getProduct, products } from "@/lib/products";
import { site } from "@/lib/content";
import { productPageJsonLd } from "@/lib/jsonld";
import PageHero from "./PageHero";
import FaqList from "./FaqList";

export default function ProductPage({ slug }: { slug: string }) {
  const p = getProduct(slug);
  const others = products.filter((x) => x.slug !== slug);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productPageJsonLd(p)) }}
      />

      <PageHero
        eyebrow={p.eyebrow}
        h1={p.h1}
        sub={p.intro}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Non-ferrous scrap", href: "/non-ferrous-scrap" },
          { label: p.metal },
        ]}
      >
        <a className="btn btn-primary" href="/contact">Request a quote <span className="circ">→</span></a>
        <a className="btn btn-ghost" href="/non-ferrous-scrap">All grades</a>
      </PageHero>

      <section className="pp">
        <div className="wrap">
          {/* Grades */}
          <div className="pp-head">
            <span className="eyebrow">Grades we supply</span>
            <h2>{p.metal} grades</h2>
          </div>
          <div className="pp-grid">
            {p.grades.map((g) => (
              <div className="pp-card" key={g.name}>
                <h3>{g.name}</h3>
                <ul>
                  {g.specs.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Applications */}
          <div className="pp-head pp-mt">
            <span className="eyebrow">Where it is used</span>
            <h2>Applications</h2>
          </div>
          <div className="pp-chips">
            {p.applications.map((a) => (
              <span className="pp-chip" key={a}>{a}</span>
            ))}
          </div>

          {/* Sourcing */}
          <div className="pp-head pp-mt">
            <span className="eyebrow">Sourcing &amp; logistics</span>
            <h2>How we deliver it</h2>
          </div>
          <p className="lead">{p.sourcing}</p>
          <div className="pp-facts">
            <div><b>Sourcing</b><span>UAE · China · Europe · N. America</span></div>
            <div><b>Ports cleared</b><span>Mundra · Kandla · JNPT</span></div>
            <div><b>Payment</b><span>LC at sight · T/T</span></div>
          </div>

          {/* FAQ */}
          <div className="pp-head pp-mt">
            <span className="eyebrow">Questions</span>
            <h2>{p.metal} scrap FAQ</h2>
          </div>
          <FaqList items={p.faqs} />

          {/* Other grades (internal links) */}
          <div className="pp-head pp-mt">
            <span className="eyebrow">More non-ferrous</span>
            <h2>Other grades</h2>
          </div>
          <div className="pp-others">
            {others.map((o) => (
              <a className="pp-other" href={`/${o.slug}`} key={o.slug}>
                <span>{o.metal}</span>
                <span className="pp-arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="pp-cta">
            <h2>Need {p.metal.toLowerCase()} scrap?</h2>
            <p>Tell us the grade, quantity and destination and we will come back with terms.</p>
            <div className="pp-cta-row">
              <a className="btn btn-primary" href="/contact">Request a quote <span className="circ">→</span></a>
              <a className="btn btn-ghost" href={`mailto:${site.email}`}>Email us</a>
              <a className="btn btn-ghost" href={`tel:${site.phoneHref}`}>{site.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .pp { padding: clamp(3.4rem, 8vw, 6rem) 0; }
        .pp-head { margin-bottom: 1.6rem; }
        .pp-head .eyebrow { margin-bottom: 0.9rem; }
        .pp-head h2 { font-size: clamp(1.7rem, 3.4vw, 2.5rem); }
        .pp-mt { margin-top: clamp(3rem, 6vw, 4.6rem); }
        .pp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.1rem; }
        .pp-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r);
          padding: 1.5rem 1.6rem; }
        .pp-card h3 { font-size: 1.2rem; margin-bottom: 0.9rem; }
        .pp-card ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
        .pp-card li { position: relative; padding-left: 1.2rem; color: var(--ink-soft); font-size: 0.98rem; }
        .pp-card li::before { content: ""; position: absolute; left: 0; top: 0.6em; width: 6px; height: 6px;
          border-radius: 50%; background: var(--copper); }
        .pp-chips { display: flex; flex-wrap: wrap; gap: 0.7rem; }
        .pp-chip { background: var(--copper-tt2); color: var(--copper-dk); border: 1px solid var(--line);
          padding: 0.6rem 1.1rem; border-radius: 50px; font-weight: 600; font-size: 0.92rem; }
        .pp-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem;
          margin-top: 1.6rem; }
        .pp-facts > div { background: var(--paper-2); border-radius: var(--r-sm); padding: 1.1rem 1.3rem;
          display: flex; flex-direction: column; gap: 0.3rem; }
        .pp-facts b { font-family: var(--f-body); font-size: 0.74rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--copper); }
        .pp-facts span { color: var(--ink); font-weight: 600; }
        .pp-others { display: flex; flex-wrap: wrap; gap: 0.8rem; }
        .pp-other { display: inline-flex; align-items: center; gap: 0.7rem; text-decoration: none;
          background: var(--card); border: 1px solid var(--line); border-radius: 50px;
          padding: 0.75rem 1.3rem; color: var(--ink); font-weight: 600; transition: border-color .2s, color .2s; }
        .pp-other:hover { border-color: var(--copper); color: var(--copper); }
        .pp-arrow { color: var(--copper); }
        .pp-cta { margin-top: clamp(3.4rem, 7vw, 5.5rem); background: var(--char); color: var(--on-char);
          border-radius: var(--r-lg); padding: clamp(2.2rem, 5vw, 3.4rem); }
        .pp-cta h2 { color: var(--on-char); font-size: clamp(1.7rem, 3.6vw, 2.6rem); }
        .pp-cta p { color: var(--on-char-mut); margin-top: 0.7rem; max-width: 52ch; }
        .pp-cta-row { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.6rem; }
        .pp-cta-row .btn-ghost { color: var(--on-char); border-color: rgba(243,237,228,0.28); }
        .pp-cta-row .btn-ghost:hover { color: var(--copper-lit); border-color: var(--copper-lit); }
      `}</style>
    </>
  );
}
