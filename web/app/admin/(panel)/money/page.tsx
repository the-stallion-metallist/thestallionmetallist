"use client";
import Link from "next/link";
import { usePanel } from "../Panel";
import { Empty, I } from "../icons";
import { PhFold, PhHead, PhRow } from "../bits";
import { EditExpense, EditPayment, EditSale } from "../forms2";
import { CATS, dnice, fmt, inP, itemLabel, kg, lastUnitCost, monthOf, rs, rsu, staffDue, totals } from "@/lib/admin/logic";

export default function Money() {
  const c = usePanel(); const p = c.per;
  const T = totals(p, c.pickups, c.vmap, c.set);
  const trips = c.trips.filter((t) => !t.deleted && inP(t.d, p)), tripCost = trips.reduce((a, t) => a + Number(t.fuel_cost) + Number(t.other_cost), 0);
  const exps = c.expenses.filter((e) => !e.deleted && inP(e.d, p)), byCat: Record<string, number> = {}; for (const e of exps) byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount);
  const salesIn = c.sales.filter((s) => !s.deleted && inP(s.d, p)).reduce((a, s) => a + Number(s.kg) * Number(s.rate), 0);
  const profit = T.canValue + T.plValue - T.paid - tripCost - exps.reduce((a, e) => a + Number(e.amount), 0);
  const sname = (id: number | null) => c.staff.find((s) => s.id === id)?.name ?? "";
  const margin = c.set.ubcRate / c.set.cansPerKg - c.set.canRate;
  const allBins = c.venues.reduce((a, v) => a + v.steel + v.plastic_bins, 0), cpb = allBins ? (T.cans / allBins) * (p.all ? 30 / p.days : 1) : 0, perBin = cpb * margin;
  const owed = c.venues.map((v) => c.pay(v)), od = owed.filter((s) => s.st === "overdue");
  const payNote = c.set.goLive ? "" : " Payouts are tracked from the go-live day (set in Settings).";

  if (c.phone) { // phone: the three money jobs, a plain summary, and where to look next
    const expTot = exps.reduce((a, e) => a + Number(e.amount), 0), costs = tripCost + expTot, owedTot = owed.reduce((a, s) => a + s.owed, 0), owedN = owed.filter((s) => s.owed > 0).length;
    const ps = c.pickups.filter((x) => !x.deleted), soldKg = c.sales.filter((s) => !s.deleted && s.material === "UBC").reduce((a, s) => a + Number(s.kg), 0);
    const cansNow = ps.reduce((a, x) => a + x.cans, 0) - soldKg * c.set.cansPerKg;
    const mo = monthOf(c.today), active = c.staff.filter((s) => s.active), salSet = active.filter((s) => s.salary).length;
    const toPay = active.reduce((a, s) => a + Math.max(0, staffDue(s, mo, c.marks, c.advances, c.expenses).pay ?? 0), 0);
    return (<div className="ph">
      <PhHead title="Money" sub={`${p.label}${p.end >= c.today ? " · up to " + dnice(c.today) : ""}`} />
      <div className="ph-qa">
        <button onClick={() => c.openModal(<EditPayment />)}>{I.payouts}Pay venue</button>
        <button onClick={() => c.openModal(<EditExpense />)}>{I.plus}Expense</button>
        <button onClick={() => c.openModal(<EditSale />)}>{I.stock}Sale</button>
      </div>
      <div className="ph-card"><div className="ph-stmt">
        <div><span>Cans collected are worth<small>{fmt(T.cans)} cans at ₹{c.set.ubcRate}/kg{T.plValue ? ` · plus ${kg(T.pl)} kg plastic` : ""}</small></span><b>{rs(T.canValue + T.plValue)}</b></div>
        <div><span>Paid to venues</span><b className="neg">{rs(-T.paid)}</b></div>
        <div><span>Trips and expenses{!costs && <small>None entered yet</small>}</span><b className={costs ? "neg" : "muted"}>{costs ? rs(-costs) : "₹0"}</b></div>
        <div className="tot"><span>Left over</span><b className={profit < 0 ? "neg" : "pos"}>{rs(profit)}</b></div>
      </div>{!expTot && <p className="muted" style={{ fontSize: 13.5, marginTop: 10 }}>Add salaries, rent and fuel as expenses to see real profit.</p>}</div>
      <div className="ph-list">
        <PhRow lead={owedN ? owedN : I.tick} tone={od.length ? "bad" : owedN ? "warn" : "good"} title="Venues owed" sub={owedN ? `${rs(owedTot)} to pay${od.length ? ` · ${od.length} not paid on time` : ""}` : "Everyone is paid"} href="/admin/payouts" />
        <PhRow lead={I.stock} title="In the godown" sub={`${fmt(cansNow)} cans · worth ${rs((cansNow / c.set.cansPerKg) * c.set.ubcRate)}`} href="/admin/stock" />
        <PhRow lead={I.staff} title="Staff pay" sub={!salSet ? `${active.length} staff · salaries not set yet` : toPay ? `${rs(toPay)} to pay this month` : "Nothing to pay this month"} href="/admin/staff" />
      </div>
      <PhFold title="Per can" sub="Margin, trip cost, bin payback"><div className="ph-stmt">
        <div><span>Sale value per can</span><b>₹{(c.set.ubcRate / c.set.cansPerKg).toFixed(2)}</b></div>
        <div><span>Paid per can</span><b>₹{c.set.canRate.toFixed(2)}</b></div>
        <div><span>Margin per can</span><b className="pos">₹{margin.toFixed(2)}</b></div>
        <div><span>Trip cost per can</span><b>{T.cans ? `₹${(tripCost / T.cans).toFixed(2)}` : "–"}</b></div>
        <div><span>Cans per pickup</span><b>{T.n ? fmt(T.cans / T.n) : "–"}</b></div>
      </div></PhFold>
      <PhFold title="Expenses" sub={exps.length ? `${exps.length} in ${p.label} · ${rs(expTot)}` : `Nothing entered in ${p.label}`}>
        {exps.length ? <div className="ph-list flat">{exps.slice().sort((a, b) => (a.d < b.d ? 1 : -1)).map((e) => <PhRow key={e.id} title={e.category === "Salaries" ? "Salary · " + sname(e.staff_id) : e.qty ? itemLabel(e) : e.category} sub={`${dnice(e.d)} · ${e.mode}`} right={<b className="ph-amt">{rs(Number(e.amount))}</b>} onClick={() => c.openModal(<EditExpense rec={e} />)} />)}</div>
          : <p className="muted">Add salaries, rent, new bins and phone bills here.</p>}
      </PhFold>
    </div>);
  }
  return (
    <section className="grid2">
      <div className="card"><div className="card-h"><h2>Profit for {p.label}</h2><span className="hint">Cans valued at ₹{c.set.ubcRate}/kg until they&apos;re sold</span></div>
        <div className="stmt">
          <div className="srow h">Money in</div>
          <div className="srow"><span className="lbl">Cans collected<span className="note">{fmt(T.cans)} cans ≈ {kg(T.cans / c.set.cansPerKg)} kg</span></span><span className="a">{rs(T.canValue)}</span></div>
          <div className="srow"><span className="lbl">Plastic collected<span className="note">{kg(T.pl)} kg</span></span><span className="a">{c.set.plasticSale ? rs(T.plValue) : <Link className="missing" href="/admin/settings">Set plastic sale rate</Link>}</span></div>
          <div className="srow h">Money out</div>
          <div className="srow"><span className="lbl">Paid to venues for cans<span className="note">Mostly ₹{c.set.canRate.toFixed(2)} per can</span></span><span className="a neg">{rs(-T.paidV)}</span></div>
          <div className="srow"><span className="lbl">Paid for plastic<span className="note">Per kg, depends on venue</span></span><span className="a neg">{rs(-T.paidPl)}</span></div>
          <div className="srow"><span className="lbl">Trip costs<span className="note">{trips.length} trip{trips.length === 1 ? "" : "s"}</span></span><span className="a neg">{rs(-tripCost)}</span></div>
          {CATS.map((k) => { const who = k === "Salaries" ? [...new Set(exps.filter((e) => e.category === k).map((e) => sname(e.staff_id)))].join(", ") : k === "Bins & bags" ? exps.filter((e) => e.category === k && e.qty).map(itemLabel).join(", ") : "";
            return <div key={k} className="srow"><span className="lbl">{k}{who && <span className="note">{who}</span>}</span><span className={"a" + (byCat[k] ? " neg" : "")}>{byCat[k] ? rs(-byCat[k]) : <span className="missing">Not entered</span>}</span></div>; })}
          <div className="srow tot"><span className="lbl">Profit</span><span className={"a " + (profit < 0 ? "neg" : "pos")}>{rs(profit)}</span></div>
        </div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <div className="kpi hero"><div className="l">Cash received from buyers</div><div className="v">{rs(salesIn)}</div><div className="s">From sales recorded in {p.label}</div></div>
        <details className="card fold"><summary><h2>Unit economics</h2><span className="hint">Margin per can, trip cost, bin payback</span></summary>
          <div className="fold-b"><div className="kv">
            <div><span>Sale value per can</span><b>₹{(c.set.ubcRate / c.set.cansPerKg).toFixed(2)}</b></div>
            <div><span>Paid per can</span><b>₹{c.set.canRate.toFixed(2)}</b></div>
            <div><span>Margin per can before costs</span><b>₹{margin.toFixed(2)}</b></div>
            <div><span>Trip cost per can</span><b>{T.cans ? `₹${(tripCost / T.cans).toFixed(2)}` : "–"}</b></div>
            <div><span>Cans per pickup</span><b>{T.n ? fmt(T.cans / T.n) : "–"}</b></div>
            {([["Steel bin", "steel bin"], ["Plastic bin", "plastic bin"], ["Garbage bags", "garbage bag"]] as const).map(([k, l]) => { const cost = lastUnitCost(c.expenses, k);
              return cost == null ? <div key={k}><span>Cost per {l}</span><b className="missing">Add a Bins &amp; bags expense</b></div>
                : [<div key={k}><span>Cost per {l}</span><b>{rsu(cost)}</b></div>, k !== "Garbage bags" && perBin > 0 && <div key={k + "p"}><span>A {l} pays for itself in<br /><small className="muted">At {fmt(cpb)} cans per bin {p.all ? "a month on average" : "this month"}</small></span><b>{(cost / perBin).toFixed(1)} months</b></div>]; })}
          </div></div></details>
        <div className="card"><div className="card-h"><h2>Venue payouts</h2><span className="sp" /><Link className="btn btn-g btn-sm" href="/admin/payouts">View all</Link></div>
          <div className="kv"><div><span>Owed to venues now</span><b>{rs(owed.reduce((a, s) => a + s.owed, 0))}</b></div><div><span>Not paid on time</span><b className={od.length ? "neg" : ""}>{od.length} venues · {rs(od.reduce((a, s) => a + s.owed, 0))}</b></div></div>
          {payNote && <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>{payNote}</p>}</div>
        <div className="card"><div className="card-h"><h2>Expenses</h2><span className="sp" /><button className="btn btn-p btn-sm" onClick={() => c.openModal(<EditExpense />)}>+ Add expense</button></div>
          {exps.length ? <div>{exps.slice().sort((a, b) => (a.d < b.d ? 1 : -1)).map((e) => <button key={e.id} className="exp-row" onClick={() => c.openModal(<EditExpense rec={e} />)}>
            <div><div className="t">{e.category === "Salaries" ? "Salary · " + sname(e.staff_id) : e.qty ? itemLabel(e) : e.category}</div><div className="d">{e.qty ? `${rsu(Number(e.amount) / e.qty)} each · ` : ""}{dnice(e.d)} · {e.mode}{e.note ? " · " + e.note : ""}</div></div>
            <b>{rs(Number(e.amount))}</b></button>)}</div>
            : <Empty title="No expenses in this period" text="Add salaries, rent, new bins and phone bills to see real profit." />}
        </div>
      </div>
    </section>
  );
}
