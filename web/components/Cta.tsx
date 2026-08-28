import { cta, site } from "@/lib/content";

export default function Cta() {
  return (
    <section className="block" id="contact" style={{ paddingTop: 0 }}>
      <div className="wrap reveal">
        <div className="cta-band">
          <div className="cta-inner">
            <h2>{cta.heading}</h2>
            <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
              <a className="btn btn-white magnetic" href={`mailto:${site.email}`}>
                Email us{" "}
                <span className="circ" style={{ background: "var(--copper-tt2)", color: "var(--copper-dk)" }}>→</span>
              </a>
              <a className="btn btn-out magnetic" href={`tel:+${site.phoneHref}`}>{site.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
