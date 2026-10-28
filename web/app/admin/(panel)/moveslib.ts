"use client";
import { type PanelCtxT, warnNext } from "./Panel";
import type { BinChange, Venue } from "@/lib/admin/logic";
import { type Move, binsTxt } from "@/lib/admin/moves";
import { dnice, monthDays, monthOf, shiftMonth } from "@/lib/admin/logic";

type C = PanelCtxT;
export const snoozeEnd = (today: string) => { const nm = shiftMonth(monthOf(today), 1); return nm + "-" + String(monthDays(nm)).padStart(2, "0"); };

async function venueUpdate(c: C, v: Venue, vals: Partial<Venue>) {
  const { data, error } = await c.db.from("venues").update(vals).eq("id", v.id).select().single();
  if (c.fail(error)) return null; c.patch((d) => ({ ...d, venues: d.venues.map((x) => (x.id === v.id ? (data as Venue) : x)) })); return data as Venue;
}
// The spare count at the godown changes inside the database in one step (so two phones can't overwrite each other). One more try if it fails; false = it did not change.
export async function adjustSpare(c: C, dSteel: number, dPl: number) {
  for (let i = 0; i < 2; i++) {
    const { data, error } = await c.db.rpc("adjust_spare", { d_steel: dSteel, d_plastic: dPl });
    if (!error && data) { c.patch((d) => ({ ...d, spare: data })); return true; }
  }
  return false;
}

// Add every suggested move to the routes.
export async function planMoves(c: C) {
  const P = c.sug;
  const rows = [
    // every row lists every column: in a batch insert, a column missing from one row would be saved as empty
    ...P.pulls.map((p) => ({ kind: "pull", venue_id: p.v.id, steel: p.steel, plastic: p.pb, n: p.n, last_bin: p.last, after: null, source: "" })),
    ...P.give.map((g) => ({ kind: "place", venue_id: g.v.id, steel: 0, plastic: 0, n: g.n, last_bin: false, after: g.after, source: g.from.join(", ") })),
  ];
  if (!rows.length) return;
  const { data, error } = await c.db.from("bin_moves").insert(rows).select();
  if (c.fail(error)) return;
  c.patch((d) => ({ ...d, moves: [...d.moves, ...(data as Move[])] }));
  await c.logIt("Planned", "Bin moves", `${P.pulls.length} take-back${P.pulls.length === 1 ? "" : "s"} · ${P.give.length} placement${P.give.length === 1 ? "" : "s"}`);
  c.toast(`${rows.length} bin moves added to the routes`);
}

const moving = new Set<number>(); // moves being carried out right now: a second tap on Mark done must not do it twice

// Carry out one move: bins change at the venue, the spare count follows, and it's logged.
export async function doMove(c: C, t: Move, d = c.today) {
  if (moving.has(t.id)) return false;
  moving.add(t.id);
  try { return await carryOut(c, t, d); } finally { moving.delete(t.id); }
}

