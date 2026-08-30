import type { Metadata } from "next";
import SiteFrame from "@/components/SiteFrame";
import PageHero from "@/components/PageHero";
import { products } from "@/lib/products";
import { site } from "@/lib/content";
import { pageJsonLd } from "@/lib/jsonld";

const title = "Non-Ferrous Scrap Supplier in India | Aluminium, Copper, Brass, Stainless | The Stallion Metallist";
const description =
  "The Stallion Metallist supplies non-ferrous metal scrap (aluminium, copper, brass and stainless steel) to India's foundries, smelters and mills, sourced from vetted international exporters.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/non-ferrous-scrap" },
  openGraph: { title, description, url: "/non-ferrous-scrap", type: "website" },
};

export default function Page() {
  return (
    <SiteFrame>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd("Non-ferrous scrap", "/non-ferrous-scrap", [
            { name: "Non-ferrous scrap", path: "/non-ferrous-scrap" },
          ])),
        }}
      />

      <PageHero
        eyebrow="What we trade"
        h1="Non-ferrous scrap: aluminium, copper, brass and stainless"
        sub="We source a full range of non-ferrous grades from established exporters across the UAE, China, Europe and North America, and deliver them to India's foundries, smelters and mills."
        crumbs={[{ label: "Home", href: "/" }, { label: "Non-ferrous scrap" }]}
      >
        <a className="btn btn-primary" href="/contact">Request a quote <span className="circ">→</span></a>
      </PageHero>

      <section className="nf">
        <div className="wrap">
          <div className="nf-head">
            <span className="eyebrow">Grades</span>
            <h2>Choose a metal</h2>
          </div>
          <div className="nf-grid">
            {products.map((p) => (
              <a className="nf-card" href={`/${p.slug}`} key={p.slug}>
                {p.photos?.[0] ? (
                  <img className="nf-thumb" src={p.photos[0].src} alt={p.photos[0].alt} width={1400} height={1050} loading="lazy" />
                ) : (
                  <span className="nf-thumb nf-ph" aria-hidden="true">{p.metal}</span>
                )}
                <div className="nf-body">
                  <div className="nf-metal">{p.metal}</div>
                  <p>{p.grades.map((g) => g.name).join(", ")}</p>
                  <span className="nf-go">View grades <span aria-hidden="true">→</span></span>
                </div>
              </a>
            ))}
          </div>

          <div className="nf-head nf-mt">
            <span className="eyebrow">How we operate</span>
            <h2>Full-cycle trade</h2>
          </div>
          <div className="nf-steps">
            <div><b>01 · Source</b><span>Direct exporter relationships across four global markets.</span></div>
            <div><b>02 · Clear</b><span>Documentation and customs at Mundra, Kandla and JNPT.</span></div>
            <div><b>03 · Deliver</b><span>To recyclers, furnaces and mills across the Gujarat belt.</span></div>
            <div><b>04 · Settle</b><span>Structured terms: LC at sight and T/T.</span></div>
          </div>

          <div className="nf-cta">
            <h2>Looking for a specific grade?</h2>
            <p>Tell us the grade, quantity and destination and we will come back with terms.</p>
            <div className="nf-cta-row">
              <a className="btn btn-primary" href="/contact">Request a quote <span className="circ">→</span></a>
              <a className="btn btn-ghost" href={`mailto:${site.email}`}>Email us</a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .nf { padding: clamp(3.4rem, 8vw, 6rem) 0; }
        .nf-head { margin-bottom: 1.6rem; }
        .nf-head .eyebrow { margin-bottom: 0.9rem; }
        .nf-head h2 { font-size: clamp(1.7rem, 3.4vw, 2.5rem); }
        .nf-mt { margin-top: clamp(3rem, 6vw, 4.6rem); }
        .nf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.1rem; }
        .nf-card { display: flex; flex-direction: column; text-decoration: none; overflow: hidden;
          background: var(--card); border: 1px solid var(--line); border-radius: var(--r);
          color: var(--ink); transition: border-color .2s, transform .2s, box-shadow .2s; }
        .nf-card:hover { border-color: var(--copper); transform: translateY(-3px);
          box-shadow: 0 18px 40px -26px rgba(0,0,0,0.4); }
        .nf-thumb { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; }
        .nf-ph { display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--paper-2), var(--copper-tint));
          color: var(--copper-dk); font-family: var(--f-disp); font-weight: 700; font-size: 1.4rem; letter-spacing: -0.02em; }
        .nf-body { display: flex; flex-direction: column; gap: 0.6rem; padding: 1.4rem 1.6rem 1.6rem; flex: 1; }
        .nf-metal { font-family: var(--f-disp); font-weight: 700; font-size: 1.5rem; letter-spacing: -0.02em; }
        .nf-body p { color: var(--muted); font-size: 0.95rem; flex: 1; }
        .nf-go { color: var(--copper); font-weight: 600; font-size: 0.9rem; }
        .nf-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
        .nf-steps > div { background: var(--paper-2); border-radius: var(--r-sm); padding: 1.2rem 1.4rem;
          display: flex; flex-direction: column; gap: 0.4rem; }
        .nf-steps b { font-family: var(--f-disp); font-size: 0.95rem; color: var(--ink); }
        .nf-steps span { color: var(--ink-soft); font-size: 0.95rem; line-height: 1.55; }
        .nf-cta { margin-top: clamp(3.4rem, 7vw, 5.5rem); background: var(--char); color: var(--on-char);
          border-radius: var(--r-lg); padding: clamp(2.2rem, 5vw, 3.4rem); }
        .nf-cta h2 { color: var(--on-char); font-size: clamp(1.7rem, 3.6vw, 2.6rem); }
        .nf-cta p { color: var(--on-char-mut); margin-top: 0.7rem; max-width: 52ch; }
        .nf-cta-row { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.6rem; }
        .nf-cta-row .btn-ghost { color: var(--on-char); border-color: rgba(243,237,228,0.28); }
        .nf-cta-row .btn-ghost:hover { color: var(--copper-lit); border-color: var(--copper-lit); }
      `}</style>
    </SiteFrame>
  );
}
