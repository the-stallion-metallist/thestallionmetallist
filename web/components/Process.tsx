import { process } from "@/lib/content";

export default function Process() {
  return (
    <section className="block" id="process" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">{process.eyebrow}</span>
          <h2 className="metal" style={{ fontSize: "clamp(2rem,4.2vw,3.3rem)" }}>{process.heading}</h2>
        </div>
        <div className="proc reveal">
          <div className="proc-fill" />
          {process.steps.map((s) => (
            <div className="proc-step" key={s.n}>
              <div className="proc-node">{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
