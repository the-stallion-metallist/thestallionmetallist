import { services } from "@/lib/content";

export default function Services() {
  return (
    <section className="block" id="services" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="split-head reveal">
          <div>
            <span className="eyebrow">{services.eyebrow}</span>
            <h2 className="metal" style={{ fontSize: "clamp(2rem,4.2vw,3.3rem)", marginTop: "1.1rem" }}>
              {services.heading}
            </h2>
          </div>
          <p className="lead">{services.lead}</p>
        </div>
        <div className="svc-grid">
          {services.items.map((s) => (
            <article className="svc reveal" key={s.title}>
              <img src={s.img} alt={s.alt} />
              <div className="ov" />
              <div className="body">
                <div>
                  <span className="tag">{s.tag}</span>
                  <h3>{s.title}</h3>
                </div>
                <a className="arrow-btn" href="#trade" aria-label={s.title}>↗</a>
              </div>
            </article>
          ))}
        </div>
        <div className="svc-foot">
          <a className="btn btn-ghost" href={services.cta.href}>
            {services.cta.label}{" "}
            <span className="circ" style={{ background: "var(--copper-tt2)", color: "var(--copper)" }}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
