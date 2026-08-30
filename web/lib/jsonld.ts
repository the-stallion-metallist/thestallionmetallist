import { site, socials } from "./content";
import { faqs } from "./faq";

/**
 * Structured data (JSON-LD) so Google and AI answer engines understand who this
 * company is, that it operates locally in Dehradun, and the common questions it
 * answers. Emitted as one <script type="application/ld+json"> @graph in the
 * layout, with @id links so the nodes resolve to a single entity.
 */
// Verified Google Business Profile (public share link). Add a LinkedIn company
// page URL here too once it exists — more sameAs = stronger entity recognition.
const GBP_URL = "https://share.google/O9ESXisAZPqJxZR8t";

// Operating address (matches the verified Google Business Profile in Dehradun).
const streetAddress = "Iksana Workspace, IT Park, 115A, Sahastradhara Rd, Kasturi Nagar, Danda Lakhond";

export function organizationJsonLd() {
  const orgId = `${site.url}/#organization`;
  const siteId = `${site.url}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        alternateName: site.shortName,
        url: site.url,
        description: site.description,
        email: site.email,
        telephone: site.phoneHref,
        logo: `${site.url}/icon.png`,
        image: `${site.url}/opengraph-image`,
        foundingLocation: {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressLocality: "Calgary", addressRegion: "AB", addressCountry: "CA" },
        },
        address: {
          "@type": "PostalAddress",
          streetAddress,
          addressLocality: "Dehradun",
          addressRegion: "Uttarakhand",
          postalCode: "248001",
          addressCountry: "IN",
        },
        areaServed: ["IN", "AE", "CN", "EU", "US", "CA"],
        knowsAbout: [
          "Non-ferrous scrap trading",
          "Aluminium UBC",
          "Copper Millberry",
          "Brass scrap",
          "Stainless steel scrap",
          "Metal recycling",
        ],
        sameAs: [GBP_URL, ...socials.map((s) => s.href), site.ubcAppUrl],
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: site.url,
        name: site.name,
        publisher: { "@id": orgId },
        inLanguage: "en",
      },
      {
        // The on-the-ground operation in Dehradun (helps local/AI discovery).
        "@type": "LocalBusiness",
        "@id": `${site.url}/#localbusiness`,
        name: site.name,
        parentOrganization: { "@id": orgId },
        url: site.url,
        telephone: site.phoneHref,
        email: site.email,
        image: `${site.url}/opengraph-image`,
        hasMap: GBP_URL,
        address: {
          "@type": "PostalAddress",
          streetAddress,
          addressLocality: "Dehradun",
          addressRegion: "Uttarakhand",
          postalCode: "248001",
          addressCountry: "IN",
        },
        areaServed: [
          { "@type": "AdministrativeArea", name: "Uttarakhand" },
          { "@type": "Country", name: "India" },
        ],
        sameAs: [GBP_URL],
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
