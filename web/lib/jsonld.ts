import { site } from "./content";

/**
 * Structured data (JSON-LD) so Google and AI answer engines understand who this
 * company is. Rendered as a <script type="application/ld+json"> in the layout.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    description: site.description,
    email: site.email,
    telephone: `+${site.phoneHref}`,
    foundingLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: "Calgary", addressRegion: "AB", addressCountry: "CA" },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dehradun",
      addressRegion: "Uttarakhand",
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
    sameAs: [site.ubcAppUrl],
  };
}
