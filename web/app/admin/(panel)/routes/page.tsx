"use client";
// Areas: a street map of every venue coloured by this week (Mon–Sun), the area to go to next, and each area's venues.
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePanel } from "../Panel";
import VenueDrawer from "../VenueDrawer";
import { openLogPickup } from "../forms";
import { PhHead, PhRow } from "../bits";
import { I } from "../icons";
import { DOT, STATE_TXT } from "../AreaMap";
import { type AreaRow, type VRow, areaBoard, dueAt, nearbyAreas } from "@/lib/admin/areas";
import { binsTxt } from "@/lib/admin/moves";
import { dnice, fmt } from "@/lib/admin/logic";

const AreaMap = dynamic(() => import("../AreaMap"), { ssr: false, loading: () => <div className="ar-map ar-wait">Loading the map…</div> });
type Ctx = ReturnType<typeof usePanel>;
const useBoard = (c: Ctx) => useMemo(() => areaBoard(c.venues, c.byV, c.set, c.today), [c.venues, c.byV, c.set, c.today]);
const plural = (n: number, w: string) => `${fmt(n)} ${w}${n === 1 ? "" : "s"}`;
const wk = (b: ReturnType<typeof areaBoard>) => `${+b.week.from.slice(8)}${b.week.from.slice(5, 7) === b.week.to.slice(5, 7) ? "" : " " + dnice(b.week.from).split(" ")[1]}–${dnice(b.week.to)}`;
const areaSub = (a: AreaRow) => [a.due ? `${a.due} due` : "Nothing due", a.full ? `${a.full} with full bins` : "", `${a.done} of ${a.rows.length} collected this week`].filter(Boolean).join(" · ");

