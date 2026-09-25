"use client";
import type { PanelCtxT } from "./Panel";
import type { Venue } from "@/lib/admin/logic";
import { type Move, binsTxt } from "@/lib/admin/moves";
import { dnice, monthDays, monthOf, shiftMonth } from "@/lib/admin/logic";

type C = PanelCtxT;
export const snoozeEnd = (today: string) => { const nm = shiftMonth(monthOf(today), 1); return nm + "-" + String(monthDays(nm)).padStart(2, "0"); };

async function venueUpdate(c: C, v: Venue, vals: Partial<Venue>) {
  const { data, error } = await c.db.from("venues").update(vals).eq("id", v.id).select().single();
  if (c.fail(error)) return null; c.patch((d) => ({ ...d, venues: d.venues.map((x) => (x.id === v.id ? (data as Venue) : x)) })); return data as Venue;
}
async function spare(c: C, dSteel: number, dPl: number) {
  const { data, error } = await c.db.rpc("adjust_spare", { d_steel: dSteel, d_plastic: dPl });
  if (!c.fail(error) && data) c.patch((d) => ({ ...d, spare: data }));
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

// Carry out one move: bins change at the venue, the spare count follows, and it's logged.
export async function doMove(c: C, t: Move, d = c.today) {
  const v = c.vmap.get(t.venue_id)!;
  if (t.kind === "pull") {
    const pb = Math.min(t.plastic, v.plastic_bins), steel = Math.min(t.steel, v.steel);
    const left = v.steel - steel + v.plastic_bins - pb;
    if (!(await venueUpdate(c, v, { steel: v.steel - steel, plastic_bins: v.plastic_bins - pb, ...(left === 0 ? { status: "Paused" as const } : { cut_on: d }) }))) return false;
    await spare(c, steel, pb);
    await c.db.from("bin_log").insert({ d, venue_id: v.id, change: -1, steel, plastic: pb, note: "Bin move" });
    await c.logIt("Took back", "Bins", `${v.name} · ${binsTxt(steel, pb)}${left === 0 ? " · venue paused" : ""}`, "", { table: "venues", id: v.id });
  } else {
    const have = c.spare.steel + c.spare.plastic;
    if (have < t.n) { c.toast(`Only ${have} spare bin${have === 1 ? "" : "s"} at the godown. Take bins back first, or add bins you bought.`); return false; }
    const steel = Math.min(c.spare.steel, t.n), pb = t.n - steel;
    const vals: Partial<Venue> = { steel: v.steel + steel, plastic_bins: v.plastic_bins + pb, ...(v.status === "Waiting" ? { status: "Active" as const, bin_since: d, bin_est: false, promised: 0 } : {}) };
    if (!(await venueUpdate(c, v, vals))) return false;
    await spare(c, -steel, -pb);
    await c.db.from("bin_log").insert({ d, venue_id: v.id, change: 1, steel, plastic: pb, note: "Bin move" });
    await c.logIt("Placed", "Bins", `${v.name} · ${binsTxt(steel, pb)}`, "", { table: "venues", id: v.id });
  }
  const { data, error } = await c.db.from("bin_moves").update({ status: "done", done_on: d, done_by: c.me.name }).eq("id", t.id).select().single();
  if (!c.fail(error)) c.patch((x) => ({ ...x, moves: x.moves.map((m) => (m.id === t.id ? (data as Move) : m)) }));
  const { data: bl } = await c.db.from("bin_log").select("*").eq("venue_id", v.id).order("id", { ascending: false }).limit(1);
  if (bl?.[0]) c.patch((x) => ({ ...x, binlog: [...x.binlog.filter((b) => b.id !== bl[0].id), bl[0]] }));
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
