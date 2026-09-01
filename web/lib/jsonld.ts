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

// Map coordinates + opening hours, taken from the verified Google Business Profile.
// (Keep these in sync if the GBP hours/location ever change.)
const geo = { latitude: 30.3581708, longitude: 78.0878097 };
// Open Monday–Saturday 11:00–17:00; closed Sunday.
const openingHours = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "11:00",
    closes: "17:00",
  },
];

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
        geo: { "@type": "GeoCoordinates", latitude: geo.latitude, longitude: geo.longitude },
        openingHoursSpecification: openingHours,
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

const orgRef = { "@id": `${site.url}/#organization` };

/** BreadcrumbList for a sub-page. Pass items in order (Home first). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.path}`,
    })),
  };
}

type FaqItem = { q: string; a: string };

/**
 * Structured-data @graph for a non-ferrous grade page.
 *
 * We intentionally do NOT emit a `Product` node here. Google requires every
 * Product to carry a price, a review, or an aggregateRating. Scrap is traded
 * per-tonne at daily market/LME-linked prices, so there is no fixed public
 * price, and fabricating a price/review/rating violates Google's guidelines.
 * A price-less Product only ever produced "Product snippets" errors and never a
 * rich result, so the page instead relies on BreadcrumbList + FAQPage (both
 * valid, both rich-result eligible) plus the site-wide Organization /
 * LocalBusiness graph. `knowsAbout` on the Organization already names each grade
 * for entity/topic understanding.
 */
export function productPageJsonLd(p: { slug: string; metal: string; faqs: FaqItem[] }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Non-ferrous scrap", path: "/non-ferrous-scrap" },
        { name: p.metal, path: `/${p.slug}` },
      ]),
      {
        "@type": "FAQPage",
        mainEntity: p.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

/** Simpler @graph for a content page (Breadcrumb + WebPage). */
export function pageJsonLd(name: string, path: string, breadcrumbTail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([{ name: "Home", path: "/" }, ...breadcrumbTail]),
      {
        "@type": "WebPage",
        name,
        url: `${site.url}${path}`,
        isPartOf: { "@id": `${site.url}/#website` },
        about: orgRef,
      },
    ],
  };
}
