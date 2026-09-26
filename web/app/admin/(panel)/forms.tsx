"use client";
import { useEffect, useRef, useState } from "react";
import { usePanel } from "./Panel";
import { I } from "./icons";
import {
  type Pickup, type Venue, AREAS, VSTATUS, bins, dnice, fmt, parsePin, pickupCost, rs,
} from "@/lib/admin/logic";

type Ctx = ReturnType<typeof usePanel>;
export type Errs = Record<string, string>;
export const vname = (c: Ctx, id: number | null) => (id == null ? "Household (app)" : c.vmap.get(id)?.name ?? "Unknown venue");
export const cansTxt = (n: number) => `${fmt(n)} can${n === 1 ? "" : "s"}`;
const pickupLabel = (c: Ctx, p: Pickup) => `${vname(c, p.venue_id)} · ${cansTxt(p.cans)}`;
export const metaOf = (r: { created_by: string; updated_by?: string | null; created_at?: string }) =>
  `Added by ${r.created_by}${r.created_at ? " on " + dnice(r.created_at.slice(0, 10)) : ""}${r.updated_by ? ` · last edited by ${r.updated_by}` : ""}`;

// "Cans 120 → 140 · Bin fill – → Full"
export function diffs<T extends Record<string, unknown>>(a: T, b: T, fields: [keyof T, string, ((x: never) => string)?][]) {
  return fields.map(([k, l, f]) => {
    const show = (x: unknown) => (x == null || x === "" ? "–" : f ? f(x as never) : String(x));
    const x = show(a[k]), y = show(b[k]); return x !== y ? `${l} ${x} → ${y}` : null;
  }).filter(Boolean).join(" · ");
}

// ---------- building blocks ----------
export function FormModal({ title, onSave, children, meta, onDelete, saveLabel = "Save", deleteLabel = "Delete" }: {
  title: string; onSave: (fd: FormData) => Promise<Errs | void | false>; children: (errs: Errs) => React.ReactNode;
  meta?: string; onDelete?: () => void; saveLabel?: string; deleteLabel?: string;
}) {
  const c = usePanel(); const [errs, setErrs] = useState<Errs>({}); const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { setTimeout(() => ref.current?.querySelector<HTMLElement>("input:not([type=hidden]),select")?.focus(), 60); }, []);
  return (<>
    <div className="dr-h"><h2>{title}</h2><button className="x" type="button" onClick={c.closeModal} aria-label="Close">{I.x}</button></div>
    <form ref={ref} noValidate onSubmit={async (e) => {
      e.preventDefault(); if (busy) return; setBusy(true);
      const r = await onSave(new FormData(e.currentTarget)); setBusy(false);
      if (r && typeof r === "object" && Object.keys(r).length) { setErrs(r); return; }
      if (r !== false) c.closeModal();
    }}>
      {children(errs)}
      {meta && <p className="meta">{meta}</p>}
      <div className="m-foot">
        {onDelete && <><button type="button" className="btn btn-g btn-del" onClick={() => { c.closeModal(); onDelete(); }}>{deleteLabel}</button><span className="sp" /></>}
        <button type="button" className="btn btn-g" onClick={c.closeModal}>Cancel</button>
        <button className="btn btn-p" type="submit" disabled={busy}>{busy ? "Saving…" : saveLabel}</button>
      </div>
    </form>
  </>);
}

export function Field({ id, label, err, help, children, hidden }: { id?: string; label: React.ReactNode; err?: string; help?: string; children: React.ReactNode; hidden?: boolean }) {
  return <div className={"field" + (err ? " bad" : "")} hidden={hidden}><label htmlFor={id}>{label}</label>{children}{help && <span className="help">{help}</span>}{err && <span className="err">{err}</span>}</div>;
}

// Pill buttons; the choice goes into the form as a hidden field.
export function Opts({ name, values, initial = "", multi, onChange }: { name: string; values: string[]; initial?: string; multi?: boolean; onChange?: (v: string) => void }) {
  const [sel, setSel] = useState<string[]>(initial ? initial.split(", ") : []);
  const val = values.filter((v) => sel.includes(v)).join(", ");
  useEffect(() => { onChange?.(val); }, [val]); // eslint-disable-line react-hooks/exhaustive-deps
  return (<div className="opts">
    {values.map((v) => <button key={v} type="button" aria-pressed={sel.includes(v)}
      onClick={() => setSel((s) => (multi ? (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]) : s.includes(v) && !initial ? [] : [v]))}>{v}</button>)}
    <input type="hidden" name={name} value={val} />
  </div>);
}

