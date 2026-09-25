"use client";
// Forms for money, trips, sales, staff and venue payments (ported from the approved mockup).
import { useState } from "react";
import { usePanel, type PanelCtxT } from "./Panel";
import { FormModal, Field, Opts, VenuePicker, diffs, metaOf, vname, type Errs } from "./forms";
import {
  type Advance, type Expense, type Payment, type Sale, type Trip, CATS, FUEL_RS_PER_L, ITEMS, dnice, fmt, itemLabel, kg, lastUnitCost, monthLabel, rs, rsu, staffDue,
} from "@/lib/admin/logic";

type C = PanelCtxT;
type Table = "payments" | "expenses" | "sales" | "trips" | "advances";
const KEY: Record<Table, keyof C> = { payments: "payments", expenses: "expenses", sales: "sales", trips: "trips", advances: "advances" };
const WHAT: Record<Table, string> = { payments: "Payment", expenses: "Expense", sales: "Sale", trips: "Trip", advances: "Advance" };
type Row = { id: number; deleted: boolean };
const R = (x: unknown) => x as Record<string, unknown>;

// Insert or update one row, keep the screen in step, and write the history line.
export async function saveRow<T extends Row>(c: C, table: Table, vals: Partial<T>, label: (r: T) => string, rec?: T, fields?: [keyof T, string, ((x: never) => string)?][], note = "") {
  if (rec) {
    const { data, error } = await c.db.from(table).update(vals as Record<string, unknown>).eq("id", rec.id).select().single();
    if (c.fail(error)) return null;
    const next = data as T; c.patch((d) => ({ ...d, [KEY[table]]: (d[KEY[table] as keyof typeof d] as unknown as T[]).map((x) => (x.id === rec.id ? next : x)) }));
    const ch = fields ? diffs(R(rec), R(next), fields as never) : "";
    if (ch) { await c.logIt("Edited", WHAT[table], label(next), ch, { table, id: rec.id }); c.toast(`${WHAT[table]} updated`); }
    return next;
  }
  const { data, error } = await c.db.from(table).insert(vals as Record<string, unknown>).select().single();
  if (c.fail(error)) return null;
  const row = data as T; c.patch((d) => ({ ...d, [KEY[table]]: [...(d[KEY[table] as keyof typeof d] as unknown as T[]), row] }));
  await c.logIt("Added", WHAT[table], label(row), note, { table, id: row.id });
  return row;
}
// Soft delete with a 5-second Undo; restorable later from Change history.
export async function softDelete<T extends Row>(c: C, table: Table, rec: T, label: string) {
  const set = async (deleted: boolean) => {
    const { error } = await c.db.from(table).update({ deleted }).eq("id", rec.id);
    if (c.fail(error)) return false;
    c.patch((d) => ({ ...d, [KEY[table]]: (d[KEY[table] as keyof typeof d] as unknown as T[]).map((x) => (x.id === rec.id ? { ...x, deleted } : x)) }));
    await c.logIt(deleted ? "Deleted" : "Restored", WHAT[table], label, "", { table, id: rec.id });
    return true;
  };
  if (await set(true)) c.toast(`${WHAT[table]} deleted`, async () => { if (await set(false)) c.toast(`${WHAT[table]} restored`); });
}
export async function restoreRow(c: C, table: string, id: number) {
  const { error } = await c.db.from(table).update({ deleted: false }).eq("id", id);
  if (c.fail(error)) return;
  if (table === "pickups") await c.db.from("payments").update({ deleted: false }).eq("pickup_id", id);
  await c.reload(); await c.logIt("Restored", table === "pickups" ? "Pickup" : WHAT[table as Table] ?? table, `#${id}`, "", { table, id }); c.toast("Restored");
}

