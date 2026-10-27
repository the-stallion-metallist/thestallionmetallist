import type { Metadata } from "next";
import { RATE_CAN, RATE_PET } from "./rates";
import { WHATSAPP_IN, waLink, type ServiceFaq, type ServiceLink } from "./services";

/* ============================================================================
 * HOW-TO GUIDES. Plain explainers that answer the questions people search (and
 * ask AI assistants) about cans and PET bottles, then point to the service.
 * Rendered by components/GuidePage.tsx. Keep only well-established facts here.
 * ========================================================================== */

export type GuideData = {
  slug: string; // path without a leading slash, e.g. "learn/what-is-ubc-scrap"
  title: string;
  description: string;
  h1: string;
  sub: string;
  crumb: string;
  published: string; // ISO date, for Article structured data
  updatedLabel: string; // shown to readers
  answer: string; // the short direct answer, shown first
  sections: { heading: string; body?: string[]; list?: string[] }[];
  faqs: ServiceFaq[];
  related: { label: string; href: string; blurb: string }[];
  cta: { heading: string; sub: string; primary: ServiceLink; secondary: ServiceLink };
  sources?: { label: string; href: string }[]; // shown under the FAQ
  ogHeading?: string; // short headline for the share card (posts only)
  ogSub?: string;
};

export const REL = {
  cans: {
    label: "Sell aluminium cans (UBC)",
    href: "/aluminium-can-collection-dehradun",
    blurb: "Doorstep pickup, counted at your door, paid on collection.",
  },
  pet: {
    label: "Sell PET bottles",
    href: "/pet-bottle-collection-dehradun",
    blurb: "Doorstep pickup, weighed at your door.",
  },
  venues: {
    label: "For bars, restaurants and cafes",
    href: "/bar-restaurant-can-bottle-collection-dehradun",
    blurb: "Free bins and scheduled pickups for venues.",
  },
};

export const ubcGuide: GuideData = {
  slug: "learn/what-is-ubc-scrap",
  title: "What Is UBC Scrap? Used Beverage Cans Explained | The Stallion Metallist",
  description:
    "UBC means used beverage cans: empty aluminium drink cans sold as scrap. How they are recycled, how many make a kilo, and how to sell them in Dehradun.",
  h1: "What is UBC scrap?",
  sub: "UBC means used beverage cans. Here is what that means, how the cans are recycled, and how to sell yours in Dehradun.",
  crumb: "What is UBC scrap",
  published: "2026-10-27",
  updatedLabel: "27 October 2026",
  answer:
    "UBC stands for used beverage cans. In the scrap trade it is the name for empty aluminium drink cans, which are collected, baled and sold by weight to recyclers who melt them into new aluminium.",
  sections: [
    {
      heading: "Why aluminium cans have value",
      body: [
        "Aluminium can be melted and made into new metal again and again without losing its quality. Making aluminium from recycled cans takes about 5% of the energy needed to make it from raw ore, which is why recyclers pay for cans.",
        "Most other kitchen waste has little resale value. A clean, empty can does.",
      ],
    },
    {
      heading: "How a used can is recycled",
      list: [
        "Cans are collected from homes, bars, restaurants and cafes.",
        "They are sorted and checked for anything that is not aluminium.",
        "They are crushed or baled to make them cheaper to move.",
        "A recycler shreds the cans and melts them in a furnace.",
        "The molten metal is cast into ingots or sheet, then rolled and made into new products, including new cans.",
      ],
    },
    {
      heading: "UBC compared with other aluminium scrap",
      body: [
        "UBC is thin-walled can scrap with a coating and printed paint. Other aluminium scrap, such as extrusion offcuts, cast parts or foil, is graded and priced on its own.",
        "Mixing grades lowers the value of the lot, so keep cans separate from other aluminium.",
      ],
    },
    {
      heading: "How to prepare cans before you sell them",
      list: [
        "Empty the can and rinse it.",
        "Let it drain and dry.",
        "Crush it if you like, to save space.",
        "Keep cans away from other waste so they stay clean.",
        "Do not mix in bottles or foil.",
      ],
    },
    {
      heading: "How many cans make a kilo",
      body: [
        "It depends on the can. A new 330 ml can weighs about 9.5 to 10 g, so a kilo holds roughly 100. A 500 ml can weighs about 12 to 13 g, so a kilo holds roughly 80. Used cans from collection weigh more, and our working figure is about 65 to the kilo.",
      ],
    },
    {
      heading: "UBC can also mean used beverage cartons",
      body: [
        "You may see the same three letters used for used beverage cartons, the paper-based packs that milk and juice come in. Those are recycled at paper mills, not melted like metal. This guide and our service are about aluminium cans. We currently collect cans and PET bottles, not cartons.",
      ],
    },
    {
      heading: "Selling UBC in Dehradun",
      body: [
        `The Stallion Metallist collects used aluminium cans from homes, bars, restaurants and cafes in Dehradun. We count the cans at your door and pay ${RATE_CAN} per can on collection.`,
      ],
    },
  ],
  faqs: [
    {
      q: "What does UBC stand for?",
      a: "UBC stands for used beverage cans. It is the scrap-trade name for empty aluminium drink cans.",
    },
    {
      q: "Are aluminium cans recyclable?",
      a: "Yes. Aluminium can be recycled repeatedly without losing quality, and recycling it uses about 5% of the energy needed to make new aluminium.",
    },
    {
      q: "Is UBC the same as other aluminium scrap?",
      a: "No. UBC is can scrap. Extrusion offcuts, cast parts and foil are other grades that are priced separately.",
    },
    {
      q: "Where can I sell used cans in Dehradun?",
      a: `The Stallion Metallist collects used aluminium cans from your door across Dehradun and pays ${RATE_CAN} per can on collection.`,
    },
  ],
  sources: [
    { label: "Hydro: Remelting and recycling", href: "https://drp.hydro.com/en-AT/aluminium/products/extruded-profiles/services/remelting-and-recycling/" },
    { label: "European Commission LIFE project: Recycling aluminium", href: "https://webgate.ec.europa.eu/life/publicWebsite/project/LIFE96-ENV-B-000477/recycling-aluminium" },
    { label: "Cantech: Ball reduces weight of beverage cans (2012)", href: "https://www.cantechonline.com/news/3522/ball-reduces-weight-of-beverage-cans/" },
  ],
  related: [REL.cans, REL.venues, REL.pet],
  cta: {
    heading: "Got cans? Get paid.",
    sub: "Free doorstep pickup across Dehradun. Paid on collection.",
    primary: { label: "Book a pickup", href: "https://app.thestallionmetallist.com", external: true },
    secondary: { label: "Message us on WhatsApp", href: WHATSAPP_IN, external: true },
  },
};

