// Growth: cans waiting at a venue now, cans lost to full bins, and the week-by-week trend.
import { DATA_START, addDays, collectionDays, daysBetween, inP, type Period, type Pickup, type Settings, type Trip, type Venue } from "./logic";
import { weeklyCans } from "./routes";

export const FULL_AT = 0.9; // a pickup that brings back 90% of what the bins hold means the bins were full
export const holdOf = (v: Venue, set: Settings) => v.steel * (set.capSteel || 150) + v.plastic_bins * (set.capPl || 150);

// Last collection, cans a day over the last 4 weeks (same pace as the route planner) and the cans likely waiting today.
// mine = the venue's pickups, oldest first.
export function waiting(v: Venue, mine: Pickup[], set: Settings, today: string) {
  const past = mine.filter((x) => x.d <= today), last = past.length ? past[past.length - 1].d : null;
  const pace = weeklyCans(v, past, today) / 7, hold = holdOf(v, set), ago = last ? daysBetween(last, today) : null;
  const est = ago == null ? null : pace * ago;
  return { last, ago, pace, hold, est, full: hold > 0 && est != null && est >= hold };
}

// Cans lost: only when a pickup came back full. Lost = cans a day (last 4 weeks up to that pickup) × days since the
// previous pickup − what the bins hold. Uses today's bin count.
export type Lost = { d: string; prev: string; cans: number; exp: number; lost: number };
export function lostCans(v: Venue, mine: Pickup[], set: Settings, p?: Period) {
  const hold = holdOf(v, set), out: Lost[] = []; if (!hold) return out;
  const days = [...mine.reduce((m, x) => m.set(x.d, (m.get(x.d) ?? 0) + x.cans), new Map<string, number>())].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  days.forEach(([d, cans], i) => {
    const prev = i ? days[i - 1][0] : v.bin_since && v.bin_since < d ? v.bin_since : null;
    if (!prev || cans < FULL_AT * hold || (p && !inP(d, p))) return;
    const exp = (weeklyCans(v, mine, d) / 7) * daysBetween(prev, d);
    out.push({ d, prev, cans, exp, lost: Math.max(0, exp - hold) });
  });
  return out;
}
// profit missed on a lost can: what it sells for minus what the venue would have been paid
export const canMargin = (v: Venue, set: Settings) => set.ubcRate / set.cansPerKg - Number(v.can_rate);

// Mon–Sun weeks since the data starts: venue cans, venues giving cans, venue visits and diesel (from collection days).
export type Week = { start: string; end: string; cans: number; venues: number; visits: number; diesel: number; days: number; partial: boolean };
const monday = (d: string) => addDays(d, -((new Date(d + "T00:00:00Z").getUTCDay() + 6) % 7));
export function weeks(pickups: Pickup[], trips: Trip[], set: Settings, today: string) {
  const from = DATA_START + "-01", out: Week[] = [], seen = new Map<string, Set<number>>();
  for (let s = monday(from); s <= today; s = addDays(s, 7)) { const e = addDays(s, 6); out.push({ start: s, end: e, cans: 0, venues: 0, visits: 0, diesel: 0, days: 0, partial: s < from || e > today }); seen.set(s, new Set()); }
  const at = new Map(out.map((w) => [w.start, w]));
  for (const g of collectionDays(pickups, trips, set)) {
    const w = at.get(monday(g.d)); if (!w || !g.picks.length) continue;
    w.cans += g.cans; w.visits += g.venues; w.diesel += g.diesel; w.days++;
    for (const x of g.picks) seen.get(w.start)!.add(x.venue_id!);
  }
  for (const w of out) w.venues = seen.get(w.start)!.size;
  return out; // oldest first
}
