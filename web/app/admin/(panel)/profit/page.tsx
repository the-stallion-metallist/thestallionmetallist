"use client";
import { useState } from "react";
import Link from "next/link";
import { usePanel } from "../Panel";
import VenueDrawer from "../VenueDrawer";
import { setVisit } from "../forms";
import { MonthSeg, PhHead, PhRow } from "../bits";
import { Empty } from "../icons";
import { fmt, inP, rs, venueEarn, visitCost, type Period, type Venue } from "@/lib/admin/logic";

type Ctx = ReturnType<typeof usePanel>;
type Verdict = "ok" | "fortnight" | "moved" | "loss" | "none";
type Row = { v: Venue; visits: number; cans: number; earn: number; per: number; est: boolean; cost: number; profit: number; perVisit: number | null; verdict: Verdict };

// What each venue earned after its payout, minus what its visits cost (extra km and minutes on its route day, plus the stop).
function venueRows(c: Ctx, p: Period) {
  const cost = new Map<number, number>();
  if (c.plan) for (const w of ["A", "B"] as const) for (const d of c.plan.weeks[w]) for (const s of d.stops) if (!s.extra && !cost.has(s.v.id)) cost.set(s.v.id, visitCost(c.set, s.addKm, s.addMin));
  const all = [...cost.values()].sort((a, b) => a - b), typical = all.length ? all[Math.floor(all.length / 2)] : visitCost(c.set, 0, 0);
  const rows: Row[] = c.venues.map((v) => {
    const ps = (c.byV.get(v.id) ?? []).filter((x) => inP(x.d, p)), e = venueEarn(v, ps, c.set);
    const per = cost.get(v.id) ?? typical, visits = ps.length, total = visits * per, profit = e.earn - total, perVisit = visits ? profit / visits : null;
    // losing money each visit: would every 2 weeks (twice the cans a visit) fix it?
    const fixable = (2 * e.earn) / visits - per >= 0; // twice the cans a visit covers the cost
    const verdict: Verdict = !visits ? "none" : perVisit! >= 0 ? "ok" : fixable ? (v.visit === "fortnight" ? "moved" : "fortnight") : "loss";
    return { v, visits, cans: e.cans, earn: e.earn, per, est: !cost.has(v.id), cost: total, profit, perVisit, verdict };
  });
  return { rows, typical };
}
const VERDICT: Record<Verdict, [string, string]> = { ok: ["Pays its way", "c-keep"], fortnight: ["Try every 2 weeks", "c-new"], moved: ["Now every 2 weeks", "c-keep"], loss: ["Loses money", "c-pull"], none: ["No pickups", "c-idle"] };

