"use client";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import VenueDrawer from "../VenueDrawer";
import { AddVenue, EditVenue } from "../forms";
import { doMove, planMoves, setMoveStatus, setSpare, snooze } from "../moveslib";
import Link from "next/link";
import { type Venue, areaName, dnice, fmt, lowTxt } from "@/lib/admin/logic";
import { binsTxt } from "@/lib/admin/moves";

export default function Moves() {
  const c = usePanel(); const P = c.sug;
  // moves have no dates: each one is done on the next visit to the venue, so they are listed by area
  const open = c.moves.filter((t) => t.status === "planned").map((t) => ({ t, v: c.vmap.get(t.venue_id)! }))
    .sort((a, b) => (areaName(a.v.area) || "~").localeCompare(areaName(b.v.area) || "~") || a.v.name.localeCompare(b.v.name));
  const pullN = P.pulls.reduce((a, p) => a + p.n, 0), waitV = c.venues.filter((v) => v.status === "Waiting");
  const done = c.moves.filter((t) => t.status === "done").slice(-10).reverse();
  const bn = (n: number) => `${n} bin${n === 1 ? "" : "s"}`;
  const when = (v: Venue) => (v.area ? <>on the next visit to <Link className="linkb" href={`/admin/routes?area=${v.area}`}>{areaName(v.area)}</Link></> : <span className="missing">Area not set</span>);
  const name = (id: number, n: string) => <button className="rt-name" onClick={() => c.openDrawer(<VenueDrawer id={id} />)}>{n}</button>;

  return (<>
    <section className="kpis">
      <div className="kpi spare-k"><div className="l">Spare at godown</div>
        <div className="spare">
          <label htmlFor="spS">Steel<input id="spS" className="inl" type="number" inputMode="numeric" min={0} defaultValue={c.spare.steel} key={"s" + c.spare.steel} onBlur={(e) => { if (+e.target.value !== c.spare.steel) setSpare(c, Math.max(0, +e.target.value || 0), null); }} /></label>
          <label htmlFor="spP">Plastic<input id="spP" className="inl" type="number" inputMode="numeric" min={0} defaultValue={c.spare.plastic} key={"p" + c.spare.plastic} onBlur={(e) => { if (+e.target.value !== c.spare.plastic) setSpare(c, null, Math.max(0, +e.target.value || 0)); }} /></label>
        </div>
        <div className="s">{c.spare.counted ? "Bins taken back or bought add to this" : <><span className="missing">Count them once</span> · bins taken back or bought add to this</>}</div></div>
      <div className="kpi"><div className="l">To take back</div><div className="v">{pullN} <small>bins</small></div><div className="s">From {P.pulls.length} venue{P.pulls.length === 1 ? "" : "s"} low for 2 months</div></div>
      <div className="kpi"><div className="l">Waiting for a bin</div><div className="v">{waitV.length}</div><div className="s">{waitV.length ? `${bn(waitV.reduce((a, v) => a + (v.promised || 1), 0))} promised` : "No signed venue is waiting"}</div></div>
      <div className="kpi hero"><div className="l">Moves planned</div><div className="v">{open.length}</div><div className="s">{open.length ? `In ${new Set(open.map((o) => o.v.area ?? "")).size} area${new Set(open.map((o) => o.v.area ?? "")).size === 1 ? "" : "s"}, done on the next visit` : "Nothing planned"}</div></div>
    </section>
    <div className="card">
      <div className="card-h"><h2>Suggested moves</h2><span className="hint">Low for 2 months → signed venues waiting → busy venues</span><span className="sp" /><button className="btn btn-g btn-sm" onClick={() => c.openModal(<AddVenue />)}>+ Signed venue</button></div>
      {P.pulls.length || P.give.length || P.wait.length ? <>
        <div className="mv-grid">
          <div><h3 className="mv-h">Take back <span>{bn(pullN)} from {P.pulls.length} venue{P.pulls.length === 1 ? "" : "s"}</span></h3>
            {P.pulls.length ? P.pulls.map((p) => <div key={p.v.id} className="mv-row"><div className="mv-main">{name(p.v.id, p.v.name)}<div className="d">{lowTxt(p.s)}</div>
              <div className="d"><b>{p.last ? "Last bin · venue pauses" : `${binsTxt(p.steel, p.pb)} · leave 1`}</b> · {when(p.v)}</div></div>
              <div className="mv-act"><button className="btn btn-g btn-sm" onClick={() => snooze(c, p.v, "keep_until")}>Keep for now</button></div></div>)
              : <Empty title="Nothing to take back" text="No venue has been low for 2 months in a row." />}
          </div>
          <div><h3 className="mv-h">Give to <span>{P.give.length} venue{P.give.length === 1 ? "" : "s"}</span></h3>
            {P.give.map((g) => <div key={g.v.id} className="mv-row"><div className="mv-main">{name(g.v.id, g.v.name)}
              <div className="d">{g.why === "waiting" ? `Signed ${g.v.added ? dnice(g.v.added) : ""} · waiting ${g.v.added ? Math.max(0, Math.round((Date.parse(c.today) - Date.parse(g.v.added)) / 864e5)) : 0} days` : `${fmt(g.s!.cpb || 0)} cans per bin a month · bins overflow`}</div>
              <div className="d"><b>{bn(g.n)} from {g.from.join(", ")}</b> · {when(g.v)}</div></div>
              <div className="mv-act"><button className="btn btn-g btn-sm" onClick={() => snooze(c, g.v, "skip_give")}>Not now</button></div></div>)}
            {P.wait.map((w) => <div key={w.v.id} className="mv-row"><div className="mv-main">{name(w.v.id, w.v.name)}<div className="d">{w.why === "waiting" ? `Signed, ${bn(w.n)} promised` : `${fmt(w.s!.cpb || 0)} cans per bin a month`}</div>
              <div className="d"><span className="missing">{w.noPin ? "Needs a map location first" : "No free bin yet. Buy one, or it gets the next bin taken back."}</span></div></div>
              {w.noPin && <div className="mv-act"><button className="btn btn-g btn-sm" onClick={() => c.openModal(<EditVenue v={w.v} />)}>Add location</button></div>}</div>)}
            {!P.give.length && !P.wait.length && <Empty title="Nobody needs a bin" text={`No signed venue is waiting, and no venue is over ${c.set.add} cans per bin.`} />}
            {P.left > 0 && <p className="mv-left">{bn(P.left)} will stay at the godown as spare.</p>}
          </div>
        </div>
        {(P.pulls.length > 0 || P.give.length > 0) && <div className="mv-foot"><button className="btn btn-p" onClick={() => planMoves(c)}>Plan {P.pulls.length + P.give.length} moves</button>
          <span className="muted">Each move shows on the Areas map with its venue. Tap Mark done when the bins have moved.</span></div>}
      </> : <Empty title="No bins to move" text="Nothing has been low for 2 months, and no venue needs a bin." />}
    </div>
    <div className="card"><div className="card-h"><h2>Planned</h2><span className="hint">Also shown with each venue on the Areas map</span></div>
      {open.length ? open.map(({ t, v }) => <div key={t.id} className="mv-row"><span className={"chip " + (t.kind === "pull" ? "c-pull" : "c-add")}>{t.kind === "pull" ? "Take back" : "Place"}</span>
        <div className="mv-main">{name(v.id, v.name)}<div className="d">{t.kind === "pull" ? binsTxt(t.steel, t.plastic) + (t.last_bin ? " · last bin, venue pauses" : "") : `${bn(t.n)} from ${t.source}`} · {when(v)}</div></div>
        <div className="mv-act"><button className="btn btn-g btn-sm" onClick={async () => { if (await doMove(c, t)) c.toast(`${v.name}: ${t.kind === "pull" ? "bins taken back" : "bin placed"}`); }}>Mark done</button>
          <button className="btn btn-g btn-sm" onClick={async () => { await setMoveStatus(c, t, "cancelled"); c.toast("Bin move cancelled", () => setMoveStatus(c, t, "planned")); }}>Cancel</button></div></div>)
        : <Empty title="Nothing planned" text="Moves you plan show up here and on the Areas map." />}
    </div>
    {done.length > 0 && <details className="card fold"><summary><h2>Done recently</h2><span className="hint">{done.length} move{done.length === 1 ? "" : "s"}</span></summary>
      <div className="fold-b"><div className="kv">{done.map((t) => <div key={t.id}><span>{t.done_on ? dnice(t.done_on) : ""} · {c.vmap.get(t.venue_id)?.name}</span><b>{t.kind === "pull" ? "Took back" : "Placed"} {bn(t.n)} · {t.done_by}</b></div>)}</div></div></details>}
    <details className="card fold"><summary><h2>How bin moves work</h2></summary><div className="fold-b"><ol className="how" style={{ margin: 0 }}>
      <li>A venue under {c.set.pull} cans per bin a month, two months in a row, is flagged. No cans at all counts as low.</li>
      <li>A venue with 2 or more bins keeps 1. If that last bin stays low for 2 more months, it comes back too and the venue is paused.</li>
      <li>Free bins go first to signed venues waiting for a bin (oldest first), then to venues over {c.set.add} cans per bin.</li>
      <li>A bin taken back waits at the godown and goes out the next time someone visits the new venue.</li>
      <li><b>Keep for now</b> and <b>Not now</b> hide a suggestion until the end of next month.</li>
      <li>Steel or plastic bins you record under Money → Add expense → Bins &amp; bags are added to the spare count.</li></ol></div></details>
  </>);
}
