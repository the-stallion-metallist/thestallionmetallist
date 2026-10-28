"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePanel, warnNext, type Run, type RunStop } from "../Panel";
import VenueDrawer from "../VenueDrawer";
import { EditVenue, FormModal, VenuePicker, vname, cansTxt } from "../forms";
import { TripFields, checkKm, tripCode, tripLabel } from "../forms2";
import { saveRun } from "../runlib";
import { doMove } from "../moveslib";
import { taskChips } from "../bits";
import { type Pickup, type Trip, areaName, dnice, fmt, kg, fuelPrice, pickupCost, rs } from "@/lib/admin/logic";
import { DAYS, pinOf } from "@/lib/admin/routes";
import { binsTxt } from "@/lib/admin/moves";

const FILLS = ["25%", "50%", "75%", "Full", "Overflow"], REASONS = ["Closed", "Bin empty", "Couldn't reach", "No time", "Other"];

export default function RunPage() {
  const c = usePanel(); const router = useRouter(); const r = c.run;
  const [open, setOpen] = useState<{ k: number; kind: "form" | "skip" } | null>(null);
  const [fill, setFill] = useState(""); const [reason, setReason] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [wake, setWake] = useState(""); const lock = useRef<WakeLockSentinel | null>(null);
  const saving = useRef(false); // a second tap on Save stop before the screen has caught up must not save the stop twice
  useEffect(() => { // keep the phone screen on during the route
    const get = async () => { try { if (r && !lock.current && "wakeLock" in navigator) { lock.current = await navigator.wakeLock.request("screen"); lock.current.addEventListener("release", () => { lock.current = null; }); setWake("Screen stays on during the route"); } } catch {} };
    get(); const v = () => { if (document.visibilityState === "visible") get(); };
    document.addEventListener("visibilitychange", v); return () => { document.removeEventListener("visibilitychange", v); lock.current?.release(); lock.current = null; };
  }, [r]);
  if (!r) return <div className="card"><h2>No route running</h2><p className="muted" style={{ margin: "6px 0 12px" }}>Start one from the Route planner, or from Today&apos;s route on the Overview.</p><Link className="btn btn-p" href="/admin/routes">Open route planner</Link></div>;

  const done = r.stops.filter((s) => s.mode === "done"), skip = r.stops.filter((s) => s.mode === "skip"), left = r.stops.length - done.length - skip.length;
  const onboard = done.reduce((a, s) => a + (s.cans || 0), 0), cap = c.set.vehCap;
  const staff = r.staff ? r.staff.split(", ") : [];
  const openMoves = (vid: number) => c.moves.filter((t) => t.status === "planned" && t.venue_id === vid);
  const setStops = (stops: RunStop[]) => saveRun(c, r, { stops });
  const openForm = (k: number, kind: "form" | "skip") => { setErr(""); setOpen({ k, kind }); setFill(r.stops[k]?.fill || ""); setReason(r.stops[k]?.reason || ""); };

  async function saveStop(k: number) {
    if (saving.current) return;
    saving.current = true;
    try { await saveStopNow(k); } finally { saving.current = false; }
  }
  async function saveStopNow(k: number) {
    const s = r!.stops[k]; const cansEl = document.getElementById("rc" + k) as HTMLInputElement, plEl = document.getElementById("rp" + k) as HTMLInputElement, paid = (document.getElementById("ry" + k) as HTMLInputElement).checked, mode = (document.getElementById("rpm" + k) as HTMLSelectElement).value;
    const mv = openMoves(s.vid).filter((t) => (document.getElementById(`rm${k}_${t.id}`) as HTMLInputElement | null)?.checked);
    if (cansEl.value === "" && !mv.length) { setErr("Enter the cans. Use 0 if only plastic."); cansEl.focus(); return; }
    setBusy(true);
    const cans = Number(cansEl.value) || 0, pl = Number(plEl.value) || 0; const moved: string[] = [];
    for (const t of mv) if (await doMove(c, t)) moved.push(t.kind === "pull" ? `took back ${binsTxt(t.steel, t.plastic)}` : `placed ${t.n} bin${t.n > 1 ? "s" : ""}`);
    const next: RunStop = { ...s, fill, movesTxt: [s.movesTxt, ...moved].filter(Boolean).join(", ") || undefined, mode: "done" };
    if (cans || pl || s.pid) {
      const vals = { d: c.today, venue_id: s.vid, cans, plastic_kg: pl, src: "Bin" as const, staff: r!.staff, fill };
      let rec = s.pid ? c.pickups.find((p) => p.id === s.pid) : undefined;
      if (rec) { const { data, error } = await c.db.from("pickups").update(vals).eq("id", rec.id).select().single(); if (c.fail(error)) { setBusy(false); return; } rec = data as Pickup; c.patch((d) => ({ ...d, pickups: d.pickups.map((p) => (p.id === rec!.id ? rec! : p)) })); await c.logIt("Edited", "Pickup", `${vname(c, s.vid)} · ${cansTxt(cans)}`, "On the route", { table: "pickups", id: rec.id }); }
      else { const { data, error } = await c.db.from("pickups").insert({ ...vals, trip: "On route" }).select().single(); if (c.fail(error)) { setBusy(false); return; } rec = data as Pickup; c.patch((d) => ({ ...d, pickups: [...d.pickups, rec!] })); await c.logIt("Added", "Pickup", `${vname(c, s.vid)} · ${cansTxt(cans)}`, "On the route", { table: "pickups", id: rec.id }); }
      const cost = Math.round(pickupCost(rec, c.vmap, c.set)); next.pid = rec.id; next.cans = cans; next.pl = pl; next.cost = cost; next.paid = paid;
      const pay = s.payId ? c.payments.find((p) => p.id === s.payId) : undefined;
      if (paid && cost > 0 && !pay) { const { data, error: pe } = await c.db.from("payments").insert({ d: c.today, venue_id: s.vid, amount: cost, mode, note: "Paid on the route", pickup_id: rec.id }).select().single(); if (data) { next.payId = data.id; c.patch((d) => ({ ...d, payments: [...d.payments, data] })); await c.logIt("Added", "Payment", `${vname(c, s.vid)} · ${rs(cost)}`, "On the route", { table: "payments", id: data.id }); } else { next.paid = false; warnNext(`${vname(c, s.vid)}: the payment of ${rs(cost)} was not saved${pe ? " (" + pe.message + ")" : ""}. Add it on Payouts.`); } }
      else if (pay) { const { data, error: pe } = await c.db.from("payments").update({ amount: Math.max(cost, 1), mode, deleted: !paid || cost <= 0 }).eq("id", pay.id).select().single(); if (data) c.patch((d) => ({ ...d, payments: d.payments.map((p) => (p.id === pay.id ? data : p)) })); else warnNext(`${vname(c, s.vid)}: the payment did not follow the new amount${pe ? " (" + pe.message + ")" : ""}. Change it on Payouts.`); }
    } else Object.assign(next, { cans: 0, pl: 0, paid: false, cost: 0 });
    if (!(await setStops(r!.stops.map((x, i) => (i === k ? next : x))))) { setBusy(false); return; } // the pickup is saved; the form stays open so Save stop can be tapped again
    setBusy(false); setOpen(null); c.toast(`${vname(c, s.vid)}: ${cansTxt(next.cans || 0)} saved${moved.length ? ", " + moved.join(", ") : ""}`);
    setTimeout(() => document.querySelector(".run-stop.todo")?.scrollIntoView({ block: "center" }), 50);
  }
  async function saveSkip(k: number) {
    if (!reason) { setErr("Pick a reason first."); return; }
    await setStops(r!.stops.map((x, i) => (i === k ? { ...x, mode: "skip", reason } : x)));
    await c.logIt("Skipped", "Stop", `${vname(c, r!.stops[k].vid)} · ${reason}`); setOpen(null); setErr("");
  }
  const addStop = () => c.openModal(<FormModal title="Add a stop" saveLabel="Add stop" onSave={async (fd) => {
    if (!fd.get("venue_id")) return { venue_id: "Type the venue name and pick it from the list." };
    const stops = [...r!.stops, { vid: Number(fd.get("venue_id")), exp: 0, extra: false, added: true, mode: "todo" as const, fill: "", reason: "" }];
    await setStops(stops); setTimeout(() => openForm(stops.length - 1, "form"), 50);
  }}>{(errs) => <VenuePicker id="aVen" err={errs.venue_id} />}</FormModal>);
  const finish = () => c.openModal(<FinishRun run={r} onDone={() => router.push("/admin/trips")} />);
  const cancel = () => c.openModal(<CancelRun run={r} onDone={() => router.push("/admin/routes")} />);

  const k0 = r.stops.findIndex((s) => s.mode === "todo" && !(open && open.k === r.stops.indexOf(s)));
  const next = k0 >= 0 ? r.stops[k0] : null, nv = next ? c.vmap.get(next.vid)! : null;
  return (<>
    <div className="card run-head">
      <div className="card-h"><h2>{DAYS[r.day]} · {r.label}</h2><span className="hint">Started {dnice(r.started_at.slice(0, 10))}</span><span className="hint">{wake}</span></div>
      <div className="run-stats"><span><b>{done.length + skip.length}/{r.stops.length}</b> stops</span><span><b>{fmt(onboard)}</b> cans on board{cap ? ` of ${fmt(cap)}` : ""}</span><span><b>{rs(done.reduce((a, s) => a + (s.paid ? s.cost || 0 : 0), 0))}</b> paid out</span></div>
      <span className={"rp-bar" + (cap && onboard > cap ? " over" : "")}><i style={{ width: `${cap ? Math.min((onboard / cap) * 100, 100) : ((done.length + skip.length) / r.stops.length) * 100}%` }} /></span>
      <div className="field" style={{ margin: "14px 0 0" }}><label>Staff on this route</label><div className="opts">{c.staff.filter((s) => s.active).map((s) => <button key={s.id} type="button" aria-pressed={staff.includes(s.name)}
        onClick={() => saveRun(c, r, { staff: (staff.includes(s.name) ? staff.filter((x) => x !== s.name) : [...staff, s.name]).join(", ") })}>{s.name}</button>)}</div></div>
    </div>
    {!next && !left ? <div className="card next-stop"><div className="l">All stops done</div><h2>Finish the route to save the trip</h2><div className="ns-act"><button className="btn btn-p" onClick={finish}>Finish route</button></div></div>
      : next && nv && <div className="card next-stop"><div className="l">Next stop · {k0 + 1} of {r.stops.length}</div><h2>{nv.name}</h2>
        <div className="d">{areaName(nv.area)}{next.exp ? ` · ~${fmt(next.exp)} cans` : ""}{nv.phone ? ` · ${nv.phone}` : ""}</div>{taskChips(openMoves(nv.id))}
        <div className="ns-act">
          <a className="btn btn-p" href={`https://www.google.com/maps/dir/?api=1&destination=${pinOf(nv) ? pinOf(nv)!.join(",") : encodeURIComponent(nv.name + " Dehradun")}&travelmode=driving`} target="_blank" rel="noopener">Navigate</a>
          {nv.phone ? <a className="btn btn-g" href={`tel:${nv.phone}`}>Call</a> : <button className="btn btn-g" onClick={() => c.openModal(<EditVenue v={nv} />)}>Add phone</button>}
          <button className="btn btn-g" onClick={() => openForm(k0, "form")}>Collected</button><button className="btn btn-g" onClick={() => openForm(k0, "skip")}>Skip</button>
        </div></div>}
    <div className="card"><ol className="run-list">
      {r.stops.map((s, k) => {
        const v = c.vmap.get(s.vid)!; const nm = <button className="rt-name" onClick={() => c.openDrawer(<VenueDrawer id={v.id} />)}>{v.name}</button>;
        const sub = `${areaName(v.area)}${s.added ? " · added on the way" : ` · ~${fmt(s.exp)} cans`}${s.extra ? " · extra visit" : ""}`;
        if (open?.k === k && open.kind === "form") return <li key={k} className="run-stop open"><span className="rt-dot">{k + 1}</span><div className="rs-main">{nm}<div className="d">{sub}</div>
          <div className="rs-form">
            <div className="two"><div className={"field" + (err ? " bad" : "")}><label htmlFor={"rc" + k}>Cans</label><input id={"rc" + k} type="number" inputMode="numeric" min={0} defaultValue={s.cans ?? ""} placeholder={`~${fmt(s.exp)}`} autoFocus />{err && <span className="err">{err}</span>}</div>
              <div className="field"><label htmlFor={"rp" + k}>Plastic kg <span className="muted">(optional)</span></label><input id={"rp" + k} type="number" inputMode="decimal" step="any" min={0} defaultValue={s.pl || ""} /></div></div>
            <div className="field"><label>Bin fill when you arrived</label><div className="opts">{FILLS.map((x) => <button key={x} type="button" aria-pressed={fill === x} onClick={() => setFill(fill === x ? "" : x)}>{x}</button>)}</div></div>
            <label className="check"><input type="checkbox" id={"ry" + k} defaultChecked={s.paid !== false} /> Paid the venue on the spot</label>
            <div className="field"><label htmlFor={"rpm" + k}>Paid by</label><select id={"rpm" + k} defaultValue={c.payments.find((p) => p.id === s.payId)?.mode ?? "Cash"}>{["Cash", "UPI", "Bank"].map((m) => <option key={m}>{m}</option>)}</select></div>
            {openMoves(s.vid).map((t) => { const ok = t.kind === "pull" || c.spare.steel + c.spare.plastic >= t.n; return <label key={t.id} className="check"><input type="checkbox" id={`rm${k}_${t.id}`} defaultChecked={ok} disabled={!ok} /> {t.kind === "pull" ? `Took back ${binsTxt(t.steel, t.plastic)}${t.last_bin ? " (venue pauses)" : ""}` : `Placed ${t.n} bin${t.n > 1 ? "s" : ""}`}{!ok && <span className="muted"> · no spare bin on board yet</span>}</label>; })}
            <div className="m-foot"><button type="button" className="btn btn-g" onClick={() => setOpen(null)}>Cancel</button><button type="button" className="btn btn-p" disabled={busy} onClick={() => saveStop(k)}>{busy ? "Saving…" : "Save stop"}</button></div>
          </div></div></li>;
        if (open?.k === k && open.kind === "skip") return <li key={k} className="run-stop open"><span className="rt-dot">{k + 1}</span><div className="rs-main">{nm}<div className="d">Why are you skipping it?</div>
          <div className="rs-form"><div className="opts">{REASONS.map((x) => <button key={x} type="button" aria-pressed={reason === x} onClick={() => setReason(x)}>{x}</button>)}</div>{err && <p className="err" style={{ color: "var(--bad)", fontSize: 12.5, marginTop: 6 }}>{err}</p>}
            <div className="m-foot"><button type="button" className="btn btn-g" onClick={() => setOpen(null)}>Cancel</button><button type="button" className="btn btn-p" onClick={() => saveSkip(k)}>Skip stop</button></div></div></div></li>;
        if (s.mode === "done") return <li key={k} className="run-stop done"><span className="rt-dot ok" aria-label="Done">✓</span><div className="rs-main">{nm}<div className="d">{cansTxt(s.cans || 0)}{s.pl ? ` · ${kg(s.pl)} kg plastic` : ""}{s.fill ? " · " + s.fill : ""}{s.paid && s.cost ? ` · paid ${rs(s.cost)}` : ""}{s.movesTxt ? " · " + s.movesTxt : ""}</div></div><div className="rs-act"><button className="btn btn-g btn-sm" onClick={() => openForm(k, "form")}>Edit</button></div></li>;
        if (s.mode === "skip") return <li key={k} className="run-stop skip"><span className="rt-dot sk" aria-label="Skipped">–</span><div className="rs-main">{nm}<div className="d">Skipped: {s.reason}</div></div><div className="rs-act"><button className="btn btn-g btn-sm" onClick={() => setStops(r.stops.map((x, i) => (i === k ? { ...x, mode: "todo", reason: "" } : x)))}>Undo</button></div></li>;
        return <li key={k} className="run-stop todo"><span className="rt-dot">{k + 1}</span><div className="rs-main">{nm}<div className="d">{sub}</div>{taskChips(openMoves(v.id))}</div><div className="rs-act"><button className="btn btn-p" onClick={() => openForm(k, "form")}>Collected</button><button className="btn btn-g" onClick={() => openForm(k, "skip")}>Skip</button></div></li>;
      })}
    </ol>
      <div className="run-foot"><button className="btn btn-g" onClick={addStop}>+ Add a stop not on the route</button><button className="btn btn-g" onClick={cancel}>Cancel route</button><span className="sp" /><button className="btn btn-p" onClick={finish}>{left ? `Finish route (${left} not visited)` : "Finish route"}</button></div></div>
  </>);
}

