// Route planner engine, ported from the approved mockup (same rules and numbers).
// Smart zones = balanced k-medoids on real road times; day routes = cheapest insertion + 2-opt + or-opt;
// busy venues get extra visits; low-can venues move to every 2 weeks when a day runs long;
// the zone with the most Rajpur Road venues stays on Monday. Pure functions: no database or browser code.
import { type Pickup, type Settings, type Venue, addDays, daysBetween } from "./logic";

export type Pin = [number, number];
export type Matrix = { pts: Pin[]; dur: number[][]; dist: number[][]; fetched_at: string | null };
export type Zones = { of: Record<string, number>; day: number[]; built: string; sig: string } | null;
export type AreaRule = { area: string; day: number } | null;
export type Stop = { v: Venue; pin: Pin; exp: number; unload: { eta: string; cans: number } | null; extra: boolean; bi: "A" | "B" | null; eta: string; legKm: number; legMin: number; real: boolean; week: number };
export type Day = { i: number; d: string; date: string; zone: number; color: string; label: string; stops: Stop[]; backMin: number; backKm: number; driveMin: number; stopMin: number; unloads: number; totalMin: number; km: number; load: number; end: string; over: boolean; overBy: number };
export type Plan = { weeks: { A: Day[]; B: Day[] }; meta: { kmOld: number; oldOver: number; oldLongest: number; kmSame: number; kmWeek: number; biN: number; extraN: number; nodes: number; overDays: string[]; est: number; bi: { v: Venue; w: "A" | "B"; week: number }[] } };

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const ZC = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"]; // zone colours (validated for colour-blind reading)
export const ZT = ["#fff", "#fff", "#131417", "#131417", "#131417", "#fff"];         // number colour on each zone colour
export const AREA_DAY: Record<string, number> = { rajpur: 0, sahas: 1, gms: 2, prem: 3, dharam: 4, city: 5 }; // the old fixed area days, for the km comparison
const ROAD_EST_KMH = 35; // only for points with no road data yet (a pin changed after the last road refresh)

// Weeks alternate A, B, A… from Monday 28 Sep 2026 (Week A), so every-2-weeks venues keep their week.
const ANCHOR = "2026-09-28";
export const mondayOf = (d: string) => addDays(d, -((new Date(d + "T00:00:00").getDay() + 6) % 7));
export const weekOf = (d: string): "A" | "B" => (Math.floor(daysBetween(ANCHOR, mondayOf(d)) / 7) % 2 === 0 ? "A" : "B");
// The two weeks the planner shows: this week (next week on a Sunday) and the one after, keyed by A/B.
export function planWeeks(today: string) {
  const sun = new Date(today + "T00:00:00").getDay() === 0;
  const m1 = mondayOf(sun ? addDays(today, 1) : today), m2 = addDays(m1, 7);
  const w1 = weekOf(m1);
  const dates = (m: string) => [0, 1, 2, 3, 4, 5].map((i) => addDays(m, i));
  return w1 === "A" ? { A: dates(m1), B: dates(m2), first: "A" as const } : { A: dates(m2), B: dates(m1), first: "B" as const };
}

