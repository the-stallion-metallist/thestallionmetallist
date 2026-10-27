import { RATE_CAN, RATE_PET, RATES_AS_OF } from "./rates";
import { WHATSAPP_IN, waLink } from "./services";
import { REL, ubcGuide, petGuide, type GuideData } from "./guides";

/* ============================================================================
 * BLOG POSTS. Researched explainers on aluminium cans and PET bottles, rendered
 * by components/GuidePage.tsx at /learn/<slug>. Every figure carries a source in
 * `sources`. Where a source is secondary or old, the text says so. If a rate,
 * date or figure changes, edit it here and bump the updated label.
 * ========================================================================== */

const PUBLISHED = "2026-10-27";
const UPDATED = "27 October 2026";

const canRs = parseFloat(RATE_CAN.replace(/[^\d.]/g, ""));
const inr = (n: number) => `₹${Number.isInteger(n) ? n : n.toFixed(2).replace(/0$/, "")}`;

const CTA_CANS: GuideData["cta"] = {
  heading: "Got cans? Get paid.",
  sub: "Free doorstep pickup across Dehradun. Paid on collection.",
  primary: { label: "Book a pickup", href: "https://app.thestallionmetallist.com", external: true },
  secondary: { label: "Message us on WhatsApp", href: WHATSAPP_IN, external: true },
};

const CTA_PET: GuideData["cta"] = {
  heading: "Got bottles? Get paid.",
  sub: "Doorstep PET bottle pickup across Dehradun.",
  primary: {
    label: "Book on WhatsApp",
    href: waLink("Hi, I would like to sell PET bottles in Dehradun. My area is: "),
    external: true,
  },
  secondary: { label: "Selling cans too? Open the app", href: "https://app.thestallionmetallist.com", external: true },
};

const CTA_VENUE: GuideData["cta"] = {
  heading: "Turn your empties into a regular payout.",
  sub: "Bins, a fixed pickup day and payment on the spot for bars, restaurants and cafes in Dehradun.",
  primary: {
    label: "Get set up on WhatsApp",
    href: waLink("Hi, I run a venue in Dehradun and want can and PET collection. Venue name and area: "),
    external: true,
  },
  secondary: { label: "Call us", href: "tel:+919997348394" },
};

const L = {
  ubc: { label: "What is UBC scrap?", href: "/learn/what-is-ubc-scrap", blurb: "Used beverage cans explained." },
  petGuide: {
    label: "How to recycle PET bottles",
    href: "/learn/how-to-recycle-pet-bottles-dehradun",
    blurb: "What counts as PET and how to prepare it.",
  },
  kilo: {
    label: "How many cans make a kilo?",
    href: "/learn/how-many-aluminium-cans-in-a-kilo",
    blurb: "Can weights by size, and what a kilo is worth.",
  },
  crush: {
    label: "Should you crush cans?",
    href: "/learn/should-you-crush-aluminium-cans",
    blurb: "Where the advice comes from and what applies here.",
  },
  newCans: {
    label: "Do old cans become new cans?",
    href: "/learn/do-old-cans-become-new-cans",
    blurb: "What a 2025 industry report found.",
  },
  cansIndia: {
    label: "Why India is switching to cans",
    href: "/learn/why-india-is-switching-to-cans",
    blurb: "Brewers, shortages and what it means for scrap.",
  },
  petCaps: {
    label: "PET caps, labels and colours",
    href: "/learn/pet-bottle-caps-labels-and-colours",
    blurb: "Three small choices that change how a bottle recycles.",
  },
  petWhere: {
    label: "Where PET bottles go in India",
    href: "/learn/where-pet-bottles-go-in-india",
    blurb: "From your bag to fibre and new bottles.",
  },
  petRules: {
    label: "India's 2026 plastic rules",
    href: "/learn/plastic-rules-2026-pet-bottles",
    blurb: "Recycled-content targets for bottles.",
  },
  venueRules: {
    label: "Waste rules for venues, 2026",
    href: "/learn/waste-rules-bars-restaurants-cafes-2026",
    blurb: "Four-stream segregation and bulk generators.",
  },
  whereSell: {
    label: "Where to sell in Dehradun",
    href: "/learn/where-to-sell-cans-and-pet-bottles-dehradun",
    blurb: "Kabadiwala, NGO programme or doorstep collector.",
  },
  compare: {
    label: "Can vs PET vs glass",
    href: "/learn/aluminium-can-vs-pet-bottle-vs-glass",
    blurb: "What the studies say, and who paid for them.",
  },
};