// Closes a started route without a trip (started by mistake, or the day was called off). Pickups already saved on it stay in Pickups.
function CancelRun({ run, onDone }: { run: Run; onDone: () => void }) {
  const c = usePanel(); const done = run.stops.filter((s) => s.mode === "done").length;
  return (
    <FormModal title="Cancel this route?" saveLabel="Yes, cancel the route" onSave={async () => {
      const { data, error } = await c.db.from("route_runs").update({ finished_at: new Date().toISOString() }).eq("id", run.id).is("finished_at", null).select();
      if (c.fail(error)) return false;
      if (!data?.length) { c.toast("This route was already finished. Reloading."); await c.reload(); return false; }
      c.patch((x) => ({ ...x, run: null }));
      await c.logIt("Cancelled", "Route", `${DAYS[run.day]} · ${done} of ${run.stops.length} stops had been collected`);
      c.toast("Route cancelled. No trip was saved."); onDone();
    }}>
      {() => <p className="muted" style={{ marginBottom: 6 }}>No trip is saved and nothing needs the odometer. {done ? `The ${done} stop${done === 1 ? "" : "s"} already collected stay${done === 1 ? "s" : ""} in Pickups, with ${done === 1 ? "its payment" : "their payments"}.` : "No stops had been collected yet."}</p>}
    </FormModal>
  );
}

