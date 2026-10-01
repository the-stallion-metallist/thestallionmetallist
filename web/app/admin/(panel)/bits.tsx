"use client";
// Small pieces shared by several screens.
import Link from "next/link";
import { usePanel } from "./Panel";
import { DAYS } from "@/lib/admin/routes";
import { type Move, binsTxt } from "@/lib/admin/moves";
import { I } from "./icons";
import { DATA_START, MON, MONL, breakEven, collectionDays, dieselOf, dnice, fmt, inP, kg, monthOf, monthsSince, rs, totals, type State } from "@/lib/admin/logic";

// "Route in progress" bar on Overview and the Route planner.
export function RunBar() {
  const c = usePanel(); const r = c.run; if (!r) return null;
  const n = r.stops.filter((s) => s.mode === "done" || s.mode === "skip").length;
  return <div className="note-bar run-bar"><span><b>Route in progress:</b> {DAYS[r.day]}, {n} of {r.stops.length} stops done</span><Link className="btn btn-p btn-sm" href="/admin/run">Continue</Link></div>;
}

// "Take back 1 steel bin" / "Place 2 bins" chips on a stop.
export const taskChips = (ts: Move[]) => ts.length ? <div className="rt-tasks">{ts.map((t) => t.kind === "pull"
  ? <span key={t.id} className="chip c-pull">Take back {binsTxt(t.steel, t.plastic)}</span>
  : <span key={t.id} className="chip c-add">Place {t.n} bin{t.n > 1 ? "s" : ""}</span>)}</div> : null;

// ---------- phone screens (shown at 880px wide and under; the laptop view is unchanged) ----------

// what a venue's state means on a phone, in plain words, and whether someone needs to act on it
export const PH_ST: Record<State, [string, "bad" | "good" | "warn" | "idle", boolean]> = {
  pull: ["Take a bin back", "bad", true], add: ["Add a bin", "good", true], quiet: ["Gone quiet", "warn", true], nobin: ["Count its bins", "warn", true],
  waiting: ["Waiting for a bin", "warn", true], watch: ["Low this month", "idle", false], idle: ["No cans yet", "idle", false], keep: ["Doing fine", "good", false],
  new: ["New", "idle", false], kept: ["Kept for now", "idle", false], later: ["Bin not out yet", "idle", false],
};
// "Zone 6 · Dharampur & Haridwar Road" → "Dharampur & Haridwar Road"
export const areaOnly = (label: string) => label.replace(/^Zone [0-9]+ · ?/, "") || label;

export function PhHead({ title, sub, right }: { title: string; sub?: React.ReactNode; right?: React.ReactNode }) {
  return <div className="ph-hrow"><div><h1 className="ph-h1">{title}</h1>{sub && <div className="ph-sub">{sub}</div>}</div>{right}</div>;
}
// one tappable row: a count or icon on the left, title and detail, and an arrow
export function PhRow({ lead, tone = "idle", title, sub, right, href, onClick }: { lead?: React.ReactNode; tone?: string; title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode; href?: string; onClick?: () => void }) {
  const inner = <>{lead != null && <span className={"ph-cnt " + tone}>{lead}</span>}<span className="ph-m"><span className="ph-t">{title}</span>{sub && <span className="ph-d">{sub}</span>}</span>{right}<span className="ph-chev">{I.chev}</span></>;
  return href ? <Link className="ph-row" href={href}>{inner}</Link> : <button type="button" className="ph-row" onClick={onClick}>{inner}</button>;
}
export function PhFold({ title, sub, children, open }: { title: string; sub?: string; children: React.ReactNode; open?: boolean }) {
  return <details className="ph-fold" open={open}><summary><span className="ph-m"><span className="ph-t">{title}</span>{sub && <span className="ph-d">{sub}</span>}</span><span className="ph-chev down">{I.chev}</span></summary><div className="ph-fold-b">{children}</div></details>;
}
// Aug · Sep · Both, same choice as the laptop's month switch
export function MonthSeg() {
  const c = usePanel(); const ms = monthsSince(DATA_START, monthOf(c.today)); const list = [...ms.slice(-3), "all"];
  return <div className="seg" role="group" aria-label="Month">{list.map((m) => <button key={m} aria-pressed={c.month === m} onClick={() => c.setMonth(m)}>{m === "all" ? (ms.length === 2 ? "Both" : "All") : MON[+m.slice(5, 7) - 1]}</button>)}</div>;
}

