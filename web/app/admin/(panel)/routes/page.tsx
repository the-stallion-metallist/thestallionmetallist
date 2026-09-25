"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import VenueDrawer from "../VenueDrawer";
import { saveSettings, saveZones } from "../forms2";
import { startRun } from "../runlib";
import { RunBar, taskChips } from "../bits";
import { areaName, dnice, fmt } from "@/lib/admin/logic";
import { DAYS, ZC, ZT, type Day, type Plan, buildZones, fmtClock, hm, mapsLinks, pinOf, pinSig, planWeeks, ruleZone, zoneName } from "@/lib/admin/routes";
import { moveDate } from "@/lib/admin/moves";

export default function Routes() {
  const c = usePanel(); const router = useRouter();
  const W = planWeeks(c.today);
  const [week, setWeek] = useState<"A" | "B">(W.first);
  const [sel, setSel] = useState(() => { const i = (new Date(c.today + "T00:00:00").getDay() + 6) % 7; return i < 6 ? i : 0; });
  const [busy, setBusy] = useState(false);
  const P = c.plan;
  if (!c.matrix.pts.length || c.matrix.pts.length < 7) return <div className="card"><Empty title="Road data isn't loaded yet" text="Routes use real road times between the godown and each venue. Load them once from Venue locations.">
    <Link className="btn btn-p btn-sm" href="/admin/locations">Open Venue locations</Link></Empty></div>;
  if (!P || !c.zones) return <div className="card"><Empty title="Working out zones…" text="The first plan takes a few seconds." /></div>;
  const days = P.weeks[week], d = days[sel], M2 = P.meta, lim = c.set.routeHours * 60;
  const realPins = c.venues.filter((v) => v.status === "Active" && v.steel + v.plastic_bins > 0 && pinOf(v) && (v.pin_src === "google" || v.pin_src === "manual")).length;
  const cal = c.trips.filter((t) => !t.deleted && t.plan_min && (t.act_min ?? 0) >= 30);
  const save = M2.kmOld ? Math.round((1 - M2.kmSame / M2.kmOld) * 100) : 0;
  const movesOn = (vid: number, date: string) => c.moves.filter((t) => t.status === "planned" && t.venue_id === vid && moveDate(t, c.vmap.get(vid)!, P, c.today) === date);
  const setNum = async (k: "routeHours" | "stopMin" | "traffic" | "vehCap", raw: string) => {
    let v: number | null = raw === "" ? null : Number(raw);
    if (k === "routeHours" && !(v! > 0)) v = 4.5; if (k === "stopMin" && !(v! > 0)) v = 15;
    if (v === c.set[k]) return; if (await saveSettings(c, { [k]: v }, LAB[k], `${c.set[k] ?? "–"} → ${v ?? "–"}`)) c.toast("Route plan updated");
  };
  const inp = (k: "routeHours" | "stopMin" | "traffic" | "vehCap", l: string, u: string, step = 1) => <div className="rp-set" key={k}><label htmlFor={"rs_" + k}>{l}</label>
    <div className="inrow"><input id={"rs_" + k} className="inl" type="number" inputMode="decimal" step={step} min={0} defaultValue={c.set[k] ?? ""} placeholder="Add" onBlur={(e) => setNum(k, e.target.value)} /><span>{u}</span></div></div>;
  const rebuild = () => { setBusy(true); setTimeout(async () => { const t0 = Date.now(); const z = buildZones({ venues: c.venues, byV: c.byV, set: c.set, matrix: c.matrix, zones: null, areaRule: c.areaRule, today: c.today, waitingWithBin: new Set() });
    if (z && await saveZones(c, z, `Rebuilt ${P.meta.nodes} venues`)) c.toast(`Zones rebuilt in ${((Date.now() - t0) / 1000).toFixed(1)} s`); setBusy(false); }, 30); };
  const swap = async (z: number, day: number) => { const zones = { ...c.zones!, day: c.zones!.day.slice() }; const other = zones.day.indexOf(day); zones.day[other] = zones.day[z]; zones.day[z] = day;
    if (await saveZones(c, zones, `Zone ${z + 1} → ${DAYS[day]}`)) c.toast(`Zone ${z + 1} moved to ${DAYS[day]}${other !== z ? `, zone ${other + 1} took its old day` : ""}`); };
  const rz = ruleZone(c.zones, c), rule = c.areaRule;
  const ruleVenues = c.venues.filter((v) => rule && v.area === rule.area && v.status === "Active" && v.steel + v.plastic_bins > 0);

  return (<div style={{ display: "contents", opacity: busy ? 0.45 : 1 }}>
    <RunBar />
    <details className="card fold"><summary><h2>Route settings</h2><span className="hint">{c.set.routeHours} h routes · {c.set.stopMin} min a stop · +{c.set.traffic || 0}% traffic · leave {c.set.depart} · {c.set.vehCap ? fmt(c.set.vehCap) + " cans a load" : "no vehicle limit set"}</span></summary>
      <div className="fold-b"><div className="rp-top">
        {inp("routeHours", "Route length", "hours", 0.5)}{inp("stopMin", "Time per stop", "min")}{inp("traffic", "Traffic buffer", "%", 5)}
        <div className="rp-set"><label htmlFor="rs_depart">Leave godown</label><input id="rs_depart" className="inl" type="time" defaultValue={c.set.depart} style={{ width: 120, textAlign: "left" }}
          onBlur={async (e) => { const v = e.target.value || "11:00"; if (v !== c.set.depart && await saveSettings(c, { depart: v }, "Leave godown", `${c.set.depart} → ${v}`)) c.toast("Route plan updated"); }} /></div>
        {inp("vehCap", "Vehicle capacity", "cans")}
      </div>
      <p className="muted" style={{ fontSize: 12.5 }}>Driving times and km come from OpenRouteService road data. They assume empty roads, so the traffic buffer adds time on top.{cal.length ? ` Your last ${cal.length} route${cal.length > 1 ? "s" : ""} took ${Math.round((cal.reduce((a, t) => a + t.act_min! / t.plan_min!, 0) / cal.length) * 100 - 100)}% longer than planned.` : " After a few real routes this shows how far off the plan was."}</p></div></details>
    <section className="rp-ins">
      <div className="kpi"><div className="l">Road km per week</div><div className="v">{fmt(M2.kmWeek)}</div><div className="s">{save >= 0 ? <>Old fixed areas: {fmt(M2.kmOld)} km. Smart zones: {fmt(M2.kmSame)} km (−{save}%).</> : <>Old fixed areas: {fmt(M2.kmOld)} km{M2.oldOver ? <>, but {M2.oldOver} day{M2.oldOver > 1 ? "s" : ""} ran past {hm(lim)} (longest {hm(M2.oldLongest)})</> : ""}. Smart zones: {fmt(M2.kmSame)} km (+{-save}%){M2.oldOver ? " so every day fits" : ""}.</>}</div></div>
      <div className="kpi"><div className="l">Venues covered</div><div className="v">{M2.nodes}</div><div className="s">{M2.nodes - M2.biN} weekly · {M2.biN} every 2 weeks · {M2.extraN} extra visits</div></div>
      <div className="kpi"><div className="l">Longest day</div><div className="v">{hm(Math.max(...P.weeks.A.concat(P.weeks.B).map((x) => x.totalMin)))}</div><div className="s">Limit {hm(lim)}. {M2.overDays.length ? <span className="neg">{M2.overDays.length} day{M2.overDays.length > 1 ? "s" : ""} still over</span> : "Every day fits."}</div></div>
      <Link className="kpi kpi-link" href="/admin/locations"><div className="l">Real locations</div><div className="v">{realPins} <small>of {M2.nodes}</small></div><div className="s">The rest need checking. Fix them →</div></Link>
    </section>
    <div className="rp-bar2">
      <div className="seg" role="group" aria-label="Week">{(W.first === "A" ? (["A", "B"] as const) : (["B", "A"] as const)).map((w) => <button key={w} aria-pressed={week === w} onClick={() => setWeek(w)}>Week {w} · {dnice(W[w][0])}</button>)}</div>
      <span className="sp" /><button className="btn btn-g btn-sm" disabled={busy} onClick={rebuild}>{busy ? "Working out zones…" : "Rebuild zones"}</button>
    </div>
    <section className="rp-week">
      {days.map((x) => { const pct = Math.min((x.totalMin / lim) * 100, 100), mvN = x.stops.reduce((a, s) => a + movesOn(s.v.id, x.date).length, 0);
        return <button key={x.i} className={"rp-day" + (sel === x.i ? " on" : "")} aria-pressed={sel === x.i} onClick={() => setSel(x.i)}>
          <span className="rp-d">{x.d} <small>{dnice(x.date)}</small></span>
          <span className="rp-a"><i className="zdot" style={{ background: x.color }} />{x.label}</span>
          <span className="rp-n">{hm(x.totalMin)} <small>of {hm(lim)}</small></span>
          <span className={"rp-bar" + (x.over ? " over" : "")}><i style={{ width: `${pct}%` }} /></span>
          <span className="rp-m">{x.stops.length} stops · {Math.round(x.km)} km · ~{fmt(x.load)} cans{x.unloads ? ` · ${x.unloads} unload${x.unloads > 1 ? "s" : ""}` : ""}{mvN ? ` · ${mvN} bin move${mvN > 1 ? "s" : ""}` : ""}</span></button>; })}
    </section>
    <section className="rp-detail">
      <div className="card"><div className="card-h"><h2>{d.d} {dnice(d.date)}</h2><span className="hint">Week {week}</span></div>
        <RouteMap plan={P} week={week} sel={sel} god={c.god} />
        <div className="legend" style={{ marginTop: 8 }}>{days.map((x) => <span key={x.i}><i style={{ background: x.color, width: 10, height: 10, borderRadius: "50%" }} />{x.d} · {x.label.split(" · ")[0]}</span>)}<span><i style={{ background: "var(--copper)", width: 10, height: 10 }} />Godown</span></div>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Lines join the stops in order. Google Maps shows the road route.</p></div>
      <div className="card"><div className="card-h"><h2>Route</h2><span className="hint">{d.stops.length} stops{d.unloads ? ` · ${d.unloads} unload${d.unloads > 1 ? "s" : ""}` : ""} · {Math.round(d.km)} km · {hm(d.driveMin)} driving + {hm(d.stopMin)} at stops</span></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {d.stops.length > 0 && <button className="btn btn-p btn-sm" onClick={async () => { if (await startRun(c, sel, week)) router.push("/admin/run"); }}>Start this route</button>}
          {mapsLinks(d.stops, c.god).map((u, i, a) => <a key={i} className="btn btn-g btn-sm" href={u} target="_blank" rel="noopener">Google Maps{a.length > 1 ? ` part ${i + 1}` : ""}</a>)}
        </div>
        {d.over && <div className="note-bar" style={{ marginBottom: 10 }}>This day is {Math.round(d.overBy)} min over even after moving low-can venues to every 2 weeks. Raise the route length, or rebuild zones.</div>}
        {d.stops.length ? <ol className="route">
          <li className="rt-end"><span className="rt-dot" /><div className="rt-main"><b>Godown, Turner Road</b><div className="d">Leave {fmtClock((() => { const [h, m] = String(c.set.depart).split(":").map(Number); return (h * 60 + m) * 60; })())}</div></div></li>
          {d.stops.map((s, k) => [
            s.unload && <li key={"u" + k} className="rt-end"><span className="rt-dot" /><div className="rt-main"><b>Unload at godown</b><div className="d">{s.unload.eta} · vehicle full with ~{fmt(s.unload.cans)} cans</div></div></li>,
            <li key={k}><span className="rt-dot" style={{ background: d.color, color: ZT[d.zone % 6] }}>{k + 1}</span><div className="rt-main">
              <button className="rt-name" onClick={() => c.openDrawer(<VenueDrawer id={s.v.id} />)}>{s.v.name}</button>
              <div className="d">{s.eta} · {s.legKm.toFixed(1)} km, {Math.round(s.legMin)} min drive{s.real ? "" : " (estimate)"}{s.v.pin_src === "googleCheck" ? " · check pin" : ""}</div>
              <div className="d">{s.extra && <span className="chip c-new">Extra visit</span>} {s.bi && <span className="chip c-idle">Every 2 weeks</span>} ~{fmt(s.exp)} cans</div>
              {taskChips(movesOn(s.v.id, d.date))}</div></li>,
          ])}
          <li className="rt-end"><span className="rt-dot" /><div className="rt-main"><b>Back at godown</b><div className="d">{d.end} · {d.backKm.toFixed(1)} km, {Math.round(d.backMin)} min</div></div></li>
        </ol> : <p className="muted">No stops this day.</p>}
      </div>
    </section>
    <details className="card fold"><summary><h2>Zones and every-2-weeks venues</h2><span className="hint">6 zones built {dnice(c.zones.built)} · {M2.biN} venues every 2 weeks</span></summary>
      <div className="fold-b"><div className="grid2 flat">
        <div><div className="card-h"><h3>Zones</h3><span className="hint">Built from road times. Venues keep their day.</span></div>
          <div className="kv">{[0, 1, 2, 3, 4, 5].map((z) => { const vs = c.venues.filter((v) => c.zones!.of[v.id] === z); const nm = zoneName(z, c.zones, c.venues, areaName);
            return <div key={z}><span><i className="zdot" style={{ background: ZC[z] }} />Zone {z + 1}{nm ? " · " + nm : ""}<br /><small className="muted">{vs.length} venues{rz === z && rule ? ` · ${ruleVenues.filter((v) => c.zones!.of[v.id] === z).length} of ${ruleVenues.length} ${areaName(rule.area)} venues` : ""}</small>
              {rz === z && rule && <> <span className="chip c-new">Kept on {DAYS[rule.day]} for {areaName(rule.area)}</span></>}</span>
              <b><select className="inl" style={{ width: 90, textAlign: "left" }} value={c.zones!.day[z]} onChange={(e) => swap(z, +e.target.value)} aria-label={`Day for zone ${z + 1}`}>{DAYS.map((dd, i) => <option key={i} value={i}>{dd}</option>)}</select></b></div>; })}</div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>The zone with the most Rajpur Road venues (by each venue&apos;s Area) always goes on Monday, including after Rebuild zones.</p></div>
        <div><div className="card-h"><h3>Every 2 weeks</h3><span className="hint">{M2.biN} venues give few cans for the time they take</span></div>
          {M2.bi.length ? <div className="kv">{M2.bi.sort((a, b) => a.week - b.week).map((x) => <div key={x.v.id}><span>{x.v.name}<br /><small className="muted">~{fmt(x.week)} cans a week</small></span><b>Week {x.w}</b></div>)}</div>
            : <p className="muted">Every venue fits in weekly. Nobody moved to every 2 weeks.</p>}
          <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Only venues whose bins can hold 2 weeks of cans can move. Busy venues are never skipped.</p></div>
      </div>{c.zones.sig !== pinSig(c.venues) && <div className="note-bar">Venue locations changed since the zones were built. Rebuild zones to use them.</div>}</div></details>
  </div>);
}
const LAB = { routeHours: "Route length", stopMin: "Time per stop", traffic: "Traffic buffer", vehCap: "Vehicle capacity" };

