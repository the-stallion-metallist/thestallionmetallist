import { about } from "@/lib/content";

export default function About() {
  return (
    <section className="block" id="about">
      <div className="wrap about-grid">
        <div className="about-copy reveal">
          <span className="eyebrow">{about.eyebrow}</span>
          <h2 className="metal" style={{ fontSize: "clamp(2rem,4.2vw,3.2rem)", margin: "1.2rem 0 1.3rem" }}>
            {about.heading}
          </h2>
          <p className="lead">{about.lead}</p>
          <div className="rating">
            <span className="stars">★★★★★</span>
            <small>{about.ratingNote}</small>
          </div>
          <a className="btn btn-primary" href={about.cta.href}>
            {about.cta.label} <span className="circ">→</span>
          </a>
        </div>
        <div className="about-media reveal">
          <div className="photo">
            <img src="/images/metal_recycling.webp" alt="Processed scrap metal ready for trade" />
          </div>
          <div className="chip a">
            <div className="n">{about.chipA.num}<em>{about.chipA.unit}</em></div>
            <div className="t">{about.chipA.label}</div>
          </div>
          <div className="chip b">
            <div className="n">{about.chipB.num}{about.chipB.unit && <em>{about.chipB.unit}</em>}</div>
            <div className="t">{about.chipB.label}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
