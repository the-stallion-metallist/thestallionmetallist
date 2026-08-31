/* ============================================================================
 * FAQ — questions & answers shown on the page AND fed to FAQ structured data.
 * ----------------------------------------------------------------------------
 * Edit freely. Keep answers plain and factual: Google requires the answer text
 * here to match what visitors see on the page (both are generated from this
 * file, so they always match). Add a question by copying a { q, a } block.
 * ========================================================================== */

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "What does The Stallion Metallist trade?",
    a: "Non-ferrous metal scrap: aluminium (UBC and Zorba), copper (Millberry and bare bright), brass (honey), and stainless steel 304 and 316. We source it from exporters in the UAE, China, Europe and North America and supply it to furnaces, foundries and mills in India.",
  },
  {
    q: "Where is the company based?",
    a: "We operate from Dehradun, Uttarakhand, India, and are incorporated in Calgary, Canada.",
  },
  {
    q: "Which ports do you clear scrap through?",
    a: "We handle documentation and customs clearance at Mundra, Kandla and JNPT (Nhava Sheva), then deliver across the Gujarat industrial belt.",
  },
  {
    q: "What payment terms do you offer?",
    a: "We work on international trade terms, including letter of credit (LC) at sight and T/T (telegraphic transfer).",
  },
  {
    q: "Do you buy used aluminium cans from individuals?",
    a: "Yes. In Dehradun we run a doorstep collection service for used beverage cans. You can book a pickup through our app and get paid on collection.",
  },
  {
    q: "How do I get a quote or contact you?",
    a: "Email contact@thestallionmetallist.com or call +91 99973 48394. Tell us the grade, quantity and destination and we'll come back with terms.",
  },
];