export const petGuide: GuideData = {
  slug: "learn/how-to-recycle-pet-bottles-dehradun",
  title: "How to Recycle PET Bottles in Dehradun | The Stallion Metallist",
  description: `What PET plastic is, how to tell, how PET bottles are recycled, and how to sell yours in Dehradun at ${RATE_PET} per kg.`,
  h1: "How to recycle PET bottles in Dehradun",
  sub: "What PET is, how to spot it, how it is recycled, and how to sell your empty bottles in Dehradun.",
  crumb: "How to recycle PET bottles",
  published: "2026-10-27",
  updatedLabel: "27 October 2026",
  answer: `Empty PET bottles can be recycled. Keep them separate from wet waste and sell them to a collector. In Dehradun, The Stallion Metallist collects PET bottles from homes and businesses and pays ${RATE_PET} per kg.`,
  sections: [
    {
      heading: "What PET is",
      body: [
        "PET (polyethylene terephthalate) is the clear, light plastic used for most water, soft-drink and juice bottles. Look for the number 1 inside the recycling triangle, usually on the base of the bottle.",
      ],
    },
    {
      heading: "How PET bottles are recycled",
      list: [
        "Bottles are collected and sorted.",
        "They are washed.",
        "They are shredded into small flakes.",
        "The flakes are melted and spun into polyester fibre, or moulded into new bottles and containers.",
      ],
    },
    {
      heading: "How to prepare PET bottles",
      list: [
        "Empty the bottle.",
        "Rinse it if you can.",
        "Crush it flat to save space.",
        "Keep it dry and apart from food waste.",
      ],
    },
    {
      heading: "What to keep out of your PET pile",
      body: [
        "Keep glass, metal cans and other kinds of plastic out of your PET bottles. Aluminium cans are worth selling too, but bag them separately.",
      ],
    },
    {
      heading: "Selling PET bottles in Dehradun",
      body: [
        `The Stallion Metallist collects PET bottles from households, bars, restaurants, cafes, hotels and shops in Dehradun. We weigh them at your door and pay ${RATE_PET} per kg. Message us on WhatsApp with your area and roughly how much you have.`,
      ],
    },
  ],
  faqs: [
    {
      q: "How do I know if a bottle is PET?",
      a: "Check the base of the bottle for the number 1 inside the recycling triangle. Most single-use water and soft-drink bottles are PET.",
    },
    {
      q: "Is a plastic water bottle PET?",
      a: "Most single-use water bottles are PET. Check for the number 1 on the base to be sure.",
    },
    {
      q: "Why keep PET bottles out of wet waste?",
      a: "Food and liquid contaminate plastic and limit what it can be recycled into. Dry, empty bottles are easier to recycle.",
    },
    {
      q: "Where can I sell PET bottles in Dehradun?",
      a: `The Stallion Metallist collects PET bottles from homes and businesses across Dehradun and pays ${RATE_PET} per kg. Message us on WhatsApp to book.`,
    },
  ],
  related: [REL.pet, REL.cans, REL.venues],
  cta: {
    heading: "Got bottles? Get paid.",
    sub: "Doorstep PET bottle pickup across Dehradun.",
    primary: {
      label: "Book on WhatsApp",
      href: waLink("Hi, I would like to sell PET bottles in Dehradun. My area is: "),
      external: true,
    },
    secondary: { label: "Selling cans too? Open the app", href: "https://app.thestallionmetallist.com", external: true },
  },
};

export function guideMetadata(d: GuideData): Metadata {
  const path = `/${d.slug}`;
  return {
    title: { absolute: d.title },
    description: d.description,
    alternates: { canonical: path },
    openGraph: { title: d.title, description: d.description, url: path, type: "article" },
  };
}
