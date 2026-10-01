"use client";
import { usePanel } from "../Panel";
import VenueDrawer from "../VenueDrawer";
import BarChart from "../BarChart";
import { MonthSeg, PhFold, PhHead, PhRow } from "../bits";
import { Empty } from "../icons";
import { canMargin, lostCans, waiting, weeks, FULL_AT, type Week } from "@/lib/admin/growth";
import { DATA_START, dnice, fmt, rs } from "@/lib/admin/logic";

const wkName = (w: Week) => (w.start.slice(5, 7) === w.end.slice(5, 7) ? `${+w.start.slice(8)}–${dnice(w.end)}` : `${dnice(w.start)} – ${dnice(w.end)}`);
const ago = (n: number) => (n === 0 ? "today" : n === 1 ? "yesterday" : `${n} days ago`);
const pct = (a: number, b: number) => (b ? `${a >= b ? "+" : "−"}${Math.round((Math.abs(a - b) / b) * 100)}%` : null);

// What is holding growth back: cans lost to full bins, bins likely full now, and the week-by-week trend.
export default function Growth() {
  const c = usePanel(); const p = c.per;
  // cans lost this period (follows the month switch)
  let lost = 0, lostRs = 0, fullPicks = 0;
  for (const v of c.vmap.values()) for (const l of lostCans(v, c.byV.get(v.id) ?? [], c.set, p)) { fullPicks++; lost += l.lost; lostRs += l.lost * canMargin(v, c.set); }
  // bins likely full today (on-request venues left out)
  const full = c.venues.filter((v) => v.status === "Active" && v.visit !== "call").map((v) => ({ v, w: waiting(v, c.byV.get(v.id) ?? [], c.set, c.today) }))
    .filter((r) => r.w.full).sort((a, b) => b.w.est! - a.w.est!);
  const over = full.reduce((a, r) => a + r.w.est! - r.w.hold, 0);
  // weeks, newest first; the last full week is the first one that has ended
  const ws = weeks(c.pickups, c.trips, c.set, c.today), rev = ws.slice().reverse();
  const done = rev.filter((w) => w.end < c.today), lw = done[0], pw = done[1];
  const dpc = (w?: Week) => (w && w.cans ? w.diesel / w.cans : null);
  const bars = ws.map((w) => ({ k: w.start, v: w.cans, lab: dnice(w.start).split(" ")[0] }));

  const lostSub = fullPicks ? `About ${rs(lostRs)} profit missed · ${fullPicks} pickup${fullPicks === 1 ? "" : "s"} came back full` : "No pickup came back full";
  const fullSub = full.length ? `About ${fmt(over)} cans more than their bins hold` : "No bins likely full";
  const lwSub = lw ? (pw ? `${pct(lw.cans, pw.cans) ?? "–"} on the week before (${fmt(pw.cans)})` : wkName(lw)) : "No full week yet";
  const dSub = lw ? `${rs(lw.diesel)} diesel · ${lw.days} collection day${lw.days === 1 ? "" : "s"}` : "No full week yet";
  const lwV = lw ? fmt(lw.cans) : "–", dV = dpc(lw) != null ? `₹${dpc(lw)!.toFixed(2)}` : "–";
  const note = `A pickup counts as full when it brings back ${FULL_AT * 100}% of what the bins hold (${c.set.capSteel || 150} a steel bin, ${c.set.capPl || 150} a plastic bin, from Settings). Lost = cans a day over the 4 weeks up to that pickup × days since the previous pickup, minus what the bins hold. It uses today's bin count, so it may undercount. Profit missed = lost cans × (sale price per can − the venue's payout per can).`;
  const open = (id: number) => c.openDrawer(<VenueDrawer id={id} />);
  const emptyFull = <Empty title="No bins likely full" text="No venue on the route has gone long enough since its last pickup to fill its bins." />;

  if (c.phone) return (<div className="ph">
    <PhHead title="Growth" sub={`What is holding cans back · ${p.label}`} right={<MonthSeg />} />
    <div className="ph-nums">
      <div className="ph-nb dark"><span className="l">Cans lost</span><span className="v">{fmt(lost)}</span><span className="s">{lostSub}</span></div>
      <div className="ph-nb"><span className="l">Bins likely full</span><span className="v">{full.length}</span><span className="s">{fullSub}</span></div>
      <div className="ph-nb"><span className="l">Cans last week</span><span className="v">{lwV}</span><span className="s">{lwSub}</span></div>
      <div className="ph-nb"><span className="l">Diesel per can</span><span className="v">{dV}</span><span className="s">{dSub}</span></div>
    </div>
    <h2 className="ph-sec">Bins likely full now</h2>
    {full.length ? <div className="ph-list">{full.map(({ v, w }) => <PhRow key={v.id} title={v.name}
      sub={`Last collected ${dnice(w.last!)}, ${ago(w.ago!)} · holds ${fmt(w.hold)}`}
      right={<span className="ph-cans"><b>{fmt(w.est!)}</b><span>est. cans</span></span>} onClick={() => open(v.id)} />)}</div>
      : <div className="ph-card">{emptyFull}</div>}
    <h2 className="ph-sec">Week by week</h2>
    <PhFold title="Cans per week" sub={lw ? `Last week ${fmt(lw.cans)} cans` : "No full week yet"}><BarChart data={bars} label={(b) => wkName(ws.find((w) => w.start === b.k)!)} hi={(b) => b.k === lw?.start} /></PhFold>
    <div className="ph-list">{rev.map((w) => <PhRow key={w.start} title={wkName(w) + (w.end >= c.today ? " · so far" : "")}
      sub={w.cans ? `${w.venues} venue${w.venues === 1 ? "" : "s"} · ${fmt(w.cans / w.visits)} cans a visit · ₹${dpc(w)!.toFixed(2)} diesel a can` : "No pickups"}
      right={<span className="ph-cans"><b>{fmt(w.cans)}</b><span>cans</span></span>} />)}</div>
    <div className="ph-card"><p className="muted" style={{ fontSize: 13 }}>{note}</p></div>
  </div>);

  return (<>
    <section className="kpis">
      <div className="kpi hero"><div className="l">Cans lost to full bins</div><div className="v">{fmt(lost)}</div><div className="s">{lostSub}, {p.label}</div></div>
      <div className="kpi"><div className="l">Bins likely full now</div><div className="v">{full.length}</div><div className="s">{fullSub}</div></div>
      <div className="kpi"><div className="l">Cans last week{lw ? ` (${wkName(lw)})` : ""}</div><div className="v">{lwV}</div><div className="s">{lwSub}</div></div>
      <div className="kpi"><div className="l">Diesel per can last week</div><div className="v">{dV}</div><div className="s">{dSub}</div></div>
    </section>
    <div className="card">
      <div className="card-h"><h2>Bins likely full now</h2><span className="hint">Cans a day over the last 4 weeks × days since the last pickup is more than the bins hold. Tap a venue to open it.</span></div>
      {full.length ? <div className="tbl-wrap"><table><thead><tr><th>Venue</th><th>Last collected</th><th className="n">Cans a day</th><th className="n">Bins hold</th><th className="n">Est. cans now</th></tr></thead><tbody>
        {full.map(({ v, w }) => <tr key={v.id} className="click" onClick={() => open(v.id)}>
          <td><b>{v.name}</b></td><td>{dnice(w.last!)} · {ago(w.ago!)}</td><td className="n">{w.pace.toFixed(1)}</td><td className="n">{fmt(w.hold)}</td><td className="n neg"><b>{fmt(w.est!)}</b></td></tr>)}
      </tbody></table></div> : emptyFull}
    </div>
    <div className="card">
      <div className="card-h"><h2>Week by week</h2><span className="hint">Monday to Sunday. Venue pickups only; diesel from Collection days.</span></div>
      <BarChart data={bars} label={(b) => wkName(ws.find((w) => w.start === b.k)!)} hi={(b) => b.k === lw?.start} />
      <div className="tbl-wrap"><table><thead><tr><th>Week</th><th className="n">Cans</th><th className="n">Venues giving cans</th><th className="n">Cans a visit</th><th className="n">Diesel per can</th></tr></thead><tbody>
        {rev.map((w) => <tr key={w.start}><td><b>{wkName(w)}</b>{w.end >= c.today && <span className="muted"> · so far</span>}{w.start < DATA_START + "-01" && <span className="muted"> · from 1 Aug</span>}</td>
          <td className="n"><b>{fmt(w.cans)}</b></td><td className="n">{w.venues || "–"}</td><td className="n">{w.visits ? fmt(w.cans / w.visits) : "–"}</td><td className="n">{dpc(w) != null ? `₹${dpc(w)!.toFixed(2)}` : "–"}</td></tr>)}
      </tbody></table></div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>{note}</p>
    </div>
  </>);
}
