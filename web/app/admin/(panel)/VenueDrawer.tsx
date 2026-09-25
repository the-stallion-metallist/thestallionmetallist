"use client";
import { useState } from "react";
import Link from "next/link";
import { EditPayment } from "./forms2";
import { usePanel } from "./Panel";
import { I, Empty } from "./icons";
import { BinChangeForm, DatesForm, EditVenue, openLogPickup } from "./forms";
import { PST, ST, addDays, areaName, bins, dayName, dnice, fmt, kg, lowTxt, rs, vstatus, type State, type Venue } from "@/lib/admin/logic";
import type { Plan } from "@/lib/admin/routes";

// "Mon, Thu · every week" or "Mon wk A · every 2 weeks"
function planInfo(v: Venue, plan: Plan | null) {
  if (!plan) return null; const where: Record<"A" | "B", string[]> = { A: [], B: [] };
  for (const w of ["A", "B"] as const) for (const d of plan.weeks[w]) for (const s of d.stops) if (s.v.id === v.id) where[w].push(d.d + (s.extra ? " (extra)" : ""));
  if (!where.A.length && !where.B.length) return null;
  return where.A.join() === where.B.join() ? `${where.A.join(", ")} · every week` : `${[...where.A.map((x) => x + " wk A"), ...where.B.map((x) => x + " wk B")].join(", ")} · every 2 weeks`;
}

export const Chip = ({ st }: { st: State }) => <span className={"chip " + ST[st][1]}>{ST[st][0]}</span>;
export const Est = ({ t = "est." }: { t?: string }) => <span className="est">{t}</span>;

