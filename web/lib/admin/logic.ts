// Team panel logic, ported from the approved mockup (same rules, same numbers).
// Pure functions only: no database or browser code here.

export type Venue = {
  id: number; name: string; type: string | null;
  status: "Active" | "Waiting" | "Paused" | "Pulled";
  area: string | null; area_est: boolean;
  steel: number; plastic_bins: number; bags: boolean; promised: number;
  can_rate: number; plastic_rate: number | null;
  added: string | null; added_est: boolean; bin_since: string | null; bin_est: boolean;
  lat: number | null; lng: number | null; pin_src: string | null; pin_by: string | null; g_name: string | null;
  contact: string | null; phone: string | null; terms: "On the spot" | "Per pickup" | "Monthly"; upi: string | null;
  opening: number | null; keep_until: string | null; skip_give: string | null; cut_on: string | null;
  deleted: boolean; // removed from the panel; past pickups and payments still count
  brought_by: string | null; // who brought the venue in (People screen); null = not set
  created_by: string; updated_by: string | null;
};
export type Pickup = {
  id: number; d: string; venue_id: number | null; cans: number; plastic_kg: number;
  src: "Bin" | "App" | "Walk-in"; staff: string; fill: string; trip: string; deleted: boolean;
  created_at: string; created_by: string; updated_by: string | null;
  app_id?: string | null; app_payout?: number | null; // household pickups copied from the customer app
};
export type BinChange = { id: number; d: string; venue_id: number; change: 1 | -1; steel: number; plastic: number; note: string; created_by: string };
export type Payment = { id: number; d: string; venue_id: number; amount: number; mode: string; note: string; pickup_id: number | null; deleted: boolean; created_by: string };
export type LogRow = { id: number; at: string; who: string; action: string; what: string; label: string; changes: string; ref_table: string | null; ref_id: number | null };
export type Settings = {
  ubcRate: number; cansPerKg: number; plasticSale: number | null; canRate: number; plasticBuy: number;
  add: number; pull: number; grace: number;
  vehCap: number | null; capSteel: number; capPl: number; routeHours: number; stopMin: number; traffic: number; depart: string;
  goLive: string | null;
};

// ---------- dates (India time) ----------
export const DATA_START = "2026-08"; // the Excel starts in August
export const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const todayIST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
export const monthOf = (d: string) => d.slice(0, 7);
export const dnice = (d: string) => { const x = new Date(d + "T00:00:00"); return x.getDate() + " " + MON[x.getMonth()]; };
export const dayName = (d: string) => WD[new Date(d + "T00:00:00").getDay()];
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
export const addDays = (d: string, n: number) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10);
export const monthDays = (mo: string) => new Date(+mo.slice(0, 4), +mo.slice(5, 7), 0).getDate();
export const monthLabel = (mo: string) => MONL[+mo.slice(5, 7) - 1] + " " + mo.slice(0, 4);
export const shiftMonth = (mo: string, n: number) => { const d = new Date(+mo.slice(0, 4), +mo.slice(5, 7) - 1 + n, 1); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); };
export const monthsSince = (from: string, to: string) => { const out: string[] = []; for (let m = from; m <= to; m = shiftMonth(m, 1)) out.push(m); return out; };

export type Period = { key: string; all: boolean; start: string; end: string; label: string; short: string; days: number; asOf: string };
// A month ("2026-09") or "all" (every month since the Excel starts).
export function period(mo: string, today: string): Period {
  if (mo === "all") {
    const s = DATA_START + "-01", e = period(monthOf(today), today).end, n = monthsSince(DATA_START, monthOf(today)).length;
    return { key: "all", all: true, start: s, end: e, label: n === 2 ? `${MONL[+s.slice(5, 7) - 1]} to ${MONL[+e.slice(5, 7) - 1]} ${e.slice(0, 4)}` : `All months since ${MONL[+s.slice(5, 7) - 1]}`,
      short: `${MON[+s.slice(5, 7) - 1]}–${MON[+e.slice(5, 7) - 1]}`, days: daysBetween(s, e) + 1, asOf: today };
  }
  const days = monthDays(mo), start = mo + "-01", end = mo + "-" + String(days).padStart(2, "0");
  return { key: mo, all: false, start, end, label: monthLabel(mo), short: MON[+mo.slice(5, 7) - 1], days, asOf: end < today ? end : today };
}
export const inP = (d: string, p: Period) => d >= p.start && d <= p.end;

// ---------- numbers ----------
export const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
export const rs = (n: number) => (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");
export const rsu = (n: number) => (n < 100 ? "₹" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0) : rs(n));
export const kg = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-IN");
export const bins = (v: Venue) => v.steel + v.plastic_bins;

