import { why } from "@/lib/content";

export default function Why() {
  return (
    <section className="block" id="why" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">{why.eyebrow}</span>
          <h2 className="metal" style={{ fontSize: "clamp(2rem,4.2vw,3.3rem)" }}>{why.heading}</h2>
        </div>
        <div className="why-grid">
          {why.cards.map((c) => (
            <div className="why-card reveal" key={c.title}>
              <div className="ic">{c.icon}</div>
              <h4>{c.title}</h4>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