/* 1 ------------------------------------------------------------------------ */
const kilo: GuideData = {
  slug: "learn/how-many-aluminium-cans-in-a-kilo",
  title: "How Many Aluminium Cans Make a Kilo? | The Stallion Metallist",
  description:
    "A 330 ml can weighs about 9.5 to 10 g and a 500 ml can about 12 to 13 g, so a kilo is 80 to 105 new cans. Used cans weigh more. The maths, and how to count your own.",
  h1: "How many aluminium cans make a kilo?",
  sub: "Can makers publish the weights. Used cans from real bins come out heavier, and that changes the count.",
  crumb: "Cans in a kilo",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "Cans in a kilo",
  ogSub: "Weights by size, and the maths",
  answer: `A 330 ml can weighs about 9.5 to 10 g new, so a kilo is roughly 100 cans. A 500 ml can weighs about 12 to 13 g, so a kilo is roughly 80. Used cans from collection come out heavier, and our working figure is about 65 cans to the kilo.`,
  sections: [
    {
      heading: "What can makers publish",
      body: [
        "Can makers list a nominal weight for every can they sell. Ball said in 2012 that it had cut its 330 ml can to just under 9.5 g. Ardagh Metal Packaging's specification for a 500 ml can gives a nominal finished weight of 12.4 g, give or take 0.8 g.",
        "Divide a kilo by those weights. A 330 ml can at 9.5 to 10 g gives 100 to 105 cans. A 500 ml can at 12 to 13 g gives about 77 to 83.",
      ],
    },
    {
      heading: "Why a bag of used cans weighs more",
      body: [
        "Those are weights for new, empty cans. A can that spent a weekend in a bar bin can hold leftover drink, ash and grit, and older can designs were heavier than today's.",
        "Our working figure for cans we collect in Dehradun is about 65 to the kilo. That is the number we use for our own stock, not a rule. Your count will be higher if your cans are mostly small and clean, and lower if they are mostly 500 ml.",
      ],
    },
    {
      heading: "Per can or per kilo: same price, different money",
      body: [
        "Scrap dealers usually quote a price per kilo. We pay per can. The two are tied together by how many cans a kilo holds, so the same rate per kilo can mean very different money per can.",
        `Here is what our ${RATE_CAN} per can works out to for a kilo of cans at different counts:`,
      ],
      list: [
        `100 cans to the kilo: ${inr(100 * canRs)}`,
        `80 cans to the kilo: ${inr(80 * canRs)}`,
        `65 cans to the kilo: ${inr(65 * canRs)}`,
      ],
    },
    {
      heading: "Count your own",
      body: [
        "Pick 100 cans from your usual mix. Weigh them on a kitchen or shop scale, then divide 100 by the weight in kilos. If they weigh 1.4 kg, you have about 71 cans to the kilo.",
        "When a dealer quotes you a price per kilo, ask whether the weight is before or after the bag, and do the same division. It takes a minute and shows you what you are really being paid per can.",
      ],
    },
    {
      heading: "Why the price per kilo moves",
      body: [
        "Aluminium is traded on the London Metal Exchange. AL Circle's daily reports had the LME cash offer price at roughly $3,100 to $3,150 a tonne in the first week of October 2026. Scrap dealers pay less than that benchmark, and the gap changes.",
        "CRU, which follows the can scrap market, says scrap prices respond to the metal price and the premium, just not as fast, so the discount widens when the metal jumps. India has its own dealers and its own rates, so a figure from another market will not match what you are offered. Ask for today's rate.",
      ],
    },
  ],
  faqs: [
    {
      q: "How many 330 ml cans make a kilo?",
      a: "About 100 to 105 new cans, based on a weight of 9.5 to 10 g each. Used cans weigh more, so a kilo of collected cans holds fewer.",
    },
    {
      q: "How many 500 ml cans make a kilo?",
      a: "About 77 to 83 new cans, based on a weight of 12 to 13 g each.",
    },
    {
      q: "How much does an empty aluminium can weigh?",
      a: "A new 330 ml can weighs about 9.5 to 10 g. A new 500 ml can weighs about 12 to 13 g. Weights vary by maker and design.",
    },
    {
      q: "Does crushing a can change its weight?",
      a: "No. Crushing changes the shape, not the weight. Leftover liquid does change it, which is why cans should be emptied and rinsed.",
    },
    {
      q: "Do you pay per can or per kilo?",
      a: `Per can. We count the cans at your door and pay ${RATE_CAN} per can on collection. Rates last updated ${RATES_AS_OF}.`,
    },
  ],
  sources: [
    { label: "Cantech: Ball reduces weight of beverage cans (2012)", href: "https://www.cantechonline.com/news/3522/ball-reduces-weight-of-beverage-cans/" },
    { label: "Ardagh Metal Packaging specification, 500 ml can", href: "https://help.nomoq.com/hubfs/Product%20Specifications/04_5_1_66_500_1_06_en.pdf?hsLang=en" },
    { label: "AL Circle: LME aluminium offer price at October start", href: "https://www.alcircle.com/news/lme-aluminium-offer-price-eases-0-34-to-3-109-5-t-at-october-start-as-stocks-dip-to-240-625t-121420" },
    { label: "CRU: Scrap musings for December", href: "https://www.aluminummarketupdate.crugroup.com/global-trade/scrap-musings-for-december/" },
  ],
  related: [L.crush, L.ubc, REL.cans],
  cta: CTA_CANS,
};

/* 2 ------------------------------------------------------------------------ */
const crush: GuideData = {
  slug: "learn/should-you-crush-aluminium-cans",
  title: "Should You Crush Aluminium Cans? | The Stallion Metallist",
  description:
    "Crush or not, rinse or not. Where the 'do not crush' advice comes from, why wet cans are the real problem, and what to do before a pickup.",
  h1: "Should you crush aluminium cans before recycling?",
  sub: "The advice online contradicts itself. Here is where it comes from, and what applies when a person collects your cans.",
  crumb: "Should you crush cans",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "Crush your cans?",
  ogSub: "What recyclers actually say",
  answer:
    "Rinse them, let them drain, and crush them only if your buyer is fine with crushed cans. The 'do not crush' advice comes from kerbside sorting plants that sort by shape. It does not apply when a person collects the cans and handles them by hand.",
  sections: [
    {
      heading: "Where the 'do not crush' advice comes from",
      body: [
        "Many recycling plants use machines that \"see\" the shape of an item when deciding where to send paper, glass, metal and plastic. Writing in the Concord Monitor in 2024, David Brooks put the problem this way: a crushed can does not look like a can, so it can go to the wrong place and foul the system.",
        "That is a real concern in single-stream kerbside systems, where cans, paper, plastic and glass travel mixed together. Most of the 'never crush your cans' headlines trace back to it.",
      ],
    },
    {
      heading: "Where crushing is fine",
      body: [
        "Some plants do not sort cans by shape at all. Jeff Weld, director of communications at Casella, a US recycler, told the Concord Monitor that they use eddy currents to sort aluminium from ferrous metals, so it is not a shape issue. An eddy current separator spins a magnet near conductive metal such as aluminium, which creates a current that pushes the metal off the belt and into its own bin.",
        "If your cans go to a person who sorts by hand, shape does not matter to the sort either. Whether they like crushed cans is a question for them.",
      ],
    },
    {
      heading: "Rinsing matters more",
      body: [
        "Liquid is the real concern. The UK's Health and Safety Executive says one of the most common causes of explosions in metal furnaces is water getting in with wet scrap, and it tells operators to punch holes in drums so liquid can drain. A splash left in a can is nowhere near that scale, but recyclers want their scrap dry for the same reason.",
        "There are plainer reasons too. Leftover drink adds weight, attracts ants and flies, and smells after a few days in a warm store room.",
      ],
    },
    {
      heading: "A simple routine",
      list: [
        "Tip out the last of the drink and rinse the can once.",
        "Stand it upside down to drain.",
        "Bag the cans loose, or crush them if you want to save space and your buyer accepts them.",
        "Open and empty any can that is still full or sealed before crushing it.",
        "Keep cans away from bottles, foil and food waste.",
      ],
    },
    {
      heading: "What we ask",
      body: [
        "We count cans at your door. If you crush them, put them in a bag so the count is quick, and tell us when you book.",
      ],
    },
  ],
  faqs: [
    {
      q: "Do aluminium cans need to be rinsed before recycling?",
      a: "A quick rinse is enough. Leftover drink adds weight, attracts pests and smells, and recyclers prefer dry scrap.",
    },
    {
      q: "Does crushing a can reduce its value?",
      a: "Crushing does not change a can's weight, so it does not change what a kilo is worth. Whether a buyer takes crushed cans is their call, so ask.",
    },
    {
      q: "Why do some recyclers say not to crush cans?",
      a: "Plants that sort by shape can send a crushed can to the wrong place because it no longer looks like a can. Plants that use eddy currents do not have that problem.",
    },
    {
      q: "Should I crush cans before selling them to a kabadiwala?",
      a: "Ask the buyer. A person who sorts by hand is not affected by shape, and crushed cans take less room in a sack.",
    },
  ],
  sources: [
    { label: "Concord Monitor: Should you crush your aluminum cans before recycling? (2024)", href: "https://granitegeek.concordmonitor.com/2024/02/21/should-you-crush-your-aluminum-cans-before-recycling-probably/" },
    { label: "UK Health and Safety Executive: Molten metal and water explosions", href: "https://www.hse.gov.uk/moltenmetals/safety-topics.htm" },
  ],
  related: [L.kilo, L.ubc, REL.cans],
  cta: CTA_CANS,
};