// ---------- venues ----------
export type State = "add" | "keep" | "pull" | "watch" | "kept" | "waiting" | "new" | "quiet" | "idle" | "nobin" | "later";
export const ST: Record<State, [string, string]> = {
  add: ["Add a bin", "c-add"], keep: ["Keep", "c-keep"], pull: ["Take a bin back", "c-pull"], watch: ["Low this month", "c-new"],
  kept: ["Kept for now", "c-keep"], waiting: ["Waiting for bin", "c-new"], new: ["Too new", "c-new"], quiet: ["Gone quiet", "c-quiet"],
  idle: ["No cans yet", "c-idle"], nobin: ["No bin record", "c-nobin"], later: ["Bin not placed yet", "c-idle"],
};
export type Stats = {
  cans: number; pl: number; all: number; first: string | null; bins: number; cpb: number | null; st: State; n: number;
  picks: { d: string; n: number }[]; since: string | null; days: number; counted: number; age: number | null;
  lowRaw: boolean; prevCpb: number | null; prevKey: string;
};

// Pickups grouped by venue, oldest first, for fast per-venue stats.
export function byVenue(pickups: Pickup[]) {
  const m = new Map<number, Pickup[]>();
  for (const p of pickups) if (!p.deleted && p.venue_id != null) (m.get(p.venue_id) ?? m.set(p.venue_id, []).get(p.venue_id)!).push(p);
  for (const l of m.values()) l.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  return m;
}

// Cans per bin per 30 days, counted from the day the bin was placed, and what to do about it.
// A bin only comes back after 2 low months in a row (low = under the take-back line, or no cans at all).
export function venueStats(v: Venue, p: Period, mine: Pickup[], set: Settings, today: string, noPrev = false): Stats {
  const picks = mine.filter((x) => x.cans > 0).map((x) => ({ d: x.d, n: x.cans }));
  const inM = picks.filter((x) => inP(x.d, p));
  const cans = inM.reduce((a, x) => a + x.n, 0);
  const pl = mine.filter((x) => inP(x.d, p)).reduce((a, x) => a + Number(x.plastic_kg || 0), 0);
  const all = picks.reduce((a, x) => a + x.n, 0);
  const first = picks.length ? picks[0].d : null;
  const b = bins(v), since = v.bin_since;
  const from = since && since > p.start ? since : p.start;
  const days = since && since > p.asOf ? 0 : daysBetween(from, p.asOf) + 1;
  const counted = inM.filter((x) => !since || x.d >= since).reduce((a, x) => a + x.n, 0);
  const cpb = b && days > 0 ? (counted / b) * 30 / days : null;
  const age = since ? daysBetween(since, p.asOf) : null;
  const before = picks.some((x) => x.d < p.start);
  let st: State;
  if (!b && all > 0) st = "nobin";
  else if (!b) st = "idle";
  else if (since && since > p.asOf) st = "later";
  else if (age != null && age < set.grace) st = "new";
  else if (counted === 0) st = before ? "quiet" : "idle";
  else if (cpb! >= set.add) st = "add";
  else if (cpb! < set.pull) st = "pull";
  else st = "keep";
  const base = { cans, pl, all, first, bins: b, cpb, n: inM.length, picks, since, days, counted, age };
  if (p.all) { // all months: numbers for the whole period, the action from the latest month
    const c = venueStats(v, period(monthOf(today), today), mine, set, today);
    return { ...base, st: c.st, lowRaw: c.lowRaw, prevCpb: c.prevCpb, prevKey: c.prevKey };
  }
  const lowRaw = b > 0 && (st === "pull" || st === "quiet" || st === "idle"), pm = shiftMonth(p.key, -1);
  let prevCpb: number | null = null;
  if (v.status === "Waiting") st = "waiting";
  else if (lowRaw && !noPrev) {
    const prev = pm >= DATA_START ? venueStats(v, period(pm, today), mine, set, today, true) : null;
    prevCpb = prev ? prev.cpb || 0 : null;
    if (prev && prev.lowRaw) st = v.keep_until && today <= v.keep_until ? "kept" : "pull";
    else if (st === "pull") st = "watch";
  }
  return { ...base, st, lowRaw, prevCpb, prevKey: pm };
}

