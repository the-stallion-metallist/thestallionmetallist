"use client";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import { EditTrip } from "../forms2";
import { dnice, fmt, inP, rs } from "@/lib/admin/logic";
import { cansTxt } from "../forms";

export default function Trips() {
  const c = usePanel(); const p = c.per;
  const t = c.trips.filter((x) => !x.deleted && inP(x.d, p)).sort((a, b) => (a.d < b.d ? 1 : -1));
  const km = t.reduce((a, x) => a + x.km_end - x.km_start, 0), cans = t.reduce((a, x) => a + x.cans, 0), cost = t.reduce((a, x) => a + Number(x.fuel_cost) + Number(x.other_cost), 0);
  const perCan = c.set.ubcRate / c.set.cansPerKg - c.set.canRate, avg = t.length ? cost / t.length : 0;
  return (<>
    <section className="kpis">
      <div className="kpi"><div className="l">Trips</div><div className="v">{t.length}</div><div className="s">{fmt(km)} km driven</div></div>
      <div className="kpi"><div className="l">Cans per km</div><div className="v">{km ? fmt(cans / km) : "–"}</div><div className="s">Higher means a tighter route</div></div>
      <div className="kpi"><div className="l">Cost per trip</div><div className="v">{t.length ? rs(avg) : "–"}</div><div className="s">Fuel, tolls, parking</div></div>
      <div className="kpi hero"><div className="l">Break-even per trip</div><div className="v">{perCan > 0 && t.length ? cansTxt(avg / perCan) : "–"}</div><div className="s">Cans a trip needs to cover its fuel, at ₹{perCan.toFixed(2)} margin per can</div></div>
    </section>
    <div className="card">
      <div className="card-h"><h2>Trip log</h2><span className="sp" /><button className="btn btn-g btn-sm" onClick={() => c.openModal(<EditTrip />)}>+ Add trip</button></div>
      {t.length ? <div className="tbl-wrap"><table><thead><tr><th>Trip</th><th>Date</th><th>Vehicle</th><th>Driver</th><th className="n">Km</th><th className="n">Stops</th><th className="n">Fuel (L)</th><th className="n">Cost</th><th className="n">Cans</th><th className="n">Cans/km</th></tr></thead><tbody>
        {t.map((x) => { const k = x.km_end - x.km_start; return <tr key={x.id} className="click" onClick={() => c.openModal(<EditTrip rec={x} />)}>
          <td>{x.code}{x.route && <> <span className="src">{x.route} route</span></>}</td><td>{dnice(x.d)}</td><td>{x.vehicle}</td><td>{x.driver}</td><td className="n">{k}</td><td className="n">{x.stops}</td><td className="n">{Number(x.fuel_l)}</td>
          <td className="n">{rs(Number(x.fuel_cost) + Number(x.other_cost))}</td><td className="n">{fmt(x.cans)}</td><td className="n">{fmt(x.cans / k)}</td></tr>; })}</tbody></table></div>
        : <Empty title="No trips in this period" text="Finishing a route saves the trip for you. You can also add one by hand."><button className="btn btn-p btn-sm" onClick={() => c.openModal(<EditTrip />)}>+ Add trip</button></Empty>}
    </div>
  </>);
}