/* 3 ------------------------------------------------------------------------ */
const newCans: GuideData = {
  slug: "learn/do-old-cans-become-new-cans",
  title: "Do Old Cans Become New Cans? 2025 Data | The Stallion Metallist",
  description:
    "71% of aluminium cans are recycled, but only 33% are made back into cans. What the International Aluminium Institute found, and what it asks of people who collect cans.",
  h1: "Do old cans really become new cans?",
  sub: "Some do. A 2025 industry report counted where recycled cans end up, and the answer is less tidy than the slogans.",
  crumb: "Do old cans become new cans",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "Old cans, new cans",
  ogSub: "What the 2025 data says",
  answer:
    "Some do, many do not. The International Aluminium Institute found that 71% of cans placed on the market are recycled, but only 33% are made back into new cans. The rest become other aluminium products, such as engine blocks.",
  sections: [
    {
      heading: "The numbers",
      body: [
        "In September 2025 the International Aluminium Institute (IAI) published Can-to-Can Recycling: Performance, Potential and Pathways. As reported by Aluminium International Today, it found that 71% of aluminium cans placed on the market are recycled, and that 33% are made back into new cans. That 33% is about 140 billion cans.",
        "The same report puts the equivalent figure at 7% for PET and 20% for glass, which is the sense in which cans lead. The comparison is about how much comes back as the same kind of container.",
      ],
    },
    {
      heading: "Why recycled cans end up elsewhere",
      body: [
        "More than 20% of recycled cans go into products such as engine blocks. The report blames incompatible alloys, which keep that metal out of the can cycle.",
        "It also finds that 87% of recycled cans could return to cans today without changing alloys or remelter operations, yet only 47% do. By the report's own count, a 40-point gap could close with no change to alloys or furnaces.",
      ],
    },
    {
      heading: "What the report asks of collectors",
      list: [
        "High collection rates.",
        "Clean used beverage can (UBC) scrap.",
        "Alloys designed with recycling in mind.",
        "Policies that limit contamination and scrap leaking out of the system.",
      ],
      body: [
        "Cans kept apart from other metals, rinsed and dry, are the simplest part of that list, and the part a household or a bar controls.",
      ],
    },
    {
      heading: "A can's second life can be quick",
      body: [
        "The Aditya Birla Group says Novelis, which it describes as the world's largest aluminium recycler, turns used cans into new cans within 60 days. The same page says aluminium can be recycled repeatedly without losing quality.",
        "The IAI estimates that 74.5% of all the aluminium ever made, 1.2 billion of 1.6 billion tonnes produced between 1888 and 2021, is still in use.",
      ],
    },
    {
      heading: "What about India",
      body: [
        "We looked for a current figure for how many beverage cans are recycled in India and did not find a reliable one. The IAI numbers above are global.",
        "Hindalco, India's large aluminium producer, says its downstream units have dedicated recycling and remelting facilities and take scrap from reverse supply contracts with customers, scrap collected from the market, and its own process scrap. It does not publish can-specific volumes.",
      ],
    },
  ],
  faqs: [
    {
      q: "What percentage of aluminium cans are recycled?",
      a: "Globally, 71% of cans placed on the market are recycled, according to the International Aluminium Institute's 2025 can-to-can report. We did not find a reliable India-specific figure.",
    },
    {
      q: "Do aluminium cans become new cans?",
      a: "Some do. About 33% of cans are made back into cans. Others become different aluminium products such as engine blocks.",
    },
    {
      q: "Can aluminium be recycled forever?",
      a: "Aluminium keeps its properties through recycling, so it can be recycled repeatedly. The IAI estimates that about three quarters of all aluminium ever produced is still in use.",
    },
    {
      q: "Why does it matter that cans are clean?",
      a: "The IAI report calls for clean UBC scrap. Contamination lowers what the metal can be made into.",
    },
  ],
  sources: [
    { label: "Aluminium International Today: IAI highlights aluminium circularity potential (26 Sep 2025)", href: "https://aluminiumtoday.com/news/international-aluminium-institute-highlights-aluminium-circularity-potential" },
    { label: "Aditya Birla Group: Recycling aluminium, the circularity of cans and cars", href: "https://www.adityabirla.com/media/stories/recycling-aluminium-the-circularity-of-cans-and-cars/" },
    { label: "International Aluminium Institute: 75% of all aluminium ever produced is still in use", href: "https://international-aluminium.org/landing/75-of-all-aluminium-ever-produced-is-still-in-use-today/" },
  ],
  related: [L.ubc, L.compare, REL.cans],
  cta: CTA_CANS,
};

