"use client";
import { useState } from "react";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import VenueDrawer from "../VenueDrawer";
import { EditPayment } from "../forms2";
import { vname } from "../forms";
import { MONL, PST, type Venue, daysBetween, dnice, monthOf, pickupCost, rs } from "@/lib/admin/logic";

export default function Payouts() {
  const c = usePanel(); const [f, setF] = useState<"owed" | "overdue" | "due" | "paid" | "all">("owed");
  const goLive = c.set.goLive || c.today;
  const rows = c.venues.map((v) => ({ v, s: c.pay(v) })).filter((r) => r.s.cost > 0);
  const ord = { overdue: 0, due: 1, paid: 2 };
  const list = rows.filter((r) => f === "all" || (f === "owed" ? r.s.owed > 0 : r.s.st === f)).sort((a, b) => ord[a.s.st] - ord[b.s.st] || b.s.owed - a.s.owed);
  const owed = rows.reduce((a, r) => a + r.s.owed, 0), od = rows.filter((r) => r.s.st === "overdue"), due = rows.filter((r) => r.s.st === "due");
  const mo = monthOf(c.today), paysM = c.payments.filter((p) => !p.deleted && monthOf(p.d) === mo);
  const cnt = (k: typeof f) => (k === "all" ? rows.length : k === "owed" ? rows.filter((r) => r.s.owed > 0).length : rows.filter((r) => r.s.st === k).length);
  const recent = c.payments.filter((p) => !p.deleted).sort((a, b) => (a.d < b.d ? 1 : b.id - a.id)).slice(0, 12);
  const pre = c.venues.filter((v) => (c.byV.get(v.id) ?? []).some((p) => p.d < goLive)).sort((a, b) => Number(a.opening != null) - Number(b.opening != null) || a.name.localeCompare(b.name));
  const preSet = pre.filter((v) => v.opening != null).length;
  const preVal = (v: Venue) => (c.byV.get(v.id) ?? []).filter((p) => p.d < goLive).reduce((a, p) => a + pickupCost(p, c.vmap, c.set), 0);
  const chip = (st: keyof typeof PST) => <span className={"chip " + PST[st][1]}>{PST[st][0]}</span>;
  async function setOpening(v: Venue, raw: string) {
    const val = raw === "" ? null : Math.max(0, Number(raw)); if (val === (v.opening == null ? null : Number(v.opening))) return;
    const { data, error } = await c.db.from("venues").update({ opening: val }).eq("id", v.id).select().single(); if (c.fail(error)) return;
    c.patch((d) => ({ ...d, venues: d.venues.map((x) => (x.id === v.id ? (data as Venue) : x)) }));
    await c.logIt("Edited", "Opening balance", v.name, `${v.opening == null ? "Not set" : rs(Number(v.opening))} → ${val == null ? "Not set" : rs(val)}`, { table: "venues", id: v.id });
    c.toast(`${v.name}: opening balance saved`);
  }
  const fc = (k: typeof f, l: string) => <button key={k} className="fchip" aria-pressed={f === k} onClick={() => setF(k)}>{l} <b>{cnt(k)}</b></button>;
  return (<>
    <section className="kpis">
      <div className="kpi"><div className="l">Not paid on time</div><div className={"v" + (od.length ? " neg" : "")}>{od.length}</div><div className="s">{od.length ? rs(od.reduce((a, r) => a + r.s.owed, 0)) + " past the due day" : "Every venue paid on the spot"}{due.length ? ` · ${due.length} due today` : ""}</div></div>
      <div className="kpi"><div className="l">Paid in {MONL[+mo.slice(5, 7) - 1]}</div><div className="v">{rs(paysM.reduce((a, p) => a + Number(p.amount), 0))}</div><div className="s">{paysM.length} payment{paysM.length === 1 ? "" : "s"}</div></div>
      <div className="kpi"><div className="l">Opening balances</div><div className="v">{preSet} <small>of {pre.length}</small></div><div className="s">Owed from before {dnice(goLive)}</div></div>
      <div className="kpi hero"><div className="l">Owed to venues now</div><div className="v">{rs(owed)}</div><div className="s">Paid on the spot at each pickup. A few venues can be set to monthly in Edit venue.</div></div>
    </section>
    <div className="card">
      <div className="card-h"><h2>Who needs paying</h2><span className="sp" /><button className="btn btn-p btn-sm" onClick={() => c.openModal(<EditPayment />)}>+ Record payment</button></div>
      <div className="filters" style={{ marginBottom: 10 }}>{fc("owed", "Owed")}{fc("overdue", "Not paid on time")}{fc("due", "Due")}{fc("paid", "Paid up")}{fc("all", "All")}</div>
      {list.length ? <div className="tbl-wrap"><table><thead><tr><th>Venue</th><th className="hide-m">Terms</th><th className="n hide-m">Unpaid pickups</th><th className="hide-m">Oldest unpaid</th><th className="n">Owed</th><th>Status</th><th /></tr></thead><tbody>
        {list.map(({ v, s }) => <tr key={v.id} className="click" onClick={() => c.openDrawer(<VenueDrawer id={v.id} tab="pay" />)}><td><b>{v.name}</b></td><td className="hide-m muted">{v.terms}</td><td className="n hide-m">{s.unpaidN || "–"}</td>
          <td className="hide-m">{s.oldest ? <>{dnice(s.oldest)} <span className="muted">· {daysBetween(s.oldest, c.today)} days</span></> : "–"}</td><td className="n"><b>{s.owed ? rs(s.owed) : "–"}</b></td><td>{chip(s.st)}</td>
          <td className="n">{s.owed > 0 && <button className="btn btn-g btn-sm" onClick={(e) => { e.stopPropagation(); c.openModal(<EditPayment venueId={v.id} />); }}>Pay</button>}</td></tr>)}</tbody></table></div>
        : f === "owed" || !rows.length ? <Empty title="Nobody is owed anything" text={`From ${dnice(goLive)}, every pickup not paid on the spot adds to what the venue is owed. Add anything still owed from before under Opening balances below.`} />
        : <Empty title="Nothing in this filter" text="Pick another filter above." />}
    </div>
    <div className="card"><div className="card-h"><h2>Recent payments</h2><span className="hint">Tap one to edit or delete it</span></div>
      {recent.length ? recent.map((p) => <button key={p.id} className="exp-row" onClick={() => c.openModal(<EditPayment rec={p} />)}><div><div className="t">{vname(c, p.venue_id)}</div><div className="d">{dnice(p.d)} · {p.mode}{p.note ? " · " + p.note : ""} · by {p.created_by}</div></div><b>{rs(Number(p.amount))}</b></button>)
        : <Empty title="No payments yet" text="Record a payment here, or tick &quot;Paid the venue on the spot&quot; when logging a pickup." />}</div>
    <details className="card fold"><summary><h2>Opening balances</h2><span className="hint">{preSet} of {pre.length} set · what each venue was still owed on {dnice(goLive)}</span></summary>
      <div className="fold-b"><p className="muted" style={{ fontSize: 13 }}>The Excel doesn&apos;t say what was already paid for pickups before {dnice(goLive)}. Enter what each venue is still owed for them. Enter 0 if they&apos;re paid up.</p>
        <div>{pre.map((v) => <div key={v.id} className="ob-row"><span><b>{v.name}</b><br /><small className="muted">{rs(preVal(v))} of pickups before {dnice(goLive)}</small></span>
          <span className="inrow"><span>₹</span><input className="inl" type="number" inputMode="numeric" min={0} defaultValue={v.opening ?? ""} placeholder="Not set" aria-label={`Owed before ${dnice(goLive)}, ${v.name}`} onBlur={(e) => setOpening(v, e.target.value)} /></span></div>)}</div></div></details>
  </>);
}
