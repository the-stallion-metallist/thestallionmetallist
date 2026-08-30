import { trade, type Grade } from "@/lib/content";

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// A single expandable grade row. The open/close animation is wired in Effects.tsx
// (it toggles aria-expanded and the max-height of .grow-spec).
function GradeRow({ g }: { g: Grade }) {
  return (
    <div className="grade">
      <button className="grow" aria-expanded="false">
        <span className="nm">{g.name}</span>
        <span className="cd">{g.code} <Chevron /></span>
      </button>
      <div className="grow-spec">
        <div className="inner">
          {g.specs.map((s) => (
            <span className="tag2" key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Trade() {
  return (
    <section className="block" id="trade" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head center reveal">
          <span className="eyebrow">{trade.eyebrow}</span>
          <h2 className="metal">{trade.heading}</h2>
          <p className="lead" style={{ textAlign: "center" }}>
            {trade.lead} <strong style={{ color: "var(--copper)" }}>{trade.tapHint}</strong>
          </p>
        </div>
        <div className="trade-grid">
          {trade.groups.map((group) => (
            <div className={`trade-card reveal${group.dark ? " dark" : ""}`} key={group.title}>
              <div className="cat">
                <h3 className={group.dark ? "copper" : undefined}>{group.title}</h3>
                <span className="n">{group.count}</span>
              </div>
              {group.grades.map((g) => (
                <GradeRow g={g} key={g.name} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "2.2rem" }} className="reveal">
          <a className="btn btn-primary magnetic" href="/non-ferrous-scrap">
            Explore all non-ferrous grades <span className="circ">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
