"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePanel } from "./Panel";
import { I, Empty } from "./icons";
import BarChart, { type Bar } from "./BarChart";
import VenueDrawer from "./VenueDrawer";
import { openLogPickup } from "./forms";
import { RunBar } from "./bits";
import { startRun } from "./runlib";
import { MON, addDays, dayName, dnice, fmt, inP, kg, monthOf, rs, shiftMonth, totals, DATA_START } from "@/lib/admin/logic";
import { weekOf } from "@/lib/admin/routes";

export default function Overview() {
  const c = usePanel(); const router = useRouter(); const p = c.per;
  const T = useMemo(() => totals(p, c.pickups, c.vmap, c.set), [p, c.pickups, c.vmap, c.set]);
  const rows = c.venues.map((v) => ({ v, s: c.stats(v), n: c.stats(v, c.now) }));
  const cnt = (k: string) => rows.filter((x) => x.n.st === k).length;
  const top = rows.filter((x) => x.s.cans > 0).sort((a, b) => b.s.cans - a.s.cans);
  const share = T.cans ? Math.round((top.slice(0, 10).reduce((a, x) => a + x.s.cans, 0) / T.cans) * 100) : 0;
  const mc = (mo: string) => c.pickups.filter((x) => !x.deleted && monthOf(x.d) === mo).reduce((a, x) => a + x.cans, 0);
  const prevMo = shiftMonth(p.all ? monthOf(c.today) : p.key, -1);
  const prev = p.all ? `${MON[+DATA_START.slice(5, 7) - 1]} to now` : prevMo >= DATA_START ? `${MON[+prevMo.slice(5, 7) - 1]} total ${fmt(mc(prevMo))}` : "First month";
  const todays = c.pickups.filter((x) => !x.deleted && x.d === c.today);
  const od = c.venues.map((v) => c.pay(v)).filter((s) => s.st === "overdue");
  const mvBins = c.sug.pulls.reduce((a, x) => a + x.n, 0), mvOpen = c.moves.filter((t) => t.status === "planned").length;
  const di = (new Date(c.today + "T00:00:00").getDay() + 6) % 7, wk = weekOf(c.today), route = di < 6 && c.plan ? c.plan.weeks[wk][di] : null;
  const tripCost = c.trips.filter((t) => !t.deleted && inP(t.d, p)).reduce((a, t) => a + Number(t.fuel_cost) + Number(t.other_cost), 0);
  const go = (href: string) => () => router.push(href);
  const row = (key: string, n: number, cls: string, t: string, d: string, onClick: () => void) => n ? <button key={key} className="arow" onClick={onClick}>
    <span className={"big " + cls}>{n}</span><span><span className="t">{t}</span><br /><span className="d">{d}</span></span><span className="go">{I.chev}</span></button> : null;
  const attention = [
    row("pay", od.length, "neg", "Venue payouts not paid on time", `${rs(od.reduce((a, s) => a + s.owed, 0))} not paid on the spot`, go("/admin/payouts")),
    row("mv", c.sug.pulls.length + c.sug.give.length, "", "Bin moves to plan", `${mvBins} bin${mvBins === 1 ? "" : "s"} to take back · ${c.sug.give.length} venue${c.sug.give.length === 1 ? "" : "s"} to give one`, go("/admin/moves")),
    row("mvo", mvOpen, "", "Bin moves planned", "Ticked off on the route checklist", go("/admin/moves")),
    row("quiet", cnt("quiet"), "neg", "Gone quiet", "Gave cans before, nothing this month. Call them.", go("/admin/venues?f=quiet")),
    row("watch", cnt("watch"), "", "Low this month", `Under ${c.set.pull} cans per bin. A second low month flags a take-back.`, go("/admin/venues?f=watch")),
    row("loc", Number(c.badges["/admin/locations"] || 0), "", "Locations to check", "So routes use the right roads", go("/admin/locations")),
  ].filter(Boolean);

  const days: Bar[] = useMemo(() => {
    const out: Bar[] = [];
    for (let d = p.start; d <= p.end; d = addDays(d, 1)) {
      const i = +d.slice(8);
      out.push({ k: d, v: T.ps.filter((x) => x.d === d).reduce((a, x) => a + x.cans, 0), lab: p.all ? (i === 1 || i === 15 ? `${i} ${MON[+d.slice(5, 7) - 1]}` : "") : i === 1 || i % 5 === 0 ? String(i) : "" });
    }
    return out;
  }, [T.ps, p]);
  const topDay = Math.max(...days.map((d) => d.v));
  const wd: Bar[] = useMemo(() => {
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], all = c.pickups.filter((x) => !x.deleted && x.cans > 0);
    return names.map((n) => { const x = all.filter((q) => names[(new Date(q.d + "T00:00:00").getDay() + 6) % 7] === n); return { k: n, lab: n, v: x.length ? x.reduce((a, q) => a + q.cans, 0) / x.length : 0 }; });
  }, [c.pickups]);
  const best = Math.max(...wd.map((d) => d.v));

  return (<>
    <RunBar />
    <div className="sec-h"><h2>Today</h2><span>{dayName(c.today)} {dnice(c.today)} · {todays.length} pickup{todays.length === 1 ? "" : "s"} logged so far</span></div>
    <section className="grid2">
      <div className="card"><div className="card-h"><h2>Today&apos;s route</h2>{route && route.stops.length > 0 && <span className="hint">{route.label} · {route.stops.length} stops · ~{fmt(route.load)} cans · back by {route.end}</span>}</div>
        {route && route.stops.length ? <>
          <div className="due">{route.stops.slice(0, 5).map((s, k) => <div key={k} className="due-row"><div><div className="t">{k + 1}. {s.v.name}</div><div className="d">{s.eta}{s.exp ? ` · ~${fmt(s.exp)} cans` : ""}{s.extra ? " · extra visit" : ""}</div></div>
            <button className="btn btn-g btn-sm" onClick={() => openLogPickup(c, s.v.id)}>Log</button></div>)}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {c.run ? <Link className="btn btn-p" href="/admin/run">Continue route</Link>
              : <button className="btn btn-p" onClick={async () => { if (await startRun(c, di, wk)) router.push("/admin/run"); }}>Start today&apos;s route</button>}
            <Link className="btn btn-g" href="/admin/routes">See full route{route.stops.length > 5 ? ` (${route.stops.length - 5} more)` : ""}</Link>
          </div></>
          : di === 6 ? <Empty title="No route today" text="Sunday is off. The next route is on Monday."><Link className="btn btn-g btn-sm" href="/admin/routes">Open route planner</Link></Empty>
          : c.plan ? <Empty title="No stops planned today" text="Nothing is planned for today."><Link className="btn btn-g btn-sm" href="/admin/routes">Open route planner</Link></Empty>
          : <Empty title="Routes need road data" text="Load road data once from Venue locations."><Link className="btn btn-g btn-sm" href="/admin/locations">Open Venue locations</Link></Empty>}
        {todays.length > 0 && <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>{fmt(todays.reduce((a, x) => a + x.cans, 0))} cans logged today. <Link className="linkb" href="/admin/pickups">See them</Link></p>}
      </div>
      <div className="card"><div className="card-h"><h2>Needs attention</h2></div>
        <div className="alist">{attention.length ? attention : <div className="all-clear">{I.ok}All clear. Nothing needs you right now.</div>}</div></div>
    </section>
    <div className="sec-h"><h2>{p.label}</h2><span>{p.end >= c.today ? (p.all ? "All months together, up to " : "Up to ") + dnice(c.today) : "Full month"}</span></div>
    <section className="kpis">
      <div className="kpi"><div className="l">Cans collected</div><div className="v">{fmt(T.cans)}</div><div className="s">{prev} · plus {kg(T.pl)} kg plastic</div></div>
      <div className="kpi"><div className="l">Pickups</div><div className="v">{T.n}</div><div className="s">{T.n ? fmt(T.cans / T.n) : 0} cans per pickup</div></div>
      <div className="kpi"><div className="l">Paid to venues</div><div className="v">{rs(T.paid)}</div><div className="s">₹{c.set.canRate.toFixed(2)} per can + plastic per kg</div></div>
      <div className="kpi hero"><div className="l">Profit before salaries &amp; rent</div><div className="v">{rs(T.canValue + T.plValue - T.paid - tripCost)}</div><div className="s">Cans valued at ₹{c.set.ubcRate}/kg, minus payouts and trip costs</div></div>
    </section>
    <section className="grid2">
      <div className="card"><div className="card-h"><h2>Cans per day</h2><span className="hint">Tap a bar for the exact number</span></div>
        <BarChart data={days} label={(d) => `${dayName(d.k)} ${dnice(d.k)}`} hi={(d) => d.v === topDay && topDay > 0} /></div>
      <div className="card"><div className="card-h"><h2>Top venues</h2><span className="hint">Top 10 = {share}% of cans</span></div>
        {top.length ? top.slice(0, 8).map((x) => <button key={x.v.id} className="hbar" onClick={() => c.openDrawer(<VenueDrawer id={x.v.id} />)}>
          <span className="nm">{x.v.name}</span><span className="val">{fmt(x.s.cans)}</span><span className="track"><i style={{ width: `${(x.s.cans / top[0].s.cans) * 100}%` }} /></span></button>)
          : <Empty title="No cans yet" text="Pickups you log show up here." />}</div>
    </section>
    <details className="card fold"><summary><h2>Best pickup days</h2><span className="hint">Average cans per pickup by weekday, all months</span></summary>
      <div className="fold-b"><BarChart data={wd} h={160} label={(d) => d.k} unit="cans per pickup" hi={(d) => d.v === best} /><p className="muted" style={{ fontSize: 12.5 }}>Bins are fullest after the weekend.</p></div></details>
  </>);
}