/* 4 ------------------------------------------------------------------------ */
const cansIndia: GuideData = {
  slug: "learn/why-india-is-switching-to-cans",
  title: "Why India Is Switching to Cans | The Stallion Metallist",
  description:
    "Brewers say demand is moving from bottles to cans faster than factories can make them. What is driving it, the 500 ml can shortage, and where the empties go.",
  h1: "Why more of India is drinking from cans",
  sub: "Brewers say demand is shifting from bottles to cans faster than factories can keep up. Every can sold becomes a can to collect.",
  crumb: "Why India is switching to cans",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "India loves cans",
  ogSub: "Bottles to cans, and the scrap",
  answer:
    "AB InBev India says cans are about 30% of total industry volumes and that demand is shifting from bottles to cans. The Brewers Association of India reported a shortage of 12 to 13 crore 500 ml cans a year. More cans sold means more empty cans to collect.",
  sections: [
    {
      heading: "What the brewers say",
      body: [
        "Kartikeya Sharma, president of AB InBev India, told Moneycontrol in December 2025 that cans account for about 30% of total industry volumes and that \"demand is significantly shifting from bottles to cans.\"",
        "He gave format reasons: cans chill faster, are easier to carry, and are less likely to break on a two-wheeler. He also pointed to changing lifestyles and convenience among urban drinkers.",
      ],
    },
    {
      heading: "The 500 ml can shortage",
      body: [
        "The Brewers Association of India estimates a yearly shortage of 12 to 13 crore 500 ml cans, which AL Circle reported as nearly 20% of the country's beer sales. Ball Beverage Packaging India and Can-Pack India had both hit full production capacity at home, and both said expansion would take six to twelve months.",
        "A quality control order added a second squeeze. From 1 April 2025 aluminium cans needed BIS certification. The deadline for importing uncertified cans was pushed to 30 September 2025, and the brewers asked for a further extension to April 2026, saying the first extension still left importing impractical.",
      ],
    },
    {
      heading: "What it means for the empties",
      body: [
        "Every can sold is a can that will be empty within hours. In a city like Dehradun the empties pile up in bars, restaurants, cafes and homes.",
        `A bar that goes through 200 cans on a busy weekend is holding about ${inr(200 * canRs)} of cans at our ${RATE_CAN} per can. That is an example for scale, not a promise of volume. The point is that a can is worth something after the drink, and the habit of throwing it in the wet bin has a price.`,
      ],
    },
    {
      heading: "Cans and bottles in the same bin",
      body: [
        "Switching from glass to cans changes what a venue has to deal with. Glass bottles are heavy and break. Cans are light, stack in a sack, and are worth money to a collector.",
        "If you run a bar or restaurant, our venue service sets up bins and a fixed pickup day. We currently collect cans and PET bottles. For glass, message us.",
      ],
    },
  ],
  faqs: [
    {
      q: "Why are beer cans in short supply in India?",
      a: "Demand has grown faster than domestic can capacity. The Brewers Association of India estimates a yearly shortage of 12 to 13 crore 500 ml cans, and the two main can makers were at full capacity in October 2025.",
    },
    {
      q: "What share of beer is sold in cans in India?",
      a: "AB InBev India's president said in December 2025 that cans account for about 30% of total industry volumes. The Brewers Association's shortfall figure is nearly 20% of beer sales.",
    },
    {
      q: "Are cans better for the environment than bottles?",
      a: "It depends on recycled content and how often the container is returned. We went through the studies in a separate guide.",
    },
    {
      q: "Do you collect beer cans in Dehradun?",
      a: `Yes. We collect used aluminium cans of any drink from homes and venues in Dehradun and pay ${RATE_CAN} per can on collection.`,
    },
  ],
  sources: [
    { label: "Asia Brewers Network: India's urban beer drinkers shift from bottles to cans (17 Dec 2025)", href: "https://asiabrewersnetwork.com/news/indias-urban-beer-drinkers-shift-from-buying-bottles-to-cans" },
    { label: "AL Circle: Beer growth in India stalls as aluminium can supply hits capacity limits (13 Oct 2025)", href: "https://www.alcircle.com/news/beer-growth-in-india-stalls-as-aluminium-can-supply-hits-capacity-limits-115810" },
  ],
  related: [L.compare, REL.venues, REL.cans],
  cta: CTA_VENUE,
};

/* 5 ------------------------------------------------------------------------ */
const petCaps: GuideData = {
  slug: "learn/pet-bottle-caps-labels-and-colours",
  title: "PET Bottle Caps, Labels and Colours | The Stallion Metallist",
  description:
    "Should the cap stay on? Do labels matter? Does colour change anything? What recyclers say about each, and how to prepare bottles before a pickup.",
  h1: "PET bottles: caps, labels and colours",
  sub: "Three small choices change how well a bottle recycles. Here is what recyclers say about each one.",
  crumb: "PET caps, labels and colours",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "PET caps and labels",
  ogSub: "What recyclers say",
  answer:
    "Empty the bottle and rinse it. Recyclers now mostly say to put the cap back on, and plain labels are fine. Clear PET recycles most easily, and bottles with PVC sleeves or heavy colour are harder to handle.",
  sections: [
    {
      heading: "Caps: usually on",
      body: [
        "Bottle caps are normally made of a different plastic, polypropylene or HDPE. At a recycling plant the bottles are ground into flakes and washed. The flakes then go through a water bath where PET sinks and the cap plastic floats, so the two come apart on their own.",
        "Kent State University's sustainability office tells people to keep caps on, for two reasons: caps are recyclable too, and an easier rule gets more people to recycle.",
        "The older advice in Australia was to leave caps off. Bottles still holding liquid were being rejected or causing contamination, and caps could pop off while bottles were baled under compression. Today the Australasian Recycling Label says \"Crush Bottle and Replace Cap\", which makes it less likely the bottle still holds liquid and keeps the cap from popping off.",
        "It is not settled everywhere. In the UK, some plastics reprocessors prefer householders to remove caps, because it is then easier to separate the two parts. Ask whoever collects your bottles which they prefer.",
      ],
    },
    {
      heading: "Labels: mostly a sorting-plant problem",
      body: [
        "Design guidelines from European recyclers flag sleeves and labels made of denser plastics such as PVC, as well as PET labels and paper labels that are not wet-strength, as contaminants in the PET stream. A PVC sleeve can also hide the bottle from the near-infrared scanners that identify plastic, so the whole bottle gets sorted wrongly.",
        "Those scanners are in large optical sorting plants. For a bottle you hand to a collector, the practical advice is simple: if a shrink sleeve tears off easily, take it off, and do not scrape off paper labels.",
      ],
    },
    {
      heading: "Colour: clear is easiest",
      body: [
        "WRAP, the UK's recycling charity, said in 2019 that using clear PET rather than coloured plastic increases the chance a pack gets recycled, because the end market for clear PET is stronger. RecyClass grades light transparent colours as fully compatible with recycling, dark transparent colours as limited, and opaque, fluorescent or metallic colours as not compatible.",
        "Plants usually split coloured bottles into separate colour streams. A green or brown bottle is still recyclable, but it gives the recycler fewer ways to use it.",
      ],
    },
    {
      heading: "A routine that works",
      list: [
        "Empty the bottle and rinse it once.",
        "Crush it flat, then put the cap back on.",
        "Keep clear bottles together and coloured ones together.",
        "Keep out other plastics, caps from other products, glass and cans.",
        "Keep the bag dry and away from food waste.",
      ],
    },
    {
      heading: "Selling PET in Dehradun",
      body: [
        `We collect PET bottles from homes and businesses in Dehradun, weigh them at your door and pay ${RATE_PET} per kg. Rates last updated ${RATES_AS_OF}.`,
      ],
    },
  ],
  faqs: [
    {
      q: "Should I take the cap off a PET bottle before recycling?",
      a: "Many recyclers prefer the cap back on, because the cap plastic floats off in the wash while the PET sinks. Some reprocessors prefer caps removed, so ask whoever collects your bottles.",
    },
    {
      q: "Do I need to remove the label from a plastic bottle?",
      a: "Plain paper labels can stay. A shrink sleeve that tears off easily is worth removing, because PVC sleeves can confuse sorting machines.",
    },
    {
      q: "Can coloured PET bottles be recycled?",
      a: "Yes, but clear bottles are easiest. Coloured bottles are usually sorted into separate colour streams, and opaque colours are harder to recycle.",
    },
    {
      q: "Why crush a bottle and put the cap back on?",
      a: "It takes less room, makes it less likely the bottle still holds liquid, and keeps the cap from popping off when bottles are baled. The Australasian Recycling Label gives the same instruction.",
    },
  ],
  sources: [
    { label: "Kent State University: Should caps be on or off bottles? Caps on", href: "https://www.kent.edu/sustainability/should-caps-be-or-bottles-answer-caps" },
    { label: "Let's Recycle: Recycling rules will seek to answer bottle cap question", href: "https://letsrecycle.com/news/recycling-rules-will-seek-to-answer-bottle-cap-question" },
    { label: "Let's Recycle: Favour clear plastics to maximise recycling, WRAP says (16 Jul 2019)", href: "https://www.letsrecycle.com/news/latest-news/favour-clear-plastics-to-maximise-recycling-wrap-says/" },
    { label: "Treepl: Caps on plastic bottles (Australasian Recycling Label)", href: "https://prep.treepl.co/blog/caps-on-plastic-bottles" },
    { label: "RecyClass: Design for recycling guidelines, transparent coloured PET bottles", href: "https://recyclass.eu/wp-content/uploads/2026/03/RecyClass-DfR-Guidelines-Transparent-coloured-PET-bottles.pdf" },
    { label: "Plastics Recyclers Europe: PET bottles factsheet", href: "https://www.plasticsrecyclers.eu/wp-content/uploads/2022/10/PET-Bottles-Factsheets.pdf" },
  ],
  related: [L.petWhere, L.petGuide, REL.pet],
  cta: CTA_PET,
};

