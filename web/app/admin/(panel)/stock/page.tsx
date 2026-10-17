"use client";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import { EditSale } from "../forms2";
import { DATA_START, addDays, dnice, fmt, godownOn, inP, kg, monthOf, monthsSince, period, rs } from "@/lib/admin/logic";

// The godown = everything collected minus everything sold, the same count Home and Money show.
// The cards are always "today". The month table shows each month's start, in, out and end; the month switch picks the sales listed below.
export default function Stock() {
  const c = usePanel();
  const now = godownOn(c.pickups, c.sales, c.set, null, null);
  const val = (now.cans / c.set.cansPerKg) * c.set.ubcRate;
  const months = monthsSince(DATA_START, monthOf(c.today));
  const rows = months.map((m) => {
    const p = period(m, c.today);
    return { m, label: p.label, open: godownOn(c.pickups, c.sales, c.set, null, addDays(p.start, -1)), flow: godownOn(c.pickups, c.sales, c.set, p.start, p.end), end: godownOn(c.pickups, c.sales, c.set, null, p.asOf) };
  });
  const sales = c.sales.filter((s) => !s.deleted && inP(s.d, c.per)).sort((a, b) => (a.d < b.d ? 1 : -1));
  const total = godownOn(c.pickups, c.sales, c.set, DATA_START + "-01", c.today);
  return (<>
    <section className="godown">
      <div className="card stock"><div className="l muted" style={{ fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" }}>Cans in godown today</div>
        <div className="big">{fmt(now.cans)} <small>≈ {kg(now.cans / c.set.cansPerKg)} kg</small></div>
        <div className="flow"><span>Collected<b>{fmt(total.cansIn)}</b></span><span>Sold<b>{fmt(total.cansOut)}</b></span><span>Worth now<b>{rs(val)}</b></span></div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>Buyers pay by kg, so each sale removes {c.set.cansPerKg} cans per kg (Settings). Changing that number changes the count for every sale, past months included.</p></div>
      <div className="card stock"><div className="l muted" style={{ fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" }}>Plastic in godown today</div>
        <div className="big">{kg(now.pl)} <small>kg</small></div>
        <div className="flow"><span>Collected<b>{kg(total.plIn)} kg</b></span><span>Sold<b>{kg(total.plOut)} kg</b></span><span>Sale rate<b>{c.set.plasticSale ? `₹${c.set.plasticSale}/kg` : "Not set"}</b></span></div></div>
    </section>
    <div className="card"><div className="card-h"><h2>Godown by month</h2><span className="hint">Cans, from the first pickup. Plastic in kg.</span></div>
      <div className="tbl-wrap"><table><thead><tr><th>Month</th><th className="n">At start</th><th className="n">Collected</th><th className="n">Sold</th><th className="n">At end</th><th className="n">Plastic at end</th></tr></thead><tbody>
        {rows.map((r) => <tr key={r.m} className={c.month === r.m ? "on" : ""} style={c.month === r.m ? { fontWeight: 600 } : undefined}>
          <td>{r.label}{r.end.cans < 0 && <span className="missing"> · more sold than collected</span>}</td>
          <td className="n">{fmt(r.open.cans)}</td><td className="n">{fmt(r.flow.cansIn)}</td><td className="n">{fmt(r.flow.cansOut)}</td><td className="n"><b>{fmt(r.end.cans)}</b></td><td className="n">{kg(r.end.pl)} kg</td></tr>)}
        <tr style={{ borderTop: "1px solid var(--line)" }}><td><b>All months</b></td><td className="n">0</td><td className="n">{fmt(total.cansIn)}</td><td className="n">{fmt(total.cansOut)}</td><td className="n"><b>{fmt(now.cans)}</b></td><td className="n">{kg(now.pl)} kg</td></tr>
      </tbody></table></div>
    </div>
    <div className="card"><div className="card-h"><h2>Sales to buyers</h2><span className="hint">{c.per.label} · tap a sale to edit it or mark the payment received</span><span className="sp" /><button className="btn btn-p btn-sm" onClick={() => c.openModal(<EditSale />)}>+ Record sale</button></div>
      {sales.length ? <div className="tbl-wrap"><table><thead><tr><th>Sale</th><th>Date</th><th>Buyer</th><th>Material</th><th className="n">Kg</th><th className="n">Rate</th><th className="n">Invoice</th><th className="n">Transport</th><th>Paid on</th></tr></thead><tbody>
        {sales.map((s) => <tr key={s.id} className="click" onClick={() => c.openModal(<EditSale rec={s} />)}><td>{s.code}</td><td>{dnice(s.d)}</td><td>{s.buyer}</td><td>{s.material}</td><td className="n">{kg(Number(s.kg))}</td><td className="n">₹{Number(s.rate)}</td>
          <td className="n">{rs(Number(s.kg) * Number(s.rate))}</td><td className="n">{rs(Number(s.transport))}</td><td>{s.paid_on ? dnice(s.paid_on) : <span className="missing">Waiting</span>}</td></tr>)}</tbody></table></div>
        : <Empty title="No sales in this period" text="Record a sale when cans or plastic go to a buyer. Stock updates by itself."><button className="btn btn-p btn-sm" onClick={() => c.openModal(<EditSale />)}>+ Record sale</button></Empty>}
    </div>
  </>);
}
