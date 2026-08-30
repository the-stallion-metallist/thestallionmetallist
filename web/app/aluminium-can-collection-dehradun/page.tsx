import type { Metadata } from "next";
import SiteFrame from "@/components/SiteFrame";
import PageHero from "@/components/PageHero";
import FaqList from "@/components/FaqList";
import { site } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/jsonld";

/* ============================================================================
 * LOCAL LANDING PAGE — Aluminium can (UBC) doorstep collection in Dehradun.
 * Targets local searches ("sell used cans Dehradun", "aluminium can pickup
 * Dehradun") and links the trading site to the live collection app. All copy
 * lives here; edit the text in the marked sections below.
 * ========================================================================== */

const path = "/aluminium-can-collection-dehradun";
const title = "Aluminium Can Collection in Dehradun | Doorstep Pickup, Paid on Collection | The Stallion Metallist";
const description =
  "Sell your used aluminium beverage cans in Dehradun. Book a free doorstep pickup, we weigh on the spot and pay you on collection. No fees. Now serving Dehradun.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  openGraph: { title, description, url: path, type: "website" },
};

// FAQ — shown on the page AND fed to FAQPage structured data (kept in sync).
const faqs = [
  {
    q: "How do I sell my used aluminium cans in Dehradun?",
    a: "Book a doorstep pickup in our free app. We come to your address anywhere in Dehradun, weigh the cans on the spot and pay you on collection. There is nothing to drop off and no fee.",
  },
  {
    q: "Do you collect cans from home?",
    a: "Yes. We run a doorstep collection service across Dehradun for households, offices, cafes, bars and event venues. Schedule a pickup in the app and we handle the rest.",
  },
  {
    q: "How much do you pay for aluminium cans?",
    a: "You are paid by weight at the current rate for used beverage cans, settled on collection. The more clean, dry cans you gather, the more your pickup is worth.",
  },
  {
    q: "What kind of cans do you accept?",
    a: "Used aluminium beverage cans, soft-drink, beer and energy-drink cans, ideally empty, rinsed and dry. Keeping them clean and crushed lets you fit more into each pickup.",
  },
  {
    q: "Which areas do you cover?",
    a: "We are live across Dehradun now, with more cities in Uttarakhand and beyond coming soon.",
  },
  {
    q: "Is there any charge for the pickup?",
    a: "No. The pickup is free and you get paid on collection, there are no fees or deductions for the doorstep service.",
  },
];

