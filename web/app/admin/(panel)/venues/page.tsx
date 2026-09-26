"use client";
import { useEffect, useState } from "react";
import { usePanel } from "../Panel";
import VenueDrawer, { Chip, Est } from "../VenueDrawer";
import Link from "next/link";
import { AddVenue } from "../forms";
import { MONL, dnice, fmt, type State } from "@/lib/admin/logic";
import { PH_ST, PhHead } from "../bits";

const ORDER: Record<State, number> = { add: 0, pull: 1, watch: 2, quiet: 3, waiting: 4, new: 5, keep: 6, kept: 7, nobin: 8, idle: 9, later: 10 };
const FILTERS: [string, string][] = [["all", "All"], ["add", "Add a bin"], ["pull", "Take back"], ["watch", "Low this month"], ["quiet", "Gone quiet"], ["waiting", "Waiting for bin"],
  ["new", "Too new"], ["keep", "Keep"], ["kept", "Kept for now"], ["idle", "Idle bins"], ["nobin", "No bin record"], ["nopin", "No map location"]];

export default function Venues() {
  const c = usePanel(); const p = c.per;
  const [f, setF] = useState(() => (c.phone ? "act" : "all")); const [q, setQ] = useState("");
  useEffect(() => { const x = new URLSearchParams(location.search).get("f"); if (x) setF(x); }, []);
  const rows = c.venues.map((v) => ({ v, s: c.stats(v) }));
  const counts: Record<string, number> = { all: rows.length, nopin: rows.filter((r) => r.v.lat == null && r.v.status !== "Pulled").length };
  for (const r of rows) counts[r.s.st] = (counts[r.s.st] || 0) + 1;
  counts.idle = (counts.idle || 0) + (counts.quiet || 0);
  const list = rows
    .filter((r) => f === "all" || (f === "nopin" ? r.v.lat == null && r.v.status !== "Pulled" : r.s.st === f || (f === "idle" && r.s.st === "quiet")))
    .filter((r) => !q || r.v.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => ORDER[a.s.st] - ORDER[b.s.st] || (b.s.cpb || 0) - (a.s.cpb || 0) || b.s.all - a.s.all);
  const MAXG = 400, pct = (x: number) => (Math.min(x, MAXG) / MAXG) * 100;
  const totBins = rows.reduce((a, r) => a + r.s.bins, 0);

  if (c.phone) { // phone: find a venue, see what to do; the gauge board stays on the laptop
    const act = (st: State) => PH_ST[st][2];
    const pc: Record<string, number> = { act: rows.filter((r) => act(r.s.st)).length, all: rows.length, pull: counts.pull || 0, add: counts.add || 0, quiet: counts.quiet || 0, waiting: counts.waiting || 0, new: counts.new || 0, nopin: counts.nopin };
    const chips: [string, string][] = [["act", "Needs action"], ["all", "All"], ["pull", "Take back"], ["add", "Add a bin"], ["quiet", "Gone quiet"], ["waiting", "Waiting"], ["new", "New"], ["nopin", "No map pin"]];
    const ql = q.trim().toLowerCase();
    const shown = rows.filter((r) => (ql ? r.v.name.toLowerCase().includes(ql) : f === "all" ? true : f === "act" ? act(r.s.st) : f === "nopin" ? r.v.lat == null && r.v.status !== "Pulled" : r.s.st === f))
      .sort((a, b) => (ql ? a.v.name.localeCompare(b.v.name) : b.s.cans - a.s.cans || a.v.name.localeCompare(b.v.name)));
    return (<div className="ph">
      <PhHead title="Venues" sub={`${rows.length} venues · ${p.all ? "all months" : MONL[+p.key.slice(5, 7) - 1]}`} right={<button className="ph-btn g sm" onClick={() => c.openModal(<AddVenue />)}>+ Add venue</button>} />
      <label className="ph-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input type="search" placeholder="Find a venue" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a venue" autoComplete="off" /></label>
      {!ql && <div className="ph-chips" role="group" aria-label="Show">{chips.map(([k, l]) => (pc[k] || f === k) ? <button key={k} className="ph-chip" aria-pressed={f === k} onClick={() => setF(k)}>{l} <span>{pc[k] || 0}</span></button> : null)}</div>}
      {shown.length ? <div className="ph-list">{shown.map(({ v, s }) => { const last = c.byV.get(v.id)?.at(-1)?.d, st = PH_ST[s.st];
        return <button key={v.id} type="button" className="ph-row ph-vrow" onClick={() => c.openDrawer(<VenueDrawer id={v.id} />)}>
          <span className="ph-m"><span className="ph-t">{v.name}</span><span className="ph-meta"><span className={"ph-pill " + st[1]}>{st[0]}</span><span>{s.bins} bin{s.bins === 1 ? "" : "s"}{last ? ` · last ${dnice(last)}` : ""}</span></span></span>
          <span className="ph-cans"><b>{fmt(s.cans)}</b><span>cans</span></span></button>; })}</div>
        : <div className="ph-card"><p className="muted">{ql ? `No venue matches “${q}”.` : "Nothing here right now."}</p></div>}
    </div>);
  }

  return (
    <div className="card">
      <div className="card-h"><h2>Bin board</h2><span className="hint">{rows.length} venues · {totBins} bins · cans per bin, {p.label}{p.all ? ". Actions follow the latest month" : ""}</span><span className="sp" />
        <button className="btn btn-g btn-sm" onClick={() => c.openModal(<AddVenue />)}>+ Add venue</button></div>
      <div className="filters" style={{ marginBottom: 12 }}>
        <input className="search" type="search" placeholder="Search venues" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search venues" />
        {FILTERS.map(([k, l]) => (counts[k] || f === k) ? <button key={k} className="fchip" aria-pressed={f === k} onClick={() => setF(k)}>{l} <b>{counts[k] || 0}</b></button> : null)}
      </div>
      {c.sug.pulls.length > 0 && <div className="note-bar run-bar" style={{ marginBottom: 12 }}><span><b>{c.sug.pulls.length} venue{c.sug.pulls.length > 1 ? "s" : ""}</b> stayed low for 2 months. Plan where their bins go.</span><Link className="btn btn-p btn-sm" href="/admin/moves">Open Bin moves</Link></div>}
      <div className="legend" style={{ marginBottom: 6 }}>
        <span><i style={{ background: "var(--bad-bg)" }} />Under {c.set.pull}: low</span><span><i style={{ background: "var(--paper-2)" }} />{c.set.pull}–{c.set.add}: keep</span>
        <span><i style={{ background: "var(--good-bg)" }} />{c.set.add}+: add a bin</span><span><i style={{ background: "var(--ink-soft)", width: 8 }} />Steel bin</span><span><i style={{ background: "var(--copper-lit)", width: 8 }} />Plastic bin</span>
      </div>
      <div className="board">
        <div className="brow head"><span>Venue</span><span>Bins</span><span>Cans per bin per month</span><span style={{ textAlign: "right" }}>Per month</span><span>Action</span></div>
        {list.map(({ v, s }) => {
          const has = s.cpb != null && s.cans > 0;
          return <button key={v.id} className="brow" onClick={() => c.openDrawer(<VenueDrawer id={v.id} />)}>
            <span><span className="vn">{v.name}</span><br /><span className="vs">{fmt(s.cans)} cans · {s.n} pickup{s.n === 1 ? "" : "s"}{s.since ? <> · bin since {dnice(s.since)}{v.bin_est && <Est />}</> : s.bins ? <> · <span className="missing">add bin date</span></> : null}</span></span>
            <span className="pips" title={`${v.steel} steel, ${v.plastic_bins} plastic`}>{s.bins ? Array.from({ length: Math.min(s.bins, 12) }, (_, i) => <i key={i} className={"pip" + (i >= v.steel ? " p" : "")} />) : <i className="pip none" />}</span>
            {has ? <span className={"gauge " + s.st} aria-hidden="true">
              <span className="z z1" style={{ width: `${pct(c.set.pull)}%` }} /><span className="z z2" style={{ left: `${pct(c.set.pull)}%`, width: `${pct(c.set.add) - pct(c.set.pull)}%` }} />
              <span className="z z3" style={{ left: `${pct(c.set.add)}%` }} /><span className="fill" style={{ width: `${pct(s.cpb!)}%` }} /><span className="dot" style={{ left: `${pct(s.cpb!)}%` }} /></span>
              : <span className="gauge"><span className="empty-g">{s.st === "nobin" ? `${fmt(s.cans)} cans, no bins on record` : s.st === "quiet" ? `0 cans · ${fmt(s.all)} before` : s.st === "waiting" ? "Signed, waiting for a bin" : "No cans yet"}</span></span>}
            <span className="cpb">{has ? fmt(s.cpb!) : "–"}<small>per bin/mo</small></span>
            <span className="st"><Chip st={s.st} /></span>
          </button>;
        })}
        {!list.length && <p className="muted" style={{ padding: "20px 6px" }}>No venues match. Clear the search or pick another filter.</p>}
      </div>
    </div>
  );
}
