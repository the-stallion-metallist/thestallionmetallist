import type { Metadata } from "next";
import SiteFrame from "@/components/SiteFrame";
import PageHero from "@/components/PageHero";
import { pageJsonLd } from "@/lib/jsonld";
import { allGuides } from "@/lib/posts";

const title = "Guides on Aluminium Cans and PET Bottle Recycling | The Stallion Metallist";
const description =
  "Researched guides on aluminium cans (UBC) and PET bottles: what they weigh, how to prepare them, where they go, what the rules say, and where to sell them in Dehradun.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/learn" },
  openGraph: { title, description, url: "/learn", type: "website" },
};

/** Which guides sit under which heading. Anything not listed lands in the last group. */
const GROUPS: { heading: string; slugs: string[] }[] = [
  {
    heading: "Aluminium cans",
    slugs: [
      "learn/what-is-ubc-scrap",
      "learn/how-many-aluminium-cans-in-a-kilo",
      "learn/should-you-crush-aluminium-cans",
      "learn/do-old-cans-become-new-cans",
      "learn/why-india-is-switching-to-cans",
    ],
  },
  {
    heading: "PET bottles",
    slugs: [
      "learn/how-to-recycle-pet-bottles-dehradun",
      "learn/pet-bottle-caps-labels-and-colours",
      "learn/where-pet-bottles-go-in-india",
    ],
  },
  {
    heading: "Rules, comparisons and Dehradun",
    slugs: [
      "learn/where-to-sell-cans-and-pet-bottles-dehradun",
      "learn/plastic-rules-2026-pet-bottles",
      "learn/waste-rules-bars-restaurants-cafes-2026",
      "learn/aluminium-can-vs-pet-bottle-vs-glass",
    ],
  },
];

export default function Page() {
  const listed = new Set(GROUPS.flatMap((g) => g.slugs));
  const extra = allGuides.filter((g) => !listed.has(g.slug)).map((g) => g.slug);
  const groups = GROUPS.map((g, i) => ({
    heading: g.heading,
    guides: [...g.slugs, ...(i === GROUPS.length - 1 ? extra : [])]
      .map((s) => allGuides.find((x) => x.slug === s))
      .filter((x): x is NonNullable<typeof x> => Boolean(x)),
  }));

  return (
    <SiteFrame>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd("Guides", "/learn", [{ name: "Guides", path: "/learn" }])),
        }}
      />

      <PageHero
        h1="Guides on cans and PET bottles"
        sub="What they weigh, how to prepare them, where they go after you sell them, and what the rules say. Each guide lists its sources."
        crumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]}
      />

      <section className="ln">
        <div className="wrap">
          {groups.map((g) => (
            <div className="ln-group" key={g.heading}>
              <h2>{g.heading}</h2>
              <ul className="ln-list">
                {g.guides.map((d) => (
                  <li key={d.slug}>
                    <a href={`/${d.slug}`}>
                      <b>{d.h1}</b>
                      <span>{d.sub}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .ln { padding: clamp(3rem, 7vw, 5rem) 0 clamp(3.4rem, 8vw, 6rem); }
        .ln-group + .ln-group { margin-top: clamp(2.8rem, 6vw, 4.2rem); }
        .ln h2 { font-size: clamp(1.5rem, 3vw, 2rem); margin: 0 0 1.1rem; word-spacing: 0.1em; text-wrap: balance; }
        .ln-list { list-style: none; margin: 0; padding: 0; max-width: 78ch; border-top: 1px solid var(--line); }
        .ln-list a { display: flex; flex-direction: column; gap: 0.3rem; padding: 1.25rem 0; min-height: 44px;
          border-bottom: 1px solid var(--line); text-decoration: none; color: var(--ink); }
        .ln-list b { font-family: var(--f-disp); font-weight: 600; font-size: 1.2rem; line-height: 1.25; word-spacing: 0.1em;
          transition: color .2s; }
        .ln-list span { color: var(--ink-soft); font-size: 1rem; line-height: 1.55; }
        .ln-list a:hover b { color: var(--copper); }
        .ln-list a:focus-visible { outline: 2px solid var(--copper); outline-offset: 3px; border-radius: 4px; }
      `}</style>
    </SiteFrame>
  );
}
