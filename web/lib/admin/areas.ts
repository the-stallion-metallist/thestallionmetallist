// Areas: which venues were collected this week (Mon–Sun), which have cans waiting, and which area to go to next.
// Pure functions: no database or browser code.
import { AREAS, type Pickup, type Settings, type Venue, addDays, daysBetween } from "./logic";
import { holdOf } from "./growth";

export type Pin = [number, number];
export const pinOf = (v: Venue): Pin | null => (v.lat != null && v.lng != null ? [Number(v.lat), Number(v.lng)] : null);
export const kmBetween = (a: Pin, b: Pin) => { const r = Math.PI / 180, dA = (b[0] - a[0]) * r, dO = (b[1] - a[1]) * r; const x = Math.sin(dA / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dO / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
export const mondayOf = (d: string) => addDays(d, -((new Date(d + "T00:00:00").getDay() + 6) % 7));

// A venue's cans a week over the last 4 weeks (or since its bin went out, at least a 14-day window). mine = its pickups.
export function weeklyCans(v: Venue, mine: Pickup[], today: string) {
  const from = addDays(today, -27), start = v.bin_since && v.bin_since > from ? v.bin_since : from;
  const cans = mine.filter((p) => !p.deleted && p.d >= start && p.d <= today).reduce((a, p) => a + p.cans, 0);
  return (cans / Math.max(daysBetween(start, today) + 1, 14)) * 7;
}

// A venue turns amber ("due") when this many cans are likely waiting (Settings → "Due at", 40 when not set).
export const dueAt = (set: Settings) => (set.otwCans != null && set.otwCans > 0 ? set.otwCans : 40);

// done = collected this week · full = bins likely full · due = enough cans waiting to be worth the stop
// low = a few cans only · new = no pickup yet, so nothing to estimate from
export type VState = "done" | "full" | "due" | "low" | "new";
export type VRow = { v: Venue; st: VState; pin: Pin | null; last: string | null; ago: number | null; pace: number; hold: number; cans: number; onCall: boolean };
export type AreaRow = { id: string | null; name: string; rows: VRow[]; done: number; due: number; full: number; cans: number; centre: Pin | null };

export function areaBoard(venues: Venue[], byV: Map<number, Pickup[]>, set: Settings, today: string) {
  const mon = mondayOf(today), due = dueAt(set);
  // venues on the round: active with bins out
  const rows: VRow[] = venues.filter((v) => !v.deleted && v.status === "Active" && v.steel + v.plastic_bins > 0).map((v) => {
    const mine = (byV.get(v.id) ?? []).filter((p) => !p.deleted && p.d <= today), last = mine.length ? mine[mine.length - 1].d : null;
    const ago = last ? daysBetween(last, today) : null, pace = weeklyCans(v, mine, today) / 7, hold = holdOf(v, set);
    const est = ago == null ? null : pace * ago, waiting = est == null ? 0 : Math.round(hold ? Math.min(est, hold) : est);
    const st: VState = last && last >= mon ? "done" : est == null ? "new" : hold && est >= hold ? "full" : est >= due ? "due" : "low";
    return { v, st, pin: pinOf(v), last, ago, pace, hold, cans: st === "done" ? 0 : waiting, onCall: v.visit === "call" };
  });
  const groups = [...AREAS.map((a) => ({ id: a.id as string | null, name: a.n })), { id: null, name: "Area not set" }];
  const areas: AreaRow[] = groups.map((g) => {
    const rs = rows.filter((r) => (r.v.area ?? null) === g.id).sort((a, b) => b.cans - a.cans || a.v.name.localeCompare(b.v.name));
    const count = rs.filter((r) => !r.onCall), pins = rs.map((r) => r.pin).filter(Boolean) as Pin[];
    return {
      id: g.id, name: g.name, rows: rs,
      done: rs.filter((r) => r.st === "done").length,
      due: count.filter((r) => r.st === "due" || r.st === "full").length,
      full: count.filter((r) => r.st === "full").length,
      cans: count.reduce((a, r) => a + r.cans, 0), // on-request venues never count toward going there
      centre: pins.length ? ([pins.reduce((a, p) => a + p[0], 0) / pins.length, pins.reduce((a, p) => a + p[1], 0) / pins.length] as Pin) : null,
    };
  }).filter((a) => a.rows.length)
    .sort((a, b) => b.cans - a.cans || b.due - a.due || a.name.localeCompare(b.name));
  const next = areas.find((a) => a.id && a.due > 0) ?? null; // "Go next": most cans waiting among areas with venues due
  return { rows, areas, next, week: { from: mon, to: addDays(mon, 6) } };
}

// Other areas with venues due, nearest first (by the middle of each area's pins).
export function nearbyAreas(a: AreaRow, all: AreaRow[]) {
  if (!a.centre) return [];
  return all.filter((x) => x.id && x.id !== a.id && x.centre && x.due > 0).map((x) => ({ a: x, km: kmBetween(a.centre!, x.centre!) })).sort((p, q) => p.km - q.km);
}
