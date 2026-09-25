"use client";
import { useState } from "react";
import Link from "next/link";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import { refreshRoads } from "../../actions";
import { type Venue, areaName, dnice, parsePin } from "@/lib/admin/logic";
import { pinOf, pinSig } from "@/lib/admin/routes";

type St = "done" | "found" | "check" | "need";
const stOf = (v: Venue): St => (v.pin_src === "manual" ? "done" : v.pin_src === "google" ? "found" : v.pin_src === "googleCheck" ? "check" : "need");

export default function Locations() {
  const c = usePanel(); const [f, setF] = useState<St | "all">("check"); const [q, setQ] = useState("");
  const [vals, setVals] = useState<Record<number, string>>({}); const [errs, setErrs] = useState<Record<number, string>>({}); const [busy, setBusy] = useState(false);
  const act = c.venues.filter((v) => v.status !== "Pulled" && (v.steel + v.plastic_bins > 0 || v.status === "Waiting"));
  const cnt = (k: St | "all") => (k === "all" ? act.length : act.filter((v) => stOf(v) === k).length);
  const list = act.filter((v) => f === "all" || stOf(v) === f).filter((v) => !q || v.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const done = act.length - cnt("need"), fixedToday = c.log.filter((x) => x.what === "Location" && x.at.slice(0, 10) === c.today).length;
  const known = new Set(c.matrix.pts.map((p) => p[0].toFixed(5) + "," + p[1].toFixed(5)));
  const newPins = act.filter((v) => pinOf(v) && !known.has(pinOf(v)!.map((x) => x.toFixed(5)).join(","))).length;

  async function setPin(v: Venue, p: [number, number] | null, src: string, how: string) {
    const { data, error } = await c.db.from("venues").update({ lat: p?.[0] ?? v.lat, lng: p?.[1] ?? v.lng, pin_src: src, pin_by: c.me.name }).eq("id", v.id).select().single();
    if (c.fail(error)) return;
    c.patch((d) => ({ ...d, venues: d.venues.map((x) => (x.id === v.id ? (data as Venue) : x)) }));
    await c.logIt(how, "Location", v.name, p ? `${v.lat ?? "–"}, ${v.lng ?? "–"} → ${p.join(", ")}` : `${v.lat}, ${v.lng}`, { table: "venues", id: v.id });
    c.toast(p ? `${v.name} saved. Refresh road data when you've added a batch.` : `${v.name} confirmed`);
  }
  async function roads() {
    setBusy(true); const r = await refreshRoads(); setBusy(false);
    if (r.err) { c.toast("Road data not updated: " + r.err); return; }
    await c.reload(); c.toast(`Road data updated for ${r.ok} venues`);
  }
  const fc = (k: St | "all", l: string) => <button key={k} className="fchip" aria-pressed={f === k} onClick={() => setF(k)}>{l} <b>{cnt(k)}</b></button>;

  return (
    <div className="card">
      <div className="card-h"><h2>{done} of {act.length} venues have a location</h2><span className="sp" />
        {c.zones && c.zones.sig !== pinSig(c.venues) && <Link className="btn btn-g btn-sm" href="/admin/routes">Rebuild zones with new locations</Link>}</div>
      <span className="rp-bar"><i style={{ width: `${(done / Math.max(act.length, 1)) * 100}%` }} /></span>
      <p className="loc-prog"><b>{fixedToday}</b> fixed today · <b>{cnt("need") + cnt("check")}</b> left to check or add</p>
      <div className="note-bar" style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: "var(--paper-2)", color: "var(--ink-soft)" }}>
        <span style={{ flex: "1 1 240px" }}>{c.matrix.fetched_at ? <>Road data from <b>{dnice(c.matrix.fetched_at.slice(0, 10))}</b> for {c.matrix.pts.length - 1} locations.{newPins ? ` ${newPins} location${newPins > 1 ? "s are" : " is"} newer; routes estimate those until you refresh.` : " Up to date."}</> : "Road data hasn't been loaded yet. Routes need it."}</span>
        <button className="btn btn-p btn-sm" disabled={busy} onClick={roads}>{busy ? "Getting road times…" : "Refresh road data"}</button>
      </div>
      <details className="inline-fold"><summary>How to add a location</summary>
        <ol className="how" style={{ marginTop: 0 }}><li>Tap <b>Find on Google Maps</b> next to a venue.</li><li>In Google Maps, press and hold on the venue&apos;s exact spot. The numbers (like 30.34412, 78.06205) appear at the top. Copy them.</li><li>Paste here and tap <b>Save</b>. A full Google Maps link works too.</li></ol>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Locations were first found by searching each venue on Google Maps: 49 clear matches, 33 to double-check, 10 not found. Road times come from OpenRouteService.</p></details>
      <div className="filters" style={{ margin: "12px 0 10px" }}>
        <input className="search" type="search" placeholder="Search venues" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search venues" />
        {fc("check", "Check the match")}{fc("need", "Needs location")}{fc("found", "Found on Google")}{fc("done", "Confirmed")}{fc("all", "All")}
      </div>
      {list.length ? list.map((v) => { const s = stOf(v), p = pinOf(v);
        return <div key={v.id} className="loc-row"><div className="lr-main"><b>{v.name}</b><div className="d">
          {s === "done" ? <><span className="chip c-add">Set by {v.pin_by || "team"}</span> {p?.join(", ")}</>
            : s === "found" ? <><span className="chip c-add">Found on Google</span> &quot;{v.g_name}&quot; · {areaName(v.area)}</>
            : s === "check" ? <><span className="chip c-new">Google found &quot;{v.g_name}&quot;</span> Is this the right place?</>
            : v.g_name ? <><span className="chip c-pull">Not found</span> Google only showed &quot;{v.g_name}&quot;, a different place</> : <span className="chip c-idle">No location</span>}</div></div>
          <div className="lr-act">
            <a className="btn btn-g btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + " Dehradun")}`} target="_blank" rel="noopener">Find on Google Maps</a>
            {(s === "check" || s === "found") && p && <><a className="btn btn-g btn-sm" href={`https://www.google.com/maps?q=${p.join(",")}`} target="_blank" rel="noopener">See pin</a>
              <button className="btn btn-g btn-sm" onClick={() => setPin(v, null, "manual", "Confirmed")}>Yes, correct</button></>}
            <span className="lr-in"><input className="inl" placeholder="Paste numbers or link" aria-label={`Location for ${v.name}`} value={vals[v.id] ?? ""} onChange={(e) => setVals({ ...vals, [v.id]: e.target.value })} />
              <button className="btn btn-p btn-sm" onClick={() => { const r = parsePin(vals[v.id] ?? ""); if (r.err) { setErrs({ ...errs, [v.id]: r.err }); return; } setErrs({ ...errs, [v.id]: "" }); setVals({ ...vals, [v.id]: "" }); setPin(v, r.p!, "manual", "Edited"); }}>Save</button></span></div>
          <div className="err">{errs[v.id]}</div></div>; })
        : <Empty title="No venues here" text="Pick another filter." />}
    </div>
  );
}
