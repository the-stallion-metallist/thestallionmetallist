import { routes } from "@/lib/content";
import Globe from "./Globe";

export default function Routes() {
  return (
    <section className="block" id="routes" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="routes reveal">
          <div className="routes-head">
            <span className="eyebrow">{routes.eyebrow}</span>
            <h2 className="metal-silver">{routes.heading}</h2>
            <p>{routes.sub}</p>
          </div>
          <div className="routes-map">
            <Globe nodes={routes.nodes} />
          </div>
          <div className="routes-data">
            {routes.nodes.map((n) => (
              <span className={`rd${n.hub ? " india" : ""}`} key={n.id}>
                {n.label} <b>{n.v}</b>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