export default function Profit() {
  const c = usePanel(); const p = c.per;
  const { rows, typical } = venueRows(c, p);
  const losing = rows.filter((r) => r.verdict === "fortnight" || r.verdict === "loss");
  const [f, setF] = useState<"lose" | "all" | "none">(() => (losing.length ? "lose" : "all"));
  const shown = rows.filter((r) => (f === "all" ? r.visits > 0 : f === "none" ? r.verdict === "none" : r.verdict === "fortnight" || r.verdict === "loss"))
    .sort((a, b) => (f === "all" ? b.profit - a.profit : f === "none" ? a.v.name.localeCompare(b.v.name) : a.profit - b.profit));
  const visited = rows.filter((r) => r.visits), total = visited.reduce((a, r) => a + r.profit, 0), lost = losing.reduce((a, r) => a + r.profit, 0);
  const chips: [typeof f, string, number][] = [["lose", "Losing money", losing.length], ["all", "All with pickups", visited.length], ["none", "No pickups", rows.length - visited.length]];
  const kmNote = !c.set.kmCost && <p className="muted" style={{ fontSize: 13 }}>Vehicle cost per km isn&apos;t set yet, so visit costs count only the team&apos;s time (₹{c.set.hourCost ?? 0} an hour). <Link className="linkb" href="/admin/settings">Add it in Settings</Link></p>;
  const action = (r: Row) => r.verdict === "fortnight" ? <button className="btn btn-g btn-sm" onClick={() => setVisit(c, r.v, "fortnight")}>Every 2 weeks</button>
    : r.v.visit === "fortnight" ? <button className="btn btn-g btn-sm" onClick={() => setVisit(c, r.v, null)}>Back to weekly</button>
    : r.verdict === "loss" ? <Link className="btn btn-g btn-sm" href="/admin/moves">Take bins back</Link> : null;
  const seg = <div className="seg" role="group" aria-label="Show">{chips.map(([k, l, n]) => <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{l} <span className="muted">{n}</span></button>)}</div>;

  if (c.phone) return (<div className="ph">
    <PhHead title="Venue profit" sub={`After payouts and visit costs · ${p.label}`} right={<MonthSeg />} />
    <div className="ph-nums">
      <div className="ph-nb dark"><span className="l">Venues, after visits</span><span className="v">{rs(total)}</span><span className="s">{visited.length} venues with pickups</span></div>
      <div className="ph-nb"><span className="l">Losing money</span><span className="v">{losing.length}</span><span className="s">{losing.length ? `${rs(lost)} between them` : "None"}</span></div>
    </div>
    <div className="ph-chips" role="group" aria-label="Show">{chips.map(([k, l, n]) => <button key={k} className="ph-chip" aria-pressed={f === k} onClick={() => setF(k)}>{l} <span>{n}</span></button>)}</div>
    {shown.length ? <div className="ph-list">{shown.map((r) => <PhRow key={r.v.id} title={r.v.name}
      sub={r.visits ? `${VERDICT[r.verdict][0]} · ${r.visits} visit${r.visits === 1 ? "" : "s"} · ${rs(r.perVisit!)} a visit` : "No pickups this period"}
      tone={r.verdict === "ok" || r.verdict === "moved" ? "good" : r.verdict === "none" ? "idle" : "bad"}
      right={<span className="ph-cans"><b className={r.profit < 0 ? "neg" : ""}>{rs(r.profit)}</b><span>profit</span></span>} onClick={() => c.openDrawer(<VenueDrawer id={r.v.id} />)} />)}</div>
      : <div className="ph-card"><p className="muted">{f === "lose" ? "No venue loses money on its visits." : "Nothing here."}</p></div>}
    <div className="ph-card"><p className="muted" style={{ fontSize: 13 }}>A visit costs about {rs(typical)}: the extra km and minutes the stop adds to its route day, plus {c.set.stopMin} minutes at the stop. Open a venue to move it to every 2 weeks.</p>{kmNote}</div>
  </div>);

  return (<>
    <section className="kpis">
      <div className="kpi hero"><div className="l">Venues, after visit costs</div><div className="v">{rs(total)}</div><div className="s">{visited.length} venues with pickups, {p.label}</div></div>
      <div className="kpi"><div className="l">Losing money</div><div className="v">{losing.length}</div><div className="s">{losing.length ? `${rs(lost)} between them` : "Every venue pays its way"}</div></div>
      <div className="kpi"><div className="l">A visit costs about</div><div className="v">{rs(typical)}</div><div className="s">Extra route time and km, plus the stop</div></div>
      <div className="kpi"><div className="l">No pickups</div><div className="v">{rows.length - visited.length}</div><div className="s">Nothing to judge yet</div></div>
    </section>
    <div className="card">
      <div className="card-h"><h2>Profit by venue</h2><span className="hint">What each venue&apos;s cans and plastic earned after its payout, minus what its visits cost</span><span className="sp" />{seg}</div>
      {kmNote}
      {shown.length ? <div className="tbl-wrap"><table><thead><tr><th>Venue</th><th className="n">Visits</th><th className="n">Cans</th><th className="n">Earned</th><th className="n">Visit cost</th><th className="n">Profit</th><th className="n">Per visit</th><th>Verdict</th><th /></tr></thead><tbody>
        {shown.map((r) => <tr key={r.v.id}><td><button className="linkb" onClick={() => c.openDrawer(<VenueDrawer id={r.v.id} />)}>{r.v.name}</button>{r.v.visit === "fortnight" && <span className="muted"> · every 2 weeks</span>}</td>
          <td className="n">{r.visits}</td><td className="n">{fmt(r.cans)}</td><td className="n">{rs(r.earn)}</td><td className="n" title={r.est ? "Not on the route yet: typical visit cost" : undefined}>{rs(r.cost)}{r.est && r.visits ? "*" : ""}</td>
          <td className={"n " + (r.profit < 0 ? "neg" : "")}><b>{rs(r.profit)}</b></td><td className="n">{r.perVisit != null ? rs(r.perVisit) : "–"}</td>
          <td><span className={"chip " + VERDICT[r.verdict][1]}>{VERDICT[r.verdict][0]}</span></td><td className="n">{action(r)}</td></tr>)}
      </tbody></table></div>
        : <Empty title={f === "lose" ? "No venue loses money" : "Nothing here"} text={f === "lose" ? "Every venue with pickups earns more than its visits cost." : "Try another filter."} />}
      <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Visit cost = the extra km and minutes the stop adds to its route day, plus {c.set.stopMin} minutes at the stop. * Not on the route yet, so the typical visit cost is used. &quot;Try every 2 weeks&quot; means twice the cans on each visit would cover its cost.</p>
    </div>
  </>);
}
