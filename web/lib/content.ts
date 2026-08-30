/* ============================================================================
 * THE STALLION METALLIST — SITE CONTENT
 * ----------------------------------------------------------------------------
 * This is the ONE file to edit when you want to change wording, numbers, grades,
 * routes, phone/email, etc. You do NOT need to touch any other file for content.
 *
 * Rules of thumb:
 *   • Text goes inside "quotes".
 *   • Keep the commas and curly braces where they are.
 *   • If you add an item to a list, copy an existing { ... } block and edit it.
 *   • TypeScript will warn if something is mistyped, so a typo can't silently
 *     break the page.
 * ========================================================================== */

export const site = {
  name: "The Stallion Metallist",
  shortName: "Stallion Metallist",
  // Used for the browser tab title + search engines.
  tagline: "Raw scrap. Refined trade.",
  description:
    "The Stallion Metallist is an international non-ferrous metal-scrap trading company, sourcing aluminium, copper, brass and stainless scrap across UAE, China, Europe and North America and delivering to India's furnaces, foundries and mills.",
  url: "https://www.thestallionmetallist.com", // canonical site URL (update when the domain is live)
  email: "contact@thestallionmetallist.com",
  phoneDisplay: "+91 99973 48394",
  phoneHref: "+919997348394",
  ubcAppUrl: "https://thestallionmetalist.com", // the live can-collection PWA (note: one "l")
  location: "Dehradun, Uttarakhand · India",
  incorporation: "Incorporated in Calgary, AB · Canada",
  copyrightYear: 2026,
};

// Social profiles. Shown in the footer and listed in the site's structured data
// (sameAs) so Google and AI engines link them to the company. Add or remove a
// { ... } block to change what appears.
export const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/the-stallion-metallist" },
  { label: "Instagram", href: "https://www.instagram.com/thestallionmetallist/" },
];

// Top navigation links. Real pages where they exist; "/#id" jumps to a section
// on the home page (works from any sub-page).
export const nav = [
  { label: "Trade", href: "/non-ferrous-scrap" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Recycle Cans", href: "/#ubc" },
];

export const hero = {
  badge: "International Non-Ferrous Scrap Trading",
  // Read by screen readers and search engines as the real H1 text (the giant
  // "STALLION" below is decorative for them). Keep it an accurate, plain sentence.
  seoHeading: "The Stallion Metallist. International non-ferrous scrap trading in Dehradun, India.",
  wordmark: "STALLION", // the giant metallic centerpiece
  tagLead: "Raw scrap.",
  tagAccent: "Refined trade.", // shown in copper
  ctaPrimary: { label: "Explore our trade", href: "#trade" },
  ctaGhost: { label: "How we operate", href: "#about" },
  marketsLabel: "Sourcing across global markets",
  markets: ["UAE", "China", "Europe", "North America"],
};

// Scrolling "grades" ticker under the hero. (Non-ferrous only.)
export const ticker = [
  { name: "Aluminium UBC", meta: "Baled" },
  { name: "Zorba", meta: "Al shred" },
  { name: "Twitch", meta: "Al float" },
  { name: "Copper", meta: "Millberry" },
  { name: "Bare Bright", meta: "Cu 99%+" },
  { name: "Brass", meta: "Honey" },
  { name: "Zurik", meta: "Recovery" },
  { name: "Stainless", meta: "304 / 316" },
];

export const about = {
  eyebrow: "About us",
  heading: "A Canadian trade house, built for Indian industry.",
  lead: "Stallion Metallist Ltd. is an international metal-scrap trading company, incorporated in Calgary and operating on the ground in Dehradun, bridging global supply with India's furnaces and foundries.",
  ratingNote: "Full-cycle trade: sourcing, clearance and delivery",
  cta: { label: "Learn more", href: "#why" },
  chipA: { num: "50", unit: "K+", label: "Tons traded / year" },
  chipB: { num: "03", unit: "", label: "Ports cleared · MUN·KDL·NSA" },
};

// Trade-route globe: source markets converging on India (the hub).
export const routes = {
  eyebrow: "Global sourcing",
  heading: "The world's scrap, routed to India.",
  sub: "We source across four global markets and channel it directly to India's furnaces, foundries and mills.",
  // lat/lng place the node on the 3D globe; v is the tonnage shown on the chip/label.
  nodes: [
    { id: "nam", lat: 39, lng: -98, label: "North America", v: "12k T" },
    { id: "eur", lat: 50, lng: 9, label: "Europe", v: "9k T" },
    { id: "chn", lat: 34, lng: 108, label: "China", v: "16k T" },
    { id: "uae", lat: 24, lng: 54, label: "UAE", v: "13k T" },
    { id: "ind", lat: 22, lng: 79, label: "India", v: "50K+ T/yr", hub: true },
  ] as GlobeNode[],
};

export type GlobeNode = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  v: string;
  hub?: boolean;
};