export function lowTxt(s: Stats) {
  const a = MON[+s.prevKey.slice(5, 7) - 1], b = MON[+shiftMonth(s.prevKey, 1).slice(5, 7) - 1];
  return !s.counted && !s.prevCpb
    ? `No cans in ${a} or ${b}${s.since ? "" : " · no bin date, check it wasn't just placed"}`
    : `${a} ${fmt(s.prevCpb || 0)} · ${b} ${fmt(s.cpb || 0)} cans per bin a month`;
}

// ---------- money ----------
export function pickupCost(p: Pick<Pickup, "venue_id" | "cans" | "plastic_kg"> & { app_payout?: number | null }, venues: Map<number, Venue>, set: Settings) {
  if (p.venue_id == null) return p.app_payout != null ? Number(p.app_payout) : p.cans * set.canRate;
  const v = venues.get(p.venue_id)!;
  return p.cans * Number(v.can_rate) + Number(p.plastic_kg || 0) * Number(v.plastic_rate || set.plasticBuy);
}

export function totals(p: Period, pickups: Pickup[], venues: Map<number, Venue>, set: Settings) {
  const ps = pickups.filter((x) => !x.deleted && inP(x.d, p));
  const cans = ps.reduce((a, x) => a + x.cans, 0), pl = ps.reduce((a, x) => a + Number(x.plastic_kg || 0), 0);
  let paidV = 0, paidPl = 0;
  for (const x of ps) {
    const v = x.venue_id != null ? venues.get(x.venue_id) : null;
    paidV += v ? x.cans * Number(v.can_rate) : x.app_payout != null ? Number(x.app_payout) : x.cans * set.canRate;
    paidPl += Number(x.plastic_kg || 0) * Number((v && v.plastic_rate) || set.plasticBuy);
  }
  const canValue = (cans / set.cansPerKg) * set.ubcRate, plValue = set.plasticSale ? pl * set.plasticSale : 0;
  const n = ps.filter((x) => x.cans > 0).length;
  return { ps, cans, pl, paidV, paidPl, paid: paidV + paidPl, canValue, plValue, n };
}

export const AREAS = [
  { id: "rajpur", n: "Rajpur Road" }, { id: "sahas", n: "Sahastradhara Road" }, { id: "gms", n: "GMS Road & Ballupur" },
  { id: "prem", n: "Prem Nagar & Pondha" }, { id: "dharam", n: "Dharampur & Haridwar Road" }, { id: "city", n: "Clock Tower & Race Course" },
];
export const areaName = (id: string | null) => AREAS.find((a) => a.id === id)?.n ?? "";
export const VSTATUS: [Venue["status"], string][] = [["Active", "Active"], ["Waiting", "Waiting for bin"], ["Paused", "Paused"], ["Pulled", "Pulled"]];
export const vstatus = (k: string) => VSTATUS.find((x) => x[0] === k)?.[1] ?? k;

// A Google Maps link or pasted numbers → a point in Dehradun.
export function parsePin(raw: string): { p?: [number, number]; err?: string } {
  raw = (raw || "").trim();
  const m = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || raw.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    || raw.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/) || raw.match(/^\s*(-?\d{1,2}\.\d+)\s*[, ]\s*(-?\d{1,3}\.\d+)\s*$/);
  if (!m) return { err: /goo\.gl|maps\.app/.test(raw) ? "Short share links don't include the numbers. Press and hold the pin in Google Maps and copy the numbers instead." : "Couldn't find a location in that. Paste the numbers, like 30.3440, 78.0620." };
  const p: [number, number] = [+(+m[1]).toFixed(5), +(+m[2]).toFixed(5)];
  if (p[0] < 29.9 || p[0] > 30.7 || p[1] < 77.6 || p[1] > 78.4) return { err: "That point is outside Dehradun. Check the numbers." };
  return { p };
}

// ---------- trips, sales, expenses, staff ----------
export type Trip = { id: number; code: string; d: string; vehicle: string; driver: string; km_start: number; km_end: number; stops: number; fuel_l: number; fuel_cost: number; other_cost: number; cans: number; route: string | null; plan_min: number | null; act_min: number | null; deleted: boolean; created_by: string; updated_by: string | null; created_at: string };
export type Sale = { id: number; code: string; d: string; buyer: string; material: "UBC" | "Plastic"; kg: number; rate: number; transport: number; paid_on: string | null; deleted: boolean; created_by: string; updated_by: string | null; created_at: string };
export type Expense = { id: number; d: string; category: "Salaries" | "Rent" | "Bins & bags" | "Vehicle" | "Phone & misc"; staff_id: number | null; amount: number; note: string; mode: string; item: string; other: string; qty: number; deleted: boolean; created_by: string; updated_by: string | null; created_at: string };
export type StaffRow = { id: number; name: string; salary: number | null; active: boolean };
export type Advance = { id: number; d: string; staff_id: number; amount: number; note: string; deleted: boolean; created_by: string; updated_by: string | null; created_at: string };
export type Mark = { d: string; staff_id: number; mark: "P" | "H" | "A" };
export const CATS = ["Salaries", "Rent", "Bins & bags", "Vehicle", "Phone & misc"] as const;
export const ITEMS = ["Steel bin", "Plastic bin", "Garbage bags", "Other"];
export const FUEL_RS_PER_L = 104; // petrol price used to cost a trip's fuel

