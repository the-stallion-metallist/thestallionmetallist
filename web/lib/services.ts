import type { Metadata } from "next";
import { RATE_CAN, RATE_PET, RATES_AS_OF } from "./rates";

/* ============================================================================
 * COLLECTION SERVICE PAGES (cans, PET bottles, bars and restaurants).
 * ----------------------------------------------------------------------------
 * Each entry becomes one page, rendered by components/ServicePage.tsx. Edit the
 * copy here. Keep claims true: only say what the service really does today.
 * Cans are COUNTED at pickup; PET (plastic) is WEIGHED in kg.
 * FAQ answers feed both the visible page and the FAQ structured data.
 * ========================================================================== */

export const WHATSAPP_IN = "https://wa.me/919997348394";
export const WHATSAPP_CA = "https://wa.me/15878933420";

/** WhatsApp link to the India number with a message already typed in. */
export const waLink = (text: string) => `${WHATSAPP_IN}?text=${encodeURIComponent(text)}`;

// Real route areas (from the collection planner). Said as "including", so a
// missing area is not a promise either way.
export const AREAS =
  "Rajpur Road, Sahastradhara Road, Prem Nagar, the Clock Tower and city centre, Ballupur, GMS Road, Chakrata Road, Canal Road, Dharampur, Pondha, Bidholi, Mussoorie Road, Malsi, Haridwar Bypass, ISBT and Majra";

export type ServiceLink = { label: string; href: string; external?: boolean };
export type ServiceFaq = { q: string; a: string };

export type ServiceData = {
  slug: string; // URL path without the slash; also the canonical path
  title: string; // <title>
  description: string; // meta description
  h1: string;
  sub: string; // hero sentence
  crumb: string; // breadcrumb label
  schemaName: string; // name of the Service in structured data
  serviceType: string;
  offer?: string; // set only when the customer really pays nothing for the service
  intro: string[]; // opening paragraphs
  rates?: { heading: string; rows: { item: string; rate: string; note: string }[] }; // payout rates (from lib/rates.ts)
  stepsHeading: string;
  steps: { title: string; body: string }[];
  lists: { title: string; items: string[] }[]; // exactly two
  hindi?: { heading: string; body: string[] };
  faqHeading: string;
  faqs: ServiceFaq[];
  related: { label: string; href: string; blurb: string }[];
  cta: { heading: string; sub: string; primary: ServiceLink; secondary: ServiceLink };
};

const REL = {
  cans: {
    label: "Aluminium cans (UBC)",
    href: "/aluminium-can-collection-dehradun",
    blurb: "Used drink cans, paid on collection.",
  },
  pet: {
    label: "PET bottles",
    href: "/pet-bottle-collection-dehradun",
    blurb: "Water, soft-drink and juice bottles, paid by weight.",
  },
  venues: {
    label: "Bars, restaurants and cafes",
    href: "/bar-restaurant-can-bottle-collection-dehradun",
    blurb: "Free bins and scheduled pickups for venues.",
  },
};

