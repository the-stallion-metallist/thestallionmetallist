"use client";
import { useEffect, useState } from "react";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import { restorePickup, setVenueRemoved } from "../forms";
import { restoreRow } from "../forms2";
import { type LogRow, dnice } from "@/lib/admin/logic";

const byNewest = (rows: LogRow[], more: LogRow[]) => { const m = new Map(rows.map((x) => [x.id, x])); for (const x of more) m.set(x.id, x); return [...m.values()].sort((a, b) => b.id - a.id); };

export default function History() {
  const c = usePanel(); const [who, setWho] = useState("all");
  // the panel loads the newest 500 lines; this screen keeps every line it has seen and can fetch older ones
  const [rows, setRows] = useState<LogRow[]>(c.log); const [total, setTotal] = useState<number | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { setRows((r) => byNewest(r, c.log)); }, [c.log]);
  useEffect(() => { c.db.from("change_log").select("id", { count: "exact", head: true }).then(({ count }) => setTotal(count)); }, [c.db, c.log[0]?.id]);
  async function older() {
    setBusy(true);
    const { data, error } = await c.db.from("change_log").select("*").lt("id", rows[rows.length - 1].id).order("id", { ascending: false }).limit(500);
    setBusy(false); if (c.fail(error)) return;
    setRows((r) => byNewest(r, (data ?? []) as LogRow[]));
  }
  const people = ["all", ...new Set(rows.map((x) => x.who))];
  const L = rows.filter((x) => who === "all" || x.who === who);
  const time = (at: string) => new Date(at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
  const day = (at: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(at));
  return (
    <div className="card">
      <div className="card-h"><h2>Every change, with a name on it</h2><span className="hint">{total != null && total > rows.length ? `Latest ${rows.length} of ${total} changes` : `All ${rows.length} changes`}</span></div>
      <div className="filters" style={{ marginBottom: 10 }}>{people.map((n) => <button key={n} className="fchip" aria-pressed={who === n} onClick={() => setWho(n)}>{n === "all" ? "Everyone" : n}</button>)}</div>
      {L.length ? L.map((x) => {
        const w = x.what.toLowerCase(), art = /s$/.test(w) ? "" : /^[aeiou]/.test(w) ? "an " : "a ";
        const pool: Record<string, { id: number; deleted: boolean }[]> = { venues: [...c.vmap.values()], pickups: c.pickups, payments: c.payments, expenses: c.expenses, sales: c.sales, trips: c.trips, advances: c.advances };
        const canRestore = (x.action === "Deleted" || x.action === "Removed") && x.ref_table && pool[x.ref_table]?.find((p) => p.id === x.ref_id)?.deleted;
        return <div key={x.id} className="hist"><span className="av">{x.who[0]}</span>
          <div className="hb"><div><b>{x.who}</b> {x.action.toLowerCase()} {art}{w} <span className="muted">· {x.label}</span></div>
            {x.changes && <div className="d">{x.changes}</div>}<div className="d">{dnice(day(x.at))} · {time(x.at)}</div></div>
          {canRestore && <button className="btn btn-g btn-sm" onClick={async () => { if (x.ref_table === "venues") { const v = c.vmap.get(x.ref_id!); if (v && (await setVenueRemoved(c, v, false))) c.toast(`${v.name} restored`); } else if (x.ref_table === "pickups") restorePickup(c, x.ref_id!); else restoreRow(c, x.ref_table!, x.ref_id!); }}>Restore</button>}</div>;
      }) : <Empty title="No changes yet" text="Anything anyone adds, edits or deletes shows up here with their name and the time." />}
      {total != null && total > rows.length && <div style={{ marginTop: 14 }}><button className="btn btn-g" disabled={busy} onClick={older}>{busy ? "Loading…" : `Show ${Math.min(500, total - rows.length)} older changes`}</button></div>}
    </div>
  );
}