// ---------- venue payments ----------
const owedInfo = (c: C, vid: number) => { const v = c.vmap.get(vid)!, s = c.pay(v); return s.owed > 0 ? `${v.name} is owed ${rs(s.owed)} for ${s.unpaidN} pickup${s.unpaidN === 1 ? "" : "s"}, oldest from ${dnice(s.oldest!)}.${v.upi ? ` UPI: ${v.upi}` : ""}` : `${v.name} is paid up.${v.upi ? ` UPI: ${v.upi}` : ""}`; };
const payLabel = (c: C) => (p: Payment) => `${vname(c, p.venue_id)} · ${rs(Number(p.amount))}`;
export function EditPayment({ rec, venueId }: { rec?: Payment; venueId?: number }) {
  const c = usePanel(); const v0 = rec ? rec.venue_id : venueId;
  const [info, setInfo] = useState(v0 != null ? owedInfo(c, v0) : "Pick the venue you paid.");
  const [amt, setAmt] = useState(rec ? String(rec.amount) : v0 != null && c.pay(c.vmap.get(v0)!).owed > 0 ? String(c.pay(c.vmap.get(v0)!).owed) : "");
  return (
    <FormModal title={rec ? "Edit payment" : "Pay venue"} saveLabel={rec ? "Save" : "Save payment"} meta={rec ? metaOf(rec) : undefined}
      onDelete={rec ? () => softDelete(c, "payments", rec, payLabel(c)(rec)) : undefined}
      onSave={async (fd) => {
        const e: Errs = {}; if (!fd.get("venue_id")) e.venue_id = "Type the venue name and pick it from the list.";
        if (!(Number(fd.get("amt")) > 0)) e.amt = "Enter the amount you paid, more than ₹0."; if (Object.keys(e).length) return e;
        const vals = { venue_id: Number(fd.get("venue_id")), amount: Number(fd.get("amt")), d: String(fd.get("d") || c.today), mode: String(fd.get("mode") || "UPI"), note: String(fd.get("note")) };
        const before = c.pay(c.vmap.get(vals.venue_id)!).owed;
        const row = await saveRow<Payment>(c, "payments", vals, payLabel(c), rec, [["venue_id", "Venue", ((x: number) => vname(c, x)) as never], ["amount", "Amount", rs as never], ["d", "Date", dnice as never], ["mode", "Paid by"], ["note", "Note"]]);
        if (!row) return false;
        if (!rec) { const left = Math.max(0, before - Number(row.amount)); c.toast(`${rs(Number(row.amount))} paid to ${vname(c, row.venue_id)}. ${left ? rs(left) + " still owed." : "Paid up."}`); }
      }}>
      {(errs) => <>
        <VenuePicker id="yVen" initial={v0} err={errs.venue_id} onPick={(v) => { setInfo(owedInfo(c, v.id)); if (!rec) { const o = c.pay(v).owed; setAmt(o > 0 ? String(o) : ""); } }} />
        <p className="help" style={{ margin: "-6px 0 12px", fontSize: 12.5, color: "var(--muted)" }}>{info}</p>
        <div className="two">
          <Field id="yAmt" label="Amount (₹)" err={errs.amt}><input id="yAmt" name="amt" type="number" inputMode="numeric" min={1} value={amt} onChange={(e) => setAmt(e.target.value)} /></Field>
          <Field id="yD" label="Date"><input id="yD" name="d" type="date" defaultValue={rec?.d ?? c.today} max={c.today} /></Field>
        </div>
        <Field label="Paid by"><Opts name="mode" values={["Cash", "UPI", "Bank"]} initial={rec?.mode ?? "UPI"} /></Field>
        <Field id="yNote" label={<>Note <span className="muted">(optional)</span></>}><input id="yNote" name="note" defaultValue={rec?.note ?? ""} placeholder="e.g. UPI ref 4821" /></Field>
      </>}
    </FormModal>
  );
}

