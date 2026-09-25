"use client";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import { EditSale } from "../forms2";
import { dnice, fmt, kg, rs } from "@/lib/admin/logic";

// Stock is all-time: everything collected minus everything sold.
export default function Stock() {
  const c = usePanel();
  const ps = c.pickups.filter((p) => !p.deleted), sales = c.sales.filter((s) => !s.deleted).sort((a, b) => (a.d < b.d ? 1 : -1));
  const cansIn = ps.reduce((a, p) => a + p.cans, 0), plIn = ps.reduce((a, p) => a + Number(p.plastic_kg || 0), 0);
  const outKg = sales.filter((s) => s.material === "UBC").reduce((a, s) => a + Number(s.kg), 0), outPl = sales.filter((s) => s.material === "Plastic").reduce((a, s) => a + Number(s.kg), 0);
  const cansOut = outKg * c.set.cansPerKg, cansNow = cansIn - cansOut, plNow = plIn - outPl, val = (cansNow / c.set.cansPerKg) * c.set.ubcRate;
  return (<>
    <section className="godown">
      <div className="card stock"><div className="l muted" style={{ fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" }}>Cans in godown</div>
        <div className="big">{fmt(cansNow)} <small>≈ {kg(cansNow / c.set.cansPerKg)} kg</small></div>
        <div className="flow"><span>Collected<b>{fmt(cansIn)}</b></span><span>Sold<b>{fmt(cansOut)}</b></span><span>Worth now<b>{rs(val)}</b></span></div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>Buyers pay by kg, so each sale removes about {c.set.cansPerKg} cans per kg. Change that in Settings once you weigh a few bags.</p></div>
      <div className="card stock"><div className="l muted" style={{ fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" }}>Plastic in godown</div>
        <div className="big">{kg(plNow)} <small>kg</small></div>
        <div className="flow"><span>Collected<b>{kg(plIn)} kg</b></span><span>Sold<b>{kg(outPl)} kg</b></span><span>Sale rate<b>{c.set.plasticSale ? `₹${c.set.plasticSale}/kg` : "Not set"}</b></span></div></div>
    </section>
    <div className="card"><div className="card-h"><h2>Sales to buyers</h2><span className="hint">Tap a sale to edit it or mark the payment received</span><span className="sp" /><button className="btn btn-p btn-sm" onClick={() => c.openModal(<EditSale />)}>+ Record sale</button></div>
      {sales.length ? <div className="tbl-wrap"><table><thead><tr><th>Sale</th><th>Date</th><th>Buyer</th><th>Material</th><th className="n">Kg</th><th className="n">Rate</th><th className="n">Invoice</th><th className="n">Transport</th><th>Paid on</th></tr></thead><tbody>
        {sales.map((s) => <tr key={s.id} className="click" onClick={() => c.openModal(<EditSale rec={s} />)}><td>{s.code}</td><td>{dnice(s.d)}</td><td>{s.buyer}</td><td>{s.material}</td><td className="n">{kg(Number(s.kg))}</td><td className="n">₹{Number(s.rate)}</td>
          <td className="n">{rs(Number(s.kg) * Number(s.rate))}</td><td className="n">{rs(Number(s.transport))}</td><td>{s.paid_on ? dnice(s.paid_on) : <span className="missing">Waiting</span>}</td></tr>)}</tbody></table></div>
        : <Empty title="No sales yet" text="Record a sale when cans or plastic go to a buyer. Stock updates by itself."><button className="btn btn-p btn-sm" onClick={() => c.openModal(<EditSale />)}>+ Record sale</button></Empty>}
    </div>
  </>);
}