export const cansPage: ServiceData = {
  slug: "aluminium-can-collection-dehradun",
  title: `Sell Aluminium Cans (UBC) in Dehradun | ${RATE_CAN} per Can | The Stallion Metallist`,
  description: `Sell used aluminium cans (UBC) in Dehradun at ${RATE_CAN} per can. Free doorstep pickup, counted at your door and paid on collection. For homes, bars and cafes.`,
  h1: "Aluminium can (UBC) collection in Dehradun",
  sub: `Sell your used drink cans for ${RATE_CAN} each. Book a free doorstep pickup. We count your cans at your door and pay you on collection.`,
  crumb: "Aluminium can collection Dehradun",
  schemaName: "Aluminium can (UBC) doorstep collection",
  serviceType: "Used beverage can collection",
  offer: "Free doorstep pickup, paid on collection.",
  intro: [
    "The Stallion Metallist runs a doorstep collection service for used aluminium beverage cans across Dehradun. Instead of throwing cans away or hauling them to a scrap dealer, you book a pickup in our app and get paid at your door. The aluminium is then recycled.",
    "UBC stands for used beverage cans: the empty soft-drink, beer and energy-drink cans most homes and venues throw away. The service is free to use, and every can you recycle stays out of landfill.",
  ],
  rates: {
    heading: "What we pay",
    rows: [{ item: "Used aluminium cans (UBC)", rate: `${RATE_CAN} per can`, note: "Counted at your door, paid on collection" }],
  },
  stepsHeading: "Four steps, paid on collection",
  steps: [
    { title: "Book a pickup", body: "Open the app, tell us roughly how many cans you have and pick a slot. It takes under a minute." },
    { title: "We come to you", body: "Our collector arrives at your doorstep in Dehradun. No travel, nothing to drop off." },
    { title: "Count at your door", body: "Your cans are counted in front of you and paid for at the current per-can rate, so the payout is clear." },
    { title: "Get paid on collection", body: "You are paid on the spot. The aluminium then goes on to be recycled." },
  ],
  lists: [
    {
      title: "What we accept",
      items: [
        "Used aluminium soft-drink cans",
        "Beer and energy-drink cans",
        "Clean, dry and empty cans (rinsed is best)",
        "Crushed cans, to fit more into each pickup",
      ],
    },
    {
      title: "Who it is for",
      items: [
        "Households with regular can waste",
        "Bars, restaurants and cafes",
        "Hotels and homestays",
        "Shops",
      ],
    },
  ],
  hindi: {
    heading: "देहरादून में खाली एल्यूमिनियम कैन बेचें",
    body: [
      `कोल्ड ड्रिंक, बीयर और एनर्जी ड्रिंक के खाली कैन कूड़े में न फेंकें। हमारे ऐप से पिकअप बुक करें। हम आपके दरवाज़े पर आकर कैन आपके सामने गिनते हैं और ${RATE_CAN} प्रति कैन के हिसाब से पैसे उसी समय दे देते हैं।`,
      "घर, कैफे, रेस्टोरेंट, बार और होटल, सभी जगह से कलेक्शन होता है। पिकअप की कोई फीस नहीं है।",
    ],
  },
  faqHeading: "Selling cans in Dehradun",
  faqs: [
    {
      q: "How do I sell my used aluminium cans in Dehradun?",
      a: "Book a doorstep pickup in our free app. We come to your address across Dehradun, count the cans on the spot and pay you on collection. There is nothing to drop off and no fee.",
    },
    {
      q: "What does UBC mean?",
      a: "UBC means used beverage cans. In scrap trading it is the grade name for empty aluminium drink cans.",
    },
    {
      q: "Do you collect cans from home?",
      a: "Yes. We run a doorstep collection service across Dehradun for households, cafes, bars, restaurants and hotels. Schedule a pickup in the app and we handle the rest.",
    },
    {
      q: "How much do you pay for aluminium cans?",
      a: `We pay ${RATE_CAN} per can, settled on collection. The more clean, dry cans you gather, the more your pickup is worth. Rates last updated ${RATES_AS_OF}.`,
    },
    {
      q: "How many cans make a kilo?",
      a: "Roughly 60 to 70 standard drink cans weigh a kilo, depending on the can size. We pay per can, so you do not need to weigh them.",
    },
    {
      q: "What kind of cans do you accept?",
      a: "Used aluminium beverage cans: soft-drink, beer and energy-drink cans, ideally empty, rinsed and dry. Keeping them clean and crushed lets you fit more into each pickup.",
    },
    {
      q: "Which areas do you cover?",
      a: `We are live across Dehradun, including ${AREAS}. More cities are coming soon.`,
    },
    {
      q: "Do you collect from bars, restaurants and cafes?",
      a: "Yes. Venues get free collection bins (as stock allows) and scheduled pickups, and we pay on the spot at every pickup. We collect cans and PET bottles.",
    },
    {
      q: "Do you also buy PET bottles?",
      a: "Yes. We collect PET bottles from homes and businesses in Dehradun, paid by weight. You can sell cans and bottles on the same visit.",
    },
    {
      q: "Is there any charge for the pickup?",
      a: "No. The pickup is free and you get paid on collection. There are no fees or deductions for the doorstep service.",
    },
    {
      q: "How do I book a pickup?",
      a: "Open the app at app.thestallionmetallist.com, tell us roughly how many cans you have and pick a slot. You can also message us on WhatsApp at +91 99973 48394.",
    },
  ],
  related: [REL.pet, REL.venues],
  cta: {
    heading: "Got cans? Get paid.",
    sub: "Free doorstep pickup across Dehradun. Paid on collection.",
    primary: { label: "Book a pickup", href: "https://app.thestallionmetallist.com", external: true },
    secondary: { label: "Message us on WhatsApp", href: WHATSAPP_IN, external: true },
  },
};

