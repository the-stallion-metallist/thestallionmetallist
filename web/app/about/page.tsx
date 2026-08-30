import type { Metadata } from "next";
import SiteFrame from "@/components/SiteFrame";
import PageHero from "@/components/PageHero";
import { site, why } from "@/lib/content";
import { pageJsonLd } from "@/lib/jsonld";

const title = "About Us | Non-Ferrous Scrap Trade House | The Stallion Metallist";
const description =
  "The Stallion Metallist is a Canada-incorporated non-ferrous scrap trading company operating in Dehradun, India, bridging global supply with Indian industry.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, url: "/about", type: "website" },
};

export default function Page() {
  return (
    <SiteFrame>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd("About", "/about", [{ name: "About", path: "/about" }])),
        }}
      />

      <PageHero
        eyebrow="About us"
        h1="A Canadian trade house, built for Indian industry"
        sub="Stallion Metallist Ltd. is an international non-ferrous scrap trading company, incorporated in Calgary and operating on the ground in Dehradun."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      >
        <a className="btn btn-primary" href="/contact">Get in touch <span className="circ">→</span></a>
      </PageHero>

      <section className="ab">
        <div className="wrap">
          <div className="ab-intro">
            <p className="lead">
              We connect global suppliers of non-ferrous scrap with India&apos;s furnaces, foundries and
              mills. Material is sourced from established exporters across the UAE, China, Europe and North
              America, cleared through Mundra, Kandla and JNPT, and delivered across the Gujarat industrial belt.
            </p>
            <p className="lead">
              Our structure is deliberately simple: a credible international corporate entity for global trade,
              and people on the ground in India who understand the buyers, the ports and the paperwork.
            </p>
          </div>

          <div className="ab-head">
            <span className="eyebrow">{why.eyebrow}</span>
            <h2>{why.heading}</h2>
          </div>
          <div className="ab-grid">
            {why.cards.map((c) => (
              <div className="ab-card" key={c.title}>
                <span className="ab-ic" aria-hidden="true">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>

          <div className="ab-facts">
            <div><b>Incorporation</b><span>Calgary, AB · Canada</span></div>
            <div><b>Operations</b><span>Dehradun, Uttarakhand · India</span></div>
            <div><b>Ports cleared</b><span>Mundra · Kandla · JNPT</span></div>
            <div><b>Payment terms</b><span>LC at sight · T/T</span></div>
          </div>

          <div className="ab-cta">
            <h2>Let&apos;s move your material</h2>
            <div className="ab-cta-row">
              <a className="btn btn-primary" href="/contact">Contact us <span className="circ">→</span></a>
              <a className="btn btn-ghost" href={`mailto:${site.email}`}>{site.email}</a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .ab { padding: clamp(3.4rem, 8vw, 6rem) 0; }
        .ab-intro { max-width: 760px; display: flex; flex-direction: column; gap: 1.1rem; }
        .ab-head { margin: clamp(3rem, 6vw, 4.6rem) 0 1.6rem; }
        .ab-head .eyebrow { margin-bottom: 0.9rem; }
        .ab-head h2 { font-size: clamp(1.7rem, 3.4vw, 2.5rem); }
        .ab-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.1rem; }
        .ab-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 1.6rem 1.7rem; }
        .ab-ic { display: inline-flex; font-size: 1.5rem; color: var(--copper); margin-bottom: 0.7rem; }
        .ab-card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
        .ab-card p { color: var(--ink-soft); line-height: 1.6; }
        .ab-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;
          margin-top: clamp(2.4rem, 5vw, 3.4rem); }
        .ab-facts > div { background: var(--paper-2); border-radius: var(--r-sm); padding: 1.1rem 1.3rem;
          display: flex; flex-direction: column; gap: 0.3rem; }
        .ab-facts b { font-family: var(--f-body); font-size: 0.74rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--copper); }
        .ab-facts span { color: var(--ink); font-weight: 600; }
        .ab-cta { margin-top: clamp(3.4rem, 7vw, 5.5rem); background: var(--char); color: var(--on-char);
          border-radius: var(--r-lg); padding: clamp(2.2rem, 5vw, 3.4rem); }
        .ab-cta h2 { color: var(--on-char); font-size: clamp(1.7rem, 3.6vw, 2.6rem); }
        .ab-cta-row { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.4rem; }
        .ab-cta-row .btn-ghost { color: var(--on-char); border-color: rgba(243,237,228,0.28); }
        .ab-cta-row .btn-ghost:hover { color: var(--copper-lit); border-color: var(--copper-lit); }
      `}</style>
    </SiteFrame>
  );
}