// Cash sitting in the godown: unsold cans and plastic, what they are worth at the Settings rates, and what was paid for them.
function GodownLine() {
  const c = usePanel();
  const ps = c.pickups.filter((p) => !p.deleted), sales = c.sales.filter((s) => !s.deleted);
  const ubcSold = sales.filter((s) => s.material === "UBC"), plSold = sales.filter((s) => s.material === "Plastic");
  const cans = ps.reduce((a, p) => a + p.cans, 0) - ubcSold.reduce((a, s) => a + Number(s.kg), 0) * c.set.cansPerKg;
  const pl = ps.reduce((a, p) => a + Number(p.plastic_kg || 0), 0) - plSold.reduce((a, s) => a + Number(s.kg), 0);
  if (cans <= 0 && pl <= 0) return null;
  const worth = (cans / c.set.cansPerKg) * c.set.ubcRate + (c.set.plasticSale ? pl * c.set.plasticSale : 0), paid = cans * c.set.canRate + pl * c.set.plasticBuy;
  return <p className="note-bar" style={{ marginTop: 12, fontSize: 13 }}>
    {!ubcSold.length && <><b>No cans sold yet, so ₹{c.set.ubcRate}/kg is a guess.</b> Update the sale rate in Settings after each buyer quote. </>}
    In the godown: {fmt(cans)} cans (≈{kg(cans / c.set.cansPerKg)} kg){pl > 0 ? ` and ${kg(pl)} kg plastic` : ""}, worth about {rs(worth)} at these rates. About {rs(paid)} was paid to venues for it. <Link className="linkb" href="/admin/stock">Stock &amp; sales</Link></p>;
}

// Break-even for this month: cans so far against the cans needed to cover salaries, rent and running costs.
export function BreakEven() {
  const c = usePanel(); const p = c.now;
  const T = totals(p, c.pickups, c.vmap, c.set);
  const salaries = c.staff.filter((s) => s.active).reduce((a, s) => a + Number(s.salary || 0), 0);
  const running = dieselOf(collectionDays(c.pickups, c.trips, c.set, p))
    + c.expenses.filter((e) => !e.deleted && inP(e.d, p) && e.category !== "Salaries" && e.category !== "Rent").reduce((a, e) => a + Number(e.amount), 0);
  const B = breakEven(p, T, c.set, { salaries, running });
  const mo = MONL[+p.key.slice(5, 7) - 1], last = dnice(p.end);
  if (!B.need) return <div className="card be"><div className="be-h"><h2>Break-even, {mo}</h2></div><p className="muted">At today&apos;s rates a can earns nothing after the venue is paid. Check the sale rate and payouts in Settings.</p><GodownLine /></div>;
  const covered = T.cans >= B.need, scale = Math.max(B.need, T.cans), pct = Math.min(100, Math.round((T.cans / B.need) * 100));
  const today = Math.round((B.need * B.elapsed) / p.days); // where the month needs to be by today
  const facts = [
    { l: "Pace", v: `${fmt(B.pace)} a day`, s: `About ${fmt(B.projected)} by ${last}` },
    covered ? { l: "Needed from now", v: "Covered", s: "Every can from here is profit", tone: "pos" }
      : { l: "Needed from now", v: B.perDay != null ? `${fmt(B.perDay)} a day` : "–", s: B.left ? `For the ${B.left} day${B.left === 1 ? "" : "s"} left` : "Month is over", tone: B.perDay && B.perDay > B.pace * 1.5 ? "neg" : "" },
    { l: "Profit so far", v: rs(B.profitNow), s: `At this pace, ${rs(B.profitEnd)} by ${last}`, tone: B.profitNow < 0 ? "neg" : "pos" },
  ];
  const note = <>Each can earns ₹{B.perCan.toFixed(2)} after paying the venue{T.pl ? ", plastic included" : ""}. Monthly costs {rs(B.costs)}: salaries {rs(salaries)} · rent and fixed {rs(Number(c.set.fixedOther || 0))} · diesel and running {running ? rs(running) : "none yet"}. Profit so far spreads fixed costs over the month. <Link className="linkb" href="/admin/settings">Change costs</Link></>;
  return (
    <div className="card be">
      <div className="be-h"><h2>Break-even, {mo}</h2><span className="hint">Can this month pay its salaries, rent and running costs?</span><span className="be-pct">{pct}%</span></div>
      <div className="be-v"><b>{fmt(T.cans)}</b> of {fmt(B.need)} cans</div>
      <div className="be-bar" role="img" aria-label={`${fmt(T.cans)} of ${fmt(B.need)} cans needed this month`}>
        <i className={covered ? "ok" : ""} style={{ width: `${(T.cans / scale) * 100}%` }} />
        {!covered && B.left > 0 && <b style={{ left: `${(today / scale) * 100}%` }} title={`${fmt(today)} cans needed by today`} />}
      </div>
      {!covered && B.left > 0 && <div className="be-mark">Line: where the month needs to be today, {fmt(today)} cans</div>}
      <GodownLine />
      <div className="be-facts">{facts.map((f) => <div key={f.l}><span className="l">{f.l}</span><span className={"v " + (f.tone ?? "")}>{f.v}</span><span className="s">{f.s}</span></div>)}</div>
      {c.phone ? <details className="be-more"><summary>How this is worked out</summary><p className="be-note">{note}</p></details> : <p className="be-note">{note}</p>}
    </div>
  );
}
