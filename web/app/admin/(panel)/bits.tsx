"use client";
// Small pieces shared by several screens.
import Link from "next/link";
import { usePanel } from "./Panel";
import { DAYS } from "@/lib/admin/routes";
import { type Move, binsTxt } from "@/lib/admin/moves";

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
