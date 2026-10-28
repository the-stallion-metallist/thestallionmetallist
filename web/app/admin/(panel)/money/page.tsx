"use client";
import Link from "next/link";
import { usePanel } from "../Panel";
import { Empty, I } from "../icons";
import { PhFold, PhHead, PhRow, SplitBar, priceNote } from "../bits";
import { EditExpense, EditPayment, EditSale } from "../forms2";
import { CATS, collectionDays, dieselOf, dnice, fmt, godownOn, inP, saleMoney, saleTransport, itemLabel, kg, lastUnitCost, monthOf, rs, rsu, staffDue, totals } from "@/lib/admin/logic";

export default function Money() {
  const c = usePanel(); const p = c.per;
  const T = totals(p, c.pickups, c.vmap, c.vset);
  const days = collectionDays(c.pickups, c.trips, c.set, p), tripCost = dieselOf(days);
  const exps = c.expenses.filter((e) => !e.deleted && inP(e.d, p)), byCat: Record<string, number> = {}; for (const e of exps) byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount);
  const salesRows = c.sales.filter((s) => !s.deleted && inP(s.d, p)).map((s) => saleMoney(s, c.set));
  const salesIn = salesRows.reduce((a, m) => a + m.taxable, 0), gstIn = salesRows.reduce((a, m) => a + m.gst, 0); // GST is not income: it is set aside to pay the government
  const saleTr = saleTransport(c.sales, p); // shipping the stock sold, from the Transport box on each sale
  const profit = T.canValue + T.plValue - T.paid - tripCost - saleTr - exps.reduce((a, e) => a + Number(e.amount), 0);
  const sname = (id: number | null) => c.staff.find((s) => s.id === id)?.name ?? "";
  // unit costs: every cost in the period (diesel + all expenses, as in Profit) spread over the cans and pickups
  const costAll = tripCost + saleTr + exps.reduce((a, e) => a + Number(e.amount), 0), catSum = (k: string) => exps.filter((e) => e.category === k).reduce((a, e) => a + Number(e.amount), 0);
  const costCan = T.cans ? costAll / T.cans : null, costPick = T.n ? costAll / T.n : null, profitCan = T.cans ? (T.canValue + T.plValue - T.paid - costAll) / T.cans : null;
  const plMargin = c.vset.plasticSale && T.pl ? (T.plValue - T.paidPl) / T.pl : null;
  // plastic next to cans: what it earns after paying venues, its share, and what each can earns with its plastic
  const canProfit = T.canValue - T.paidV, plProfit = T.plValue - T.paidPl, both = canProfit + plProfit;
  const plPaidKg = T.pl ? T.paidPl / T.pl : null, plPicks = T.ps.filter((x) => Number(x.plastic_kg || 0) > 0).length;
  const plRows = <>
    <div><span>Prices used<br /><small className="muted">{priceNote(c)}</small></span><b>Last sales</b></div>
    <div><span>Plastic sale price</span><b>{c.vset.plasticSale ? `₹${c.vset.plasticSale}/kg` : <Link className="missing" href="/admin/settings">Not set</Link>}</b></div>
    <div><span>Paid per kg of plastic<br /><small className="muted">Average over {p.label}</small></span><b>{plPaidKg != null ? `₹${plPaidKg.toFixed(2)}` : "–"}</b></div>
    <div><span>Plastic margin per kg<br /><small className="muted">Sale price minus what venues are paid per kg</small></span><b className={plMargin != null && plMargin < 0 ? "neg" : "pos"}>{plMargin != null ? `₹${plMargin.toFixed(2)}` : "–"}</b></div>
    <div><span>Plastic collected<br /><small className="muted">{plPicks} of {T.n} pickups had plastic</small></span><b>{kg(T.pl)} kg{plPicks ? ` · ${kg(T.pl / plPicks)} kg each` : ""}</b></div>
    <div><span>Profit from plastic before costs<br /><small className="muted">{both > 0 ? `${Math.round((plProfit / both) * 100)}% of what cans and plastic earn` : ""}</small></span><b className={plProfit < 0 ? "neg" : ""}>{rs(plProfit)}</b></div>
    <div><span>Earned per can, with its plastic<br /><small className="muted">₹{T.cans ? (canProfit / T.cans).toFixed(2) : "0"} from the can + ₹{T.cans ? (plProfit / T.cans).toFixed(2) : "0"} from plastic. Break-even uses this.</small></span><b>{T.cans ? `₹${(both / T.cans).toFixed(2)}` : "–"}</b></div>
  </>;
  const costSplit = [["salaries", catSum("Salaries")], ["rent", catSum("Rent")], ["diesel", tripCost], ["other", costAll - catSum("Salaries") - catSum("Rent") - tripCost]].map(([l, v]) => `${l} ₹${fmt(Math.round(Number(v)))}`).join(" · ");
  const margin = c.vset.ubcRate / c.set.cansPerKg - c.set.canRate;
  // earnings (cans + plastic, after paying venues) against the costs entered for this period: diesel and expenses
  const cEarn = Math.max(0, T.canValue - T.paidV), pEarn = Math.max(0, T.plValue - T.paidPl), earnedAll = cEarn + pEarn;
  const coveredAll = costAll > 0 && earnedAll >= costAll, pctAll = costAll ? Math.round((earnedAll / costAll) * 100) : null;
  const earnCard = <div className="card be">
    <div className="be-h"><h2>Earnings against costs, {p.label}</h2><span className="hint">Cans and plastic after paying venues, against diesel, sale transport and the expenses entered</span>{pctAll != null && <span className={"be-pct" + (coveredAll ? " ok" : "")}>{pctAll}%</span>}</div>
    <div className="be-top"><div className="be-v"><b>{rs(earnedAll)}</b> earned</div><div className="be-money"><b>{rs(costAll)}</b> costs entered</div></div>
    <SplitBar canEarn={cEarn} plEarn={pEarn} plKg={T.pl} target={costAll} label={`Earned ${rs(earnedAll)} (cans ${rs(cEarn)}, plastic ${rs(pEarn)}) against ${rs(costAll)} of costs entered`}
      mark={coveredAll ? costAll : null} markNote={`Costs entered end here: ${rs(costAll)}`} />
    {!exps.some((e) => e.category === "Salaries") && <p className="be-note">No salaries entered for {p.label} yet, so costs are only diesel{saleTr ? ", sale transport" : ""}{exps.length ? " and the expenses entered" : ""}.</p>}
  </div>;
  const allBins = c.venues.reduce((a, v) => a + v.steel + v.plastic_bins, 0), cpb = allBins ? (T.cans / allBins) * (p.all ? 30 / p.days : 1) : 0, perBin = cpb * margin;
  const owed = c.venues.map((v) => c.pay(v)), od = owed.filter((s) => s.st === "overdue");
  const payNote = c.set.goLive ? "" : " Payouts are tracked from the go-live day (set in Settings).";

  if (c.phone) { // phone: the three money jobs, a plain summary, and where to look next
    const expTot = exps.reduce((a, e) => a + Number(e.amount), 0), costs = tripCost + saleTr + expTot, owedTot = owed.reduce((a, s) => a + s.owed, 0), owedN = owed.filter((s) => s.owed > 0).length;
    const g = godownOn(c.pickups, c.sales, c.set, null, null), cansNow = g.cans, gWorth = (g.cans / c.set.cansPerKg) * c.vset.ubcRate + g.pl * (c.vset.plasticSale ?? 0);
    const mo = monthOf(c.today), active = c.staff.filter((s) => s.active), salSet = active.filter((s) => s.salary).length;
    const toPay = active.reduce((a, s) => a + Math.max(0, staffDue(s, mo, c.marks, c.advances, c.expenses).pay ?? 0), 0);
    return (<div className="ph">
      <PhHead title="Money" sub={`${p.label}${p.end >= c.today ? " · up to " + dnice(c.today) : ""}`} />
      <div className="ph-qa">
        <button onClick={() => c.openModal(<EditPayment />)}>{I.payouts}Pay venue</button>
        <button onClick={() => c.openModal(<EditExpense />)}>{I.plus}Expense</button>
        <button onClick={() => c.openModal(<EditSale />)}>{I.stock}Sale</button>
      </div>
      {earnCard}
      <div className="ph-card"><div className="ph-stmt">
        <div><span>Cans and plastic are worth<small>{fmt(T.cans)} cans at ₹{c.vset.ubcRate}/kg{T.pl ? ` · ${kg(T.pl)} kg plastic at ₹${c.vset.plasticSale ?? 0}/kg` : ""}</small></span><b>{rs(T.canValue + T.plValue)}</b></div>
        <div><span>Paid to venues</span><b className="neg">{rs(-T.paid)}</b></div>
        <div><span>Diesel, sale transport and expenses{!costs && <small>None yet</small>}</span><b className={costs ? "neg" : "muted"}>{costs ? rs(-costs) : "₹0"}</b></div>
        <div className="tot"><span>Left over</span><b className={profit < 0 ? "neg" : "pos"}>{rs(profit)}</b></div>
      </div>{!expTot && <p className="muted" style={{ fontSize: 13.5, marginTop: 10 }}>Add salaries and rent as expenses to see real profit. Diesel is counted for each collection day.</p>}</div>
      <div className="ph-list">
        <PhRow lead={owedN ? owedN : I.tick} tone={od.length ? "bad" : owedN ? "warn" : "good"} title="Venues owed" sub={owedN ? `${rs(owedTot)} to pay${od.length ? ` · ${od.length} not paid on time` : ""}` : "Everyone is paid"} href="/admin/payouts" />
        <PhRow lead={I.stock} title="In the godown" sub={`${fmt(cansNow)} cans + ${kg(g.pl)} kg plastic · worth ${rs(gWorth)}`} href="/admin/stock" />
        <PhRow lead={I.staff} title="Staff pay" sub={!salSet ? `${active.length} staff · salaries not set yet` : toPay ? `${rs(toPay)} to pay this month` : "Nothing to pay this month"} href="/admin/staff" />
      </div>
      <PhFold title="Per can and per kg" sub="Cans, plastic, diesel, all costs"><div className="ph-stmt">
        <div><span>Sale value per can</span><b>₹{(c.vset.ubcRate / c.set.cansPerKg).toFixed(2)}</b></div>
        <div><span>Paid per can</span><b>₹{c.set.canRate.toFixed(2)}</b></div>
        <div><span>Margin per can</span><b className="pos">₹{margin.toFixed(2)}</b></div>
        <div><span>Diesel per can</span><b>{T.cans ? `₹${(tripCost / T.cans).toFixed(2)}` : "–"}</b></div>
        <div><span>Cans per pickup</span><b>{T.n ? fmt(T.cans / T.n) : "–"}</b></div>
        <div><span>Cost per can, all costs</span><b>{costCan != null ? `₹${costCan.toFixed(2)}` : "–"}</b></div>
        <div><span>Profit per can after all costs<br /><small className="muted">Plastic included</small></span><b className={profitCan != null && profitCan < 0 ? "neg" : ""}>{profitCan != null ? `₹${profitCan.toFixed(2)}` : "–"}</b></div>
        <div><span>Cost per pickup</span><b>{costPick != null ? `₹${fmt(Math.round(costPick))}` : "–"}</b></div>
        {plRows}
      </div></PhFold>
      <PhFold title="Expenses" sub={exps.length ? `${exps.length} in ${p.label} · ${rs(expTot)}` : `Nothing entered in ${p.label}`}>
        {exps.length ? <div className="ph-list flat">{exps.slice().sort((a, b) => (a.d < b.d ? 1 : -1)).map((e) => <PhRow key={e.id} title={e.category === "Salaries" ? "Salary · " + sname(e.staff_id) : e.qty ? itemLabel(e) : e.category} sub={`${dnice(e.d)} · ${e.mode}`} right={<b className="ph-amt">{rs(Number(e.amount))}</b>} onClick={() => c.openModal(<EditExpense rec={e} />)} />)}</div>
          : <p className="muted">Add salaries, rent, new bins and phone bills here.</p>}
      </PhFold>
    </div>);
  }
  return (<>
    {earnCard}
    <section className="grid2">
      <div className="card"><div className="card-h"><h2>Profit for {p.label}</h2><span className="hint">Cans at ₹{c.vset.ubcRate}/kg and plastic at ₹{c.vset.plasticSale ?? 0}/kg, the last sale prices</span></div>
        <div className="stmt">
          <div className="srow h">Money in</div>
          <div className="srow"><span className="lbl">Cans collected<span className="note">{fmt(T.cans)} cans ≈ {kg(T.cans / c.set.cansPerKg)} kg</span></span><span className="a">{rs(T.canValue)}</span></div>
          <div className="srow"><span className="lbl">Plastic collected<span className="note">{kg(T.pl)} kg</span></span><span className="a">{c.vset.plasticSale ? rs(T.plValue) : <Link className="missing" href="/admin/settings">Set plastic sale rate</Link>}</span></div>
          <div className="srow h">Money out</div>
          <div className="srow"><span className="lbl">Paid to venues for cans<span className="note">Mostly ₹{c.set.canRate.toFixed(2)} per can</span></span><span className="a neg">{rs(-T.paidV)}</span></div>
          <div className="srow"><span className="lbl">Paid for plastic<span className="note">Per kg, depends on venue</span></span><span className="a neg">{rs(-T.paidPl)}</span></div>
          <div className="srow"><span className="lbl">Diesel<span className="note">{days.length} collection day{days.length === 1 ? "" : "s"}</span></span><span className="a neg">{rs(-tripCost)}</span></div>
          {saleTr > 0 && <div className="srow"><span className="lbl">Transport on sales<span className="note">Shipping the stock sold</span></span><span className="a neg">{rs(-saleTr)}</span></div>}
          {CATS.map((k) => { const who = k === "Salaries" ? [...new Set(exps.filter((e) => e.category === k).map((e) => sname(e.staff_id)))].join(", ") : k === "Bins & bags" ? exps.filter((e) => e.category === k && e.qty).map(itemLabel).join(", ") : "";
            return <div key={k} className="srow"><span className="lbl">{k}{who && <span className="note">{who}</span>}</span><span className={"a" + (byCat[k] ? " neg" : "")}>{byCat[k] ? rs(-byCat[k]) : <span className="missing">Not entered</span>}</span></div>; })}
          <div className="srow tot"><span className="lbl">Profit</span><span className={"a " + (profit < 0 ? "neg" : "pos")}>{rs(profit)}</span></div>
        </div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <div className="kpi hero"><div className="l">Sales before GST</div><div className="v">{rs(salesIn)}</div><div className="s">{gstIn ? `Plus ${rs(gstIn)} GST to set aside, not profit` : `From sales recorded in ${p.label}`}</div></div>
        <details className="card fold"><summary><h2>Unit economics</h2><span className="hint">Cans, plastic, diesel, bin payback</span></summary>
          <div className="fold-b"><div className="kv">
            <div><span>Sale value per can</span><b>₹{(c.vset.ubcRate / c.set.cansPerKg).toFixed(2)}</b></div>
            <div><span>Paid per can</span><b>₹{c.set.canRate.toFixed(2)}</b></div>
            <div><span>Margin per can before costs</span><b>₹{margin.toFixed(2)}</b></div>
            <div><span>Diesel per can</span><b>{T.cans ? `₹${(tripCost / T.cans).toFixed(2)}` : "–"}</b></div>
            <div><span>Cans per pickup</span><b>{T.n ? fmt(T.cans / T.n) : "–"}</b></div>
            <div><span>Cost per can, all costs<br /><small className="muted">{costSplit}</small></span><b>{costCan != null ? `₹${costCan.toFixed(2)}` : "–"}</b></div>
            <div><span>Profit per can after all costs<br /><small className="muted">Plastic included</small></span><b className={profitCan != null && profitCan < 0 ? "neg" : ""}>{profitCan != null ? `₹${profitCan.toFixed(2)}` : "–"}</b></div>
            <div><span>Cost per pickup</span><b>{costPick != null ? `₹${fmt(Math.round(costPick))}` : "–"}</b></div>
            {plRows}
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
  </>);
}
