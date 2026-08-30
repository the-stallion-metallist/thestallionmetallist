import type { Metadata } from "next";
import SiteFrame from "@/components/SiteFrame";
import PageHero from "@/components/PageHero";
import { site } from "@/lib/content";
import { pageJsonLd } from "@/lib/jsonld";

const GBP_URL = "https://share.google/O9ESXisAZPqJxZR8t";
const WHATSAPP = "https://wa.me/919997348394";

const title = "Contact | Non-Ferrous Scrap Trading in Dehradun | The Stallion Metallist";
const description =
  "Contact The Stallion Metallist for non-ferrous scrap enquiries. Email, phone or WhatsApp us, or find us in Dehradun, Uttarakhand, India.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/contact" },
  openGraph: { title, description, url: "/contact", type: "website" },
};

export default function Page() {
  return (
    <SiteFrame>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd("Contact", "/contact", [{ name: "Contact", path: "/contact" }])),
        }}
      />

      <PageHero
        eyebrow="Get in touch"
        h1="Contact The Stallion Metallist"
        sub="Tell us the grade, quantity and destination and we will come back with terms. We reply fastest on WhatsApp."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="ct">
        <div className="wrap ct-grid">
          <div className="ct-cards">
            <a className="ct-card" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <span className="ct-k">WhatsApp</span>
              <span className="ct-v">{site.phoneDisplay}</span>
            </a>
            <a className="ct-card" href={`tel:${site.phoneHref}`}>
              <span className="ct-k">Call</span>
              <span className="ct-v">{site.phoneDisplay}</span>
            </a>
            <a className="ct-card" href={`mailto:${site.email}`}>
              <span className="ct-k">Email</span>
              <span className="ct-v">{site.email}</span>
            </a>
            <a className="ct-card" href={GBP_URL} target="_blank" rel="noopener noreferrer">
              <span className="ct-k">Find us on Google</span>
              <span className="ct-v">Get directions →</span>
            </a>
          </div>

          <aside className="ct-info">
            <span className="eyebrow">Our office</span>
            <address className="ct-addr">
              Iksana Workspace, IT Park, 115A,<br />
              Sahastradhara Rd, Kasturi Nagar,<br />
              Danda Lakhond, Dehradun,<br />
              Uttarakhand 248001, India
            </address>
            <p className="ct-note">{site.incorporation}</p>
            <a className="btn btn-primary" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              Message us on WhatsApp <span className="circ">→</span>
            </a>
          </aside>
        </div>
      </section>

      <style>{`
        .ct { padding: clamp(3.4rem, 8vw, 6rem) 0; }
        .ct-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 1.6rem; align-items: start; }
        @media (max-width: 780px){ .ct-grid { grid-template-columns: 1fr; } }
        .ct-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 520px){ .ct-cards { grid-template-columns: 1fr; } }
        .ct-card { display: flex; flex-direction: column; gap: 0.35rem; text-decoration: none;
          background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 1.4rem 1.5rem;
          transition: border-color .2s, transform .2s; }
        .ct-card:hover { border-color: var(--copper); transform: translateY(-2px); }
        .ct-k { font-family: var(--f-body); font-size: 0.74rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--copper); }
        .ct-v { font-family: var(--f-disp); font-weight: 600; color: var(--ink); font-size: 1.08rem; }
        .ct-info { background: var(--char); color: var(--on-char); border-radius: var(--r-lg); padding: 1.8rem 1.9rem; }
        .ct-info .eyebrow { background: rgba(143,97,58,0.16); color: var(--copper-lit); }
        .ct-addr { font-style: normal; color: var(--on-char); line-height: 1.8; margin: 1.1rem 0 0.8rem; font-size: 1.02rem; }
        .ct-note { color: var(--on-char-mut); font-size: 0.9rem; margin-bottom: 1.5rem; }
      `}</style>
    </SiteFrame>
  );
}