export const itemLabel = (e: Pick<Expense, "item" | "other" | "qty">) => {
  if (e.item === "Garbage bags") return `${fmt(e.qty)} garbage bag${e.qty === 1 ? "" : "s"}`;
  const nm = e.item === "Other" ? e.other : e.item; return `${fmt(e.qty)} ${nm.toLowerCase()}${e.qty === 1 || e.item === "Other" ? "" : "s"}`;
};
export const lastUnitCost = (expenses: Expense[], item: string) => { const e = expenses.filter((x) => !x.deleted && x.item === item && x.qty).at(-1); return e ? Number(e.amount) / e.qty : null; };

// Salary: monthly ÷ 30 × days present (half day = ½), minus advances and salary already paid that month.
export function staffDue(s: StaffRow, mo: string, marks: Mark[], advances: Advance[], expenses: Expense[]) {
  const days = marks.filter((m) => m.staff_id === s.id && monthOf(m.d) === mo).reduce((a, m) => a + (m.mark === "P" ? 1 : m.mark === "H" ? 0.5 : 0), 0);
  const adv = advances.filter((a) => !a.deleted && a.staff_id === s.id && monthOf(a.d) === mo).reduce((a, x) => a + Number(x.amount), 0);
  const paid = expenses.filter((e) => !e.deleted && e.category === "Salaries" && e.staff_id === s.id && monthOf(e.d) === mo).reduce((a, e) => a + Number(e.amount), 0);
  const earned = s.salary ? (Number(s.salary) / 30) * days : null;
  return { days, adv, paid, earned, pay: earned == null ? null : Math.max(0, Math.round(earned - adv - paid)) };
}

// ---------- venue payouts ----------
// Owed = opening balance + pickups from the go-live day × the venue's rates − payments. Oldest pickups are paid first.
// Due: on the spot = the pickup day, per pickup = 3 days after, monthly = the 7th of next month.
const nextMonth7 = (d: string) => { const [y, m] = d.split("-").map(Number); return m === 12 ? `${y + 1}-01-07` : `${y}-${String(m + 1).padStart(2, "0")}-07`; };
export type PayState = { cost: number; paid: number; owed: number; oldest: string | null; unpaidN: number; due: string | null; st: "overdue" | "due" | "paid"; last: string | null };
export function payState(v: Venue, mine: Pickup[], payments: Payment[], vmap: Map<number, Venue>, set: Settings, today: string): PayState {
  const from = set.goLive || today; // before go-live is set, only pickups from today count
  const ps = [...(Number(v.opening) > 0 ? [{ d: from, c: Number(v.opening) }] : []), ...mine.filter((p) => !p.deleted && p.d >= from).map((p) => ({ d: p.d, c: pickupCost(p, vmap, set) }))].sort((a, b) => (a.d < b.d ? -1 : 1));
  const cost = ps.reduce((a, p) => a + p.c, 0);
  const pays = payments.filter((p) => !p.deleted && p.venue_id === v.id), paid = pays.reduce((a, p) => a + Number(p.amount), 0);
  let rem = paid, oldest: string | null = null, unpaidN = 0;
  for (const p of ps) { if (p.c <= 0) continue; if (rem >= p.c - 0.5) rem -= p.c; else { rem = 0; unpaidN++; if (!oldest) oldest = p.d; } }
  const owed = Math.max(0, Math.round(cost - paid)); let due: string | null = null, st: PayState["st"] = "paid";
  if (owed > 0 && oldest) { due = v.terms === "Monthly" ? nextMonth7(oldest) : v.terms === "Per pickup" ? addDays(oldest, 3) : oldest; st = today > due ? "overdue" : "due"; }
  return { cost, paid, owed, oldest, unpaidN, due, st, last: pays.map((p) => p.d).sort().at(-1) ?? null };
}
export const PST: Record<PayState["st"], [string, string]> = { overdue: ["Not paid on time", "c-pull"], due: ["Due", "c-new"], paid: ["Paid up", "c-add"] };
