// Bin moves, ported from the approved mockup.
// A venue low for 2 months in a row gives bins back (2+ bins keep 1; a last bin comes back only after 2 more low months,
// and the venue pauses). Free bins go to signed venues waiting for a bin (oldest first), then to busy venues.
// A bin taken back waits at the godown and goes out when someone next visits the new venue (moves have no dates).
import { type Period, type Settings, type Stats, type Venue, daysBetween } from "./logic";
import { pinOf } from "./areas";

export type Move = {
  id: number; kind: "pull" | "place"; venue_id: number; steel: number; plastic: number; n: number; last_bin: boolean;
  after: string | null; source: string; status: "planned" | "done" | "cancelled"; done_on: string | null; done_by: string | null; created_by: string;
};
export type Spare = { steel: number; plastic: number; counted: boolean };

export const binsTxt = (steel: number, pb: number) => (steel && pb ? `${steel} steel + ${pb} plastic` : steel ? `${steel} steel` : `${pb} plastic`) + ` bin${steel + pb === 1 ? "" : "s"}`;
export function pullPlan(v: Venue) { const b = v.steel + v.plastic_bins; if (!b) return null; const n = b > 1 ? b - 1 : 1, pb = Math.min(v.plastic_bins, n); return { n, pb, steel: n - pb, last: b === 1 }; }

export type Suggestion = {
  pulls: { v: Venue; s: Stats; n: number; pb: number; steel: number; last: boolean }[];
  give: { v: Venue; s?: Stats; n: number; why: "waiting" | "busy"; after: string; from: string[] }[];
  wait: { v: Venue; s?: Stats; n: number; why: "waiting" | "busy"; noPin?: boolean }[];
  left: number;
};

export function movePlan(a: { venues: Venue[]; stats: (v: Venue, p: Period) => Stats; now: Period; set: Settings; moves: Move[]; spare: Spare; today: string; vmap: Map<number, Venue> }): Suggestion {
  const open = a.moves.filter((t) => t.status === "planned"), has = new Set(open.map((t) => t.kind + ":" + t.venue_id));
  const pulls = a.venues.filter((v) => v.status === "Active" && !has.has("pull:" + v.id)).map((v) => ({ v, s: a.stats(v, a.now) })).filter((x) => x.s.st === "pull")
    .map((x) => ({ ...x, ...pullPlan(x.v)! })).filter((x) => x.n && !(x.last && x.v.cut_on && daysBetween(x.v.cut_on, a.today) < 61))
    .sort((p, q) => q.n - p.n);
  // bins that will be free: spare now, then each take-back (planned or suggested). A placement that needs a take-back
  // first can only be done after it; when the bins are actually placed, the spare count is checked live.
  let units: { avail: string; from: string }[] = [];
  const add = (n: number, avail: string, from: string) => { for (let i = 0; i < n; i++) units.push({ avail, from }); };
  add(a.spare.steel + a.spare.plastic, a.today, "spare at the godown");
  for (const t of open.filter((t) => t.kind === "pull")) add(t.n, a.today, a.vmap.get(t.venue_id)!.name);
  units = units.slice(open.filter((t) => t.kind === "place").reduce((s, t) => s + t.n, 0));
  for (const p of pulls) add(p.n, a.today, p.v.name);
  const skip = (v: Venue) => has.has("place:" + v.id) || (v.skip_give && a.today <= v.skip_give);
  const dests: Suggestion["wait"] = [
    ...a.venues.filter((v) => v.status === "Waiting" && !skip(v)).sort((p, q) => ((p.added || "") < (q.added || "") ? -1 : 1)).map((v) => ({ v, n: Math.max(1, v.promised || 1), why: "waiting" as const })),
    ...a.venues.filter((v) => v.status === "Active" && !skip(v)).map((v) => ({ v, s: a.stats(v, a.now) })).filter((x) => x.s.st === "add").sort((p, q) => (q.s.cpb || 0) - (p.s.cpb || 0)).map((x) => ({ ...x, n: 1, why: "busy" as const })),
  ];
  const give: Suggestion["give"] = [], wait: Suggestion["wait"] = [];
  for (const d of dests) {
    if (!pinOf(d.v)) { wait.push({ ...d, noPin: true }); continue; }
    if (units.length < d.n || units[d.n - 1].avail === "9999") { wait.push(d); continue; }
    const got = units.splice(0, d.n), after = got.at(-1)!.avail;
    give.push({ ...d, after, from: [...new Set(got.map((u) => u.from))] });
  }
  return { pulls, give, wait, left: units.filter((u) => u.avail !== "9999").length };
}