/* 6 ------------------------------------------------------------------------ */
const petWhere: GuideData = {
  slug: "learn/where-pet-bottles-go-in-india",
  title: "Where Recycled PET Bottles Go in India | The Stallion Metallist",
  description:
    "From your bag to polyester fibre and, increasingly, new bottles. What happens to PET in India, with the numbers and how old they are.",
  h1: "Where do recycled PET bottles go in India?",
  sub: "A large share goes into fibre for cushions and clothes. A smaller share goes back into bottles, and that share is growing.",
  crumb: "Where PET bottles go in India",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "Where PET goes",
  ogSub: "Fibre, flakes and new bottles",
  answer:
    "Much of India's recycled PET is washed, shredded into flakes and spun into polyester fibre for filling, fabric and yarn. A smaller but growing share becomes food-grade resin for new bottles, since FSSAI issued rPET guidelines in May 2025.",
  sections: [
    {
      heading: "The last national study is from 2016",
      body: [
        "The National Chemical Laboratory did the study, which the PET Packaging Association for Clean Environment commissioned in 2016. Recycling International reported it in October 2017. About 900,000 tonnes of PET are produced in India each year, and 65% of that is recycled at registered facilities. At least 15% is recycled in the unorganised sector, and around 10% is reused at home.",
        "Add those three together and you get the 90% figure that headlines quoted at the time. It is a decade old, and we did not find a newer national number.",
      ],
    },
    {
      heading: "From bottle to fibre",
      body: [
        "The bottles are sorted, washed and shredded into flakes. A large share of those flakes is spun into polyester fibre. Ganesha Ecosphere, one of India's recyclers, lists its recycled polyester staple fibre as going into yarns, nonwovens, flame-retardant fabrics and fibre fillings, and a 2017 report on the National Chemical Laboratory study described recycled PET being turned into apparel, bedding and more.",
        "An informal collection network gathers most of India's PET waste. Ganesha Ecopet says it sources bottles through more than 300 suppliers and aggregators across the country, and the kabadiwalas and waste collectors who sort bottles by hand sit at the start of that chain.",
      ],
    },
    {
      heading: "Back into bottles",
      body: [
        "Putting recycled PET into a new food or drink bottle is stricter. FSSAI published its guidelines for recycled PET in food contact material on 23 May 2025. Only processes with a decontamination step are accepted: super-clean, melt-in, paste-in and chemical recycling. Ordinary recycling without decontamination is not permitted for food contact.",
        "Producers have to apply to FSSAI for authorisation, test their output in accredited labs, and take annual audits. Ganesha Ecopet, one Indian recycler making bottle-grade resin, reported in September 2024 that it had grown its bottle-to-bottle capacity to 42,000 tonnes a year with two new Starlinger lines.",
      ],
    },
    {
      heading: "Why clean, sorted bottles matter",
      body: [
        "Fibre makers can take a mixed stream. Food-grade recyclers cannot. It follows that bottles kept free of other plastics, dry and mostly clear are the ones most useful to the recyclers who pay the most for clean feed.",
        "The new recycled-content targets for brands push the same way. We cover them in the guide to India's 2026 plastic rules.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is PET recycled in India?",
      a: "Yes. A 2016 National Chemical Laboratory study found 65% was recycled at registered facilities, at least 15% in the unorganised sector and about 10% reused at home. We did not find a newer national figure.",
    },
    {
      q: "What is recycled PET used for?",
      a: "A large share becomes polyester fibre for yarns, fibre fillings, fabrics and nonwovens. A growing share is processed into food-grade resin for new bottles.",
    },
    {
      q: "Can recycled PET be used in new water bottles in India?",
      a: "Yes, with FSSAI-approved processes. FSSAI's guidelines of 23 May 2025 accept only recycling processes that include decontamination, and producers need authorisation.",
    },
    {
      q: "What is a PET flake?",
      a: "A small washed piece of shredded bottle. Flakes are the product that recyclers sell on to fibre makers or process further into resin.",
    },
  ],
  sources: [
    { label: "Recycling International: India's PET bottle recycling market (4 Oct 2017)", href: "https://recyclinginternational.com/commodities/plastics-recycling/indias-pet-bottle-recycling-market-worth-35-billion-rupees/2217/" },
    { label: "Plastics Europe: India recycles 90% of its PET waste (20 Mar 2017)", href: "https://plasteurope.com/news/PET_RECYCLING_t236441" },
    { label: "Modern Plastics India: PET bottle-to-bottle recycling, Ganesha Ecopet", href: "https://modernplasticsindia.in/pet-bottle-to-bottle-recycling-ganesha-ecopets-powerful-way-to-mitigate-the-effects-of-climate-change/" },
    { label: "Corporate Professionals: FSSAI guidelines for rPET in food contact materials (30 May 2025)", href: "https://www.corporateprofessionals.com/regulatoryupdate/fssai-issues-comprehensive-guidelines-for-use-of-recycled-pet-in-food-contact-materials-fcm-rpet/" },
    { label: "RECYCLING magazine: Ganesha Ecopet bottle-to-bottle capacity (Sep 2024)", href: "https://recycling-magazine.com/2024/09/04/pet-bottle-to-bottle-recycling-to-mitigate-effects-of-climate-change" },
  ],
  related: [L.petRules, L.petCaps, REL.pet],
  cta: CTA_PET,
};

/* 7 ------------------------------------------------------------------------ */
const petRules: GuideData = {
  slug: "learn/plastic-rules-2026-pet-bottles",
  title: "India's 2026 Plastic Rules and PET Bottles | The Stallion Metallist",
  description:
    "Brands must now put recycled plastic into rigid packaging, 30% rising to 60%. What the March 2026 amendment says and why it matters for used PET bottles.",
  h1: "India's 2026 plastic rules and PET bottles",
  sub: "A March 2026 amendment sets recycled-content targets for bottles and other rigid packaging. Here is the short version.",
  crumb: "India's 2026 plastic rules",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "2026 plastic rules",
  ogSub: "What they mean for PET bottles",
  answer:
    "The Plastic Waste Management (Amendment) Rules, 2026 set minimum recycled content for rigid plastic packaging at 30% for 2025-26, rising to 60% from 2028-29, according to summaries of the notification. Brands need more recycled plastic, and in our reading that keeps collected bottles in demand.",
  sections: [
    {
      heading: "What was notified",
      body: [
        "The Ministry of Environment, Forest and Climate Change notified the amendment as G.S.R. 237(E) on 31 March 2026. It changes the Plastic Waste Management Rules, 2016.",
        "It builds on the Extended Producer Responsibility (EPR) guidelines of 16 February 2022, which put plastic packaging into categories. Category I is rigid packaging, and PET containers are an example of it. Category II is flexible packaging and Category III is multi-layer.",
      ],
    },
    {
      heading: "The recycled-content targets",
      body: [
        "Summaries of the notification give these minimum shares of recycled plastic, by financial year:",
      ],
      list: [
        "Category I, rigid: 30% in 2025-26, 40% in 2026-27, 50% in 2027-28 and 60% from 2028-29.",
        "Category II, flexible: 10%, 10%, 20% and 20% over the same years.",
        "Category III, multi-layer: 5%, 5%, 10% and 10%, counted on the plastic part only.",
      ],
    },
    {
      heading: "The flexibility built in",
      body: [
        "Where another law limits the use of recycled plastic, such as FSSAI rules for food contact, the requirement is exempt. Producers who miss food-contact targets from 2025-26 can carry the shortfall forward for up to three years from 2026-27, clearing at least one third of it each year.",
        "Companies can also trade surplus EPR certificates. Drishti IAS notes in its summary that the CPCB found more than 6 lakh fake certificates in 2023. The new rules also add registered environment auditors as another way to verify compliance.",
      ],
    },
    {
      heading: "What it means for sellers of used PET",
      body: [
        "The legal duty sits with producers, importers and brand owners. A household or a bar selling its bottles has no new obligation under this amendment.",
        "Recycled content has to come from somewhere, and for bottles that means collected bottles. Food-grade resin also needs FSSAI-approved processing and clean feed. Our reading is that this supports steady demand for clean, sorted PET, though the rules do not set a price and we cannot say what the market will pay.",
      ],
    },
    {
      heading: "Read the source",
      body: [
        "We run a collection service, not a law firm. The figures above come from summaries of the notification, not the gazette text, and two of the summaries differ on the year each step starts. Check G.S.R. 237(E) or the CPCB EPR portal before you rely on the numbers for compliance.",
      ],
    },
  ],
  faqs: [
    {
      q: "What is EPR for plastic packaging?",
      a: "Extended Producer Responsibility makes producers, importers and brand owners responsible for the plastic packaging they put on the market, including collecting and recycling an agreed share of it.",
    },
    {
      q: "What is Category I plastic packaging?",
      a: "Rigid plastic packaging, such as bottles and containers. PET bottles fall in this group.",
    },
    {
      q: "Do households have to do anything under the 2026 plastic rules?",
      a: "Not under this amendment. The duties are on producers, importers and brand owners. Separately, the Solid Waste Management Rules 2026 require waste to be segregated at source.",
    },
    {
      q: "What recycled content must a rigid package have?",
      a: "According to summaries of the 2026 notification, 30% for 2025-26, 40% for 2026-27, 50% for 2027-28 and 60% from 2028-29, with exemptions where other laws restrict recycled content.",
    },
  ],
  sources: [
    { label: "Corporate Professionals: Plastic Waste Management (Amendment) Rules 2026", href: "https://www.corporateprofessionals.com/regulatoryupdate/plastic-waste-management-amendment-rules-2026-strengthening-epr-recycled-content-and-reuse-obligations/" },
    { label: "Drishti IAS: Plastic Waste Management Rules 2026", href: "https://www.drishtiias.com/daily-updates/daily-news-analysis/plastic-waste-management-rules-2026/print_manually" },
    { label: "PIB: Guidelines on Extended Producer Responsibility for plastic packaging", href: "https://pib.gov.in/PressReleasePage.aspx?PRID=1906385" },
  ],
  related: [L.petWhere, L.venueRules, REL.pet],
  cta: CTA_PET,
};

/* 8 ------------------------------------------------------------------------ */
const venueRules: GuideData = {
  slug: "learn/waste-rules-bars-restaurants-cafes-2026",
  title: "Waste Rules for Bars and Restaurants, 2026 | The Stallion Metallist",
  description:
    "The Solid Waste Management Rules 2026 took effect on 1 April 2026: four-stream segregation and extra duties for bulk generators. What it means for a venue.",
  h1: "Waste rules for bars, restaurants and cafes, 2026",
  sub: "The 2026 solid waste rules apply from 1 April. This is what they say about segregation, bulk generators and dry waste like cans and bottles.",
  crumb: "Waste rules for venues, 2026",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "Venue waste rules",
  ogSub: "SWM Rules 2026, in plain words",
  answer:
    "From 1 April 2026 the Solid Waste Management Rules require waste to be separated at source into four streams: wet, dry, sanitary and special care. A venue that produces 100 kg of waste a day or more counts as a bulk generator and carries extra duties.",
  sections: [
    {
      heading: "The four streams",
      list: [
        "Wet: kitchen waste, food leftovers, fruit and vegetable peels. It is to be composted or bio-methanated.",
        "Dry: plastic, paper, metal and glass. It goes to material recovery facilities for recycling.",
        "Sanitary: diapers and sanitary napkins, wrapped and kept separate.",
        "Special care: bulbs, batteries and medicines, which go to authorised agencies or collection centres.",
      ],
      body: [
        "Aluminium cans and PET bottles are dry waste. Keeping them out of the wet bin is the point of segregation, and it is also what makes them worth something to a collector.",
      ],
    },
    {
      heading: "Are you a bulk waste generator?",
      body: [
        "The rules treat an entity as a bulk waste generator if it meets any one of three thresholds: a floor area of 20,000 square metres or more, water use of 40,000 litres a day or more, or waste generation of 100 kg a day or more. Residential societies, government buildings and universities are included.",
        "The summaries we read do not name hotels, restaurants or bars, so the thresholds decide it. A large hotel or a busy club may cross 100 kg a day. A small cafe probably does not. If you are unsure, ask your local body, which in Dehradun is the Nagar Nigam.",
      ],
    },
    {
      heading: "What bulk generators have to do",
      list: [
        "Process wet waste on site, or get an Extended Bulk Waste Generator Responsibility certificate if that is not feasible.",
        "Register on the central online portal that will track waste generation, collection and disposal.",
        "Expect environmental compensation under the polluter pays principle for non-compliance, and higher landfill fees for unsegregated waste.",
      ],
      body: [
        "One legal summary on Mondaq describes the certificate as covering collection and transport of all four streams, while the others limit it to cases where on-site processing is not possible. Read the notification before you decide which applies to you.",
      ],
    },
    {
      heading: "Setting up a venue that works",
      list: [
        "Put a separate bin for cans and one for PET at the bar and in the kitchen pass, with a wet bin beside them.",
        "Label the bins in the language your staff read.",
        "Pick one pickup day and keep the bags dry until then.",
        "Keep a simple log of what left and what you were paid. It helps if an auditor asks.",
      ],
    },
    {
      heading: "What we do for venues",
      body: [
        `We give venues free collection bins as stock allows and collect on a fixed day for your area. We count the cans, weigh the PET, and pay on the spot at every pickup. Our standard rates are ${RATE_CAN} per can and ${RATE_PET} per kg of PET, last updated ${RATES_AS_OF}. We currently collect cans and PET bottles. For glass, message us.`,
      ],
    },
  ],
  faqs: [
    {
      q: "When did the Solid Waste Management Rules 2026 come into force?",
      a: "On 1 April 2026. They replaced the 2016 rules and apply to urban and rural local bodies.",
    },
    {
      q: "What is a bulk waste generator?",
      a: "An entity that meets any one of three thresholds: floor area of 20,000 square metres or more, water use of 40,000 litres a day or more, or waste of 100 kg a day or more.",
    },
    {
      q: "Does a small cafe have to register as a bulk generator?",
      a: "Only if it meets one of the thresholds. Check with the local body if you are close to the limits.",
    },
    {
      q: "Are aluminium cans and PET bottles dry waste?",
      a: "Yes. Plastic, paper, metal and glass are the dry stream, which is meant to go to recycling.",
    },
  ],
  sources: [
    { label: "Drishti IAS: Solid Waste Management Rules 2026 (29 Jan 2026)", href: "https://www.drishtiias.com/daily-updates/daily-news-analysis/solid-waste-management-swm-rules-2026/print_manually" },
    { label: "Vision IAS: Centre notifies new Solid Waste Management Rules, places larger onus on bulk generators", href: "https://visionias.in/current-affairs/upsc-daily-news-summary/article/2026-01-29/the-indian-express/environment/centre-notifies-new-solid-waste-management-rules-places-larger-onus-on-bulk-generators" },
    { label: "The Hitavada: Centre notifies new Solid Waste Management Rules, 2026", href: "https://www.thehitavada.com/Encyc/2026/1/30/centre-notifies-.html" },
    { label: "Mondaq: Solid Waste Management Rules 2026", href: "https://www.mondaq.com/india/waste-management/1762618" },
  ],
  related: [REL.venues, L.cansIndia, L.petRules],
  cta: CTA_VENUE,
};

/* 9 ------------------------------------------------------------------------ */
const whereSell: GuideData = {
  slug: "learn/where-to-sell-cans-and-pet-bottles-dehradun",
  title: "Where to Sell Cans and PET Bottles in Dehradun | The Stallion Metallist",
  description:
    "Three ways to sell your empties in Dehradun, what each is good at, and the questions to ask any buyer before you hand over a bag.",
  h1: "Where to sell cans and PET bottles in Dehradun",
  sub: "A local kabadiwala, a doorstep collector, or an NGO programme. What each is good at, and the questions worth asking.",
  crumb: "Where to sell in Dehradun",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "Where to sell",
  ogSub: "Cans and PET in Dehradun",
  answer:
    "You can sell to a local kabadiwala, to a doorstep collection service like ours, or hand dry waste to a ward-level NGO programme such as Waste Warriors'. Whoever you pick, ask how they weigh or count, what rate they pay and when you get paid.",
  sections: [
    {
      heading: "A note before we start",
      body: ["We run one of the options below, so read this with that in mind. We have tried to describe the others fairly."],
    },
    {
      heading: "The local kabadiwala",
      body: [
        "Kabadiwalas are the backbone of recycling in India. The Centre for Science and Environment wrote in 2021 that the informal sector reportedly recycles 50 to 80% of all plastic made in India and nearly all glass bottles. Kabadiwalas buy from households and waste pickers and sell to larger dealers.",
        "A kabadiwala is close and the sale is quick. The rate and the scale are the things to check, because you are trusting both.",
      ],
    },
    {
      heading: "An NGO ward programme",
      body: [
        "Waste Warriors is a Dehradun NGO. It describes its programme as employing locally trained green workers and teams of organised waste pickers who collect dry waste daily. UN-Habitat's best-practice page on its Model Ward programme says the recyclables go through the city's material recovery facility, which the team operates.",
        "The programme is about segregation and livelihoods in the wards it covers. Check whether your ward is one of them.",
      ],
    },
    {
      heading: "A doorstep collection service",
      body: [
        `That is us. We collect aluminium cans and PET bottles from homes and businesses across Dehradun. We count cans at your door and pay ${RATE_CAN} per can. We weigh PET at your door and pay ${RATE_PET} per kg. You book in the app or on WhatsApp and tell us roughly how much you have.`,
      ],
    },
    {
      heading: "Five questions for any buyer",
      list: [
        "Do you count or weigh? If you weigh, on whose scale, and before or after the bag?",
        "What is today's rate, and will you tell me before you come?",
        "When do I get paid, on the spot or later?",
        "Do you take both cans and bottles, or only one?",
        "Do you collect from my door, or do I bring it?",
      ],
    },
    {
      heading: "Why it matters here",
      body: [
        "Dehradun's municipal commissioner said in July 2026 that the city generates about 572 tonnes of waste a day, sometimes as much as 645 tonnes. Every can and bottle that gets sold rather than binned is a little less of that.",
        "Whichever buyer you choose, rinse your cans and bottles, keep them dry and keep them apart from food waste. It raises what they are worth to anyone.",
      ],
    },
  ],
  faqs: [
    {
      q: "Where can I sell used aluminium cans in Dehradun?",
      a: `You can sell to a scrap dealer or kabadiwala, or to a doorstep service. The Stallion Metallist collects used aluminium cans across Dehradun and pays ${RATE_CAN} per can on collection.`,
    },
    {
      q: "Is there a deposit refund scheme for bottles in Dehradun?",
      a: "Uttarakhand has run a digital deposit refund system on pilot routes, starting on the Kedarnath trek in 2022 with a ₹10 deposit. We did not find one operating in Dehradun city.",
    },
    {
      q: "What do you pay for PET bottles in Dehradun?",
      a: `We pay ${RATE_PET} per kg, weighed at your door, last updated ${RATES_AS_OF}. Other buyers set their own rates, so ask before you sell.`,
    },
    {
      q: "Do scrap dealers buy aluminium cans?",
      a: "Yes, scrap dealers buy aluminium scrap, including cans. Ask how they weigh and what they pay per kilo.",
    },
  ],
  sources: [
    { label: "Centre for Science and Environment: Integration of informal sector in solid waste management (2021)", href: "https://www.cseindia.org/integration-of-informal-sector-in-solid-waste-management-10886" },
    { label: "Construction World: Dehradun Commissioner urges faster legacy waste clearance (2 Jul 2026)", href: "https://www.constructionworld.in/urban-infrastructure/wastewater-and-sewage-treatment/dehradun-commissioner-urges-faster-legacy-waste-clearance/93787" },
    { label: "UN-Habitat: Spearheading community-driven waste management in Dehradun", href: "https://pb.unhabitat.org/best-practice/spearheading-community-driven-waste-management-dehradun-india" },
    { label: "Give.do: Waste Warriors Society", href: "https://give.do/discover/T3N/waste-warriors-society/" },
    { label: "Recykal: Sabka Sath Swachh Kedarnath through Deposit Refund System", href: "https://www.recykal.com/articles/sabka-sath-swachh-kedarnath-through-deposit-refund-system" },
  ],
  related: [REL.cans, REL.pet, L.kilo],
  cta: CTA_CANS,
};

/* 10 ----------------------------------------------------------------------- */
const compare: GuideData = {
  slug: "learn/aluminium-can-vs-pet-bottle-vs-glass",
  title: "Aluminium Can vs PET Bottle vs Glass | The Stallion Metallist",
  description:
    "Every industry has a study showing its own packaging wins. What the evidence says about cans, PET and glass, who paid for it, and what actually decides the answer.",
  h1: "Can, PET bottle or glass: which is better?",
  sub: "Every industry has a study showing its own packaging wins. Here is what the numbers say, who paid for them, and what decides it.",
  crumb: "Can vs PET vs glass",
  published: PUBLISHED,
  updatedLabel: UPDATED,
  ogHeading: "Can, PET or glass",
  ogSub: "Who paid for the studies",
  answer:
    "There is no single winner. A 2010 study paid for by a PET trade body found PET lowest on greenhouse gases and glass highest. An aluminium industry report says cans come back as cans more often than PET or glass do. What decides it is recycled content and how often the container comes back.",
  sections: [
    {
      heading: "A study that favours PET",
      body: [
        "In 2010 Franklin Associates, for the PET Resin Association, compared 20 oz PET bottles, 8 oz glass bottles and 12 oz aluminium cans. Per 100,000 oz of soft drink it found 1,125 lb of CO2 equivalent for PET, 2,766 lb for aluminium and 4,949 lb for glass. That makes PET 59% lower than aluminium and 77% lower than glass.",
        "The association then asked for a recalculation using 10,000 containers of the same size. PET still came out lower on greenhouse gases and solid waste, but total energy use was judged comparable across the three. The study left out filling, distribution and consumer use.",
      ],
    },
    {
      heading: "The view from the metal side",
      body: [
        "The International Aluminium Institute's 2025 report says 71% of cans placed on the market are recycled and 33% are made back into cans, against 7% for PET and 20% for glass in the same sense. The IAI represents the aluminium industry.",
        "On energy, Hydro says recycling aluminium takes about 5% of the energy used to make it from ore, and a European Commission project record puts the figures at 148 MJ per kg for primary metal against 7.4 MJ per kg for remelting. A can made mostly from recycled metal carries a much smaller footprint than one made from new metal.",
      ],
    },
    {
      heading: "Why they disagree",
      body: [
        "The studies do not measure the same thing. They use different container sizes, count different stages, and assume different rates of recycling. A study paid for by one industry tends to choose assumptions that suit it, and both can be right on their own terms.",
        "Glass is the heaviest of the three, so how far it travels matters, and a bottle that is refilled many times is a different product from a throwaway one.",
      ],
    },
    {
      heading: "What actually moves the answer",
      list: [
        "Recycled content. More recycled metal or resin means less energy and fewer emissions per container.",
        "Return rate. A container that is collected and recycled beats one that is binned or littered, whatever it is made of.",
        "Weight and distance. Heavier packaging costs more to move.",
        "Cleanliness. Contamination lowers what a recycler can make from the material.",
      ],
    },
    {
      heading: "What to do with that",
      body: [
        "The best container is the one that gets returned. A can in the can bag beats a can in the wet bin, and a PET bottle weighed and sold beats one in a drain.",
        `In Dehradun we collect cans at ${RATE_CAN} each and PET at ${RATE_PET} per kg. We currently collect cans and PET. For glass, message us.`,
      ],
    },
  ],
  faqs: [
    {
      q: "Is aluminium better than plastic for the environment?",
      a: "It depends on the study and its assumptions. Industry-funded studies tend to favour their own material, and recycled content and return rate matter more than the material alone.",
    },
    {
      q: "Is glass more recyclable than cans or PET?",
      a: "Glass can be recycled many times, but the IAI report counts how much comes back as the same container: 33% for cans, 20% for glass and 7% for PET.",
    },
    {
      q: "Who paid for the PET study that found PET lowest?",
      a: "The PET Resin Association commissioned Franklin Associates to carry out the 2010 comparison.",
    },
    {
      q: "Which packaging do you collect in Dehradun?",
      a: "Aluminium cans and PET bottles. For glass, message us on WhatsApp.",
    },
  ],
  sources: [
    { label: "Plastemart: PET bottles offer a better environmental footprint than aluminum cans or glass bottles (2010)", href: "https://www.plastemart.com/news-plastics-information/pet-bottles-offer-a-better-environmental-footprint-than-aluminum-cans-or-glass-bottles/17510" },
    { label: "Aluminium International Today: IAI highlights aluminium circularity potential (2025)", href: "https://aluminiumtoday.com/news/international-aluminium-institute-highlights-aluminium-circularity-potential" },
    { label: "Hydro: Remelting and recycling", href: "https://drp.hydro.com/en-AT/aluminium/products/extruded-profiles/services/remelting-and-recycling/" },
    { label: "European Commission LIFE project: Recycling aluminium", href: "https://webgate.ec.europa.eu/life/publicWebsite/project/LIFE96-ENV-B-000477/recycling-aluminium" },
  ],
  related: [L.newCans, L.cansIndia, REL.cans],
  cta: CTA_CANS,
};

export const posts: GuideData[] = [
  kilo,
  crush,
  newCans,
  cansIndia,
  petCaps,
  petWhere,
  petRules,
  venueRules,
  whereSell,
  compare,
];

/** Every guide and post, newest and most useful first, for the index page and sitemap. */
export const allGuides: GuideData[] = [ubcGuide, petGuide, ...posts];

export function postBySlug(slug: string): GuideData | undefined {
  return posts.find((p) => p.slug === `learn/${slug}`);
}
