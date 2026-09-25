"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type PanelCtxT, usePanel, SCREENS } from "./Panel";
import { I, Empty } from "./icons";
import VenueDrawer from "./VenueDrawer";
import { openLogPickup, vname } from "./forms";
import { EditPayment, EditExpense, EditSale, EditTrip } from "./forms2";
import { areaName, dayName, dnice, fmt, itemLabel, rs } from "@/lib/admin/logic";

export const openSearch = (c: PanelCtxT) => c.openModal(<Search />);

// One box that finds venues, pickups, payments, expenses, sales, trips, staff and screens.
function Search() {
  const c = usePanel(); const router = useRouter(); const [q, setQ] = useState(""); const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 60); }, []);
  const k = q.trim().toLowerCase(), has = (s: unknown) => String(s ?? "").toLowerCase().includes(k), num = +k.replace(/[₹,]/g, ""), eq = (x: number) => !!num && Math.round(x) === num;
  const row = (key: string, t: string, d: string, r: string, go: () => void) => <button key={key} className="gs-row" onClick={go}><span><span className="t">{t}</span><br /><span className="d">{d}</span></span><b>{r}</b></button>;
  const groups: [string, React.ReactNode[]][] = !k ? [] : [
    ["Venues", c.venues.filter((v) => has(v.name) || has(v.contact) || has(v.phone)).slice(0, 8).map((v) => { const o = c.pay(v).owed; return row("v" + v.id, v.name, `${areaName(v.area)} · ${v.steel + v.plastic_bins} bins`, o ? rs(o) + " owed" : "", () => c.openDrawer(<VenueDrawer id={v.id} />)); })],
    ["Pickups", c.pickups.filter((p) => !p.deleted && (has(vname(c, p.venue_id)) || has(dnice(p.d)) || eq(p.cans) || has(p.staff))).sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 8)
      .map((p) => row("p" + p.id, vname(c, p.venue_id), `${dayName(p.d)} ${dnice(p.d)}${p.staff ? " · " + p.staff : ""}`, fmt(p.cans) + " cans", () => openLogPickup(c, undefined, p)))],
    ["Payments", c.payments.filter((p) => !p.deleted && (has(vname(c, p.venue_id)) || eq(Number(p.amount)) || has(p.note) || has(dnice(p.d)))).sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 6)
      .map((p) => row("y" + p.id, vname(c, p.venue_id), `${dnice(p.d)} · ${p.mode}`, rs(Number(p.amount)), () => c.openModal(<EditPayment rec={p} />)))],
    ["Expenses", c.expenses.filter((e) => !e.deleted && (has(e.category) || has(c.staff.find((s) => s.id === e.staff_id)?.name) || has(e.note) || has(e.other) || eq(Number(e.amount)))).slice(0, 6)
      .map((e) => row("e" + e.id, e.category === "Salaries" ? "Salary · " + (c.staff.find((s) => s.id === e.staff_id)?.name ?? "") : e.qty ? itemLabel(e) : e.category, dnice(e.d), rs(Number(e.amount)), () => c.openModal(<EditExpense rec={e} />)))],
    ["Sales", c.sales.filter((s) => !s.deleted && (has(s.buyer) || has(s.code) || eq(Number(s.kg) * Number(s.rate)))).slice(0, 6)
      .map((s) => row("s" + s.id, s.buyer, `${s.code} · ${dnice(s.d)}`, rs(Number(s.kg) * Number(s.rate)), () => c.openModal(<EditSale rec={s} />)))],
    ["Trips", c.trips.filter((t) => !t.deleted && (has(t.code) || has(t.driver) || has(t.vehicle))).slice(0, 6)
      .map((t) => row("t" + t.id, t.code, `${dnice(t.d)} · ${t.driver}`, fmt(t.cans) + " cans", () => c.openModal(<EditTrip rec={t} />)))],
    ["Staff", c.staff.filter((s) => has(s.name)).map((s) => row("st" + s.id, s.name, "Attendance and salary", "", () => { c.closeModal(); router.push("/admin/staff"); }))],
    ["Screens", SCREENS.filter((s) => !("hidden" in s) && has(s.t)).map((s) => row("sc" + s.href, s.t, "Go to screen", "", () => { c.closeModal(); router.push(s.href); }))],
  ];
  const found = groups.filter(([, l]) => l.length);
  return (<>
    <div className="dr-h"><h2>Search</h2><button className="x" onClick={c.closeModal} aria-label="Close">{I.x}</button></div>
    <div className="srch">
      <label className="sr-only" htmlFor="gs">Search</label>
      <input id="gs" ref={ref} type="search" placeholder="Venue, staff, buyer, amount or date" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="gsr" aria-live="polite">
        {!k ? <p className="muted" style={{ margin: "6px 2px" }}>Type a venue, a staff name, an amount like 1500, or a date like 22 Sep.</p>
          : found.length ? found.map(([t, l]) => <div key={t}><div className="gs-h">{t}</div>{l}</div>)
          : <Empty title={`Nothing matches "${q}"`} text="Check the spelling, or try part of a name." />}
      </div>
    </div>
  </>);
}
