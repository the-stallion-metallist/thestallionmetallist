"use client";
// Small pieces shared by several screens.
import Link from "next/link";
import { usePanel } from "./Panel";
import { DAYS } from "@/lib/admin/routes";
import { type Move, binsTxt } from "@/lib/admin/moves";
import { I } from "./icons";
import { DATA_START, MON, monthOf, monthsSince, type State } from "@/lib/admin/logic";

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
