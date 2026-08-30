/* ============================================================================
 * NON-FERROUS PRODUCT PAGES — one editable entry per grade page.
 * ----------------------------------------------------------------------------
 * Each entry becomes a page at /<slug> (e.g. /copper-scrap). Edit the copy here;
 * the page layout and structured data are generated automatically. Keep the
 * writing plain and accurate — vague or inflated claims hurt trust and ranking.
 * ========================================================================== */

export type ProductGrade = { name: string; specs: string[] };
export type ProductFaq = { q: string; a: string };

export type Product = {
  slug: string; // URL, also the canonical path
  metal: string; // short label, e.g. "Copper"
  eyebrow: string;
  h1: string; // visible page heading (keyword-rich)
  title: string; // <title> tag
  description: string; // meta description
  intro: string; // opening paragraph
  grades: ProductGrade[];
  applications: string[];
  sourcing: string;
  faqs: ProductFaq[];
};

export const products: Product[] = [
  {
    slug: "copper-scrap",
    metal: "Copper",
    eyebrow: "Non-ferrous · Copper",
    h1: "Copper scrap: Millberry and bare bright",
    title: "Copper Scrap Supplier in India | Millberry & Bare Bright | The Stallion Metallist",
    description:
      "The Stallion Metallist supplies electrical-grade copper scrap (Millberry and bare bright) to Indian smelters and mills, sourced from vetted exporters in the UAE, China, Europe and North America.",
    intro:
      "We supply high-purity copper scrap to India's smelters, refineries and mills. Our copper is sourced directly from established exporters across the UAE, China, Europe and North America, cleared at Mundra, Kandla and JNPT, and delivered on international trade terms.",
    grades: [
      { name: "Copper Millberry (99%+)", specs: ["Bright, uncoated wire", "99%+ copper content", "Electrical grade", "Baled or loose"] },
      { name: "Bare Bright", specs: ["Clean, bare, uncoated wire", "1/16 inch and thicker", "Highest-value copper grade"] },
    ],
    applications: ["Copper wire rod and cable", "Transformer and motor windings", "Smelting and refining", "Copper alloy production"],
    sourcing:
      "Every consignment is contracted to international standards and settled by letter of credit (LC) at sight or T/T. We manage documentation, customs clearance and inland delivery across the Gujarat industrial belt.",
    faqs: [
      { q: "What copper grades do you supply?", a: "Primarily Millberry (99%+ bright copper wire) and bare bright. Other grades can be sourced on request." },
      { q: "Where do you deliver copper scrap?", a: "To smelters, refineries and mills across India, cleared through Mundra, Kandla and JNPT and delivered across the Gujarat belt." },
      { q: "What are your payment terms?", a: "Letter of credit at sight or T/T, contracted to international trade standards." },
    ],
  },
  {
    slug: "aluminium-scrap",
    metal: "Aluminium",
    eyebrow: "Non-ferrous · Aluminium",
    h1: "Aluminium scrap: UBC, Zorba and Twitch",
    title: "Aluminium Scrap Supplier in India | UBC, Zorba & Twitch | The Stallion Metallist",
    description:
      "The Stallion Metallist supplies aluminium scrap (baled UBC, Zorba and Twitch) to Indian foundries and secondary smelters, sourced internationally and delivered on LC and T/T terms.",
    intro:
      "Baled used beverage cans (UBC), Zorba shred and Twitch, supplied to India's foundries and secondary aluminium smelters. We source from vetted exporters and, increasingly, from our own doorstep can-collection service in Dehradun.",
    grades: [
      { name: "UBC (Used Beverage Cans)", specs: ["Baled aluminium cans", "Clean, dry, low moisture", "Secondary smelting feed"] },
      { name: "Zorba", specs: ["Shredded, aluminium-rich mix", "Density-sorted", "Consistent chemistry"] },
      { name: "Twitch", specs: ["Float-separated aluminium", "High aluminium recovery", "Low attachments"] },
    ],
    applications: ["Secondary aluminium ingot", "Foundry casting alloys", "Steel deoxidant (deox)", "Die casting"],
    sourcing:
      "Consignments are contracted internationally and settled by LC at sight or T/T. We handle clearance at Mundra, Kandla and JNPT and delivery to processors across the Gujarat belt.",
    faqs: [
      { q: "Do you supply baled UBC?", a: "Yes. We supply baled used beverage cans, plus Zorba and Twitch, to secondary aluminium smelters and foundries." },
      { q: "Do you also collect cans locally?", a: "Yes. In Dehradun we run a doorstep collection service for used beverage cans, feeding the same recycling stream." },
      { q: "What payment terms do you offer?", a: "Letter of credit at sight or T/T, on international trade terms." },
    ],
  },
  {
    slug: "brass-scrap",
    metal: "Brass",
    eyebrow: "Non-ferrous · Brass",
    h1: "Brass scrap: honey and yellow brass",
    title: "Brass Scrap Supplier in India | Honey & Yellow Brass | The Stallion Metallist",
    description:
      "The Stallion Metallist supplies brass scrap (honey and yellow brass) to Indian foundries and engineering units, sourced from vetted exporters and delivered on LC and T/T terms.",
    intro:
      "Clean brass scrap for India's foundries, valve makers and engineering units. Sourced from established exporters across the UAE, China, Europe and North America, cleared at major Indian ports and delivered on international terms.",
    grades: [
      { name: "Honey Brass", specs: ["Clean yellow brass", "Low attachments", "Remelt-ready"] },
      { name: "Yellow Brass", specs: ["Mixed plumbing and engineering brass", "Sorted", "Foundry grade"] },
    ],
    applications: ["Brass ingot and billet", "Valves and plumbing fittings", "Engineering components", "Decorative castings"],
    sourcing:
      "Contracted to international standards and settled by LC at sight or T/T. We manage documentation, customs clearance and inland delivery across the Gujarat belt.",
    faqs: [
      { q: "What brass grades do you supply?", a: "Honey brass and mixed yellow brass, sorted and remelt-ready. Other grades can be sourced on request." },
      { q: "Who do you supply to?", a: "Foundries, valve and fitting manufacturers, and engineering units across India." },
      { q: "What are your payment terms?", a: "Letter of credit at sight or T/T, on international trade terms." },
    ],
  },
  {
    slug: "stainless-steel-scrap",
    metal: "Stainless Steel",
    eyebrow: "Non-ferrous · Stainless",
    h1: "Stainless steel scrap: 304 and 316",
    title: "Stainless Steel Scrap Supplier in India | 304 & 316 | The Stallion Metallist",
    description:
      "The Stallion Metallist supplies grade-sorted stainless steel scrap (304 and 316 solids and turnings) to Indian mills and foundries, on international LC and T/T terms.",
    intro:
      "Nickel-bearing stainless steel scrap, grade-sorted for India's mills and foundries. Sourced from vetted international exporters, cleared at Mundra, Kandla and JNPT, and delivered across the Gujarat belt.",
    grades: [
      { name: "SS 304", specs: ["Solids and turnings", "Nickel-bearing", "Grade-sorted"] },
      { name: "SS 316", specs: ["Solids and turnings", "Higher nickel and molybdenum", "Grade-sorted"] },
    ],
    applications: ["Stainless remelt", "Alloy steel production", "Foundry feed", "Engineering fabrication"],
    sourcing:
      "Every lot is grade-sorted and contracted to international standards, settled by LC at sight or T/T. We handle clearance and inland delivery to Indian processors.",
    faqs: [
      { q: "Which stainless grades do you supply?", a: "Primarily 304 and 316, as solids and turnings, grade-sorted. Other grades can be sourced on request." },
      { q: "Is the material grade-checked?", a: "Yes. Lots are grade-sorted before contracting so mills receive consistent chemistry." },
      { q: "What are your payment terms?", a: "Letter of credit at sight or T/T, on international trade terms." },
    ],
  },
];

export function getProduct(slug: string): Product {
  const p = products.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown product slug: ${slug}`);
  return p;
}