function FinishRun({ run, onDone }: { run: Run; onDone: () => void }) {
  const c = usePanel();
  const done = run.stops.filter((s) => s.mode === "done"), cans = done.reduce((a, s) => a + (s.cans || 0), 0);
  return (
    <FormModal title="Finish route" saveLabel="Save trip" onSave={async (fd) => {
      const e = checkKm(fd); if (Object.keys(e).length) return e; const fl = Number(fd.get("fl")) || 0, d = String(fd.get("d"));
      const vals = { code: tripCode(c, d), d, vehicle: String(fd.get("veh")), driver: String(fd.get("drv")), km_start: Number(fd.get("k1")), km_end: Number(fd.get("k2")), stops: done.length, fuel_l: fl, fuel_cost: Math.round(fl * fuelPrice(c.set)), cans,
        route: DAYS[run.day], plan_min: run.plan_min, act_min: Math.round((Date.now() - Date.parse(run.started_at)) / 60000) };
      // finish the run first: it can only be finished once (a second tap, or another phone, finds it already finished)
      const { data: fin, error: fe } = await c.db.from("route_runs").update({ finished_at: new Date().toISOString() }).eq("id", run.id).is("finished_at", null).select();
      if (c.fail(fe)) return false;
      if (!fin?.length) { c.toast("This route was already finished. Reloading."); await c.reload(); return false; }
      const { data, error } = await c.db.from("trips").insert(vals).select().single();
      if (error || !data) { await c.db.from("route_runs").update({ finished_at: null }).eq("id", run.id); c.fail(error); return false; } // nothing saved: the route stays open to try again
      const t = data as Trip; const pids = done.map((s) => s.pid).filter(Boolean) as number[], lost: string[] = [];
      if (pids.length) { const { error: pe } = await c.db.from("pickups").update({ trip: t.code }).in("id", pids); if (pe) lost.push("the pickups were not tagged with the trip"); }
      const { error: re } = await c.db.from("route_runs").update({ trip_id: t.id }).eq("id", run.id); if (re) lost.push("the trip was not linked to the route");
      if (lost.length) warnNext(`The trip was saved, but ${lost.join(" and ")}.`);
      c.patch((x) => ({ ...x, run: null, trips: [...x.trips, t], pickups: x.pickups.map((p) => (pids.includes(p.id) && !lost.length ? { ...p, trip: t.code } : p)) }));
      await c.logIt("Finished", "Route", `${DAYS[run.day]} · ${done.length} stops · ${cansTxt(cans)}`); await c.logIt("Added", "Trip", tripLabel(t), "From the route", { table: "trips", id: t.id });
      c.toast(`Route finished: ${cansTxt(cans)} from ${done.length} stops. Trip ${t.code} saved.`); onDone();
    }}>
      {(errs) => <>
        <p className="muted" style={{ marginBottom: 14 }}>{done.length} stops collected, {cansTxt(cans)}{run.stops.length - done.length ? `, ${run.stops.length - done.length} not collected` : ""}. Add the vehicle details to save the trip.</p>
        <TripFields r={{}} errs={errs} drivers={run.staff ? run.staff.split(", ") : undefined} />
      </>}
    </FormModal>
  );
}
