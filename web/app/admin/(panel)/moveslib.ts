"use client";
import type { PanelCtxT } from "./Panel";
import type { BinChange, LogRow, Venue } from "@/lib/admin/logic";
import type { Move, Spare } from "@/lib/admin/moves";
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

// One database step does the whole move (the venue's bins, the spare count, the bin log, the move itself and the history line), all or nothing.
// The move is locked while it runs, so a second tap or another phone finds it already done.
async function carryOut(c: C, t: Move, d: string) {
  const { data, error } = await c.db.rpc("do_bin_move", { p_move: t.id, p_d: d });
  if (c.fail(error)) return false;
  const r = data as { result: string; have?: number; move?: Move; venue?: Venue; spare?: Spare; binlog?: BinChange; log?: LogRow };
  if (r.result === "gone") { c.toast("This bin move was already done or cancelled. Reloading."); await c.reload(); return false; }
  if (r.result === "nospare") { const have = r.have ?? 0; c.toast(`Only ${have} spare bin${have === 1 ? "" : "s"} at the godown. Take bins back first, or add bins you bought.`); return false; }
  c.patch((x) => ({ ...x, venues: x.venues.map((y) => (y.id === r.venue!.id ? r.venue! : y)), moves: x.moves.map((m) => (m.id === t.id ? r.move! : m)),
    spare: r.spare!, binlog: [...x.binlog, r.binlog!], log: [r.log!, ...x.log] }));
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
