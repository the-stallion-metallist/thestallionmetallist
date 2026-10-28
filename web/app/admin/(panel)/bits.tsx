"use client";
// Small pieces shared by several screens.
import Link from "next/link";
import { usePanel } from "./Panel";
import { DAYS } from "@/lib/admin/routes";
import { type Move, binsTxt } from "@/lib/admin/moves";
import { I } from "./icons";
import { DATA_START, MON, MONL, breakEven, collectionDays, dieselOf, dnice, fmt, godownOn, inP, kg, monthOf, monthsSince, rs, saleTransport, totals, type State } from "@/lib/admin/logic";

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

// "Cans ₹210/kg (sale 15 Oct) · plastic ₹33/kg (sale 10 Oct)": the prices every value and margin uses.
export function priceNote(c: ReturnType<typeof usePanel>) {
  const one = (name: string, v: number | null, s: { d: string } | null) => v == null ? `${name} price not set` : `${name} ₹${v}/kg (${s ? "sale " + dnice(s.d) : "Settings, no sale yet"})`;
  return `${one("Cans", c.price.ubc, c.price.ubcSale)} · ${one("plastic", c.price.pl, c.price.plSale)}`;
}

// One bar for money against a target: what cans earned (copper), then what plastic added (teal), both after paying venues.
// mark = a line on the bar in ₹ (where the month should be today, or where recorded costs end when earnings pass them).
// The bar keeps its copper/teal colours when the target is covered (the key must match); the green % says covered.
export function SplitBar({ canEarn, plEarn, plKg, target, mark, markNote, label }: { canEarn: number; plEarn: number; plKg: number; target: number; mark?: number | null; markNote?: string; label: string }) {
  const scale = Math.max(target, canEarn + plEarn, 1), w = (v: number) => `${(v / scale) * 100}%`;
  return <>
    <div className="be-bar" role="img" aria-label={label}>
      <i style={{ width: w(canEarn) }} />
      {plEarn > 0 && <i className="pl" style={{ left: w(canEarn), width: w(plEarn) }} />}
      {mark != null && <b style={{ left: w(mark) }} />}
    </div>
    <div className="be-key">
      <span><i />Cans <b>{rs(canEarn)}</b></span>
      {plKg > 0 && <span><i className="pl" />Plastic <b>{rs(plEarn)}</b> from {kg(plKg)} kg</span>}
      {mark != null && markNote && <span className="mk"><i className="ln" />{markNote}</span>}
    </div>
  </>;
}

// Cash sitting in the godown: unsold cans and plastic, what they are worth at the last sale prices, and what was paid for them.
function GodownRow() {
  const c = usePanel();
  const now = godownOn(c.pickups, c.sales, c.set, null, null), cans = now.cans, pl = now.pl;
  if (cans <= 0 && pl <= 0) return null;
  const worth = (cans / c.set.cansPerKg) * c.vset.ubcRate + (c.vset.plasticSale ? pl * c.vset.plasticSale : 0), paid = cans * c.set.canRate + pl * c.set.plasticBuy;
  return <div><span className="k">In the godown</span>
    <span className="d"><b>{fmt(cans)} cans</b> (≈{kg(cans / c.set.cansPerKg)} kg){pl > 0 ? <> and <b>{kg(pl)} kg plastic</b></> : null}, worth about <b>{rs(worth)}</b>. About {rs(paid)} was paid to venues for it.
      {!c.price.ubcSale && <> No cans sold yet, so ₹{c.vset.ubcRate}/kg is a guess.</>}</span>
    <Link className="linkb" href="/admin/stock">Stock &amp; sales</Link></div>;
}

