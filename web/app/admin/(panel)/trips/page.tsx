"use client";
import { usePanel } from "../Panel";
import VenueDrawer from "../VenueDrawer";
import { MonthSeg, PhHead, PhRow } from "../bits";
import { Empty, I } from "../icons";
import { EditTrip } from "../forms2";
import { cansTxt } from "../forms";
import { collectionDays, dayName, dieselDay, dieselOf, dnice, fmt, kg, rs, type CDay } from "@/lib/admin/logic";

// Collection days: every date with venue pickups is one trip. Shows which venues were collected together, and the diesel.
export default function CollectionDays() {
  const c = usePanel(); const p = c.per;
  const days = collectionDays(c.pickups, c.trips, c.set, p).filter((g) => g.picks.length);
  const diesel = dieselOf(days), visits = days.reduce((a, g) => a + g.venues, 0), cans = days.reduce((a, g) => a + g.cans, 0), real = days.filter((g) => g.real).length;
  const perCan = c.set.ubcRate / c.set.cansPerKg - c.set.canRate, need = perCan > 0 ? Math.ceil(dieselDay(c.set) / perCan) : null;
  const n = days.length, open = (g: CDay) => c.openDrawer(<Day g={g} />);
  const dsub = `₹${fmt(dieselDay(c.set))} a day${real ? ` · ${real} with real fuel` : ""}`;
  const empty = <Empty title="No collection days in this period" text="A day shows here once pickups from venues are logged for it." />;

  if (c.phone) return (<div className="ph">
    <PhHead title="Collection days" sub={`Venues collected together · ${p.label}`} right={<MonthSeg />} />
    <div className="ph-nums">
      <div className="ph-nb dark"><span className="l">Collection days</span><span className="v">{n}</span><span className="s">{visits} venue visits</span></div>
      <div className="ph-nb"><span className="l">Diesel</span><span className="v">{rs(diesel)}</span><span className="s">{dsub}</span></div>
      <div className="ph-nb"><span className="l">Venues a day</span><span className="v">{n ? (visits / n).toFixed(1) : "–"}</span><span className="s">{n ? `About ${fmt(cans / n)} cans a day` : "No days yet"}</span></div>
      <div className="ph-nb"><span className="l">Pays its diesel at</span><span className="v">{need ? fmt(need) : "–"}</span><span className="s">Cans a day</span></div>
    </div>
    {n ? <div className="ph-list">{days.map((g) => <PhRow key={g.d} lead={g.venues} title={`${dayName(g.d)} ${dnice(g.d)}`}
      sub={`${g.venues} venue${g.venues === 1 ? "" : "s"}${g.kg ? ` · ${kg(g.kg)} kg plastic` : ""}`}
      right={<span className="ph-cans"><b>{fmt(g.cans)}</b><span>cans</span></span>} onClick={() => open(g)} />)}</div>
      : <div className="ph-card">{empty}</div>}
  </div>);

  return (<>
    <section className="kpis">
      <div className="kpi"><div className="l">Collection days</div><div className="v">{n}</div><div className="s">{visits} venue visits</div></div>
      <div className="kpi"><div className="l">Diesel</div><div className="v">{rs(diesel)}</div><div className="s">{dsub}</div></div>
      <div className="kpi"><div className="l">Venues a day</div><div className="v">{n ? (visits / n).toFixed(1) : "–"}</div><div className="s">{n ? `About ${fmt(cans / n)} cans a day` : "No days yet"}</div></div>
      <div className="kpi hero"><div className="l">A day pays its diesel at</div><div className="v">{need ? cansTxt(need) : "–"}</div><div className="s">₹{fmt(dieselDay(c.set))} of diesel at ₹{perCan.toFixed(2)} margin per can</div></div>
    </section>
    <div className="card">
      <div className="card-h"><h2>Collection days</h2><span className="hint">Venues collected on the same date count as one trip. Tap a day to see them.</span></div>
      {n ? <div className="tbl-wrap"><table><thead><tr><th>Date</th><th className="n">Venues</th><th className="n">Cans</th><th className="n">Plastic</th></tr></thead><tbody>
        {days.map((g) => <tr key={g.d} className="click" onClick={() => open(g)}>
          <td><b>{dayName(g.d)} {dnice(g.d)}</b>{g.trips.map((t) => <span key={t.id} className="src"> {t.code}</span>)}</td>
          <td className="n">{g.venues}</td><td className="n"><b>{fmt(g.cans)}</b></td><td className="n">{g.kg ? kg(g.kg) + " kg" : "–"}</td></tr>)}
      </tbody></table></div> : empty}
    </div>
  </>);
}

function Day({ g }: { g: CDay }) {
  const c = usePanel();
  const by = new Map<number, { id: number; cans: number; kg: number; staff: string[] }>();
  for (const x of g.picks) {
    const r = by.get(x.venue_id!) ?? by.set(x.venue_id!, { id: x.venue_id!, cans: 0, kg: 0, staff: [] }).get(x.venue_id!)!;
    r.cans += x.cans; r.kg += Number(x.plastic_kg || 0); if (x.staff && !r.staff.includes(x.staff)) r.staff.push(x.staff);
  }
  const rows = [...by.values()].sort((a, b) => b.cans - a.cans);
  return (<>
    <div className="dr-h"><div><h2>{dayName(g.d)} {dnice(g.d)}</h2><div className="ph-sub" style={{ display: "block" }}>Collected together on one trip</div></div>
      <button className="x" onClick={c.closeLayers} aria-label="Close">{I.x}</button></div>
    <div className="dr-b">
      <div className="facts">
        <div className="fact"><div className="l">Venues</div><div className="v">{g.venues}</div></div>
        <div className="fact"><div className="l">Cans</div><div className="v">{fmt(g.cans)}</div></div>
        <div className="fact"><div className="l">Diesel</div><div className="v">{rs(g.diesel)}</div></div>
      </div>
      <p className="muted" style={{ fontSize: 13 }}>{g.real ? "Diesel is the fuel logged on this day's trip." : `Diesel is the ₹${fmt(dieselDay(c.set))} a collection day (Settings → Costs).`}{g.kg ? ` Plastic: ${kg(g.kg)} kg.` : ""}</p>
      {g.trips.map((t) => <button key={t.id} className="exp-row" onClick={() => c.openModal(<EditTrip rec={t} />)}>
        <div><div className="t">Trip {t.code}</div><div className="d">{t.km_end - t.km_start} km · {Number(t.fuel_l)} L fuel{t.driver ? ` · ${t.driver}` : ""}</div></div>
        <b>{rs(Number(t.fuel_cost) + Number(t.other_cost))}</b></button>)}
      <div>{rows.map((r) => <button key={r.id} className="exp-row" onClick={() => c.openDrawer(<VenueDrawer id={r.id} />)}>
        <div><div className="t">{c.vmap.get(r.id)?.name ?? "Unknown venue"}</div><div className="d">{[r.kg ? `${kg(r.kg)} kg plastic` : "", r.staff.join(", ")].filter(Boolean).join(" · ") || "Cans only"}</div></div>
        <b>{fmt(r.cans)} cans</b></button>)}</div>
    </div>
  </>);
}