const hv = (a: Pin, b: Pin) => { const r = Math.PI / 180, dA = (b[0] - a[0]) * r, dO = (b[1] - a[1]) * r; const x = Math.sin(dA / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dO / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
export const pinOf = (v: Venue): Pin | null => (v.lat != null && v.lng != null ? [Number(v.lat), Number(v.lng)] : null);
const pkey = (p: Pin) => (+p[0]).toFixed(5) + "," + (+p[1]).toFixed(5);
export const fmtClock = (sec: number) => { const m = Math.round(sec / 60), h = Math.floor(m / 60) % 24, mm = m % 60; return `${h > 12 ? h - 12 : h}:${String(mm).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`; };
export const hm = (min: number) => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, "0")}m`;
const departSec = (s: Settings) => { const [h, m] = String(s.depart || "11:00").split(":").map(Number); return (h * 60 + m) * 60; };

export type Ctx = { venues: Venue[]; byV: Map<number, Pickup[]>; set: Settings; matrix: Matrix; zones: Zones; areaRule: AreaRule; today: string; waitingWithBin: Set<number> };

export function weeklyCans(v: Venue, mine: Pickup[], today: string) {
  const from = addDays(today, -27), start = v.bin_since && v.bin_since > from ? v.bin_since : from;
  const cans = mine.filter((p) => p.d >= start && p.d <= today).reduce((a, p) => a + p.cans, 0);
  return (cans / Math.max(daysBetween(start, today) + 1, 14)) * 7;
}

type Node = { v: Venue; pin: Pin; week: number; hold: number; req: number; biOk: boolean; k: number; z?: number };
function planInput(c: Ctx) {
  const idx = new Map(c.matrix.pts.map((p, i) => [pkey(p), i]));
  const god = (c.set as Settings & { godown?: Pin }).godown ?? c.matrix.pts[0] ?? [30.27847, 78.00318];
  const leg = (a: Pin, b: Pin) => {
    const i = idx.get(pkey(a)), j = idx.get(pkey(b));
    if (i != null && j != null && c.matrix.dur[i]) return { s: c.matrix.dur[i][j], m: c.matrix.dist[i][j], real: true };
    const km = hv(a, b) * 1.35; return { s: (km / ROAD_EST_KMH) * 3600, m: km * 1000, real: false };
  };
  // venues with bins, plus signed venues whose first bin is planned (they join the route to get it)
  const nodes: Node[] = c.venues.filter((v) => pinOf(v) && ((v.status === "Active" && v.steel + v.plastic_bins > 0) || (v.status === "Waiting" && c.waitingWithBin.has(v.id)))).map((v, i) => {
    const week = weeklyCans(v, c.byV.get(v.id) ?? [], c.today), hold = v.steel * (c.set.capSteel || 150) + v.plastic_bins * (c.set.capPl || 150);
    return { v, pin: pinOf(v)!, week, hold, req: hold ? Math.min(3, Math.max(1, Math.ceil(week / hold))) : 1, biOk: hold > 0 && week * 2 <= hold, k: i + 1 };
  });
  const pts: Pin[] = [god, ...nodes.map((n) => n.pin)], f = 1 + (+c.set.traffic || 0) / 100;
  const D = pts.map(() => pts.map(() => 0)), Dm = pts.map(() => pts.map(() => 0)), R = pts.map(() => pts.map(() => true)); let est = 0;
  for (let i = 0; i < pts.length; i++) for (let j = 0; j < pts.length; j++) { if (i === j) continue; const l = leg(pts[i], pts[j]); D[i][j] = l.s * f; Dm[i][j] = l.m; R[i][j] = l.real; if (!l.real) est++; }
  return { nodes, D, Dm, R, est, god };
}
const tourCost = (t: number[], D: number[][]) => { let c = 0, p = 0; for (const x of t) { c += D[p][x]; p = x; } return c + D[p][0]; };
function improveTour(t: number[], D: number[][]) {
  let cost = tourCost(t, D), better = true, guard = 0;
  while (better && guard++ < 40) {
    better = false;
    for (let i = 0; i < t.length - 1; i++) for (let k = i + 1; k < t.length; k++) { const n = t.slice(0, i).concat(t.slice(i, k + 1).reverse(), t.slice(k + 1)); const c = tourCost(n, D); if (c < cost - 0.5) { t = n; cost = c; better = true; } }
    for (let len = 1; len <= 3; len++) for (let i = 0; i + len <= t.length; i++) {
      const seg = t.slice(i, i + len), rest = t.slice(0, i).concat(t.slice(i + len));
      for (let j = 0; j <= rest.length; j++) { if (j === i) continue; for (const s of [seg, seg.slice().reverse()]) { const n = rest.slice(0, j).concat(s, rest.slice(j)); const c = tourCost(n, D); if (c < cost - 0.5) { t = n; cost = c; better = true; } } }
    }
  }
  return t;
}
function solveTour(ids: number[], D: number[][]) {
  if (ids.length < 2) return ids.slice();
  const rest = ids.slice().sort((a, b) => D[0][b] + D[b][0] - D[0][a] - D[a][0]); const t = [rest.shift()!];
  while (rest.length) { let best: { d: number; r: number; i: number } | null = null; for (let r = 0; r < rest.length; r++) { const x = rest[r]; for (let i = 0; i <= t.length; i++) { const p = i ? t[i - 1] : 0, q = i < t.length ? t[i] : 0; const d = D[p][x] + D[x][q] - D[p][q]; if (!best || d < best.d) best = { d, r, i }; } } t.splice(best!.i, 0, rest.splice(best!.r, 1)[0]); }
  return improveTour(t, D);
}
const insertCost = (t: number[], x: number, D: number[][]) => { let best = { d: Infinity, i: 0 }; for (let i = 0; i <= t.length; i++) { const p = i ? t[i - 1] : 0, q = i < t.length ? t[i] : 0; const d = D[p][x] + D[x][q] - D[p][q]; if (d < best.d) best = { d, i }; } return best; };
const removeGain = (t: number[], x: number, D: number[][]) => { const i = t.indexOf(x), p = i ? t[i - 1] : 0, q = i < t.length - 1 ? t[i + 1] : 0; return D[p][x] + D[x][q] - D[p][q]; };
function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export const pinSig = (venues: Venue[]) => venues.filter((v) => v.status === "Active" && v.steel + v.plastic_bins > 0).map((v) => v.id + ":" + (pinOf(v) ? pkey(pinOf(v)!) : "-")).join("|");

// Smart zones: each day gets its own patch of the map. Venues are split by a weighted "nearest centre" rule
// (a power diagram), so no two days' areas can overlap; the weights are tuned until every day fits the route length
// with the least driving. Stop order inside each day is still worked out on real road times.
const quickTour = (ids: number[], D: number[][]) => { const t: number[] = []; for (const x of ids) t.splice(insertCost(t, x, D).i, 0, x); return t; };
export function buildZones(c: Ctx): Zones {
  const P = planInput(c), { nodes, D } = P, n = nodes.length, K = 6, limit = c.set.routeHours * 3600, stop = c.set.stopMin * 60;
  if (n < K) return null;
  const lat0 = (P.god[0] * Math.PI) / 180, X = nodes.map((x) => [(x.pin[1] - P.god[1]) * 111.32 * Math.cos(lat0), (x.pin[0] - P.god[0]) * 110.57]);
  const d2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  const dayTime = (ids: number[]) => tourCost(quickTour(ids, D), D) + stop * ids.reduce((a, k) => a + nodes[k - 1].req, 0);
  const score = (T: number[], ids: number[][]) => ids.reduce((a, z) => a + tourCost(quickTour(z, D), D), 0) + T.reduce((a, t) => a + 3 * Math.max(0, t - limit), 0);
  let best: { c: number; Z: number[][] } | null = null;
  for (let seed = 1; seed <= 8; seed++) {
    const R = rng(seed * 7919), C = [X[Math.floor(R() * n)].slice()];
    while (C.length < K) { const w = X.map((p) => Math.min(...C.map((q) => d2(p, q)))), tot = w.reduce((a, b) => a + b, 0); let r = R() * tot, i = 0; while (r > w[i] && i < n - 1) { r -= w[i]; i++; } C.push(X[i].slice()); }
    const W = C.map(() => 0);
    for (let it = 0; it < 90; it++) {
      const Z: number[][] = C.map(() => []), sq: number[] = [];
      X.forEach((p, i) => { let bz = 0, bv = Infinity; C.forEach((q, z) => { const v = d2(p, q) - W[z]; if (v < bv) { bv = v; bz = z; } }); Z[bz].push(i + 1); sq.push(d2(p, C[bz])); });
      const empty = Z.findIndex((z) => !z.length); if (empty >= 0) { const far = sq.indexOf(Math.max(...sq)); C[empty] = X[far].slice(); W[empty] = 0; continue; }
      if (it < 25) Z.forEach((z, k) => { C[k] = [z.reduce((a, i) => a + X[i - 1][0], 0) / z.length, z.reduce((a, i) => a + X[i - 1][1], 0) / z.length]; });
      const T = Z.map(dayTime), cost = score(T, Z); if (!best || cost < best.c) best = { c: cost, Z: Z.map((z) => z.slice()) };
      const avg = T.reduce((a, b) => a + b, 0) / K, scale = sq.reduce((a, b) => a + b, 0) / n, eta = 0.6 * (1 - it / 90) + 0.05;
      T.forEach((t, k) => { W[k] += (eta * scale * (Math.min(avg, limit) - t)) / Math.min(avg, limit); });
    }
  }
  const tours = best!.Z.map((z) => solveTour(z, D));
  // zones go round the godown so neighbouring days are neighbouring zones
  const ang = tours.map((t) => { const la = t.reduce((s, k) => s + nodes[k - 1].pin[0], 0) / t.length, lo = t.reduce((s, k) => s + nodes[k - 1].pin[1], 0) / t.length; return Math.atan2(lo - P.god[1], la - P.god[0]); });
  const order = tours.map((_, i) => i).sort((a, b) => ang[a] - ang[b]);
  const of: Record<string, number> = {}; order.forEach((z, rank) => tours[z].forEach((k) => (of[nodes[k - 1].v.id] = rank)));
  return applyAreaRule({ of, day: [0, 1, 2, 3, 4, 5], built: c.today, sig: pinSig(c.venues) }, c);
}
// the zone with the most Rajpur Road venues (by each venue's Area) stays on the rule's day
export function ruleZone(zones: Zones, c: Pick<Ctx, "venues" | "areaRule">) {
  const r = c.areaRule; if (!zones || !r) return null; const cnt = [0, 0, 0, 0, 0, 0];
  c.venues.forEach((v) => { if (v.area === r.area && v.status === "Active" && v.steel + v.plastic_bins > 0 && zones.of[v.id] != null) cnt[zones.of[v.id]]++; });
  const best = cnt.indexOf(Math.max(...cnt)); return cnt[best] ? best : null;
}
export function applyAreaRule(zones: Zones, c: Pick<Ctx, "venues" | "areaRule">) {
  const z = ruleZone(zones, c); if (z == null || !zones || !c.areaRule) return zones; const r = c.areaRule, other = zones.day.indexOf(r.day);
  zones.day[other] = zones.day[z]; zones.day[z] = r.day; return zones;
}
export function zoneName(z: number, zones: Zones, venues: Venue[], areaName: (id: string | null) => string) {
  const cnt: Record<string, number> = {}; venues.forEach((v) => { if (zones && zones.of[v.id] === z && v.area) cnt[v.area] = (cnt[v.area] || 0) + 1; });
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; return top ? areaName(top[0]) : "";
}

// The two-week plan: fixed zones per day, extra visits for busy venues, low-can venues every 2 weeks when a day runs long.
export function optimisePlan(c: Ctx, areaName: (id: string | null) => string): Plan | null {
  if (!c.zones) return null;
  const zones = c.zones; const P = planInput(c), { nodes, D, Dm, R } = P, limit = c.set.routeHours * 3600, stop = c.set.stopMin * 60, cap = c.set.vehCap || Infinity;
  const W = planWeeks(c.today);
  const zoneOf = (x: Node) => { const z = zones.of[x.v.id]; if (z != null) return z; let best = 0, bd = Infinity; for (let zz = 0; zz < 6; zz++) { const mem = nodes.filter((y) => zones.of[y.v.id] === zz).map((y) => y.k); const cc = insertCost(mem, x.k, D).d; if (cc < bd) { bd = cc; best = zz; } } return best; };
  const dayOf = (z: number) => zones.day[z];
  const base: { k: number; kind: "main" | "extra" }[][] = [0, 1, 2, 3, 4, 5].map(() => []), node: Record<number, Node> = {};
  nodes.forEach((x) => { node[x.k] = x; x.z = zoneOf(x); base[dayOf(x.z)].push({ k: x.k, kind: "main" }); });
  const baseTours = base.map((l) => solveTour(l.map((v) => v.k), D));
  for (const x of nodes) for (let e = 1; e < x.req; e++) {
    const main = dayOf(x.z!), t = (main + Math.round((6 * e) / x.req)) % 6;
    const cands = [t, (t + 1) % 6, (t + 5) % 6].filter((d) => Math.abs(d - main) >= 2);
    const pick = (cands.length ? cands : [t]).map((d) => ({ d, c: insertCost(baseTours[d], x.k, D).d })).sort((a, b) => a.c - b.c)[0].d;
    base[pick].push({ k: x.k, kind: "extra" });
  }
  const expOf = (x: Node, bi: boolean) => Math.min(x.hold || 0, (x.week * (bi ? 2 : 1)) / x.req);
  const bi: Record<number, "A" | "B"> = {}; const res: { A: Day[]; B: Day[] } = { A: [], B: [] }; const overDays: string[] = [];
  for (let d = 0; d < 6; d++) {
    const WK = { A: base[d].slice(), B: base[d].slice() };
    const sim = (t: number[]) => { let time = 0, load = 0, prev = 0, un = 0; for (const k of t) { const e = expOf(node[k], !!bi[k]); if (load > 0 && load + e > cap) { time += D[prev][0] + stop; prev = 0; load = 0; un++; } time += D[prev][k] + stop; load += e; prev = k; } return { time: time + D[prev][0], un }; };
    const evalW = (w: "A" | "B") => { const t = solveTour(WK[w].map((v) => v.k), D); const s = sim(t); return { t, time: s.time }; };
    let eA = evalW("A"), eB = evalW("B");
    for (let guard = 0; guard < 60; guard++) {
      const oA = eA.time > limit, oB = eB.time > limit; if (!oA && !oB) break;
      const worse: "A" | "B" = oA && (!oB || eA.time - limit >= eB.time - limit) ? "A" : "B", ew = worse === "A" ? eA : eB;
      const cands = WK[worse].filter((v) => v.kind === "main" && !bi[v.k] && node[v.k].biOk && node[v.k].req === 1 && WK.A.some((y) => y.k === v.k) && WK.B.some((y) => y.k === v.k));
      if (!cands.length) break;
      const scored = cands.map((v) => ({ v, val: node[v.k].week / ((removeGain(ew.t, v.k, D) + stop) / 60) })).sort((a, b) => a.val - b.val);
      const out = scored[0].v; WK[worse] = WK[worse].filter((y) => y !== out); bi[out.k] = worse === "A" ? "B" : "A";
      eA = evalW("A"); eB = evalW("B");
    }
    for (const w of ["A", "B"] as const) {
      const e = w === "A" ? eA : eB; const z0 = WK[w].find((v) => v.kind === "main"); const zone = z0 ? node[z0.k].z! : zones.day.indexOf(d);
      let clock = departSec(c.set), prev = 0, km = 0, drive = 0, load = 0, onb = 0, unN = 0;
      const stops: Stop[] = e.t.map((k) => {
        const x = node[k], vis = WK[w].find((v) => v.k === k)!, ex = expOf(x, !!bi[k]); let unload: Stop["unload"] = null;
        if (onb > 0 && onb + ex > cap) { const s0 = D[prev][0], m0 = Dm[prev][0]; clock += s0; drive += s0; km += m0; unload = { eta: fmtClock(clock), cans: onb }; clock += stop; prev = 0; onb = 0; unN++; }
        onb += ex; const s = D[prev][k], m = Dm[prev][k], real = R[prev][k];
        clock += s; drive += s; km += m; const eta = clock; clock += stop; prev = k; load += ex;
        return { v: x.v, pin: x.pin, exp: ex, unload, extra: vis.kind === "extra", bi: bi[k] && vis.kind === "main" ? bi[k] : null, eta: fmtClock(eta), legKm: m / 1000, legMin: s / 60, real, week: x.week };
      });
      const back = D[prev][0], backM = Dm[prev][0]; drive += back; km += backM; clock += back;
      const nm = zoneName(zone, zones, c.venues, areaName);
      const day: Day = { i: d, d: DAYS[d], date: W[w][d], zone, color: ZC[zone % 6], label: `Zone ${zone + 1}` + (nm ? ` · ${nm}` : ""), stops, backMin: back / 60, backKm: backM / 1000, driveMin: drive / 60, stopMin: (stops.length + unN) * c.set.stopMin, unloads: unN, totalMin: e.time / 60, km: km / 1000, load, end: fmtClock(clock), over: e.time > limit + 30, overBy: Math.max(0, (e.time - limit) / 60) };
      res[w].push(day); if (day.over) overDays.push(w + " " + DAYS[d]);
    }
  }
  // how the old planner (named areas, straight-line order) compares on the same real roads, everyone once a week
  const kmOf = (t: number[]) => { let m = 0, p = 0; for (const k of t) { m += Dm[p][k]; p = k; } return (m + Dm[p][0]) / 1000; };
  const orderStraight = (list: Node[]) => { const left = list.slice(), out: Node[] = []; let cur = P.god; while (left.length) { let bi2 = 0, bd = Infinity; left.forEach((x, i) => { const dd = hv(cur, x.pin); if (dd < bd) { bd = dd; bi2 = i; } }); cur = left[bi2].pin; out.push(left.splice(bi2, 1)[0]); } return out; };
  const oldTours = [0, 1, 2, 3, 4, 5].map((d) => orderStraight(nodes.filter((x) => AREA_DAY[x.v.area ?? ""] === d)).map((x) => x.k));
  const kmOld = oldTours.reduce((a, t) => a + kmOf(t), 0);
  const oldMin = oldTours.map((t) => (tourCost(t, D) + stop * t.length) / 60), oldOver = oldMin.filter((m) => m > limit / 60 + 0.5).length, oldLongest = Math.max(...oldMin);
  const kmSame = [0, 1, 2, 3, 4, 5].reduce((a, d) => a + kmOf(solveTour(nodes.filter((x) => dayOf(x.z!) === d).map((x) => x.k), D)), 0);
  const kmWeek = (res.A.reduce((a, d) => a + d.km, 0) + res.B.reduce((a, d) => a + d.km, 0)) / 2;
  return { weeks: res, meta: { kmOld, oldOver, oldLongest, kmSame, kmWeek, biN: Object.keys(bi).length, extraN: base.flat().filter((v) => v.kind === "extra").length, nodes: nodes.length, overDays, est: P.est,
    bi: Object.entries(bi).map(([k, w]) => ({ v: node[+k].v, w, week: node[+k].week })) } };
}

// Google Maps directions for a day, split so each link has at most 9 waypoints.
export function mapsLinks(stops: Stop[], god: Pin) {
  const p = (x: Pin) => x.join(","); const pts: Pin[] = [god, ...stops.flatMap((s) => (s.unload ? [god, s.pin] : [s.pin])), god]; const out: string[] = [];
  for (let i = 0; i < pts.length - 1; i += 9) { const seg = pts.slice(i, Math.min(i + 10, pts.length)); const w = seg.slice(1, -1).map(p).join("|"); out.push(`https://www.google.com/maps/dir/?api=1&origin=${p(seg[0])}&destination=${p(seg.at(-1)!)}&travelmode=driving${w ? "&waypoints=" + encodeURIComponent(w) : ""}`); }
  return out;
}

// The route days a venue is on over the next 4 weeks; a venue not on the plan yet borrows its nearest neighbour's day.
export function visitDates(v: Venue, plan: Plan | null) {
  if (!plan) return [];
  const out: string[] = [];
  for (const w of ["A", "B"] as const) for (const d of plan.weeks[w]) if (d.stops.some((s) => s.v.id === v.id)) out.push(d.date, addDays(d.date, 14));
  const pin = pinOf(v);
  if (!out.length && pin) {
    let best: Day | null = null, bd = Infinity;
    for (const d of plan.weeks.A) for (const s of d.stops) { const k = hv(pin, s.pin); if (k < bd) { bd = k; best = d; } }
    if (best) { const b = plan.weeks.B[best.i]; out.push(best.date, b.date, addDays(best.date, 14), addDays(b.date, 14)); }
  }
  return [...new Set(out)].sort();
}