// ---------- expenses ----------
const expLabel = (c: C) => (e: Expense) => `${e.category === "Salaries" ? "Salary · " + (c.staff.find((s) => s.id === e.staff_id)?.name ?? "") : e.qty ? itemLabel(e) : e.category} · ${rs(Number(e.amount))}`;
export function EditExpense({ rec, preset }: { rec?: Expense; preset?: Partial<Expense> }) {
  const c = usePanel(); const r = rec ?? preset ?? {};
  const [cat, setCat] = useState<string>(r.category ?? "Salaries"); const [item, setItem] = useState(r.item || "Steel bin");
  const [qty, setQty] = useState(r.qty ? String(r.qty) : ""); const [amt, setAmt] = useState(r.amount ? String(r.amount) : "");
  const [staffId, setStaffId] = useState(r.staff_id ? String(r.staff_id) : "");
  const mo = (r.d ?? c.today).slice(0, 7);
  const due = staffId ? (() => { const s = c.staff.find((x) => x.id === +staffId)!; const d = staffDue(s, mo, c.marks, c.advances, c.expenses); return d.earned == null ? `No monthly salary set for ${s.name} yet. Set it on the Staff page, or type the amount.` : `${s.name}: ${rs(d.earned)} earned for ${d.days} days, minus ${rs(d.adv)} advances${d.paid ? ` and ${rs(d.paid)} already paid` : ""} = ${rs(d.pay!)} to pay.`; })() : "Their salary for this month comes from the Staff page.";
  const unit = item === "Garbage bags" ? "bag" : item === "Other" ? "item" : "bin", prev = lastUnitCost(c.expenses, item);
  const each = cat !== "Bins & bags" ? "" : +qty > 0 && +amt > 0 ? `= ${rsu(+amt / +qty)} per ${unit}${prev ? ` · last time ${rsu(prev)}` : ""}` : prev ? `Last time you paid ${rsu(prev)} per ${unit}` : "Cost per item is worked out for you";
  return (
    <FormModal title={rec ? "Edit expense" : "Add expense"} meta={rec ? metaOf(rec) : undefined} onDelete={rec ? () => softDelete(c, "expenses", rec, expLabel(c)(rec)) : undefined}
      onSave={async (fd) => {
        const e: Errs = {}; if (!(Number(fd.get("amt")) > 0)) e.amt = "Enter the amount.";
        if (cat === "Salaries" && !fd.get("staff")) e.staff = "Choose who you paid.";
        if (cat === "Bins & bags") { if (!(Number(fd.get("qty")) > 0)) e.qty = "Enter how many you bought."; if (item === "Other" && !String(fd.get("other")).trim()) e.other = "Name the item."; }
        if (Object.keys(e).length) return e;
        const isBin = cat === "Bins & bags";
        const vals = { d: String(fd.get("d") || c.today), category: cat as Expense["category"], staff_id: cat === "Salaries" ? Number(fd.get("staff")) : null, amount: Number(fd.get("amt")), note: String(fd.get("note")), mode: String(fd.get("mode") || "UPI"),
          item: isBin ? item : "", other: isBin ? String(fd.get("other") || "") : "", qty: isBin ? Number(fd.get("qty")) : 0 };
        const row = await saveRow<Expense>(c, "expenses", vals, expLabel(c), rec, [["d", "Date", dnice as never], ["category", "Category"], ["item", "Item"], ["qty", "How many"], ["amount", "Amount", rs as never], ["note", "Note"], ["mode", "Paid by"]]);
        if (!row) return false;
        if (!rec) {
          const newBins = isBin && (item === "Steel bin" || item === "Plastic bin");
          if (newBins) { const { data } = await c.db.rpc("adjust_spare", { d_steel: item === "Steel bin" ? row.qty : 0, d_plastic: item === "Plastic bin" ? row.qty : 0 }); if (data) c.patch((d) => ({ ...d, spare: data })); }
          c.toast(cat === "Salaries" ? `Salary paid to ${c.staff.find((s) => s.id === row.staff_id)?.name} added` : isBin ? `${itemLabel(row)} added at ${rsu(Number(row.amount) / row.qty)} each${newBins ? ". Added to spare bins at the godown." : ""}` : "Expense added");
        }
      }}>
      {(errs) => <>
        <div className="two">
          <Field id="eDate" label="Date"><input id="eDate" name="d" type="date" defaultValue={r.d ?? c.today} max={c.today} /></Field>
          <Field id="eCat" label="Category"><select id="eCat" value={cat} onChange={(e) => setCat(e.target.value)}>{CATS.map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        {cat === "Salaries" && <Field id="eStaff" label="Paid to" err={errs.staff} help={due}>
          <select id="eStaff" name="staff" value={staffId} onChange={(e) => { setStaffId(e.target.value); const s = c.staff.find((x) => x.id === +e.target.value); if (s && !amt) { const d = staffDue(s, mo, c.marks, c.advances, c.expenses); if (d.pay) setAmt(String(d.pay)); } }}>
            <option value="">Choose staff member</option>{c.staff.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>}
        {cat === "Bins & bags" && <>
          <Field label="What did you buy?"><Opts name="item" values={ITEMS} initial={item} onChange={(v) => v && setItem(v)} /></Field>
          {item === "Other" && <Field id="eOther" label="Item name" err={errs.other}><input id="eOther" name="other" defaultValue={r.other ?? ""} placeholder="e.g. Gloves, weighing scale" /></Field>}
          <Field id="eQty" label="How many" err={errs.qty}><input id="eQty" name="qty" type="number" inputMode="numeric" min={1} placeholder="e.g. 6" value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
        </>}
        <div className="two">
          <Field id="eAmt" label={cat === "Bins & bags" ? "Total paid (₹)" : "Amount (₹)"} err={errs.amt} help={each}><input id="eAmt" name="amt" type="number" inputMode="numeric" min={0} placeholder="e.g. 12000" value={amt} onChange={(e) => setAmt(e.target.value)} /></Field>
          <Field id="eNote" label={<>Note <span className="muted">(optional)</span></>}><input id="eNote" name="note" defaultValue={r.note ?? ""} placeholder={cat === "Salaries" ? `e.g. ${monthLabel(mo)} salary` : cat === "Bins & bags" ? "e.g. From Paltan Bazaar" : "e.g. Godown rent"} /></Field>
        </div>
        <Field label="Paid by"><Opts name="mode" values={["Cash", "UPI", "Bank"]} initial={r.mode ?? "UPI"} /></Field>
      </>}
    </FormModal>
  );
}

// ---------- sales ----------
const saleLabel = (s: Sale) => `${s.code} · ${s.buyer} · ${kg(Number(s.kg))} kg`;
export function EditSale({ rec }: { rec?: Sale }) {
  const c = usePanel();
  return (
    <FormModal title={rec ? "Edit sale " + rec.code : "Record sale"} meta={rec ? metaOf(rec) : undefined} onDelete={rec ? () => softDelete(c, "sales", rec, saleLabel(rec)) : undefined}
      onSave={async (fd) => {
        const e: Errs = {}; if (!String(fd.get("buyer")).trim()) e.buyer = "Enter the buyer."; if (!(Number(fd.get("kg")) > 0)) e.kg = "Enter the weight sold."; if (Object.keys(e).length) return e;
        const next = Math.max(0, ...c.sales.map((s) => +s.code.slice(2) || 0)) + 1;
        const vals = { d: String(fd.get("d")), buyer: String(fd.get("buyer")).trim(), material: String(fd.get("mat") || "UBC") as Sale["material"], kg: Number(fd.get("kg")), rate: Number(fd.get("rate")), transport: Number(fd.get("tr")) || 0, paid_on: String(fd.get("paid")) || null,
          ...(rec ? {} : { code: "S-" + String(next).padStart(3, "0") }) };
        const row = await saveRow<Sale>(c, "sales", vals, saleLabel, rec, [["d", "Date", dnice as never], ["buyer", "Buyer"], ["material", "Material"], ["kg", "Kg"], ["rate", "Rate"], ["transport", "Transport", rs as never], ["paid_on", "Received on", dnice as never]]);
        if (!row) return false; if (!rec) c.toast("Sale recorded. Stock updated.");
      }}>
      {(errs) => <>
        <div className="two">
          <Field id="sDate" label="Date"><input id="sDate" name="d" type="date" defaultValue={rec?.d ?? c.today} max={c.today} /></Field>
          <Field id="sBuyer" label="Buyer" err={errs.buyer}><input id="sBuyer" name="buyer" placeholder="Buyer name" defaultValue={rec?.buyer ?? ""} /></Field>
        </div>
        <Field label="Material"><Opts name="mat" values={["UBC", "Plastic"]} initial={rec?.material ?? "UBC"} /></Field>
        <div className="two">
          <Field id="sKg" label="Weight (kg)" err={errs.kg}><input id="sKg" name="kg" type="number" step="any" inputMode="decimal" min={0} defaultValue={rec?.kg ?? ""} /></Field>
          <Field id="sRate" label="Rate (₹/kg)"><input id="sRate" name="rate" type="number" step="any" inputMode="decimal" defaultValue={rec?.rate ?? c.set.ubcRate} /></Field>
        </div>
        <div className="two">
          <Field id="sTr" label="Transport cost (₹)"><input id="sTr" name="tr" type="number" inputMode="numeric" min={0} defaultValue={rec?.transport ?? 0} /></Field>
          <Field id="sPaid" label={<>Payment received on <span className="muted">(leave empty if waiting)</span></>}><input id="sPaid" name="paid" type="date" defaultValue={rec?.paid_on ?? ""} /></Field>
        </div>
      </>}
    </FormModal>
  );
}

// ---------- trips ----------
export const tripLabel = (t: Trip) => `${t.code} · ${t.vehicle} · ${t.driver}`;
export const tripCode = (c: C, d: string) => { const id = "T-" + d.slice(5).replace("-", ""); let k = 0; while (c.trips.some((t) => t.code === id + (k ? String.fromCharCode(96 + k) : ""))) k++; return id + (k ? String.fromCharCode(96 + k) : ""); };
const lastKm = (c: C) => Math.max(0, ...c.trips.filter((t) => !t.deleted).map((t) => t.km_end));
export function TripFields({ r, errs, drivers }: { r: Partial<Trip>; errs: Errs; drivers?: string[] }) {
  const c = usePanel();
  return <>
    <div className="two">
      <Field id="tDate" label="Date"><input id="tDate" name="d" type="date" defaultValue={r.d ?? c.today} max={c.today} /></Field>
      <Field id="tVeh" label="Vehicle"><select id="tVeh" name="veh" defaultValue={r.vehicle ?? "Tata Ace"}>{["Tata Ace", "Scooty"].map((x) => <option key={x}>{x}</option>)}</select></Field>
    </div>
    <Field label="Driver"><Opts name="drv" values={drivers?.length ? drivers : c.staff.filter((s) => s.active).map((s) => s.name)} initial={r.driver ?? (drivers?.[0] ?? "")} /></Field>
    <div className="two">
      <Field id="tK1" label="Start km"><input id="tK1" name="k1" type="number" inputMode="numeric" defaultValue={r.km_start ?? lastKm(c)} /></Field>
      <Field id="tK2" label="End km" err={errs.k2}><input id="tK2" name="k2" type="number" inputMode="numeric" defaultValue={r.km_end ?? ""} /></Field>
    </div>
    <Field id="tFuel" label="Fuel filled (litres)" help={`Costed at ₹${FUEL_RS_PER_L} a litre.`}><input id="tFuel" name="fl" type="number" step="any" inputMode="decimal" min={0} defaultValue={r.fuel_l ?? ""} /></Field>
  </>;
}
export const checkKm = (fd: FormData): Errs => (!fd.get("k2") ? { k2: "Enter the end km reading." } : Number(fd.get("k2")) <= Number(fd.get("k1")) ? { k2: "End km must be more than start km." } : {});
export function EditTrip({ rec }: { rec?: Trip }) {
  const c = usePanel();
  return (
    <FormModal title={rec ? "Edit trip " + rec.code : "Add trip"} meta={rec ? metaOf(rec) : undefined} onDelete={rec ? () => softDelete(c, "trips", rec, tripLabel(rec)) : undefined}
      onSave={async (fd) => {
        const e = checkKm(fd); if (Object.keys(e).length) return e; const fl = Number(fd.get("fl")) || 0, d = String(fd.get("d"));
        const vals = { d, vehicle: String(fd.get("veh")), driver: String(fd.get("drv")), km_start: Number(fd.get("k1")), km_end: Number(fd.get("k2")), stops: Number(fd.get("stops")) || 0, fuel_l: fl, fuel_cost: Math.round(fl * FUEL_RS_PER_L), cans: Number(fd.get("cans")) || 0, ...(rec ? {} : { code: tripCode(c, d) }) };
        const row = await saveRow<Trip>(c, "trips", vals, tripLabel, rec, [["d", "Date", dnice as never], ["vehicle", "Vehicle"], ["driver", "Driver"], ["km_start", "Start km"], ["km_end", "End km"], ["stops", "Stops"], ["fuel_l", "Fuel L"], ["cans", "Cans"]]);
        if (!row) return false; if (!rec) c.toast("Trip added");
      }}>
      {(errs) => <>
        <TripFields r={rec ?? {}} errs={errs} />
        <div className="two">
          <Field id="tStops" label="Stops"><input id="tStops" name="stops" type="number" inputMode="numeric" min={0} defaultValue={rec?.stops ?? ""} /></Field>
          <Field id="tCans" label="Cans collected"><input id="tCans" name="cans" type="number" inputMode="numeric" min={0} defaultValue={rec?.cans ?? ""} /></Field>
        </div>
      </>}
    </FormModal>
  );
}

// ---------- staff advances ----------
export function AddAdvance() {
  const c = usePanel();
  return (
    <FormModal title="Record advance" onSave={async (fd) => {
      if (!(Number(fd.get("amt")) > 0)) return { amt: "Enter the amount." };
      const s = c.staff.find((x) => x.id === Number(fd.get("n")))!;
      const row = await saveRow<Advance>(c, "advances", { staff_id: s.id, amount: Number(fd.get("amt")), d: String(fd.get("d")) }, (a) => `${s.name} · ${rs(Number(a.amount))}`);
      if (!row) return false; c.toast("Advance recorded. It comes off this month's pay.");
    }}>
      {(errs) => <>
        <Field id="aN" label="Staff"><select id="aN" name="n">{c.staff.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <div className="two">
          <Field id="aAmt" label="Amount (₹)" err={errs.amt}><input id="aAmt" name="amt" type="number" inputMode="numeric" min={0} /></Field>
          <Field id="aD" label="Date"><input id="aD" name="d" type="date" defaultValue={c.today} max={c.today} /></Field>
        </div>
      </>}
    </FormModal>
  );
}


// ---------- settings ----------
export async function saveSettings(c: C, changes: Record<string, unknown>, label: string, detail: string) {
  const data = { ...c.set, ...changes };
  const { error } = await c.db.from("settings").update({ data }).eq("id", 1);
  if (c.fail(error)) return false;
  c.patch((d) => ({ ...d, set: data })); await c.logIt("Edited", "Setting", label, detail); return true;
}
export async function saveZones(c: C, zones: C["zones"], label: string, detail = "") {
  const { error } = await c.db.from("plan_state").update({ value: zones }).eq("key", "zones");
  if (c.fail(error)) return false;
  c.patch((d) => ({ ...d, zones })); await c.logIt(label.startsWith("Rebuilt") ? "Rebuilt" : "Edited", "Zones", label.replace(/^Rebuilt /, ""), detail); return true;
}