export const petPage: ServiceData = {
  slug: "pet-bottle-collection-dehradun",
  title: `Sell PET Bottles in Dehradun | ${RATE_PET} per kg | The Stallion Metallist`,
  description: `Sell used PET bottles in Dehradun at ${RATE_PET} per kg. Doorstep pickup for homes, bars, cafes and restaurants. Book on WhatsApp.`,
  h1: "Sell your PET bottles in Dehradun",
  sub: `We collect empty PET bottles from homes and businesses across Dehradun and pay ${RATE_PET} per kg, weighed at your door. Book a pickup on WhatsApp.`,
  crumb: "PET bottle collection Dehradun",
  schemaName: "PET bottle doorstep collection",
  serviceType: "PET bottle collection",
  intro: [
    "PET is the clear, light plastic used for most water, soft-drink and juice bottles. It is one of the most recyclable plastics, and empty PET bottles have resale value as scrap.",
    `The Stallion Metallist collects PET bottles from households, bars, restaurants, cafes, hotels and shops in Dehradun. Tell us roughly how much you have, we confirm a pickup, and we come to you. We pay ${RATE_PET} per kg.`,
    "If you also have used aluminium cans, tell us and we will collect both on the same visit.",
  ],
  rates: {
    heading: "What we pay",
    rows: [{ item: "PET bottles", rate: `${RATE_PET} per kg`, note: "Weighed at your door" }],
  },
  stepsHeading: "How a PET pickup works",
  steps: [
    { title: "Message us", body: "Send a WhatsApp message with your area and roughly how much PET you have." },
    { title: "We confirm a pickup", body: "We tell you when our route covers your area and book your slot." },
    { title: "We weigh at your door", body: "Your bottles are weighed in front of you, so you see the weight." },
    { title: "You get paid", body: `You are paid ${RATE_PET} per kg for the weight we record.` },
  ],
  lists: [
    {
      title: "What we collect",
      items: [
        "Empty PET water bottles",
        "Empty soft-drink and juice bottles",
        "Empty, rinsed bottles (rinsed is best)",
        "Crushed bottles, to fit more into each pickup",
      ],
    },
    {
      title: "Who it is for",
      items: [
        "Households with regular bottle waste",
        "Bars, restaurants and cafes",
        "Hotels and homestays",
        "Shops",
      ],
    },
  ],
  hindi: {
    heading: "देहरादून में PET प्लास्टिक की खाली बोतलें बेचें",
    body: [
      `पानी, कोल्ड ड्रिंक और जूस की खाली PET बोतलें घर या दुकान से उठवाएँ। हम आपके पास आकर बोतलें आपके सामने तौलते हैं और ${RATE_PET} प्रति किलो के हिसाब से भुगतान करते हैं।`,
      "पिकअप बुक करने के लिए हमें WhatsApp पर अपना इलाका और बोतलों की अंदाज़न मात्रा बताएँ।",
    ],
  },
  faqHeading: "Selling PET bottles in Dehradun",
  faqs: [
    {
      q: "Where can I sell PET bottles in Dehradun?",
      a: "The Stallion Metallist collects PET bottles from homes and businesses across Dehradun. Message us on WhatsApp with your area and roughly how much you have, and we book a pickup.",
    },
    {
      q: "How much do you pay for PET bottles?",
      a: `We pay ${RATE_PET} per kg, weighed at your door. Rates last updated ${RATES_AS_OF}. Message us on WhatsApp at +91 99973 48394 to confirm before you book.`,
    },
    {
      q: "What is PET plastic?",
      a: "PET (polyethylene terephthalate) is the clear plastic used for most water, soft-drink and juice bottles. Look for the number 1 inside the recycling triangle on the bottle.",
    },
    {
      q: "How should I prepare PET bottles for pickup?",
      a: "Empty bottles are best. If you can, rinse them and crush them so more fit into each pickup. Tell us what you have when you book and we will confirm.",
    },
    {
      q: "Do you take glass bottles or other plastic?",
      a: "We currently collect PET bottles and aluminium cans. For glass or other kinds of plastic, message us on WhatsApp and we will tell you.",
    },
    {
      q: "Do you collect PET bottles from bars, restaurants and cafes?",
      a: "Yes. Venues get free collection bins (as stock allows) and scheduled pickups. See our page for bars, restaurants and cafes.",
    },
    {
      q: "Do you also buy aluminium cans?",
      a: "Yes. We collect used aluminium cans (UBC) across Dehradun and pay on collection. You can sell cans and bottles together.",
    },
    {
      q: "Which areas of Dehradun do you cover?",
      a: `We collect across Dehradun, including ${AREAS}. If your area is not listed, message us and we will tell you when we can reach it.`,
    },
  ],
  related: [REL.cans, REL.venues],
  cta: {
    heading: "Got bottles? Get paid.",
    sub: "Doorstep PET bottle pickup across Dehradun. Paid by weight.",
    primary: {
      label: "Book on WhatsApp",
      href: waLink("Hi, I would like to sell PET bottles in Dehradun. My area is: "),
      external: true,
    },
    secondary: { label: "Selling cans too? Open the app", href: "https://app.thestallionmetallist.com", external: true },
  },
};

