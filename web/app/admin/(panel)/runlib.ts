"use client";
// Today's route checklist: one open run at a time, saved in the database so a phone can reload mid-route.
import type { PanelCtxT, Run, RunStop } from "./Panel";
import { DAYS } from "@/lib/admin/routes";

export async function startRun(c: PanelCtxT, day: number, week: "A" | "B") {
  if (c.run) { c.toast("A route is already running. Finish it first."); return false; }
  const d = c.plan?.weeks[week][day]; if (!d || !d.stops.length) { c.toast("No stops planned for this day"); return false; }
  const stops: RunStop[] = d.stops.map((s) => ({ vid: s.v.id, exp: Math.round(s.exp), extra: s.extra, mode: "todo", fill: "", reason: "" }));
  const { data, error } = await c.db.from("route_runs").insert({ day, week, label: d.label, plan_min: Math.round(d.totalMin), stops }).select().single();
  if (c.fail(error)) return false;
  c.patch((x) => ({ ...x, run: data as Run }));
  await c.logIt("Started", "Route", `${DAYS[day]} · ${stops.length} stops`);
  return true;
}
export async function saveRun(c: PanelCtxT, run: Run, change: Partial<Pick<Run, "stops" | "staff">>) {
  const next = { ...run, ...change };
  c.patch((x) => ({ ...x, run: next }));
  const { error } = await c.db.from("route_runs").update(change).eq("id", run.id);
  c.fail(error);
}
