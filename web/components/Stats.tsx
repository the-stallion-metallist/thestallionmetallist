import { stats } from "@/lib/content";

export default function Stats() {
  return (
    <section className="block" style={{ paddingTop: 0 }}>
      <div className="wrap reveal">
        <div className="stats-band">
          <div className="sh">
            <span className="eyebrow">{stats.eyebrow}</span>
            <h2 className="metal-silver">{stats.heading}</h2>
          </div>
          <div className="stat-row">
            {stats.items.map((s) => (
              <div className="stat" key={s.label}>
                <div className="n">
                  <span className="count" data-to={s.to} data-pad={s.pad || undefined}>0</span>
                  {s.unit && <em>{s.unit}</em>}
                </div>
                <div className="l">{s.label}</div>
                <div className="d">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