export const venuesPage: ServiceData = {
  slug: "bar-restaurant-can-bottle-collection-dehradun",
  title: "Bar & Restaurant Can and Bottle Collection in Dehradun | The Stallion Metallist",
  description: `Free bins and scheduled pickups for cans and PET bottles from bars, restaurants and cafes in Dehradun. ${RATE_CAN} per can, ${RATE_PET}/kg PET, paid on the spot.`,
  h1: "Can and bottle collection for Dehradun bars and restaurants",
  sub: "Free collection bins (as stock allows), scheduled pickups for your empty aluminium cans and PET bottles, and payment on the spot at every visit.",
  crumb: "Bar and restaurant collection Dehradun",
  schemaName: "Can and PET bottle collection for venues",
  serviceType: "Commercial can and PET bottle collection",
  offer: "Free collection bins (as stock allows) and scheduled pickups; paid on the spot at every pickup.",
  intro: [
    "Bars, restaurants and cafes go through a lot of cans and bottles. We collect them from your venue so they leave as recycling instead of general waste, and you are paid for them.",
    `Your team drops empties into our bins during service. We collect on a fixed day for your area, count the cans, weigh the PET, and pay you right then. Our standard rates are ${RATE_CAN} per can and ${RATE_PET} per kg of PET. We currently collect aluminium cans and PET bottles.`,
  ],
  rates: {
    heading: "What we pay venues",
    rows: [
      { item: "Aluminium cans (UBC)", rate: `${RATE_CAN} per can`, note: "Counted at pickup, paid on the spot" },
      { item: "PET bottles", rate: `${RATE_PET} per kg`, note: "Weighed at pickup, paid on the spot" },
    ],
  },
  stepsHeading: "How it works for your venue",
  steps: [
    { title: "Tell us about your venue", body: "Message us your venue name, area and roughly what you go through in a typical week." },
    { title: "We place the bins", body: "We set up collection bins at your venue at no cost, as stock allows. If none are free, we add you to the list for the next one." },
    { title: "We collect on a schedule", body: "A collector visits on a fixed day for your area. Most venues are weekly, lower-volume ones every two weeks." },
    { title: "You are paid on the spot", body: "We count your cans, weigh the PET and pay you at every pickup." },
  ],
  lists: [
    {
      title: "What we collect",
      items: [
        "Aluminium beverage cans: beer, soft drink and energy drink",
        "PET bottles: water, soft drink and juice",
      ],
    },
    {
      title: "A good fit for",
      items: [
        "Bars and pubs",
        "Restaurants and cafes",
        "Hotels and homestays",
        "Shops",
      ],
    },
  ],
  faqHeading: "Questions from venues",
  faqs: [
    {
      q: "Do you collect cans and bottles from bars and restaurants in Dehradun?",
      a: "Yes. We collect used aluminium cans and PET bottles from bars, restaurants, cafes, hotels and shops across Dehradun, on a regular schedule.",
    },
    {
      q: "Do the collection bins cost anything?",
      a: "No. We provide the bins at no cost, as stock allows. If none are free right now, we add you to the list for the next one.",
    },
    {
      q: "How often do you collect?",
      a: "Most venues are collected once a week on a fixed day for their area. Lower-volume venues are collected every two weeks, and busy venues can get extra visits.",
    },
    {
      q: "How and when do you pay?",
      a: `You are paid on the spot at every pickup. We count the cans and weigh the PET in front of you. Our standard rates are ${RATE_CAN} per can and ${RATE_PET} per kg of PET, last updated ${RATES_AS_OF}. Message us on WhatsApp at +91 99973 48394 to confirm your rate.`,
    },
    {
      q: "Do you take glass bottles?",
      a: "We currently collect aluminium cans and PET bottles. For glass or anything else, message us on WhatsApp.",
    },
    {
      q: "What if our volume is low?",
      a: "That is fine. Lower-volume venues are visited every two weeks. Bins stay where they are used, so if a bin goes unused for a couple of months we may move it to another venue.",
    },
    {
      q: "How do we get started?",
      a: "Message us on WhatsApp with your venue name and area. We confirm your bin drop, as stock allows, and your collection day.",
    },
  ],
  related: [REL.cans, REL.pet],
  cta: {
    heading: "Turn your empties into a regular payout.",
    sub: "Free bins. Scheduled pickups. Paid on the spot.",
    primary: {
      label: "Get set up on WhatsApp",
      href: waLink("Hi, we run a venue in Dehradun and would like regular can and PET bottle collection. Venue name and area: "),
      external: true,
    },
    secondary: { label: "Call us", href: "tel:+919997348394" },
  },
};

/** Next.js metadata for a service page. */
export function serviceMetadata(d: ServiceData): Metadata {
  const path = `/${d.slug}`;
  return {
    title: { absolute: d.title },
    description: d.description,
    alternates: { canonical: path },
    openGraph: { title: d.title, description: d.description, url: path, type: "website" },
  };
}
