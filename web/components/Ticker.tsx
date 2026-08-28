import { ticker } from "@/lib/content";

export default function Ticker() {
  // duplicated once so the marquee scrolls seamlessly (translateX(-50%))
  const items = [...ticker, ...ticker];
  return (
    <div className="ticker" aria-label="Grades we trade">
      <div className="ticker-live">
        <span className="dot" /> Grades
      </div>
      <div className="ticker-mask">
        <div className="ticker-track">
          {items.map((it, i) => (
            <span className="it" key={i}>
              <b>{it.name}</b> <i>◆</i> {it.meta}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
