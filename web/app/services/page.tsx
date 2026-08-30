import type { Metadata } from "next";
import SiteFrame from "@/components/SiteFrame";
import PageHero from "@/components/PageHero";
import { site } from "@/lib/content";
import { pageJsonLd } from "@/lib/jsonld";

const title = "Services | Metal Recycling, Waste Diversion & Product Destruction | The Stallion Metallist";
const description =
  "Beyond trading, The Stallion Metallist offers full-cycle material recovery: metal recycling, industrial waste diversion and certified product destruction.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/services" },
  openGraph: { title, description, url: "/services", type: "website" },
};

const services = [
  {
    tag: "Recovery",
    title: "Metal Recycling",
    img: "/images/metal_recycling.webp",
    alt: "Metal recycling",
    body: "We recover and channel non-ferrous metal back into production, from sorting and grading to delivery at furnaces and foundries. Material is handled to keep chemistry consistent for the mills that buy it.",
  },
  {
    tag: "Zero-waste",
    title: "Waste Diversion",
    img: "/images/waste_diversion.webp",
    alt: "Industrial waste diversion",
    body: "We divert industrial and post-consumer material away from landfill and back into the supply chain, helping producers recover value from what would otherwise be discarded.",
  },
  {
    tag: "Certified",
    title: "Product Destruction",
    img: "/images/product_destruction.webp",
    alt: "Certified product destruction",
    body: "For obsolete stock, rejects and branded goods that must not re-enter the market, we provide secure destruction with material recovery, so the metal is recycled rather than wasted.",
  },
];

export default function Page() {
  return (
    <SiteFrame>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd("Services", "/services", [{ name: "Services", path: "/services" }])),
        }}
      />

      <PageHero
        eyebrow="What we do"
        h1="Full-cycle material recovery"
        sub="Beyond trading non-ferrous scrap, we handle the full recovery cycle: recycling, waste diversion and certified destruction."
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      >
        <a className="btn btn-primary" href="/contact">Talk to us <span className="circ">→</span></a>
      </PageHero>

      <section className="sv">
        <div className="wrap">
          <div className="sv-grid">
            {services.map((s) => (
              <article className="sv-card" key={s.title}>
                <div className="sv-img" style={{ backgroundImage: `url('${s.img}')` }} role="img" aria-label={s.alt} />
                <div className="sv-body">
                  <span className="eyebrow">{s.tag}</span>
                  <h2>{s.title}</h2>
                  <p>{s.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="sv-cta">
            <h2>Have material to move?</h2>
            <p>Whether it is scrap to sell, waste to divert or stock to destroy, we can help.</p>
            <div className="sv-cta-row">
              <a className="btn btn-primary" href="/contact">Get in touch <span className="circ">→</span></a>
              <a className="btn btn-ghost" href={`tel:${site.phoneHref}`}>{site.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .sv { padding: clamp(3.4rem, 8vw, 6rem) 0; }
        .sv-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.4rem; }
        .sv-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden;
          display: flex; flex-direction: column; }
        .sv-img { height: 190px; background-size: cover; background-position: center; }
        .sv-body { padding: 1.6rem 1.7rem; display: flex; flex-direction: column; gap: 0.7rem; }
        .sv-body .eyebrow { align-self: flex-start; }
        .sv-body h2 { font-size: 1.4rem; }
        .sv-body p { color: var(--ink-soft); line-height: 1.65; }
        .sv-cta { margin-top: clamp(3.4rem, 7vw, 5.5rem); background: var(--char); color: var(--on-char);
          border-radius: var(--r-lg); padding: clamp(2.2rem, 5vw, 3.4rem); }
        .sv-cta h2 { color: var(--on-char); font-size: clamp(1.7rem, 3.6vw, 2.6rem); }
        .sv-cta p { color: var(--on-char-mut); margin-top: 0.7rem; max-width: 52ch; }
        .sv-cta-row { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.6rem; }
        .sv-cta-row .btn-ghost { color: var(--on-char); border-color: rgba(243,237,228,0.28); }
        .sv-cta-row .btn-ghost:hover { color: var(--copper-lit); border-color: var(--copper-lit); }
      `}</style>
    </SiteFrame>
  );
}