// Break-even for this month: one bar for the month's costs, filled by what cans earn (copper) and what plastic adds (teal),
// both after paying venues. In cans it reads "cans so far of cans needed": the same share, since each can is valued with its plastic.
export function BreakEven() {
  const c = usePanel(); const p = c.now;
  const T = totals(p, c.pickups, c.vmap, c.vset);
  const salaries = c.staff.filter((s) => s.active).reduce((a, s) => a + Number(s.salary || 0), 0);
  const running = dieselOf(collectionDays(c.pickups, c.trips, c.set, p)) + saleTransport(c.sales, p)
    + c.expenses.filter((e) => !e.deleted && inP(e.d, p) && e.category !== "Salaries" && e.category !== "Rent").reduce((a, e) => a + Number(e.amount), 0);
  const B = breakEven(p, T, c.vset, { salaries, running });
  const mo = MONL[+p.key.slice(5, 7) - 1], last = dnice(p.end);
  const godown = <GodownRow />;
  if (!B.need) return <div className="card be"><div className="be-h"><h2>Break-even, {mo}</h2></div><p className="muted">At today&apos;s rates a can earns nothing after the venue is paid. Check the sale rate and payouts in Settings.</p><div className="be-rows">{godown}</div></div>;
  const canEarn = Math.max(0, T.canValue - T.paidV), plEarn = Math.max(0, T.plValue - T.paidPl), earned = canEarn + plEarn;
  const covered = T.cans >= B.need, pct = Math.min(100, Math.round((T.cans / B.need) * 100));
  const today = Math.round((B.need * B.elapsed) / p.days); // where the month needs to be by today
  const canPart = T.cans ? canEarn / T.cans : 0, plPart = T.cans ? plEarn / T.cans : 0;
  const facts = [
    { l: "Pace", v: `${fmt(B.pace)} a day`, s: `About ${fmt(B.projected)} by ${last}` },
    covered ? { l: "Needed from now", v: "Covered", s: "Every can from here is profit", tone: "pos" }
      : { l: "Needed from now", v: B.perDay != null ? `${fmt(B.perDay)} a day` : "–", s: B.left ? `For the ${B.left} day${B.left === 1 ? "" : "s"} left` : "Month is over", tone: B.perDay && B.perDay > B.pace * 1.5 ? "neg" : "" },
    { l: "Profit so far", v: rs(B.profitNow), s: `At this pace, ${rs(B.profitEnd)} by ${last}`, tone: B.profitNow < 0 ? "neg" : "pos" },
  ];
  const note = <>Each can earns ₹{B.perCan.toFixed(2)} after paying the venue: ₹{canPart.toFixed(2)} from the can{T.pl ? <> and ₹{plPart.toFixed(2)} from the plastic that comes with it</> : null}. Prices: {priceNote(c)}. Monthly costs {rs(B.costs)}: salaries {rs(salaries)}, rent and fixed {rs(Number(c.set.fixedOther || 0))}, diesel and running {running ? rs(running) : "none yet"}. Profit so far spreads fixed costs over the month. <Link className="linkb" href="/admin/settings">Change costs</Link></>;
  return (
    <div className="card be">
      <div className="be-h"><h2>Break-even, {mo}</h2><span className="hint">Can this month pay its salaries, rent and running costs?</span><span className={"be-pct" + (covered ? " ok" : "")}>{pct}%</span></div>
      <div className="be-top">
        <div className="be-v"><b>{fmt(T.cans)}</b> of {fmt(B.need)} cans</div>
        <div className="be-money"><b>{rs(earned)}</b> of {rs(B.costs)} costs</div>
      </div>
      <SplitBar canEarn={canEarn} plEarn={plEarn} plKg={T.pl} target={B.costs} label={`${pct}% of this month's costs covered: cans earned ${rs(canEarn)}, plastic ${rs(plEarn)}, of ${rs(B.costs)}`}
        mark={!covered && B.left > 0 ? (B.costs * B.elapsed) / p.days : null} markNote={`Where the month should be today: ${fmt(today)} cans`} />
      <div className="be-facts">{facts.map((f) => <div key={f.l}><span className="l">{f.l}</span><span className={"v " + (f.tone ?? "")}>{f.v}</span><span className="s">{f.s}</span></div>)}</div>
      <div className="be-rows">
        {T.pl > 0 && <div><span className="k">Plastic</span>
          <span className="d"><b>{kg(T.pl)} kg</b> this month adds <b>₹{plPart.toFixed(2)}</b> to every can.{canPart > 0 ? <> Without it you would need <b>{fmt(Math.ceil(B.costs / canPart))}</b> cans, not {fmt(B.need)}.</> : null}</span>
          <Link className="linkb" href="/admin/money">Money</Link></div>}
        {godown}
      </div>
      <details className="be-more"><summary>How this is worked out</summary><p className="be-note">{note}</p></details>
    </div>
  );
}
