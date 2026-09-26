"use client";
import { useState } from "react";
import { usePanel } from "../Panel";
import VenueDrawer from "../VenueDrawer";
import { PhHead, PhRow } from "../bits";
import { I, Empty } from "../icons";
import { DATA_START, MON, fmt, inP, kg, monthLabel, monthOf, monthsSince, period, rs, staffDue, type Period, type Venue } from "@/lib/admin/logic";

type Ctx = ReturnType<typeof usePanel>;
type VRow = { v: Venue; cans: number; kg: number; n: number };
type Row = { who: string; vs: VRow[]; cans: number; kg: number; giving: number };

// Everyone who brought venues in, ranked by the cans those venues gave in the period. Removed venues still count.
function people(c: Ctx, p: Period) {
  const groups = new Map<string, VRow[]>(); const unset: VRow[] = [];
  for (const v of c.vmap.values()) {
    const ps = (c.byV.get(v.id) ?? []).filter((x) => inP(x.d, p));
    const r = { v, n: ps.length, cans: ps.reduce((a, x) => a + x.cans, 0), kg: ps.reduce((a, x) => a + Number(x.plastic_kg || 0), 0) };
    if (v.brought_by) (groups.get(v.brought_by) ?? groups.set(v.brought_by, []).get(v.brought_by)!).push(r); else unset.push(r);
  }
  const row = (who: string, vs: VRow[]): Row => ({ who, vs: vs.sort((a, b) => b.cans - a.cans || a.v.name.localeCompare(b.v.name)),
    cans: vs.reduce((a, x) => a + x.cans, 0), kg: vs.reduce((a, x) => a + x.kg, 0), giving: vs.filter((x) => x.cans > 0).length });
  const ranked = [...groups].map(([w, vs]) => row(w, vs)).sort((a, b) => b.cans - a.cans || a.who.localeCompare(b.who));
  return { ranked, unset: row("Not set", unset) };
}

export default function People() {
  const c = usePanel(); const [mo, setMo] = useState("all");
  const p = period(mo, c.today); const { ranked, unset } = people(c, p);
  const ms = monthsSince(DATA_START, monthOf(c.today));
  const seg = <div className="seg" role="group" aria-label="Month">{[...ms.slice(-3), "all"].map((m) => <button key={m} aria-pressed={mo === m} onClick={() => setMo(m)}>{m === "all" ? (ms.length === 2 ? "Both" : "All") : MON[+m.slice(5, 7) - 1]}</button>)}</div>;
  const open = (r: Row, i: number | null) => c.openDrawer(<Person row={r} rank={i} of={ranked.length} p={p} />);
  const unsetNote = unset.vs.length > 0 && <>{unset.vs.length} venue{unset.vs.length === 1 ? " has" : "s have"} no one set{unset.cans ? ` (${fmt(unset.cans)} cans)` : ""}. Set it in Edit venue.</>;

  if (c.phone) return (<div className="ph">
    <PhHead title="People" sub={`Ranked by cans · ${p.label}`} right={seg} />
    {ranked.length ? <div className="ph-list">{ranked.map((r, i) => <PhRow key={r.who} lead={i + 1} tone={i === 0 ? "good" : "idle"} title={r.who}
      sub={`${r.vs.length} client${r.vs.length === 1 ? "" : "s"}${r.kg ? ` · ${kg(r.kg)} kg plastic` : ""}`}
      right={<span className="ph-cans"><b>{fmt(r.cans)}</b><span>cans</span></span>} onClick={() => open(r, i)} />)}</div>
      : <div className="ph-card"><p className="muted">No one is set on any venue yet. Pick who brought each venue in Edit venue.</p></div>}
    {unset.vs.length > 0 && <div className="ph-list"><PhRow lead="?" title="Not set" sub={unsetNote} onClick={() => open(unset, null)} /></div>}
  </div>);

  return (
    <div className="card">
      <div className="card-h"><h2>Who brought which clients</h2><span className="hint">Ranked by cans from the venues each person brought in, {p.label}</span><span className="sp" />{seg}</div>
      {ranked.length ? <div className="tbl-wrap"><table><thead><tr><th className="n">#</th><th>Person</th><th className="n">Clients brought</th><th className="n">Giving cans</th><th className="n">Cans</th><th className="n">Plastic</th></tr></thead><tbody>
        {ranked.map((r, i) => <tr key={r.who}><td className="n"><b>{i + 1}</b></td><td><button className="linkb" onClick={() => open(r, i)}>{r.who}</button></td>
          <td className="n">{r.vs.length}</td><td className="n">{r.giving}</td><td className="n"><b>{fmt(r.cans)}</b></td><td className="n">{r.kg ? kg(r.kg) + " kg" : "–"}</td></tr>)}
      </tbody></table></div>
        : <Empty title="No one set yet" text="Pick who brought each venue in Edit venue, and the ranking shows here." />}
      {unset.vs.length > 0 && <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>{unsetNote} <button className="linkb" onClick={() => open(unset, null)}>See them</button></p>}
    </div>
  );
}

function Person({ row: r, rank, of, p }: { row: Row; rank: number | null; of: number; p: Period }) {
  const c = usePanel();
  const s = c.staff.find((x) => x.name.toLowerCase() === r.who.toLowerCase()); // staff get attendance and pay; owners don't
  const mo = monthOf(c.today); const due = s ? staffDue(s, mo, c.marks, c.advances, c.expenses) : null;
  return (<>
    <div className="dr-h"><div><h2>{r.who}</h2><div className="ph-sub" style={{ display: "block" }}>{rank != null ? `Rank ${rank + 1} of ${of} · ${p.label}` : `Venues with no one set · ${p.label}`}</div></div>
      <button className="x" onClick={c.closeLayers} aria-label="Close">{I.x}</button></div>
    <div className="dr-b">
      <div className="facts">
        <div className="fact"><div className="l">Clients</div><div className="v">{r.vs.length}</div></div>
        <div className="fact"><div className="l">{p.short} cans</div><div className="v">{fmt(r.cans)}</div></div>
        <div className="fact"><div className="l">Plastic</div><div className="v">{kg(r.kg)} kg</div></div>
      </div>
      {s && due && <div className="kv">
        <div><span>Days present, {monthLabel(mo)}</span><b>{due.days}</b></div>
        <div><span>Salary to pay</span><b>{due.pay != null ? rs(due.pay) : <span className="missing">Salary not set</span>}</b></div>
      </div>}
      {rank == null && <p className="muted" style={{ fontSize: 13 }}>Open a venue, then Edit venue, and pick who brought it in.</p>}
      <div>{r.vs.map(({ v, cans, kg: k, n }) => <button key={v.id} className="exp-row" onClick={() => c.openDrawer(<VenueDrawer id={v.id} />)}>
        <div><div className="t">{v.name}</div><div className="d">{v.deleted ? "Removed · " : ""}{n ? `${n} pickup${n === 1 ? "" : "s"}${k ? ` · ${kg(k)} kg plastic` : ""}` : "No pickups " + (p.all ? "yet" : "this month")}</div></div>
        <b>{fmt(cans)} cans</b></button>)}</div>
    </div>
  </>);
}