// The move is claimed first, so only one tap (or one phone) can carry it out; a second one finds it already done.
// If the bins can't be changed the claim is given back and nothing has changed. After the bins change, any step that fails is reported by name.
async function carryOut(c: C, t: Move, d: string) {
  const v = c.vmap.get(t.venue_id)!;
  let steel: number, pb: number, vals: Partial<Venue>, left = 0;
  if (t.kind === "pull") {
    pb = Math.min(t.plastic, v.plastic_bins); steel = Math.min(t.steel, v.steel);
    left = v.steel - steel + v.plastic_bins - pb;
    vals = { steel: v.steel - steel, plastic_bins: v.plastic_bins - pb, ...(left === 0 ? { status: "Paused" as const } : { cut_on: d }) };
  } else {
    const { data: sp } = await c.db.from("spare_bins").select("steel, plastic").eq("id", 1).single(); // the count right now, not this screen's older copy
    const spare = { ...c.spare, ...sp }, have = spare.steel + spare.plastic;
    if (have < t.n) { c.toast(`Only ${have} spare bin${have === 1 ? "" : "s"} at the godown. Take bins back first, or add bins you bought.`); return false; }
    steel = Math.min(spare.steel, t.n); pb = t.n - steel;
    vals = { steel: v.steel + steel, plastic_bins: v.plastic_bins + pb, ...(v.status === "Waiting" ? { status: "Active" as const, bin_since: d, bin_est: false, promised: 0 } : {}) };
  }
  const { data: claimed, error: ce } = await c.db.from("bin_moves").update({ status: "done", done_on: d, done_by: c.me.name }).eq("id", t.id).eq("status", "planned").select();
  if (c.fail(ce)) return false;
  if (!claimed?.length) { c.toast("This bin move was already done or cancelled. Reloading."); await c.reload(); return false; }
  // the venue's bins change only if they are still what this screen showed
  const { data: vr, error: ve } = await c.db.from("venues").update(vals).eq("id", v.id).eq("steel", v.steel).eq("plastic_bins", v.plastic_bins).select();
  if (ve || !vr?.length) {
    await c.db.from("bin_moves").update({ status: "planned", done_on: null, done_by: null }).eq("id", t.id);
    if (ve) c.fail(ve); else { c.toast(`The bins at ${v.name} changed while you were working. Reloading. Check the numbers and try again.`); await c.reload(); }
    return false;
  }
  c.patch((x) => ({ ...x, venues: x.venues.map((y) => (y.id === v.id ? (vr[0] as Venue) : y)), moves: x.moves.map((m) => (m.id === t.id ? (claimed[0] as Move) : m)) }));
  const pull = t.kind === "pull", lost: string[] = [];
  if (!(await adjustSpare(c, pull ? steel : -steel, pull ? pb : -pb))) lost.push("the spare bin count did not change (set it again on Bin moves)");
  const { data: bl, error: be } = await c.db.from("bin_log").insert({ d, venue_id: v.id, change: pull ? -1 : 1, steel, plastic: pb, note: "Bin move" }).select().single();
  if (be || !bl) lost.push("the bin history line was not saved"); else c.patch((x) => ({ ...x, binlog: [...x.binlog, bl as BinChange] }));
  await c.logIt(pull ? "Took back" : "Placed", "Bins", `${v.name} · ${binsTxt(steel, pb)}${pull && left === 0 ? " · venue paused" : ""}`, "", { table: "venues", id: v.id });
  if (lost.length) warnNext(`The bins were moved, but ${lost.join(" and ")}.`);
  return true;
}

export async function setMoveStatus(c: C, t: Move, status: "cancelled" | "planned") {
  const { data, error } = await c.db.from("bin_moves").update({ status }).eq("id", t.id).select().single();
  if (c.fail(error)) return;
  c.patch((x) => ({ ...x, moves: x.moves.map((m) => (m.id === t.id ? (data as Move) : m)) }));
  const v = c.vmap.get(t.venue_id)!;
  await c.logIt(status === "cancelled" ? "Cancelled" : "Restored", "Bin move", `${v.name} · ${t.kind === "pull" ? "take back" : "place"} ${t.n}`);
}

// "Keep for now" on a take-back, "Not now" on a placement: hidden until the end of next month.
export async function snooze(c: C, v: Venue, field: "keep_until" | "skip_give") {
  const until = snoozeEnd(c.today);
  if (!(await venueUpdate(c, v, { [field]: until }))) return;
  await c.logIt(field === "keep_until" ? "Kept" : "Skipped", "Bins", `${v.name} · until ${dnice(until)}`, "", { table: "venues", id: v.id });
  c.toast(`${v.name} ${field === "keep_until" ? "keeps its bins" : "skipped"} until ${dnice(until)}`, async () => { await venueUpdate(c, c.vmap.get(v.id) ?? v, { [field]: null }); });
}

export async function setSpare(c: C, steel: number | null, plastic: number | null) {
  const { data, error } = await c.db.rpc("adjust_spare", { d_steel: 0, d_plastic: 0, set_steel: steel, set_plastic: plastic });
  if (c.fail(error) || !data) return;
  c.patch((d) => ({ ...d, spare: data })); await c.logIt("Edited", "Spare bins", `Steel ${data.steel} · Plastic ${data.plastic}`); c.toast("Spare bins saved");
}
