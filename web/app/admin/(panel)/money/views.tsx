"use client";
// Three extra views on the Money screen: what buyers still owe, how money was paid (cash / UPI / bank), and profit month by month.
import { usePanel } from "../Panel";
import { EditSale } from "../forms2";
import { DATA_START, collectionDays, daysBetween, dieselOf, dnice, inP, monthOf, monthsSince, period, rs, saleMoney, saleTransport, totals } from "@/lib/admin/logic";

// Sales the buyer has not paid yet (no "payment received on" date), oldest first, with the invoice total.
export function buyersOweTotal(c: ReturnType<typeof usePanel>) {
  const rows = c.sales.filter((s) => !s.deleted && !s.paid_on).sort((a, b) => (a.d < b.d ? -1 : 1)).map((s) => ({ s, m: saleMoney(s, c.set), days: daysBetween(s.d, c.today) }));
  return { rows, total: rows.reduce((a, r) => a + r.m.total, 0) };
}
export function BuyersOwe() {
  const c = usePanel(); const { rows, total } = buyersOweTotal(c);
  if (!rows.length) return <p className="muted">Every sale has been paid.</p>;
  return <>
    <div className="tbl-wrap"><table><thead><tr><th>Sale</th><th>Buyer</th><th>Date</th><th className="n">Waiting</th><th className="n">Invoice total</th></tr></thead><tbody>
      {rows.map(({ s, m, days }) => <tr key={s.id} className="click" onClick={() => c.openModal(<EditSale rec={s} />)}><td>{s.code}</td><td>{s.buyer}</td><td>{dnice(s.d)}</td>
        <td className={"n" + (days > 30 ? " neg" : "")}>{days} day{days === 1 ? "" : "s"}</td><td className="n"><b>{rs(m.total)}</b></td></tr>)}
      <tr style={{ borderTop: "1px solid var(--line)" }}><td colSpan={4}><b>Owed to you</b></td><td className="n"><b>{rs(total)}</b></td></tr>
    </tbody></table></div>
    <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>Includes GST. Tap a sale and fill in &quot;Payment received on&quot; when the money arrives.</p>
  </>;
}

// Money paid out in the period, by how it was paid.
export function HowPaid() {
  const c = usePanel(); const p = c.per;
  const pay = c.payments.filter((x) => !x.deleted && inP(x.d, p)), exp = c.expenses.filter((x) => !x.deleted && inP(x.d, p));
  const modes = [...new Set([...["Cash", "UPI", "Bank"], ...pay.map((x) => x.mode), ...exp.map((x) => x.mode)])].filter(Boolean);
  const sum = (l: { mode: string; amount: number }[], m: string) => l.filter((x) => x.mode === m).reduce((a, x) => a + Number(x.amount), 0);
  const rows = modes.map((m) => ({ m, v: sum(pay, m), e: sum(exp, m) })).filter((r) => r.v || r.e);
  if (!rows.length) return <p className="muted">No payments or expenses in {p.label} yet.</p>;
  const tv = rows.reduce((a, r) => a + r.v, 0), te = rows.reduce((a, r) => a + r.e, 0);
  return <>
    <div className="tbl-wrap"><table><thead><tr><th>Paid by</th><th className="n">To venues</th><th className="n">Expenses</th><th className="n">Total</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.m}><td>{r.m}</td><td className="n">{rs(r.v)}</td><td className="n">{rs(r.e)}</td><td className="n"><b>{rs(r.v + r.e)}</b></td></tr>)}
      <tr style={{ borderTop: "1px solid var(--line)" }}><td><b>All</b></td><td className="n">{rs(tv)}</td><td className="n">{rs(te)}</td><td className="n"><b>{rs(tv + te)}</b></td></tr>
    </tbody></table></div>
    <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>Venue payments use the &quot;Paid by&quot; chosen when they were paid; expenses use the one on each expense. Older payments saved before that choice existed show as Cash.</p>
  </>;
}

// One row per month: what cans and plastic earned after paying venues, the costs, and what is left.
export function MonthByMonth() {
  const c = usePanel();
  const rows = monthsSince(DATA_START, monthOf(c.today)).reverse().map((m) => {
    const p = period(m, c.today), T = totals(p, c.pickups, c.vmap, c.vset), earned = T.canValue + T.plValue - T.paid;
    const running = dieselOf(collectionDays(c.pickups, c.trips, c.set, p)) + saleTransport(c.sales, p);
    const ex = c.expenses.filter((e) => !e.deleted && inP(e.d, p)), sal = ex.filter((e) => e.category === "Salaries"), salaries = sal.reduce((a, e) => a + Number(e.amount), 0);
    const other = ex.filter((e) => e.category !== "Salaries").reduce((a, e) => a + Number(e.amount), 0);
    return { m, label: p.label, earned, running, salaries, noSalaries: !sal.length, other, profit: earned - running - salaries - other };
  });
  const now = rows[0], full = c.staff.filter((s) => s.active).reduce((a, s) => a + Number(s.salary || 0), 0);
  return <>
    <div className="tbl-wrap"><table><thead><tr><th>Month</th><th className="n">Earned</th><th className="n">Diesel and transport</th><th className="n">Salaries</th><th className="n">Other costs</th><th className="n">Profit</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.m}><td>{r.label}</td><td className="n">{rs(r.earned)}</td><td className="n">{rs(-r.running)}</td>
        <td className="n">{r.noSalaries ? <span className="missing">Not entered</span> : rs(-r.salaries)}</td><td className="n">{rs(-r.other)}</td><td className={"n " + (r.profit < 0 ? "neg" : "pos")}><b>{rs(r.profit)}</b></td></tr>)}
    </tbody></table></div>
    <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>Earned = cans and plastic at the last sale prices, minus what venues were paid. Costs are the ones entered in each month.
      {now && now.noSalaries && full > 0 ? ` ${now.label} has no salaries entered yet; counting the full monthly salaries (${rs(full)}) its profit would be ${rs(now.profit - full)}.` : ""}</p>
  </>;
}
