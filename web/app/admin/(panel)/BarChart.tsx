"use client";
import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/admin/logic";

export type Bar = { k: string; v: number; lab?: string };

// Bars on one scale with a faint grid; tap or hover a bar to read its value.
export default function BarChart({ data, h = 190, label, unit = "cans", hi }: { data: Bar[]; h?: number; label: (b: Bar) => string; unit?: string; hi?: (b: Bar) => boolean }) {
  const box = useRef<HTMLDivElement>(null); const [W, setW] = useState(600);
  const start = data.findIndex((d) => hi?.(d)); const [sel, setSel] = useState(start);
  useEffect(() => setSel(data.findIndex((d) => hi?.(d))), [data]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(el.clientWidth, 280))); ro.observe(el); return () => ro.disconnect();
  }, []);
  const P = { l: 40, r: 8, t: 10, b: 24 }, iw = W - P.l - P.r, ih = h - P.t - P.b;
  const max = Math.max(...data.map((d) => d.v), 1), step = Math.pow(10, Math.floor(Math.log10(max)));
  const nice = [1, 2, 2.5, 5, 10].map((x) => x * step).find((x) => max / x <= 4) || step * 10;
  const top = Math.ceil(max / nice) * nice, bw = iw / data.length;
  const ticks: number[] = []; for (let y = 0; y <= top; y += nice) ticks.push(y);
  const show = (e: React.PointerEvent) => { const i = (e.target as Element).closest("[data-i]")?.getAttribute("data-i"); if (i != null) setSel(+i); };
  return (
    <div ref={box}>
      <div className="readout" aria-live="polite">{sel < 0 ? "Tap a bar" : <><b>{label(data[sel])}</b> · {fmt(data[sel].v)} {unit}</>}</div>
      <svg className="chart" width={W} height={h} viewBox={`0 0 ${W} ${h}`} role="img" aria-label="Bar chart. Tap a bar to read its value." onPointerDown={show} onPointerMove={show}>
        {ticks.map((y) => { const yy = P.t + ih - (y / top) * ih; return <g key={y}><line className="gl" x1={P.l} x2={W - P.r} y1={yy} y2={yy} /><text x={P.l - 6} y={yy + 4} textAnchor="end">{fmt(y)}</text></g>; })}
        {data.map((d, i) => {
          const bh = (d.v / top) * ih, x = P.l + i * bw + bw * 0.18, w = Math.max(bw * 0.64, 2);
          return <g key={d.k}>
            <rect className={"bar" + (sel === i ? " sel" : "")} x={x} y={P.t + ih - bh} width={w} height={Math.max(bh, d.v ? 2 : 0)} rx={Math.min(3, w / 2)} fill={hi?.(d) ? "var(--copper)" : "var(--ink)"} opacity={d.v ? 1 : 0} />
            <rect className="hit" data-i={i} x={P.l + i * bw} y={P.t} width={bw} height={ih} fill="transparent" />
            {d.lab && <text x={x + w / 2} y={h - 6} textAnchor="middle">{d.lab}</text>}
          </g>;
        })}
      </svg>
    </div>
  );
}