export default function Areas() {
  const c = usePanel(); const B = useBoard(c);
  const [sel, setSel] = useState<string | null>(null);
  const open = (id: string | null) => { setSel(id ?? ""); c.openDrawer(<AreaSheet key={id ?? "none"} id={id} onSwitch={open} />); };
  useEffect(() => { // ?area=rajpur (from Home and Bin moves) opens that area
    const id = new URLSearchParams(location.search).get("area");
    if (id && B.areas.some((a) => a.id === id)) open(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const done = B.rows.filter((r) => r.st === "done").length, noPin = B.rows.filter((r) => !r.pin);
  const map = <AreaMap rows={B.rows} sel={sel || null} god={c.god} onVenue={(id) => c.openDrawer(<VenueDrawer id={id} />)} />;
  const key = <div className="ar-key" aria-label="What the colours mean">
    {(["done", "due", "full", "low"] as const).map((s) => <span key={s}><i style={{ background: DOT[s] }} />{s === "due" ? `Due (${dueAt(c.set)}+ cans)` : s === "low" ? "Few cans or no pickup yet" : STATE_TXT[s]}</span>)}
    {sel ? <button type="button" className="linkb" onClick={() => setSel(null)}>Show all areas</button> : null}</div>;
  const next = B.next && <div className="ph-today ar-next">
    <div><div className="k">Go next</div><div className="z">{B.next.name}</div></div>
    <div className="ph-facts"><span><b>~{fmt(B.next.cans)}</b>cans waiting</span><span><b>{B.next.due}</b>venues due</span><span><b>{B.next.full}</b>with full bins</span></div>
    <button type="button" className="ph-btn p" onClick={() => open(B.next!.id)}>{I.map}See the venues</button></div>;
  const list = <div className="ph-list">{B.areas.map((a) => <PhRow key={a.id ?? "none"} lead={a.due || I.tick} tone={a.full ? "bad" : a.due ? "warn" : "good"} title={a.name} sub={areaSub(a)}
    right={<span className="ph-cans"><b>~{fmt(a.cans)}</b><span>cans</span></span>} onClick={() => open(a.id)} />)}</div>;
  const pinless = noPin.length > 0 && <div className="card ar-nopin"><div className="card-h"><h2>No map location yet</h2><span className="hint">{plural(noPin.length, "venue")} with bins. Counted in their area, not on the map.</span><span className="sp" /><Link className="btn btn-g btn-sm" href="/admin/locations">Add locations</Link></div>
    <div className="ph-list flat">{noPin.map((r) => <PhRow key={r.v.id} tone={r.st === "full" ? "bad" : r.st === "due" ? "warn" : r.st === "done" ? "good" : "idle"} lead={<i className="ar-dot" style={{ background: DOT[r.st] }} />} title={r.v.name}
      sub={`${STATE_TXT[r.st]}${r.st !== "done" && r.cans ? ` · ~${fmt(r.cans)} cans` : ""}`} onClick={() => c.openDrawer(<VenueDrawer id={r.v.id} />)} />)}</div></div>;

  if (c.phone) return (<div className="ph">
    <PhHead title="Areas" sub={`This week, ${wk(B)} · ${done} of ${B.rows.length} venues collected`} />
    {map}{key}
    {next}
    <h2 className="ph-sec">All areas</h2>{list}
    {pinless}
  </div>);

  return (<>
    <section className="ar-grid">
      <div className="card ar-mapcard"><div className="card-h"><h2>This week, {wk(B)}</h2><span className="hint">{done} of {B.rows.length} venues collected · tap a dot to open the venue</span></div>{map}{key}</div>
      <div className="ar-side">
        {next}
        <div className="card"><div className="card-h"><h2>All areas</h2><span className="hint">Most cans waiting first</span></div>{list}</div>
      </div>
    </section>
    {pinless}
  </>);
}

// One area: its venues (most cans first), tick the ones to visit, totals for the ticked ones, and nearby areas with cans waiting.
function AreaSheet({ id, onSwitch }: { id: string | null; onSwitch: (id: string | null) => void }) {
  const c = usePanel(); const B = useBoard(c);
  const a = B.areas.find((x) => x.id === id);
  const todo = a ? a.rows.filter((r) => r.st !== "done") : [], doneRows = a ? a.rows.filter((r) => r.st === "done") : [];
  const [ticked, setTicked] = useState<Set<number>>(() => new Set(todo.filter((r) => !r.onCall && (r.st === "due" || r.st === "full")).map((r) => r.v.id)));
  if (!a) return <><div className="dr-h"><h2>Area</h2><button className="x" onClick={c.closeLayers} aria-label="Close">{I.x}</button></div><div className="dr-b"><p className="muted">No venues with bins in this area.</p></div></>;
  const t = todo.filter((r) => ticked.has(r.v.id)), tCans = t.reduce((s, r) => s + r.cans, 0), tFull = t.filter((r) => r.st === "full").length;
  const moves = (vid: number) => c.moves.filter((m) => m.status === "planned" && m.venue_id === vid).map((m) => (m.kind === "pull" ? `Take back ${binsTxt(m.steel, m.plastic)}` : `Place ${m.n} bin${m.n === 1 ? "" : "s"}`));
  const near = nearbyAreas(a, B.areas).slice(0, 2);
  const flip = (vid: number) => setTicked((s) => { const n = new Set(s); if (n.has(vid)) n.delete(vid); else n.add(vid); return n; });
  const vrow = (r: VRow, tick: boolean) => {
    const tags = [r.v.visit === "fortnight" ? "Every 2 weeks" : "", r.onCall ? "On request" : "", !r.pin ? "No map location" : "", ...moves(r.v.id)].filter(Boolean);
    const when = r.last ? `Last collected ${dnice(r.last)}${r.ago ? `, ${plural(r.ago, "day")} ago` : ", today"}` : "No pickup yet";
    return <div key={r.v.id} className={"ar-v" + (tick && ticked.has(r.v.id) ? " on" : "")}>
      {tick ? <input type="checkbox" aria-label={`Visit ${r.v.name}`} checked={ticked.has(r.v.id)} onChange={() => flip(r.v.id)} /> : <i className="ar-dot" style={{ background: DOT[r.st] }} />}
      <div className="ar-vm"><button type="button" className="linkb ar-vn" onClick={() => c.openDrawer(<VenueDrawer id={r.v.id} />)}>{r.v.name}</button>
        <div className="d"><i className="ar-dot sm" style={{ background: DOT[r.st] }} />{r.st === "done" ? `Collected ${dnice(r.last!)}` : `${STATE_TXT[r.st]} · ${when}`}</div>
        {tags.length > 0 && <div className="ar-tags">{tags.map((x) => <span key={x} className={"chip " + (/^(Take back|Place)/.test(x) ? "c-new" : "c-idle")}>{x}</span>)}</div>}</div>
      <div className="ar-vr">{r.st !== "done" && r.cans > 0 && <b>~{fmt(r.cans)}</b>}
        <div className="ar-act">{r.v.phone && <a className="btn btn-g btn-sm" href={`tel:${r.v.phone}`}>Call</a>}<button type="button" className="btn btn-g btn-sm" onClick={() => openLogPickup(c, r.v.id)}>Log pickup</button></div></div>
    </div>;
  };
  return (<>
    <div className="dr-h"><div><h2>{a.name}</h2><div className="ph-sub" style={{ display: "block" }}>~{fmt(a.cans)} cans waiting · {areaSub(a)}</div></div>
      <button className="x" onClick={c.closeLayers} aria-label="Close">{I.x}</button></div>
    <div className="dr-b">
      <div className="ar-tot" aria-live="polite"><b>{plural(t.length, "venue")} ticked</b><span>~{fmt(tCans)} cans{tFull ? ` · ${tFull} with full bins` : ""}</span></div>
      {todo.length ? <div className="ar-list">{todo.map((r) => vrow(r, true))}</div> : <p className="muted">Every venue here was collected this week.</p>}
      {doneRows.length > 0 && <><h3 className="ar-h">Collected this week</h3><div className="ar-list">{doneRows.map((r) => vrow(r, false))}</div></>}
      {near.length > 0 && <><h3 className="ar-h">Nearby areas with cans waiting</h3>
        <div className="ar-near"><div className="ph-list flat">{near.map(({ a: x, km }) => <PhRow key={x.id} lead={x.due} tone={x.full ? "bad" : "warn"} title={x.name} sub={`About ${km < 10 ? km.toFixed(1) : Math.round(km)} km away · ${x.due} due · ~${fmt(x.cans)} cans`} onClick={() => onSwitch(x.id)} />)}</div></div></>}
    </div>
  </>);
}