// Type-to-search venue box: starts-with, then word-starts-with, then contains, then letters in order.
export function rankVenues(venues: Venue[], q: string) {
  q = q.trim().toLowerCase();
  if (!q) return venues.slice().sort((a, b) => a.name.localeCompare(b.name)).map((v) => ({ v, i: -1 }));
  const out: { v: Venue; s: number; i: number }[] = [];
  for (const v of venues) {
    const n = v.name.toLowerCase(); let s: number | null = null, i = n.indexOf(q);
    if (n.startsWith(q)) s = 0; else if (n.split(/[\s()/-]+/).some((w) => w.startsWith(q))) s = 1; else if (i >= 0) s = 2;
    else { let k = 0; for (const ch of n) { if (ch === q[k]) k++; if (k === q.length) break; } if (k === q.length) s = 3; i = -1; }
    if (s != null) out.push({ v, s, i: s < 3 ? i : -1 });
  }
  return out.sort((a, b) => a.s - b.s || a.v.name.localeCompare(b.v.name));
}
export function VenuePicker({ id, name = "venue_id", initial, label = "Venue", err, onPick }: { id: string; name?: string; initial?: number | null; label?: string; err?: string; onPick?: (v: Venue) => void }) {
  const c = usePanel();
  const start = initial != null ? c.vmap.get(initial) : undefined;
  const [q, setQ] = useState(start?.name ?? ""); const [picked, setPicked] = useState<number | "">(start?.id ?? "");
  const [open, setOpen] = useState(false); const [act, setAct] = useState(-1);
  const items = open ? rankVenues(c.venues, q).slice(0, q.trim() ? 8 : 100) : [];
  const listRef = useRef<HTMLUListElement>(null);
  const pick = (v: Venue) => { setQ(v.name); setPicked(v.id); setOpen(false); onPick?.(v); };
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" }); }, [act]);
  const hl = (n: string, i: number) => (i < 0 ? n : <>{n.slice(0, i)}<mark>{n.slice(i, i + q.trim().length)}</mark>{n.slice(i + q.trim().length)}</>);
  return (
    <div className={"field combo" + (err ? " bad" : "")}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={id + "-list"} autoComplete="off" spellCheck={false}
        placeholder="Type venue name" value={q}
        aria-activedescendant={act >= 0 ? `${id}-o${act}` : undefined}
        onChange={(e) => { setQ(e.target.value); setPicked(""); setOpen(true); setAct(e.target.value.trim() ? 0 : -1); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => { setOpen(false); const ex = c.venues.find((v) => v.name.toLowerCase() === q.trim().toLowerCase()); if (ex) pick(ex); }, 120)}
        onKeyDown={(e) => {
          if (!open && e.key === "ArrowDown") { setOpen(true); return; } if (!open) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setAct((a) => Math.min(a + 1, items.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setAct((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); if (items[act]) pick(items[act].v); }
          else if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
        }} />
      <input type="hidden" name={name} value={picked} />
      {open && <ul className="combo-list" id={id + "-list"} role="listbox" ref={listRef}>
        {items.length ? items.map(({ v, i }, k) => {
          const last = c.byV.get(v.id)?.filter((p) => p.cans > 0).at(-1);
          return <li key={v.id} id={`${id}-o${k}`} role="option" aria-selected={k === act} onMouseDown={(e) => { e.preventDefault(); pick(v); }}>
            <span>{hl(v.name, i)}</span><small>{bins(v)} bin{bins(v) === 1 ? "" : "s"}{last ? " · last " + dnice(last.d) : ""}</small></li>;
        }) : <li className="none">No venue matches &quot;{q}&quot;. Add it from Venues &amp; bins first.</li>}
      </ul>}
      {err && <span className="err">{err}</span>}
    </div>
  );
}

// ---------- pickups ----------
export function openLogPickup(c: Ctx, venueId?: number, rec?: Pickup) { c.openModal(<LogPickup venueId={venueId} rec={rec} />); }

function LogPickup({ venueId, rec }: { venueId?: number; rec?: Pickup }) {
  const c = usePanel(); const app = rec && rec.venue_id == null;
  return (
    <FormModal title={rec ? "Edit pickup" : "Log pickup"} meta={rec ? metaOf(rec) : undefined} onDelete={rec ? () => deletePickup(c, rec) : undefined}
      onSave={async (fd) => {
        const e: Errs = {};
        if (!app && !fd.get("venue_id")) e.venue_id = "Type the venue name and pick it from the list.";
        if (fd.get("cans") === "") e.cans = "Enter how many cans. Use 0 if only plastic.";
        if (Object.keys(e).length) return e;
        const vals = { d: String(fd.get("d") || c.today), venue_id: app ? null : Number(fd.get("venue_id")), cans: Number(fd.get("cans")), plastic_kg: Number(fd.get("pl")) || 0,
          src: (String(fd.get("src")) || "Bin") as Pickup["src"], staff: String(fd.get("staff") || ""), fill: String(fd.get("fill") || "") };
        return savePickup(c, vals, rec, !!fd.get("paynow"));
      }}>
      {(errs) => c.phone ? <>
        {app ? <Field id="pApp" label="Venue"><input id="pApp" value="Household (app)" disabled /></Field> : <VenuePicker id="pVen" initial={rec?.venue_id ?? venueId} err={errs.venue_id} />}
        <Field id="pCans" label="Cans" err={errs.cans}><input id="pCans" name="cans" type="number" inputMode="numeric" min={0} placeholder="e.g. 180" defaultValue={rec?.cans ?? ""} /></Field>
        <Field label="Staff on pickup"><Opts name="staff" values={c.staff.filter((s) => s.active).map((s) => s.name)} initial={rec?.staff} multi /></Field>
        {!rec && <label className="check"><input type="checkbox" name="paynow" defaultChecked /> Paid the venue on the spot</label>}
        <details className="ph-fold inset" open={!!rec}><summary><span className="ph-m"><span className="ph-t">More details</span><span className="ph-d">Date, plastic kg, bin fill, source</span></span><span className="ph-chev down">{I.chev}</span></summary>
          <div className="ph-fold-b">
            <Field id="pDate" label="Date"><input id="pDate" name="d" type="date" defaultValue={rec?.d ?? c.today} max={c.today} /></Field>
            <Field id="pPl" label={<>Plastic kg <span className="muted">(optional)</span></>}><input id="pPl" name="pl" type="number" inputMode="decimal" step="any" min={0} placeholder="e.g. 3.5" defaultValue={rec?.plastic_kg || ""} /></Field>
            <Field label={<>Bin fill when you arrived <span className="muted">(optional)</span></>}><Opts name="fill" values={["25%", "50%", "75%", "Full", "Overflow"]} initial={rec?.fill} /></Field>
            <Field label="Source"><Opts name="src" values={["Bin", "App", "Walk-in"]} initial={rec?.src ?? "Bin"} /></Field>
          </div></details>
      </> : <>
        <div className="two">
          <Field id="pDate" label="Date"><input id="pDate" name="d" type="date" defaultValue={rec?.d ?? c.today} max={c.today} /></Field>
          {app ? <Field id="pApp" label="Venue"><input id="pApp" value="Household (app)" disabled /></Field>
            : <VenuePicker id="pVen" initial={rec?.venue_id ?? venueId} err={errs.venue_id} />}
        </div>
        <div className="two">
          <Field id="pCans" label="Cans" err={errs.cans}><input id="pCans" name="cans" type="number" inputMode="numeric" min={0} placeholder="e.g. 180" defaultValue={rec?.cans ?? ""} /></Field>
          <Field id="pPl" label={<>Plastic kg <span className="muted">(optional)</span></>}><input id="pPl" name="pl" type="number" inputMode="decimal" step="any" min={0} placeholder="e.g. 3.5" defaultValue={rec?.plastic_kg || ""} /></Field>
        </div>
        <Field label={<>Bin fill when you arrived <span className="muted">(optional)</span></>}><Opts name="fill" values={["25%", "50%", "75%", "Full", "Overflow"]} initial={rec?.fill} /></Field>
        <Field label="Staff on pickup"><Opts name="staff" values={c.staff.filter((s) => s.active).map((s) => s.name)} initial={rec?.staff} multi /></Field>
        <Field label="Source"><Opts name="src" values={["Bin", "App", "Walk-in"]} initial={rec?.src ?? "Bin"} /></Field>
        {!rec && <label className="check"><input type="checkbox" name="paynow" defaultChecked /> Paid the venue on the spot</label>}
      </>}
    </FormModal>
  );
}

async function savePickup(c: Ctx, vals: Omit<Pickup, "id" | "deleted" | "created_at" | "created_by" | "updated_by" | "trip">, rec?: Pickup, paynow?: boolean) {
  if (rec) {
    const { data, error } = await c.db.from("pickups").update(vals).eq("id", rec.id).select().single();
    if (c.fail(error)) return false;
    const next = data as Pickup;
    const ch = diffs(rec as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>, [["d", "Date", dnice as never], ["venue_id", "Venue", ((x: number) => vname(c, x)) as never], ["cans", "Cans", fmt as never], ["plastic_kg", "Plastic kg"], ["fill", "Bin fill"], ["staff", "Staff"], ["src", "Source"]]);
    // a payment made at this pickup follows the new amount
    const pay = c.payments.find((p) => p.pickup_id === rec.id && !p.deleted);
    let payments = c.payments;
    if (pay && next.venue_id != null) {
      const amount = Math.round(pickupCost(next, c.vmap, c.set));
      if (amount > 0 && amount !== Number(pay.amount)) {
        const { data: pd } = await c.db.from("payments").update({ amount, venue_id: next.venue_id }).eq("id", pay.id).select().single();
        if (pd) payments = payments.map((p) => (p.id === pay.id ? (pd as typeof p) : p));
      }
    }
    c.patch((d) => ({ ...d, pickups: d.pickups.map((p) => (p.id === rec.id ? next : p)), payments }));
    if (ch) { await c.logIt("Edited", "Pickup", pickupLabel(c, next), ch, { table: "pickups", id: rec.id }); c.toast("Pickup updated"); }
    return;
  }
  const { data, error } = await c.db.from("pickups").insert(vals).select().single();
  if (c.fail(error)) return false;
  const p = data as Pickup; let msg = `Pickup saved: ${cansTxt(p.cans)} from ${vname(c, p.venue_id)}`;
  let payRow: typeof c.payments[number] | null = null;
  const cost = Math.round(pickupCost(p, c.vmap, c.set));
  if (paynow && p.venue_id != null && cost > 0) {
    const { data: pd, error: pe } = await c.db.from("payments").insert({ d: p.d, venue_id: p.venue_id, amount: cost, mode: "Cash", note: "Paid on the spot", pickup_id: p.id }).select().single();
    if (!pe && pd) { payRow = pd as typeof payRow; msg += `, ${rs(cost)} paid`; } else msg += ". Payment not saved: " + pe?.message;
  }
  c.patch((d) => ({ ...d, pickups: [...d.pickups, p], payments: payRow ? [...d.payments, payRow] : d.payments }));
  await c.logIt("Added", "Pickup", pickupLabel(c, p), payRow ? `Paid ${rs(cost)} on the spot` : "", { table: "pickups", id: p.id });
  c.toast(msg);
}

export async function deletePickup(c: Ctx, rec: Pickup) {
  const set = async (deleted: boolean) => {
    const { error } = await c.db.from("pickups").update({ deleted }).eq("id", rec.id);
    if (c.fail(error)) return false;
    await c.db.from("payments").update({ deleted }).eq("pickup_id", rec.id);
    c.patch((d) => ({ ...d, pickups: d.pickups.map((p) => (p.id === rec.id ? { ...p, deleted } : p)), payments: d.payments.map((p) => (p.pickup_id === rec.id ? { ...p, deleted } : p)) }));
    await c.logIt(deleted ? "Deleted" : "Restored", "Pickup", pickupLabel(c, rec), "", { table: "pickups", id: rec.id });
    return true;
  };
  if (await set(true)) c.toast("Pickup deleted", async () => { if (await set(false)) c.toast("Pickup restored"); });
}
export async function restorePickup(c: Ctx, id: number) {
  const rec = c.pickups.find((p) => p.id === id); if (!rec) return;
  const { error } = await c.db.from("pickups").update({ deleted: false }).eq("id", id);
  if (c.fail(error)) return;
  await c.db.from("payments").update({ deleted: false }).eq("pickup_id", id);
  c.patch((d) => ({ ...d, pickups: d.pickups.map((p) => (p.id === id ? { ...p, deleted: false } : p)), payments: d.payments.map((p) => (p.pickup_id === id ? { ...p, deleted: false } : p)) }));
  await c.logIt("Restored", "Pickup", pickupLabel(c, rec), "", { table: "pickups", id });
  c.toast("Pickup restored");
}

// ---------- venues ----------
async function saveVenueRow(c: Ctx, id: number, vals: Partial<Venue>) {
  const { data, error } = await c.db.from("venues").update(vals).eq("id", id).select().single();
  if (c.fail(error)) return null;
  c.patch((d) => ({ ...d, venues: d.venues.map((v) => (v.id === id ? (data as Venue) : v)) }));
  return data as Venue;
}
// names to pick from for "Brought in by": everyone already set on a venue, plus current staff
function broughtNames(c: Ctx) { return [...new Set([...[...c.vmap.values()].map((v) => v.brought_by), ...c.staff.filter((s) => s.active).map((s) => s.name)].filter(Boolean) as string[])].sort(); }
function BroughtBy({ id, value }: { id: string; value?: string | null }) {
  const c = usePanel();
  return <Field id={id} label="Brought in by" help="Who got this venue on board. Counts on the People screen."><select id={id} name="by" defaultValue={value ?? ""}><option value="">Not set</option>{broughtNames(c).map((n) => <option key={n}>{n}</option>)}</select></Field>;
}
const pinErr = (raw: string) => (raw ? parsePin(raw) : { p: undefined, err: undefined });

export function EditVenue({ v }: { v: Venue }) {
  const c = usePanel(); const [status, setStatus] = useState(v.status);
  const block = removeBlock(c, v);
  return (
    <FormModal title={"Edit " + v.name} deleteLabel="Remove venue" onDelete={block ? undefined : () => removeVenue(c, v)} onSave={async (fd) => {
      const e: Errs = {}; const name = String(fd.get("name")).trim();
      if (!name) e.name = "Enter the venue name.";
      else { const o = [...c.vmap.values()].find((x) => x.id !== v.id && x.name.toLowerCase() === name.toLowerCase()); if (o) e.name = o.deleted ? "A removed venue has this name. Restore it from Change history, or pick another name." : "Another venue already has this name."; }
      const raw = String(fd.get("pin")).trim(); const cur = v.lat != null ? `${v.lat}, ${v.lng}` : "";
      const pp = raw && raw !== cur ? pinErr(raw) : { p: undefined as [number, number] | undefined, err: undefined as string | undefined };
      if (pp.err) e.pin = pp.err;
      if (Object.keys(e).length) return e;
      const vals: Partial<Venue> = {
        name, area: String(fd.get("area")) || null, status: String(fd.get("status")) as Venue["status"],
        promised: String(fd.get("status")) === "Waiting" ? Math.max(1, Number(fd.get("promised")) || 1) : v.promised,
        contact: String(fd.get("contact")) || null, phone: String(fd.get("phone")) || null, terms: String(fd.get("terms")) as Venue["terms"], upi: String(fd.get("upi")) || null,
        can_rate: Number(fd.get("rate")) || v.can_rate, plastic_rate: Number(fd.get("pr")) || null, brought_by: String(fd.get("by")) || null,
      };
      if (String(fd.get("area")) !== (v.area ?? "")) vals.area_est = false;
      if (pp.p) Object.assign(vals, { lat: pp.p[0], lng: pp.p[1], pin_src: "manual", pin_by: c.me.name });
      if (!raw && cur) Object.assign(vals, { lat: null, lng: null, pin_src: null });
      const next = await saveVenueRow(c, v.id, vals); if (!next) return false;
      const ch = diffs(v as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>, [["name", "Name"], ["area", "Area"], ["status", "Status"], ["lat", "Pin"], ["contact", "Contact"], ["phone", "Phone"], ["terms", "Terms"], ["can_rate", "Per can"], ["plastic_rate", "Plastic ₹/kg"], ["brought_by", "Brought in by"]]);
      await c.logIt("Edited", "Venue", next.name, ch, { table: "venues", id: v.id }); c.toast("Venue saved");
    }}>
      {(errs) => <>
        <Field id="evN" label="Venue name" err={errs.name}><input id="evN" name="name" defaultValue={v.name} /></Field>
        <div className="two">
          <Field id="evA" label="Area"><select id="evA" name="area" defaultValue={v.area ?? ""}><option value="">Choose area</option>{AREAS.map((a) => <option key={a.id} value={a.id}>{a.n}</option>)}</select></Field>
          <Field id="evS" label="Status"><select id="evS" name="status" value={status} onChange={(e) => setStatus(e.target.value as Venue["status"])}>{VSTATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        </div>
        <Field id="evProm" label="Bins promised" hidden={status !== "Waiting"}><input id="evProm" name="promised" type="number" inputMode="numeric" min={1} defaultValue={v.promised || 1} /></Field>
        <Field id="evPin" label="Map location" err={errs.pin} help="In Google Maps, press and hold on the venue, then copy the numbers or the full link.">
          <input id="evPin" name="pin" defaultValue={v.lat != null ? `${v.lat}, ${v.lng}` : ""} placeholder="Paste a Google Maps link or 30.34, 78.06" /></Field>
        <div className="two">
          <Field id="evT" label="Payment terms"><select id="evT" name="terms" defaultValue={v.terms}>{["On the spot", "Per pickup", "Monthly"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field id="evU" label={<>UPI ID or number <span className="muted">(optional)</span></>}><input id="evU" name="upi" defaultValue={v.upi ?? ""} /></Field>
        </div>
        <div className="two">
          <Field id="evC" label="Contact name"><input id="evC" name="contact" defaultValue={v.contact ?? ""} /></Field>
          <Field id="evPh" label="Phone"><input id="evPh" name="phone" type="tel" inputMode="tel" defaultValue={v.phone ?? ""} /></Field>
        </div>
        <div className="two">
          <Field id="evR" label="Payout per can (₹)"><input id="evR" name="rate" type="number" step="any" defaultValue={v.can_rate} /></Field>
          <Field id="evPr" label="Plastic payout (₹/kg)"><input id="evPr" name="pr" type="number" step="any" defaultValue={v.plastic_rate ?? ""} placeholder={`Default ₹${c.set.plasticBuy}`} /></Field>
        </div>
        <BroughtBy id="evBy" value={v.brought_by} />
        {block && <p className="meta">To remove this venue, first {block}.</p>}
      </>}
    </FormModal>
  );
}

// Why a venue can't be removed yet (bins still out, money owed, or a bin move planned), or null.
function removeBlock(c: Ctx, v: Venue) {
  const n = bins(v), owed = c.pay(v).owed;
  if (n) return `take its ${n} bin${n > 1 ? "s" : ""} back (Record bin change) so the spare-bin count stays right`;
  if (owed > 0) return `pay the ${rs(owed)} it is still owed`;
  if (c.moves.some((t) => t.status === "planned" && t.venue_id === v.id)) return "cancel its planned bin move in Bin moves";
  return null;
}
// Removing hides the venue everywhere; its past pickups and payments stay and still count. Undo for 5 seconds, or restore later.
export async function setVenueRemoved(c: Ctx, v: Venue, deleted: boolean) {
  const { error } = await c.db.from("venues").update({ deleted }).eq("id", v.id);
  if (c.fail(error)) return false;
  c.patch((d) => ({ ...d, venues: d.venues.map((x) => (x.id === v.id ? { ...x, deleted } : x)) }));
  await c.logIt(deleted ? "Removed" : "Restored", "Venue", v.name, "", { table: "venues", id: v.id });
  return true;
}
async function removeVenue(c: Ctx, v: Venue) {
  if (!(await setVenueRemoved(c, v, true))) return;
  c.closeLayers();
  c.toast(`${v.name} removed`, async () => { if (await setVenueRemoved(c, v, false)) c.toast(`${v.name} restored`); });
}

export function AddVenue() {
  const c = usePanel(); const [wait, setWait] = useState(false);
  return (
    <FormModal title="Add venue" onSave={async (fd) => {
      const e: Errs = {}; const name = String(fd.get("name")).trim();
      const steel = wait ? 0 : Number(fd.get("steel")) || 0, pb = wait ? 0 : Number(fd.get("pb")) || 0, hasBins = steel + pb > 0;
      if (!name) e.name = "Enter the venue name."; else { const o = [...c.vmap.values()].find((x) => x.name.toLowerCase() === name.toLowerCase()); if (o) e.name = o.deleted ? "A removed venue has this name. Restore it from Change history instead of adding it again." : "A venue with this name already exists."; }
      if (!fd.get("added")) e.added = "Enter the day they signed.";
      if (hasBins && !fd.get("bin")) e.bin = "Enter the day the bin was placed.";
      const pp = pinErr(String(fd.get("pin")).trim()); if (pp.err) e.pin = pp.err;
      if (Object.keys(e).length) return e;
      const row = {
        name, type: String(fd.get("type")), area: String(fd.get("area")) || null, status: wait ? "Waiting" : "Active", promised: wait ? Math.max(1, Number(fd.get("promised")) || 1) : 0,
        steel, plastic_bins: pb, added: String(fd.get("added")), bin_since: hasBins ? String(fd.get("bin")) : null,
        can_rate: Number(fd.get("rate")) || c.set.canRate, plastic_rate: Number(fd.get("pr")) || null,
        contact: String(fd.get("c")) || null, phone: String(fd.get("ph")) || null, brought_by: String(fd.get("by")) || null,
        ...(pp.p ? { lat: pp.p[0], lng: pp.p[1], pin_src: "manual", pin_by: c.me.name } : {}),
      };
      const { data, error } = await c.db.from("venues").insert(row).select().single();
      if (c.fail(error)) return false;
      const v = data as Venue;
      if (hasBins) { const { data: b } = await c.db.from("bin_log").insert({ d: row.bin_since, venue_id: v.id, change: 1, steel, plastic: pb, note: "New venue" }).select().single(); if (b) c.patch((d) => ({ ...d, binlog: [...d.binlog, b as typeof d.binlog[number]] })); }
      c.patch((d) => ({ ...d, venues: [...d.venues, v] }));
      await c.logIt("Added", "Venue", name + (wait ? " · waiting for a bin" : ""), "", { table: "venues", id: v.id });
      c.toast(pp.p ? `${name} added` : `${name} added. Add its map location in Edit venue so it can go on a route.`);
    }}>
      {(errs) => <>
        <Field id="vN" label="Venue name" err={errs.name}><input id="vN" name="name" placeholder="e.g. Cafe Marigold" /></Field>
        <Field label="Bin" help="Signed but no bin yet? Pick Waiting for bin."><Opts name="vst" values={["Bin placed", "Waiting for bin"]} initial="Bin placed" onChange={(x) => setWait(x === "Waiting for bin")} /></Field>
        <div className="two">
          <Field id="vType" label="Type"><select id="vType" name="type">{["Bar", "Cafe", "Restaurant", "College", "Hostel", "Hotel / Airbnb", "Shop"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field id="vArea" label="Area"><select id="vArea" name="area"><option value="">Choose area</option>{AREAS.map((a) => <option key={a.id} value={a.id}>{a.n}</option>)}</select></Field>
        </div>
        <Field id="vPin" label={<>Map location <span className="muted">(needed for the route)</span></>} err={errs.pin}><input id="vPin" name="pin" placeholder="Paste a Google Maps link or 30.34, 78.06" /></Field>
        <div className="two">
          <Field id="vAdd" label="Signed on" err={errs.added}><input id="vAdd" name="added" type="date" defaultValue={c.today} /></Field>
          {wait ? <Field id="vProm" label="Bins promised"><input id="vProm" name="promised" type="number" inputMode="numeric" min={1} defaultValue={1} /></Field>
            : <Field id="vBin" label="Bin placed on" err={errs.bin} help="Counting starts from this day."><input id="vBin" name="bin" type="date" defaultValue={c.today} /></Field>}
        </div>
        {!wait && <div className="two">
          <Field id="vSteel" label="Steel bins"><input id="vSteel" name="steel" type="number" min={0} defaultValue={1} /></Field>
          <Field id="vPb" label="Plastic bins"><input id="vPb" name="pb" type="number" min={0} defaultValue={0} /></Field>
        </div>}
        <div className="two">
          <Field id="vRate" label="Payout per can (₹)"><input id="vRate" name="rate" type="number" step="any" defaultValue={c.set.canRate} /></Field>
          <Field id="vPr" label="Plastic payout (₹/kg)"><input id="vPr" name="pr" type="number" step="any" defaultValue={c.set.plasticBuy} /></Field>
        </div>
        <div className="two">
          <Field id="vC" label="Contact name"><input id="vC" name="c" /></Field>
          <Field id="vPh" label="Phone"><input id="vPh" name="ph" type="tel" inputMode="tel" /></Field>
        </div>
        <BroughtBy id="vBy" />
      </>}
    </FormModal>
  );
}

export function BinChangeForm({ venueId }: { venueId?: number }) {
  const c = usePanel();
  return (
    <FormModal title="Record bin change" onSave={async (fd): Promise<Errs | void | false> => {
      if (!fd.get("venue_id")) return { venue_id: "Type the venue name and pick it from the list." };
      const v = c.vmap.get(Number(fd.get("venue_id")))!; const sign = fd.get("dir") === "Taken back" ? -1 : 1; const d = String(fd.get("d") || c.today);
      const steel = sign < 0 ? Math.min(v.steel, Number(fd.get("steel")) || 0) : Number(fd.get("steel")) || 0;
      const pb = sign < 0 ? Math.min(v.plastic_bins, Number(fd.get("pb")) || 0) : Number(fd.get("pb")) || 0;
      if (!steel && !pb) return { steel: sign < 0 ? `${v.name} has ${v.steel} steel and ${v.plastic_bins} plastic bins.` : "Enter at least 1 bin." };
      const vals: Partial<Venue> = { steel: v.steel + sign * steel, plastic_bins: v.plastic_bins + sign * pb };
      if (sign > 0 && (!v.bin_since || bins(v) === 0)) Object.assign(vals, { bin_since: d, bin_est: false });
      if (sign > 0 && v.status === "Waiting") Object.assign(vals, { status: "Active", promised: 0 });
      const { data: b, error } = await c.db.from("bin_log").insert({ d, venue_id: v.id, change: sign, steel, plastic: pb }).select().single();
      if (c.fail(error)) return false;
      if (!(await saveVenueRow(c, v.id, vals))) return false;
      c.patch((x) => ({ ...x, binlog: [...x.binlog, b as typeof x.binlog[number]] }));
      // bins taken back go to the spare count at the godown; bins placed come out of it
      const { data: sp } = await c.db.rpc("adjust_spare", { d_steel: -sign * steel, d_plastic: -sign * pb }); if (sp) c.patch((x) => ({ ...x, spare: sp }));
      await c.logIt(sign > 0 ? "Placed" : "Took back", "Bins", `${v.name} · ${steel} steel, ${pb} plastic`, "", { table: "venues", id: v.id });
      c.toast(`Bins updated at ${v.name}`);
    }}>
      {(errs) => <>
        <VenuePicker id="bVen" initial={venueId} err={errs.venue_id} />
        <Field label="Change"><Opts name="dir" values={["Placed", "Taken back"]} initial="Placed" /></Field>
        <div className="two">
          <Field id="bSteel" label="Steel bins" err={errs.steel}><input id="bSteel" name="steel" type="number" min={0} defaultValue={1} inputMode="numeric" /></Field>
          <Field id="bPl" label="Plastic bins"><input id="bPl" name="pb" type="number" min={0} defaultValue={0} inputMode="numeric" /></Field>
        </div>
        <Field id="bDate" label="Date" help="Bins taken back go to the spare count at the godown. Bins placed come out of it."><input id="bDate" name="d" type="date" defaultValue={c.today} max={c.today} /></Field>
      </>}
    </FormModal>
  );
}

export function DatesForm({ v }: { v: Venue }) {
  const c = usePanel();
  return (
    <FormModal title={"Dates for " + v.name} onSave={async (fd) => {
      const a = String(fd.get("added")) || null, b = String(fd.get("bin")) || null;
      if (bins(v) > 0 && !b) return { bin: "Enter the day the bin was placed." };
      if (a && b && b < a) return { bin: "The bin can't be placed before the venue was added." };
      const next = await saveVenueRow(c, v.id, { added: a, added_est: false, bin_since: b, bin_est: false }); if (!next) return false;
      await c.logIt("Edited", "Venue dates", v.name, `Added ${a ? dnice(a) : "–"} · Bin ${b ? dnice(b) : "–"}`, { table: "venues", id: v.id });
      c.toast("Dates saved. Counting updated.");
    }}>
      {(errs) => <>
        <Field id="dAdd" label="Added to the list on" help="The day you signed them up."><input id="dAdd" name="added" type="date" defaultValue={v.added ?? ""} /></Field>
        <Field id="dBin" label="Bin placed on" err={errs.bin} help="Cans per bin is counted from this day. Pickups before it are not counted."><input id="dBin" name="bin" type="date" defaultValue={v.bin_since ?? ""} /></Field>
      </>}
    </FormModal>
  );
}


