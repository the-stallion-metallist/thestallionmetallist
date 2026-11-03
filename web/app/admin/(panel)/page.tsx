"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePanel } from "./Panel";
import { I, Empty } from "./icons";
import BarChart, { type Bar } from "./BarChart";
import VenueDrawer from "./VenueDrawer";
import { openLogPickup } from "./forms";
import { BreakEven, MonthSeg, PhFold, PhHead, PhRow } from "./bits";
import { MON, MONL, addDays, collectionDays, dayName, dieselOf, dnice, fmt, kg, monthOf, rs, saleTransport, shiftMonth, totals, DATA_START } from "@/lib/admin/logic";
import { areaBoard } from "@/lib/admin/areas";

export default function Overview() {
  const c = usePanel(); const router = useRouter(); const p = c.per;
  const T = useMemo(() => totals(p, c.pickups, c.vmap, c.vset), [p, c.pickups, c.vmap, c.vset]);
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
  // the area to go to next (most cans waiting among areas with venues due), from the Areas map
  const board = useMemo(() => areaBoard(c.venues, c.byV, c.set, c.today), [c.venues, c.byV, c.set, c.today]), nx = board.next;
  const nxHref = nx ? `/admin/routes?area=${nx.id}` : "/admin/routes", nxTop = nx ? nx.rows.filter((r) => r.st === "due" || r.st === "full").slice(0, 5) : [];
  const tripCost = dieselOf(collectionDays(c.pickups, c.trips, c.set, p)) + saleTransport(c.sales, p); // diesel plus what it cost to ship sales
  const go = (href: string) => () => router.push(href);
  const row = (key: string, n: number, cls: string, t: string, d: string, onClick: () => void) => n ? <button key={key} className="arow" onClick={onClick}>
    <span className={"big " + cls}>{n}</span><span><span className="t">{t}</span><br /><span className="d">{d}</span></span><span className="go">{I.chev}</span></button> : null;
  const attention = [
    row("pay", od.length, "neg", "Venue payouts not paid on time", `${rs(od.reduce((a, s) => a + s.owed, 0))} not paid on the spot`, go("/admin/payouts")),
    row("mv", c.sug.pulls.length + c.sug.give.length, "", "Bin moves to plan", `${mvBins} bin${mvBins === 1 ? "" : "s"} to take back · ${c.sug.give.length} venue${c.sug.give.length === 1 ? "" : "s"} to give one`, go("/admin/moves")),
    row("mvo", mvOpen, "", "Bin moves planned", "Done on the next visit to each venue", go("/admin/moves")),
    row("quiet", cnt("quiet"), "neg", "Gone quiet", "Gave cans before, nothing this month. Call them.", go("/admin/venues?f=quiet")),
    row("watch", cnt("watch"), "", "Low this month", `Under ${c.set.pull} cans per bin. A second low month flags a take-back.`, go("/admin/venues?f=watch")),
    row("loc", Number(c.badges["/admin/locations"] || 0), "", "Locations to check", "So every venue shows on the Areas map", go("/admin/locations")),
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

  if (c.phone) { // phone: this month's numbers first, then today's route and a short to-do list; charts fold away
    const prevCans = !p.all && prevMo >= DATA_START ? mc(prevMo) : null, prevName = MONL[+prevMo.slice(5, 7) - 1];
    const vsPrev = prevCans == null ? (p.all ? "All months together" : "First month") : prevCans && (p.end < c.today || T.cans >= prevCans)
      ? <><b className={T.cans >= prevCans ? "up" : "down"}>{T.cans >= prevCans ? "+" : "−"}{Math.abs(Math.round((T.cans / prevCans - 1) * 100))}%</b> on {prevName}</> : <>{prevName}: {fmt(prevCans)}</>;
    const todo = [
      { n: od.length, tone: "bad", t: "Pay venues", d: `${rs(od.reduce((a, s) => a + s.owed, 0))} not paid on the spot`, href: "/admin/payouts" },
      { n: cnt("pull"), tone: "bad", t: "Take bins back", d: "Low 2 months in a row", href: "/admin/venues?f=pull" },
      { n: cnt("add"), tone: "good", t: "Add a bin", d: "Bins filling up fast", href: "/admin/venues?f=add" },
      { n: cnt("quiet") + cnt("nobin"), tone: "warn", t: "Call or check", d: "Gone quiet, or bins not counted", href: "/admin/venues?f=act" },
      { n: mvOpen, tone: "idle", t: "Bin moves planned", d: "Done on the next visit", href: "/admin/moves" },
      { n: Number(c.badges["/admin/locations"] || 0), tone: "idle", t: "Check map locations", d: "Needed for the Areas map", href: "/admin/locations" },
    ].filter((x) => x.n > 0);
    return (<div className="ph">
      <PhHead title={p.all ? "All months" : MONL[+p.key.slice(5, 7) - 1]} sub={p.end >= c.today ? `Up to ${dnice(c.today)}` : "Full month"} right={<MonthSeg />} />
      <div className="ph-nums">
        <Link className="ph-nb dark" href="/admin/venues"><span className="l">Cans collected</span><span className="v">{fmt(T.cans)}</span><span className="s">{vsPrev}</span></Link>
        <Link className="ph-nb" href="/admin/pickups"><span className="l">Pickups</span><span className="v">{fmt(T.n)}</span><span className="s">{T.n ? fmt(T.cans / T.n) : 0} cans each</span></Link>
        <Link className="ph-nb" href="/admin/money"><span className="l">Paid to venues</span><span className="v">{rs(T.paid)}</span><span className="s">{T.pl ? `Cans + ${fmt(T.pl)} kg plastic` : "Paid on the spot"}</span></Link>
        <Link className="ph-nb" href="/admin/money"><span className="l">Cans and plastic are worth</span><span className="v">{rs(T.canValue + T.plValue)}</span><span className="s">Cans ₹{c.vset.ubcRate}/kg{c.vset.plasticSale ? ` · plastic ₹${c.vset.plasticSale}/kg` : ""}</span></Link>
      </div>
      <BreakEven />
      <div className="ph-today">
        {nx ? <>
          <div><div className="k">Go next</div><div className="z">{nx.name}</div></div>
          <div className="ph-facts"><span><b>~{fmt(nx.cans)}</b>cans waiting</span><span><b>{nx.due}</b>venues due</span><span><b>{nx.full}</b>with full bins</span></div>
          <Link className="ph-btn p" href={nxHref}>{I.map}See the venues</Link>
        </> : <>
          <div><div className="k">This week</div><div className="z">Nothing due right now</div></div>
          <Link className="ph-btn dim" href="/admin/routes">Open Areas</Link>
        </>}
        {todays.length > 0 && <div className="k">{todays.length} pickup{todays.length === 1 ? "" : "s"} logged today · {fmt(todays.reduce((a, x) => a + x.cans, 0))} cans</div>}
      </div>
      {todo.length ? <><h2 className="ph-sec">To do</h2><div className="ph-list">{todo.map((x) => <PhRow key={x.t} lead={x.n} tone={x.tone} title={x.t} sub={x.d} href={x.href} />)}</div></>
        : <div className="ph-list"><PhRow lead={I.tick} tone="good" title="All clear" sub="Nothing needs you right now" href="/admin/venues" /></div>}
      <PhFold title="Cans per day" sub={topDay ? `Best day ${fmt(topDay)} cans` : "No pickups yet"}><BarChart data={days} label={(d) => `${dayName(d.k)} ${dnice(d.k)}`} hi={(d) => d.v === topDay && topDay > 0} /></PhFold>
      <PhFold title="Top venues" sub={`Most cans · ${p.label}`}>{top.length ? <div className="ph-list flat">{top.slice(0, 5).map((x, i) => <PhRow key={x.v.id} lead={i + 1} title={x.v.name} sub={`${fmt(x.s.cans)} cans`} onClick={() => c.openDrawer(<VenueDrawer id={x.v.id} />)} />)}</div>
        : <p className="muted">Pickups you log show up here.</p>}</PhFold>
    </div>);
  }

  return (<>
    <div className="sec-h"><h2>Today</h2><span>{dayName(c.today)} {dnice(c.today)} · {todays.length} pickup{todays.length === 1 ? "" : "s"} logged so far</span></div>
    <section className="grid2">
      <div className="card"><div className="card-h"><h2>Go next</h2>{nx && <span className="hint">{nx.name} · ~{fmt(nx.cans)} cans waiting · {nx.due} venues due{nx.full ? ` · ${nx.full} with full bins` : ""}</span>}</div>
        {nx ? <>
          <div className="due">{nxTop.map((r) => <div key={r.v.id} className="due-row"><div><div className="t">{r.v.name}</div><div className="d">{r.st === "full" ? "Bins likely full" : "Due"} · ~{fmt(r.cans)} cans{r.last ? ` · last collected ${dnice(r.last)}` : ""}</div></div>
            <button className="btn btn-g btn-sm" onClick={() => openLogPickup(c, r.v.id)}>Log</button></div>)}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <Link className="btn btn-p" href={nxHref}>See {nx.name}{nx.rows.length > nxTop.length ? ` (${nx.rows.length} venues)` : ""}</Link>
            <Link className="btn btn-g" href="/admin/routes">Open the Areas map</Link>
          </div></>
          : <Empty title="Nothing due right now" text="No area has venues with cans waiting. The Areas map shows what was collected this week."><Link className="btn btn-g btn-sm" href="/admin/routes">Open the Areas map</Link></Empty>}
        {todays.length > 0 && <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>{fmt(todays.reduce((a, x) => a + x.cans, 0))} cans logged today. <Link className="linkb" href="/admin/pickups">See them</Link></p>}
      </div>
      <div className="card"><div className="card-h"><h2>Needs attention</h2></div>
        <div className="alist">{attention.length ? attention : <div className="all-clear">{I.ok}All clear. Nothing needs you right now.</div>}</div></div>
    </section>
    <BreakEven />
    <div className="sec-h"><h2>{p.label}</h2><span>{p.end >= c.today ? (p.all ? "All months together, up to " : "Up to ") + dnice(c.today) : "Full month"}</span></div>
    <section className="kpis">
      <div className="kpi"><div className="l">Cans collected</div><div className="v">{fmt(T.cans)}</div><div className="s">{prev} · plus {kg(T.pl)} kg plastic</div></div>
      <div className="kpi"><div className="l">Pickups</div><div className="v">{T.n}</div><div className="s">{T.n ? fmt(T.cans / T.n) : 0} cans per pickup</div></div>
      <div className="kpi"><div className="l">Paid to venues</div><div className="v">{rs(T.paid)}</div><div className="s">₹{c.set.canRate.toFixed(2)} per can + plastic per kg</div></div>
      <div className="kpi hero"><div className="l">Profit before salaries &amp; rent</div><div className="v">{rs(T.canValue + T.plValue - T.paid - tripCost)}</div><div className="s">Cans at ₹{c.vset.ubcRate}/kg and plastic at ₹{c.vset.plasticSale ?? 0}/kg (last sales), minus payouts, diesel and sale transport</div></div>
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