const steps = [
  { n: "01", title: "Book a pickup", body: "Open the app, tell us roughly how many cans you have and pick a slot. It takes under a minute." },
  { n: "02", title: "We come to you", body: "Our collector arrives at your doorstep in Dehradun, no need to travel or drop anything off." },
  { n: "03", title: "Weigh on the spot", body: "Your cans are weighed in front of you at the current rate, so the payout is transparent." },
  { n: "04", title: "Get paid on collection", body: "You are paid on the spot. The aluminium then feeds our recycling stream for India's foundries." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Aluminium can collection Dehradun", path },
    ]),
    {
      "@type": "Service",
      name: "Aluminium can (UBC) doorstep collection",
      serviceType: "Used beverage can collection",
      description,
      url: `${site.url}${path}`,
      provider: { "@id": `${site.url}/#organization` },
      areaServed: { "@type": "City", name: "Dehradun" },
      offers: { "@type": "Offer", priceCurrency: "INR", description: "Free doorstep pickup, paid on collection by weight." },
    },
    {
      "@type": "WebPage",
      name: "Aluminium can collection in Dehradun",
      url: `${site.url}${path}`,
      isPartOf: { "@id": `${site.url}/#website` },
      about: { "@id": `${site.url}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const WHATSAPP = "https://wa.me/919997348394";

export default function Page() {
  return (
    <SiteFrame>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow="UBC Collection · Dehradun"
        h1="Aluminium can collection in Dehradun"
        sub="Turn your used aluminium cans into cash. Book a free doorstep pickup, we weigh on the spot and pay you on collection. Now serving Dehradun."
        crumbs={[{ label: "Home", href: "/" }, { label: "Aluminium can collection Dehradun" }]}
      >
        <a className="btn btn-primary" href={site.ubcAppUrl} target="_blank" rel="noopener noreferrer">
          Book a pickup <span className="circ">→</span>
        </a>
        <a className="btn btn-ghost" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
          Ask on WhatsApp
        </a>
      </PageHero>

      <section className="uc">
        <div className="wrap">
          <div className="uc-intro">
            <p className="lead">
              The Stallion Metallist runs a doorstep collection service for used aluminium beverage cans across
              Dehradun. Instead of throwing cans away or hauling them to a scrap dealer, you book a pickup in our
              app and get paid at your door, while the aluminium is recycled into India&apos;s foundries and mills.
            </p>
            <p className="lead">
              It is free to use, there is no minimum fuss, and every can you recycle keeps material out of landfill
              and back into the supply chain.
            </p>
          </div>

          <div className="uc-head">
            <span className="eyebrow">How it works</span>
            <h2>Four steps, paid on collection.</h2>
          </div>
          <div className="uc-steps">
            {steps.map((s) => (
              <div className="uc-step" key={s.n}>
                <span className="uc-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="uc-cols">
            <div className="uc-col">
              <h3>What we accept</h3>
              <ul className="uc-list">
                <li>Used aluminium soft-drink cans</li>
                <li>Beer and energy-drink cans</li>
                <li>Clean, dry and empty (rinsed is best)</li>
                <li>Crushed cans, to fit more per pickup</li>
              </ul>
            </div>
            <div className="uc-col">
              <h3>Who it&apos;s for</h3>
              <ul className="uc-list">
                <li>Households with regular can waste</li>
                <li>Offices and co-working spaces</li>
                <li>Cafes, bars and restaurants</li>
                <li>Event venues and caterers in Dehradun</li>
              </ul>
            </div>
          </div>

          <div className="uc-faq">
            <div className="uc-head">
              <span className="eyebrow">Questions</span>
              <h2>Selling cans in Dehradun</h2>
            </div>
            <FaqList items={faqs} />
          </div>

          <div className="uc-cta">
            <h2>Got cans? Get paid.</h2>
            <p>Free doorstep pickup across Dehradun. Paid on collection.</p>
            <div className="uc-cta-row">
              <a className="btn btn-primary" href={site.ubcAppUrl} target="_blank" rel="noopener noreferrer">
                Book a pickup <span className="circ">→</span>
              </a>
              <a className="btn btn-ghost" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                Message us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .uc { padding: clamp(3.4rem, 8vw, 6rem) 0; }
        .uc-intro { max-width: 760px; display: flex; flex-direction: column; gap: 1.1rem; }
        .uc-head { margin: clamp(3rem, 6vw, 4.6rem) 0 1.6rem; }
        .uc-head .eyebrow { margin-bottom: 0.9rem; }
        .uc-head h2 { font-size: clamp(1.7rem, 3.4vw, 2.5rem); }
        .uc-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.1rem; }
        .uc-step { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 1.6rem 1.7rem; }
        .uc-n { display: inline-flex; font-family: var(--f-disp); font-weight: 700; font-size: 1.4rem; color: var(--copper); margin-bottom: 0.7rem; }
        .uc-step h3 { font-size: 1.18rem; margin-bottom: 0.5rem; }
        .uc-step p { color: var(--ink-soft); line-height: 1.6; }
        .uc-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.1rem;
          margin-top: clamp(2.4rem, 5vw, 3.4rem); }
        .uc-col { background: var(--paper-2); border-radius: var(--r); padding: 1.6rem 1.8rem; }
        .uc-col h3 { font-size: 1.2rem; margin-bottom: 0.9rem; }
        .uc-list { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
        .uc-list li { position: relative; padding-left: 1.4rem; color: var(--ink-soft); line-height: 1.5; }
        .uc-list li::before { content: "→"; position: absolute; left: 0; color: var(--copper); font-weight: 700; }
        .uc-faq { margin-top: clamp(3rem, 6vw, 4.6rem); }
        .uc-faq .uc-head { margin-top: 0; }
        .uc-cta { margin-top: clamp(3.4rem, 7vw, 5.5rem); background: var(--char); color: var(--on-char);
          border-radius: var(--r-lg); padding: clamp(2.2rem, 5vw, 3.4rem); }
        .uc-cta h2 { color: var(--on-char); font-size: clamp(1.7rem, 3.6vw, 2.6rem); }
        .uc-cta p { color: var(--on-char-mut); margin-top: 0.6rem; }
        .uc-cta-row { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.4rem; }
        .uc-cta-row .btn-ghost { color: var(--on-char); border-color: rgba(243,237,228,0.28); }
        .uc-cta-row .btn-ghost:hover { color: var(--copper-lit); border-color: var(--copper-lit); }
      `}</style>
    </SiteFrame>
  );
}