export default function VenueDrawer({ id, tab: tab0 = "sum" }: { id: number; tab?: "sum" | "pick" | "pay" | "bins" }) {
  const c = usePanel(); const [tab, setTab] = useState(tab0);
  const v = c.vmap.get(id); if (!v) return null;
  const s = c.stats(v); const n = bins(v);
  const adv: Record<State, React.ReactNode> = {
    add: <><b>Add a bin</b>{fmt(s.cpb!)} cans per bin a month is above {c.set.add}. Bins here fill up between pickups.</>,
    pull: <><b>Take {n > 1 ? `${n - 1} bin${n - 1 > 1 ? "s" : ""} back, leave 1` : "the last bin back"}</b>{lowTxt(s)}{s.counted || s.prevCpb ? ", two months in a row" : ""}. {n > 1 ? "Leave 1 bin and see if it picks up." : "Take the last bin back and pause the venue."} {c.moves.some((t) => t.status === "planned" && t.venue_id === v.id && t.kind === "pull") ? "Already planned in Bin moves." : <Link className="linkb" href="/admin/moves">Plan it in Bin moves</Link>}</>,
    watch: <><b>Low this month</b>{fmt(s.cpb!)} cans per bin a month, under {c.set.pull}. If next month is low too, it gets flagged to take a bin back.</>,
    kept: <><b>Kept for now</b>Low two months in a row, but you chose to keep the bin until {v.keep_until ? dnice(v.keep_until) : ""}.</>,
    waiting: <><b>Waiting for a bin</b>Signed {v.added ? dnice(v.added) : ""}, {v.promised || 1} bin{(v.promised || 1) > 1 ? "s" : ""} promised. {c.moves.some((t) => t.status === "planned" && t.venue_id === v.id) ? "A bin is planned in Bin moves." : <Link className="linkb" href="/admin/moves">See Bin moves</Link>}</>,
    new: <><b>Too new to judge</b>Bin placed on {s.since ? dnice(s.since) : ""}{v.bin_est ? " (estimated)" : ""}. It gets judged after {c.set.grace} days, on {s.since ? dnice(addDays(s.since, c.set.grace)) : ""}.</>,
    later: <><b>Bin not placed yet</b>The bin went out on {dnice(s.since || c.today)}, after this month.</>,
    quiet: <><b>Gone quiet</b>No cans this month, {fmt(s.all)} before. Call them before moving the bin.</>,
    idle: <><b>No cans yet</b>{s.since ? `Bins out since ${dnice(s.since)} but nothing collected.` : "Bins placed but nothing collected, and no bin date entered."} Check they are being used, or move them.</>,
    nobin: <><b>No bin record</b>Cans are coming in but no bins are recorded. Add the bin count.</>,
    keep: <><b>Keep as is</b>{fmt(s.cpb || 0)} cans per bin a month is in the healthy range ({c.set.pull}–{c.set.add}).</>,
  };
  const pickups = (c.byV.get(v.id) ?? []).slice().reverse();
  const hist = s.picks.slice(-12); const mx = Math.max(...hist.map((p) => p.n), 1);
  const log = c.binlog.filter((b) => b.venue_id === v.id).slice().reverse();
  const tabs: [typeof tab, string][] = [["sum", "Summary"], ["pick", "Pickups"], ["pay", "Payments"], ["bins", "Bins"]];
  const ps = c.pay(v); const pays = c.payments.filter((p) => !p.deleted && p.venue_id === v.id).sort((a, b) => (a.d < b.d ? 1 : -1));

  return (<>
    <div className="dr-h"><div><h2>{v.name}</h2><div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}><Chip st={s.st} />{ps.owed > 0 && <span className={"chip " + PST[ps.st][1]}>{PST[ps.st][0]}</span>}</div></div>
      <button className="x" onClick={c.closeLayers} aria-label="Close">{I.x}</button></div>
    <div className="dtabs" role="tablist">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>
    <div className="dr-b">
      {tab === "sum" && <>
        <div className={"advice a-" + s.st}>{adv[s.st]}</div>
        <div className="facts">
          <div className="fact"><div className="l">{c.per.short} cans</div><div className="v">{fmt(s.cans)}</div></div>
          <div className="fact"><div className="l">All time</div><div className="v">{fmt(s.all)}</div></div>
          <div className="fact"><div className="l">Owed now</div><div className="v">{ps.owed ? rs(ps.owed) : "₹0"}</div></div>
        </div>
        <div className="kv">
          <div><span>Pickup day</span><b>{planInfo(v, c.plan) || "Not on the route yet"}</b></div>
          <div><span>Area</span><b>{v.area ? <>{areaName(v.area)}{v.area_est && <Est t="example" />}</> : <span className="missing">Not set</span>}</b></div>
          <div><span>Contact</span><b>{v.contact || v.phone ? <>{v.contact}{v.phone && <> · <a href={`tel:${v.phone}`}>{v.phone}</a></>}</> : <span className="missing">Add name &amp; number</span>}</b></div>
          <div><span>Map pin</span><b>{v.lat != null ? <><a href={`https://www.google.com/maps?q=${v.lat},${v.lng}`} target="_blank" rel="noopener">Open in Google Maps</a>{v.pin_src === "googleCheck" && <Est t="check" />}</> : <span className="missing">Not set</span>}</b></div>
          <div><span>Payout per can</span><b>₹{Number(v.can_rate).toFixed(2)}</b></div>
          <div><span>Plastic payout</span><b>{v.plastic_rate ? `₹${v.plastic_rate}/kg` : `Default ₹${c.set.plasticBuy}/kg`}</b></div>
          <div><span>Payment</span><b>{v.terms}</b></div>
          <div><span>Status</span><b>{vstatus(v.status)}</b></div>
        </div>
        <div className="dr-act">
          <button className="btn btn-p" onClick={() => openLogPickup(c, v.id)}>Log pickup</button>
          <button className="btn btn-g" onClick={() => c.openModal(<EditPayment venueId={v.id} />)}>Pay venue</button>
          <button className="btn btn-g" onClick={() => c.openModal(<EditVenue v={v} />)}>Edit venue</button>
        </div>
      </>}
      {tab === "pay" && <>
        <div className="facts">
          <div className="fact"><div className="l">Owed now</div><div className="v">{ps.owed ? rs(ps.owed) : "₹0"}</div></div>
          <div className="fact"><div className="l">Status</div><div className="v" style={{ fontSize: 15, paddingTop: 4 }}><span className={"chip " + PST[ps.st][1]}>{PST[ps.st][0]}</span></div></div>
          <div className="fact"><div className="l">Terms</div><div className="v" style={{ fontSize: 15, paddingTop: 4 }}>{v.terms}</div></div>
        </div>
        <div className="kv">
          <div><span>Oldest unpaid</span><b>{ps.oldest ? `${dnice(ps.oldest)} · due ${dnice(ps.due!)}` : "–"}</b></div>
          <div><span>Owed from before {dnice(c.set.goLive || c.today)}</span><b>{v.opening == null ? <span className="missing">Not set</span> : rs(Number(v.opening))}</b></div>
          <div><span>UPI</span><b>{v.upi || <span className="missing">Not set</span>}</b></div>
        </div>
        <div className="dr-act"><button className="btn btn-p" onClick={() => c.openModal(<EditPayment venueId={v.id} />)}>Pay venue</button></div>
        {pays.length ? <div>{pays.map((p) => <button key={p.id} className="exp-row" onClick={() => c.openModal(<EditPayment rec={p} />)}><div><div className="t">{dnice(p.d)} · {p.mode}</div><div className="d">{p.note ? p.note + " · " : ""}by {p.created_by}</div></div><b>{rs(Number(p.amount))}</b></button>)}</div>
          : <Empty title="No payments yet" text="Payments you record for this venue show up here." />}
      </>}
      {tab === "pick" && <>
        {hist.length > 0 && <div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 90 }}>{hist.map((p, i) => <div key={i} title={`${dnice(p.d)}: ${fmt(p.n)} cans`} style={{ flex: 1, background: "var(--ink)", borderRadius: 3, height: `${Math.max((p.n / mx) * 100, 3)}%` }} />)}</div>
          <div className="muted" style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginTop: 4 }}><span>{dnice(hist[0].d)}</span><span>Last {hist.length} pickups</span><span>{dnice(hist.at(-1)!.d)}</span></div>
        </div>}
        {pickups.length ? <div>{pickups.map((p) => <button key={p.id} className="exp-row" onClick={() => openLogPickup(c, undefined, p)}>
          <div><div className="t">{dayName(p.d)} {dnice(p.d)}</div><div className="d">{p.plastic_kg ? kg(Number(p.plastic_kg)) + " kg plastic · " : ""}{p.fill ? p.fill + " · " : ""}by {p.created_by}{p.updated_by ? " · edited" : ""}</div></div>
          <b>{fmt(p.cans)} cans</b></button>)}</div>
          : <Empty title="No pickups yet" text="Log the first pickup for this venue."><button className="btn btn-p btn-sm" onClick={() => openLogPickup(c, v.id)}>Log pickup</button></Empty>}
      </>}
      {tab === "bins" && <>
        <div className="facts">
          <div className="fact"><div className="l">Bins</div><div className="v">{n}</div></div>
          <div className="fact"><div className="l">Per bin / mo</div><div className="v">{s.cpb != null ? fmt(s.cpb) : "–"}</div></div>
          <div className="fact"><div className="l">Advice</div><div className="v" style={{ fontSize: 14, paddingTop: 4 }}><Chip st={s.st} /></div></div>
        </div>
        <div className="kv">
          <div><span>Bins</span><b>{v.steel} steel · {v.plastic_bins} plastic{v.bags ? " · bags" : ""}</b></div>
          <div><span>Bin placed on</span><b>{v.bin_since ? <>{dnice(v.bin_since)}{v.bin_est && <Est />}</> : <span className="missing">Not set</span>}</b></div>
          <div><span>Counting from</span><b>{s.since ? `${dnice(s.since)} · ${fmt(s.counted)} cans in ${s.days} days` : "1st of the month"}</b></div>
          <div><span>Added to list</span><b>{v.added ? <>{dnice(v.added)}{v.added_est && <Est />}</> : <span className="missing">Not set</span>}</b></div>
        </div>
        <div className="dr-act">
          <button className="btn btn-g" onClick={() => c.openModal(<BinChangeForm venueId={v.id} />)}>Record bin change</button>
          <button className="btn btn-g" onClick={() => c.openModal(<DatesForm v={v} />)}>{v.added_est || v.bin_est || !v.bin_since ? "Set real dates" : "Edit dates"}</button>
        </div>
        {(v.added_est || v.bin_est) && <p className="muted" style={{ fontSize: 12.5 }}>Dates marked est. are the first pickup from the Excel. Replace them with the real dates so the counting is right.</p>}
        {log.length > 0 && <div className="kv">{log.map((b) => <div key={b.id}><span>{dnice(b.d)} · {b.created_by}</span><b>{b.change > 0 ? "Placed" : "Taken back"} {b.steel} steel, {b.plastic} plastic</b></div>)}</div>}
      </>}
    </div>
  </>);
}