export const ubc = {
  eyebrow: "UBC Collection · The app",
  heading: "Turn waste aluminium cans into cash.",
  body: "Our progressive web app makes recycling pay. Book a doorstep pickup for your used beverage cans and get paid on collection. No fees, no fuss. Live in Dehradun now, with more cities coming soon.",
  liveBadge: "Now serving Dehradun",
  soonBadge: "More cities soon",
  cta: { label: "Get started", href: site.ubcAppUrl },
  // The phone mockup mirrors the real app. Neutral demo identity (not a real member).
  demo: {
    greetingName: "Ravi",
    memberName: "Ravi Kumar",
    memberSince: "2026",
  },
};

export const services = {
  eyebrow: "What we do",
  heading: "Our solutions",
  lead: "Beyond trading, full-cycle material recovery, from sorting and recycling to certified destruction.",
  cta: { label: "View all services", href: "#trade" },
  items: [
    { tag: "Recovery", title: "Metal Recycling", img: "/images/metal_recycling.webp", alt: "Metal recycling" },
    { tag: "Zero-waste", title: "Waste Diversion", img: "/images/waste_diversion.webp", alt: "Industrial waste diversion" },
    { tag: "Certified", title: "Product Destruction", img: "/images/product_destruction.webp", alt: "Certified product destruction" },
  ],
};

export const process = {
  eyebrow: "How we operate",
  heading: "Full-cycle trade, five moves.",
  steps: [
    { n: "01", title: "Source", body: "Direct exporter relationships across UAE, China, Europe & North America." },
    { n: "02", title: "Negotiate", body: "Contracts executed to international trade standards with global exporters." },
    { n: "03", title: "Clear", body: "Documentation, customs & logistics at Mundra, Kandla and JNPT." },
    { n: "04", title: "Deliver", body: "To recyclers, furnaces & manufacturers across the Gujarat belt." },
    { n: "05", title: "Settle", body: "Structured terms: LC at sight and T/T arrangements." },
  ],
};

export const trade = {
  eyebrow: "What we trade",
  heading: "Internationally graded non-ferrous scrap.",
  lead: "A full range of non-ferrous grades, sourced from established exporters and delivered to India's processors and mills.",
  tapHint: "Tap a grade for its spec.",
  // Two non-ferrous groups (keeps the two-column layout balanced). Add/remove a
  // whole group by copying a { ... } block; set `dark: true` for the darker card.
  groups: [
    {
      title: "Aluminium & Copper",
      count: "02 grades",
      grades: [
        { name: "Aluminium UBC · Zorba", code: "AL", specs: ["Baled UBC", "Zorba shred", "Twitch available"] },
        { name: "Copper Millberry", code: "CU", specs: ["99%+ bright", "Bare bright", "Electrical grade"] },
      ],
    },
    {
      title: "Brass & Stainless",
      count: "02 grades",
      dark: true,
      grades: [
        { name: "Brass Honey", code: "BR", specs: ["Yellow brass", "Plumbing & eng.", "Low attachments"] },
        { name: "Stainless Steel", code: "304/316", specs: ["Solids & turnings", "Ni-bearing", "Grade-sorted"] },
      ],
    },
  ] as TradeGroup[],
};

export type Grade = { name: string; code: string; specs: string[] };
export type TradeGroup = { title: string; count: string; dark?: boolean; grades: Grade[] };

export const stats = {
  eyebrow: "Scale",
  heading: "Volume, routes and relationships that move material at scale.",
  // "to" is the number it counts up to; "pad" left-pads with zeros (e.g. 4 -> 04).
  items: [
    { to: 50, unit: "K+", pad: 0, label: "Tons / year", desc: "High-grade scrap moved across borders." },
    { to: 4, unit: "", pad: 2, label: "Global markets", desc: "UAE · China · Europe · N. America." },
    { to: 3, unit: "", pad: 2, label: "Major ports", desc: "Mundra · Kandla · JNPT clearance." },
    { to: 100, unit: "+", pad: 0, label: "Trusted partners", desc: "Vetted exporters and recyclers." },
  ],
};

export const why = {
  eyebrow: "Why Stallion Metallist",
  heading: "Global structure. Local execution.",
  cards: [
    { icon: "◇", title: "Global entity", body: "Canada-incorporated with a credible, internationally recognised corporate structure." },
    { icon: "◈", title: "On the ground", body: "Active in both India and the West, bridging global supply with Indian demand." },
    { icon: "▤", title: "Buyer network", body: "Deep knowledge of the Rajkot and Gujarat scrap-buyer ecosystem." },
    { icon: "◆", title: "Compliant terms", body: "Structured payment processes that meet international exporter expectations." },
  ],
};

export const cta = {
  heading: "Let's move your material.",
};

export const footer = {
  blurb: "International non-ferrous scrap trading, sourcing the raw materials of the world for India's heavy industry.",
  navHeading: "Navigate",
  navLinks: [
    { label: "Non-ferrous scrap", href: "/non-ferrous-scrap" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  contactHeading: "Contact",
};