function RouteMap({ plan, week, sel, god }: { plan: Plan; week: "A" | "B"; sel: number; god: [number, number] }) {
  const all: { s: Day["stops"][number]; d: Day }[] = []; for (const d of plan.weeks[week]) for (const s of d.stops) all.push({ s, d });
  const pts = [god, ...all.map((x) => x.s.pin)];
  const lat0 = pts.reduce((a, p) => a + p[0], 0) / pts.length, cx = Math.cos((lat0 * Math.PI) / 180);
  const xs = pts.map((p) => p[1] * cx), ys = pts.map((p) => -p[0]); const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 600, H = 420, pad = 24, sc = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY - minY || 1));
  const X = (p: [number, number]) => pad + (p[1] * cx - minX) * sc + (W - 2 * pad - (maxX - minX) * sc) / 2, Y = (p: [number, number]) => pad + (-p[0] - minY) * sc + (H - 2 * pad - (maxY - minY) * sc) / 2;
  const d = plan.weeks[week][sel]; const route = [god, ...d.stops.flatMap((s) => (s.unload ? [god, s.pin] : [s.pin])), god];
  return (
    <svg className="rmap" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Map of ${d.d} route with ${d.stops.length} stops`}>
      {all.filter((x) => x.d.i !== sel).map((x, i) => <circle key={i} cx={X(x.s.pin)} cy={Y(x.s.pin)} r={4} fill={x.d.color} opacity={0.45}><title>{`${x.s.v.name} · ${x.d.d}`}</title></circle>)}
      <polyline points={route.map((p) => X(p).toFixed(1) + "," + Y(p).toFixed(1)).join(" ")} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {d.stops.map((s, k) => <g key={k}><circle cx={X(s.pin)} cy={Y(s.pin)} r={10} fill={d.color} stroke="var(--card)" strokeWidth={2}><title>{`${k + 1}. ${s.v.name} · ${s.eta}`}</title></circle>
        <text x={X(s.pin)} y={Y(s.pin) + 3.8} textAnchor="middle" className="mnum" fill={ZT[d.zone % 6]}>{k + 1}</text></g>)}
      <rect x={X(god) - 8} y={Y(god) - 8} width={16} height={16} rx={3} fill="var(--copper)" stroke="var(--card)" strokeWidth={2}><title>Godown, Turner Road</title></rect>
    </svg>
  );
}
