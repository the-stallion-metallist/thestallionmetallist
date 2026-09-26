"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminDb } from "@/lib/admin/supabase-browser";
import {
  type Advance, type BinChange, type Expense, type LogRow, type Mark, type Payment, type Period, type Pickup, type Sale,
  type Settings, type StaffRow, type Stats, type Trip, type Venue, type PayState,
  DATA_START, MON, areaName, byVenue, monthOf, monthsSince, payState, period, todayIST, venueStats,
} from "@/lib/admin/logic";
import { type AreaRule, type Matrix, type Pin, type Plan, type Zones, buildZones, optimisePlan } from "@/lib/admin/routes";
import { type Move, type Spare, type Suggestion, movePlan } from "@/lib/admin/moves";
import { I } from "./icons";
import { openLogPickup } from "./forms";
import { openSearch } from "./Search";
import { syncAppPickups } from "../actions";

export type Member = { name: string; role: string; email: string };
export type RunStop = { vid: number; exp: number; extra: boolean; added?: boolean; mode: "todo" | "done" | "skip"; fill: string; reason: string; cans?: number; pl?: number; paid?: boolean; cost?: number; pid?: number; payId?: number; movesTxt?: string };
export type Run = { id: number; day: number; week: "A" | "B"; label: string; staff: string; plan_min: number | null; started_at: string; finished_at: string | null; stops: RunStop[]; trip_id: number | null };
export type Data = {
  venues: Venue[]; pickups: Pickup[]; binlog: BinChange[]; payments: Payment[]; log: LogRow[]; set: Settings & { godown?: Pin };
  trips: Trip[]; sales: Sale[]; expenses: Expense[]; staff: StaffRow[]; marks: Mark[]; advances: Advance[];
  moves: Move[]; spare: Spare; run: Run | null; zones: Zones; areaRule: AreaRule; matrix: Matrix;
};
type Ctx = Data & {
  me: Member; today: string; db: ReturnType<typeof adminDb>;
  vmap: Map<number, Venue>; byV: Map<number, Pickup[]>;
  month: string; setMonth: (m: string) => void; per: Period; now: Period; stats: (v: Venue, p?: Period) => Stats;
  plan: Plan | null; sug: Suggestion; pay: (v: Venue) => PayState; god: Pin;
  patch: (fn: (d: Data) => Data) => void; reload: () => Promise<void>;
  logIt: (action: string, what: string, label: string, changes?: string, ref?: { table: string; id: number }) => Promise<void>;
  toast: (msg: string, undo?: () => void | Promise<void>) => void;
  openDrawer: (node: React.ReactNode) => void; openModal: (node: React.ReactNode) => void; closeModal: () => void; closeLayers: () => void;
  fail: (e: { message: string } | null) => boolean; badges: Record<string, number | string>;
  phone: boolean; // 880px wide or under: the phone layouts
};
const PanelCtx = createContext<Ctx | null>(null);
export const usePanel = () => useContext(PanelCtx)!;
export type PanelCtxT = Ctx;

// All pages of a table (Supabase answers 1,000 rows at a time).
async function fetchAll<T>(db: ReturnType<typeof adminDb>, table: string, order: string) {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select("*").order(order).range(from, from + 999);
    if (error) throw error;
    out.push(...(data as T[]));
    if (!data || data.length < 1000) return out;
  }
}
const one = <T,>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) => Promise.resolve(p).then((r) => { if (r.error) throw r.error; return r.data as T; });

export const SCREENS = [
  { href: "/admin", t: "Overview", grp: "Daily", icon: "overview", sub: "" },
  { href: "/admin/venues", t: "Venues & bins", grp: "Daily", icon: "venues", sub: "Cans per bin per month, counted from the day the bin was placed" },
  { href: "/admin/moves", t: "Bin moves", grp: "Daily", icon: "moves", sub: "Take bins back from venues that stay low, and give them to venues that need one" },
  { href: "/admin/pickups", t: "Pickups", grp: "Daily", icon: "pickups", sub: "Every collection, from bins, the app and walk-ins" },
  { href: "/admin/routes", t: "Route planner", grp: "Daily", icon: "routes", sub: "Smart zones on real roads. Every route starts and ends at the godown on Turner Road." },
  { href: "/admin/locations", t: "Venue locations", grp: "Daily", icon: "locations", sub: "Exact points for each venue, so routes use the right roads" },
  { href: "/admin/trips", t: "Trips", grp: "Daily", icon: "trips", sub: "Vehicle, km and fuel for each collection run" },
  { href: "/admin/stock", t: "Stock & sales", grp: "Money", icon: "stock", sub: "What is in the godown and what went to buyers" },
  { href: "/admin/money", t: "Money", grp: "Money", icon: "money", sub: "" },
  { href: "/admin/payouts", t: "Venue payouts", grp: "Money", icon: "payouts", sub: "Venues are paid on the spot at each pickup. Anything left unpaid shows here." },
  { href: "/admin/people", t: "People", grp: "Team", icon: "people", sub: "Who brought which clients, ranked by the cans their venues give" },
  { href: "/admin/staff", t: "Staff", grp: "Team", icon: "staff", sub: "Attendance, salaries and advances" },
  { href: "/admin/history", t: "Change history", grp: "Team", icon: "history", sub: "Every add, edit and delete, and who made it" },
  { href: "/admin/settings", t: "Settings", grp: "Team", icon: "settings", sub: "Rates, bin rules, routes, team and Excel" },
  { href: "/admin/run", t: "Route in progress", grp: "Daily", icon: "run", sub: "", hidden: true },
] as const;
const MONTH_SCREENS = ["/admin", "/admin/venues", "/admin/pickups", "/admin/trips", "/admin/stock", "/admin/money"];
const MORE = ["/admin/pickups", "/admin/moves", "/admin/locations", "/admin/trips", "/admin/stock", "/admin/payouts", "/admin/people", "/admin/staff", "/admin/history", "/admin/settings"];
// screens with their own phone layout (they draw their own heading on phones)
const PHONE_OWN = ["/admin", "/admin/routes", "/admin/venues", "/admin/money", "/admin/people"];
function usePhone() {
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && matchMedia("(max-width: 880px)").matches); // the panel only draws in the browser
  useEffect(() => { const m = matchMedia("(max-width: 880px)"); const f = () => setPhone(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return phone;
}

export default function Panel({ children }: { children: React.ReactNode }) {
  const db = useMemo(() => adminDb(), []);
  const router = useRouter(); const path = usePathname();
  const today = todayIST();
  const [data, setData] = useState<Data | null>(null);
  const [me, setMe] = useState<Member | null>(null); const [outsider, setOutsider] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [month, setMonth] = useState(monthOf(today));
  const [drawer, setDrawer] = useState<React.ReactNode>(null); const [drawerOn, setDrawerOn] = useState(false);
  const [modal, setModal] = useState<React.ReactNode>(null); const [modalOn, setModalOn] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ m: string; undo?: () => void | Promise<void> } | null>(null);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastLoad = useRef(0); const modalOnRef = useRef(false); modalOnRef.current = modalOn;

  const reload = useCallback(async () => {
    try {
      // who is logged in (read from this browser's login, no server trip) and whether they're on the team
      const { data: { session } } = await db.auth.getSession();
      if (!session) { location.href = "/admin/login"; return; }
      const { data: m } = await db.from("team").select("name, role, email").eq("user_id", session.user.id).maybeSingle();
      if (!m) { setOutsider(session.user.email ?? "this account"); return; }
      setMe(m as Member);
      const [venues, pickups, binlog, payments, log, s, trips, sales, expenses, staff, marks, advances, moves, spare, runs, ps, matrix] = await Promise.all([
        fetchAll<Venue>(db, "venues", "id"), fetchAll<Pickup>(db, "pickups", "id"), fetchAll<BinChange>(db, "bin_log", "id"), fetchAll<Payment>(db, "payments", "id"),
        one<LogRow[]>(db.from("change_log").select("*").order("id", { ascending: false }).limit(500)),
        one<{ data: Data["set"] }>(db.from("settings").select("data").eq("id", 1).single()),
        fetchAll<Trip>(db, "trips", "id"), fetchAll<Sale>(db, "sales", "id"), fetchAll<Expense>(db, "expenses", "id"),
        one<StaffRow[]>(db.from("staff").select("id, name, salary, active").order("id")),
        fetchAll<Mark>(db, "attendance", "d"), fetchAll<Advance>(db, "advances", "id"), fetchAll<Move>(db, "bin_moves", "id"),
        one<Spare>(db.from("spare_bins").select("steel, plastic, counted").eq("id", 1).single()),
        one<Run[]>(db.from("route_runs").select("*").is("finished_at", null).limit(1)),
        one<{ key: string; value: unknown }[]>(db.from("plan_state").select("key, value")),
        one<Matrix>(db.from("road_matrix").select("pts, dur, dist, fetched_at").eq("id", 1).single()),
      ]);
      const st = Object.fromEntries(ps.map((r) => [r.key, r.value]));
      setData({ venues, pickups, binlog, payments, log, set: s.data, trips, sales, expenses, staff, marks, advances, moves, spare, run: runs[0] ?? null,
        zones: (st.zones as Zones) ?? null, areaRule: (st.areaRule as AreaRule) ?? null, matrix });
      setLoadErr(""); lastLoad.current = Date.now();
    } catch (e) { setLoadErr((e as Error).message); }
  }, [db]);
  useEffect(() => { reload(); }, [reload]);
  // household pickups from the customer app: copied in quietly, then the panel refreshes if anything changed
  useEffect(() => { syncAppPickups().then((r) => { if (r.added || r.updated || r.removed) reload(); }).catch(() => {}); }, [reload]);
  // other team members' changes show up when you come back to the tab
  useEffect(() => {
    const f = () => { if (Date.now() - lastLoad.current > 30000) reload(); };
    window.addEventListener("focus", f); return () => window.removeEventListener("focus", f);
  }, [reload]);

  const closeLayers = useCallback(() => { setDrawerOn(false); setModalOn(false); }, []);
  const closeModal = useCallback(() => setModalOn(false), []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { if (modalOnRef.current) closeModal(); else closeLayers(); } };
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, [closeLayers, closeModal]);
  useEffect(() => { closeLayers(); }, [path, closeLayers]);
  const toast = useCallback((m: string, undo?: () => void | Promise<void>) => {
    clearTimeout(toastT.current); setToastMsg({ m, undo });
    toastT.current = setTimeout(() => setToastMsg(null), undo ? 5000 : 2600);
  }, []);

  if (outsider) return <div className="content" style={{ maxWidth: 560, margin: "0 auto", paddingTop: 80 }}><div className="card"><h2>This account isn&apos;t on the team</h2>
    <p className="muted" style={{ margin: "8px 0 14px" }}>You&apos;re logged in as {outsider}, but only people the owner has added can open the team panel. Ask the owner to add you.</p>
    <button className="btn btn-g" onClick={async () => { await db.auth.signOut(); location.href = "/admin/login"; }}>Log out</button></div></div>;
  if (loadErr) return <div className="content"><div className="card"><h2>Couldn&apos;t load the panel</h2><p className="muted" style={{ margin: "8px 0 14px" }}>{loadErr}</p><button className="btn btn-p" onClick={reload}>Try again</button></div></div>;
  if (!data || !me) return <div className="content" aria-busy="true"><p className="muted" style={{ padding: "40px 0" }}>Loading your data…</p></div>;

  return <Loaded {...{ data, setData, me, db, today, month, setMonth, reload, toast, closeLayers, closeModal, router, path }}
    openDrawer={(n) => { setModalOn(false); setDrawer(n); setDrawerOn(true); }}
    openModal={(n) => { setModal(n); setModalOn(true); }}
    layers={{ drawer, drawerOn, modal, modalOn, toastMsg, clearToast: () => { clearTimeout(toastT.current); setToastMsg(null); } }}>{children}</Loaded>;
}

function Loaded(props: {
  data: Data; setData: React.Dispatch<React.SetStateAction<Data | null>>; me: Member; db: ReturnType<typeof adminDb>; today: string;
  month: string; setMonth: (m: string) => void; reload: () => Promise<void>; toast: Ctx["toast"]; closeLayers: () => void; closeModal: () => void;
  router: ReturnType<typeof useRouter>; path: string; openDrawer: (n: React.ReactNode) => void; openModal: (n: React.ReactNode) => void;
  layers: { drawer: React.ReactNode; drawerOn: boolean; modal: React.ReactNode; modalOn: boolean; toastMsg: { m: string; undo?: () => void | Promise<void> } | null; clearToast: () => void };
  children: React.ReactNode;
}) {
  const { data, setData, me, db, today, month, setMonth, reload, toast, closeLayers, closeModal, path, layers } = props;
  const phone = usePhone();
  const vmap = useMemo(() => new Map(data.venues.map((v) => [v.id, v])), [data.venues]);
  const venues = useMemo(() => data.venues.filter((v) => !v.deleted), [data.venues]);
  const byV = useMemo(() => byVenue(data.pickups), [data.pickups]);
  const per = useMemo(() => period(month, today), [month, today]);
  const now = useMemo(() => period(monthOf(today), today), [today]);
  const cache = useMemo(() => new Map<string, Stats>(), [data, per]); // eslint-disable-line react-hooks/exhaustive-deps
  const stats = useCallback((v: Venue, p: Period = per) => {
    const k = v.id + "|" + p.key; let s = cache.get(k);
    if (!s) { s = venueStats(v, p, byV.get(v.id) ?? [], data.set, today); cache.set(k, s); }
    return s;
  }, [cache, per, byV, data.set, today]);
  const patch = useCallback((fn: (d: Data) => Data) => setData((d) => (d ? fn(d) : d)), [setData]);
  const logIt = useCallback(async (action: string, what: string, label: string, changes = "", ref?: { table: string; id: number }) => {
    const { data: row } = await db.from("change_log").insert({ action, what, label, changes, ref_table: ref?.table ?? null, ref_id: ref?.id ?? null }).select().single();
    if (row) patch((d) => ({ ...d, log: [row as LogRow, ...d.log] }));
  }, [db, patch]);
  const fail = useCallback((e: { message: string } | null) => { if (e) { toast("Not saved: " + e.message); return true; } return false; }, [toast]);

  // the route plan: zones are built once from road times and kept, so venues keep their day
  const god: Pin = data.set.godown ?? [30.27847, 78.00318];
  const waitingWithBin = useMemo(() => new Set(data.moves.filter((t) => t.status === "planned" && t.kind === "place").map((t) => t.venue_id)), [data.moves]);
  const rctx = useMemo(() => ({ venues, byV, set: data.set, matrix: data.matrix, zones: data.zones, areaRule: data.areaRule, today, waitingWithBin }),
    [venues, byV, data.set, data.matrix, data.zones, data.areaRule, today, waitingWithBin]);
  const plan = useMemo(() => optimisePlan(rctx, areaName), [rctx]);
  const building = useRef(false);
  useEffect(() => { // first time (or after the road data arrives): build zones and save them for everyone
    if (data.zones || building.current || data.matrix.pts.length < 7) return;
    building.current = true;
    const z = buildZones(rctx);
    if (z) db.from("plan_state").update({ value: z }).eq("key", "zones").then(({ error }) => { if (!error) patch((d) => ({ ...d, zones: z })); building.current = false; });
  }, [data.zones, data.matrix, rctx, db, patch]);
  const pay = useCallback((v: Venue) => payState(v, byV.get(v.id) ?? [], data.payments, vmap, data.set, today), [byV, data.payments, vmap, data.set, today]);
  const sug = useMemo(() => movePlan({ venues, stats, now, set: data.set, plan, moves: data.moves, spare: data.spare, today, vmap }),
    [venues, stats, now, data.set, plan, data.moves, data.spare, today, vmap]);

  const badges = useMemo(() => {
    const b: Record<string, number | string> = {};
    const od = venues.filter((v) => pay(v).st === "overdue").length; if (od) b["/admin/payouts"] = od;
    const loc = venues.filter((v) => v.status !== "Pulled" && v.steel + v.plastic_bins > 0 && v.pin_src !== "google" && v.pin_src !== "manual").length; if (loc) b["/admin/locations"] = loc;
    const act = venues.filter((v) => ["add", "pull", "quiet"].includes(stats(v, now).st)).length; if (act) b["/admin/venues"] = act;
    const mv = sug.pulls.length + sug.give.length; if (mv) b["/admin/moves"] = mv;
    if (data.run) b["/admin/routes"] = "●";
    return b;
  }, [venues, data.run, pay, stats, now, sug]);

  const ctx: Ctx = { ...data, venues, me, today, db, vmap, byV, month, setMonth, per, now, stats, plan, sug, pay, god, patch, reload, logIt, toast,
    openDrawer: props.openDrawer, openModal: props.openModal, closeModal, closeLayers, fail, badges, phone };

  useEffect(() => { // "/" opens search
    const k = (e: KeyboardEvent) => { if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement)?.tagName || "")) { e.preventDefault(); openSearch(ctx); } };
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  });

  const scr = SCREENS.find((s) => s.href === path) ?? SCREENS[0];
  const nMonths = monthsSince(DATA_START, monthOf(today)).length;
  const months = [...monthsSince(DATA_START, monthOf(today)).slice(-3), "all"];
  const monthBtn = (m: string) => <button key={m} aria-pressed={month === m} onClick={() => setMonth(m)} title={m === "all" ? "All months together" : undefined}>
    {m === "all" ? (nMonths === 2 ? "Both" : "All") : MON[+m.slice(5, 7) - 1]}</button>;
  const sub = scr.href === "/admin" ? `${per.label}${per.end >= today ? " · as of " + new Date(today + "T00:00:00").getDate() + " " + MON[+today.slice(5, 7) - 1] : ""}`
    : scr.href === "/admin/money" ? `Profit and costs for ${per.label}`
    : scr.href === "/admin/run" ? (data.run ? `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][data.run.day]}'s route · tap each stop as you go` : "Nothing running right now") : scr.sub;
  const logOut = async () => { await db.auth.signOut(); location.href = "/admin/login"; };
  const routeHref = data.run ? "/admin/run" : "/admin/routes";
  const isCur = (h: string) => path === h || (h === "/admin/routes" && path === "/admin/run");
  const nb = (h: string) => (ctx.badges[h] ? <span className="nb" aria-label={ctx.badges[h] === "●" ? "running" : `${ctx.badges[h]} to do`}>{ctx.badges[h]}</span> : null);
  const inMore = MORE.includes(path);
  const moreDot = MORE.some((h) => ctx.badges[h]);
  const { toastMsg } = layers;
  let grp = "";

  return (
    <PanelCtx.Provider value={ctx}>
      <div className="shell">
        <aside className="side" aria-label="Team panel navigation">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="brand"><img src="/brand/logo-mark.png" alt="" /><div><b>STALLION</b><small>Team panel</small></div></div>
          <nav className="nav">
            {SCREENS.filter((s) => !("hidden" in s)).map((s) => {
              const head = s.grp !== grp ? <div className="grp" key={s.grp}>{s.grp}</div> : null; grp = s.grp;
              return [head, <Link key={s.href} href={s.href === "/admin/routes" ? routeHref : s.href} className="navb" aria-current={isCur(s.href) ? "page" : undefined}>{I[s.icon]}{s.t}{nb(s.href)}</Link>];
            })}
          </nav>
          <div className="side-foot"><div className="av">{me.name[0]}</div><div className="who"><b>{me.name}</b><br /><span>{me.role} · full access</span></div>
            <button onClick={logOut} aria-label="Log out" title="Log out">{I.logout}</button></div>
        </aside>
        <div className="main">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="mtop"><img src="/brand/logo-mark.png" alt="" /><b>Stallion</b>
            <button className="srchbtn" onClick={() => openSearch(ctx)} aria-label="Search">{I.search}</button>
            <button className="mlog" onClick={() => openLogPickup(ctx)}>{I.plus}Log pickup</button></div>
          {!(phone && PHONE_OWN.includes(path)) && <div className="top">
            <div><div className="eyebrow">{scr.grp}</div><h1>{scr.t}</h1><div className="sub">{sub}</div></div>
            <div className="sp" />
            <button className="btn btn-g iconbtn hide-m" onClick={() => openSearch(ctx)} aria-label="Search (press /)" title="Search (press /)">{I.search}Search</button>
            <div className="seg" role="group" aria-label="Month" style={{ visibility: MONTH_SCREENS.includes(path) ? "visible" : "hidden" }}>{months.map(monthBtn)}</div>
            <button className="btn btn-p" onClick={() => openLogPickup(ctx)}>{I.plus}Log pickup</button>
          </div>}
          <main className="content">{props.children}</main>
        </div>
      </div>
      <nav className="bnav" aria-label="Sections">
        {[["/admin", "Home", "home"], [routeHref, "Route", "routes"], ["/admin/venues", "Venues", "venues"], ["/admin/money", "Money", "money"]].map(([h, l, ic]) =>
          <Link key={l} href={h} className="navb" aria-current={isCur(h === routeHref ? "/admin/routes" : h) ? "page" : undefined}>{I[ic]}{l}{nb(h === routeHref ? "/admin/routes" : h)}</Link>)}
        <button className="navb" aria-current={inMore ? "page" : undefined} onClick={() => ctx.openModal(<MoreSheet onLogOut={logOut} />)}>{I.more}More{moreDot && <span className="nb dot" aria-label="Something in More needs a look" />}</button>
      </nav>
      <div className={"scrim" + (layers.drawerOn || layers.modalOn ? " on" : "")} onClick={closeLayers} />
      <aside className={"drawer" + (layers.drawerOn ? " on" : "")} aria-hidden={!layers.drawerOn}>{layers.drawerOn ? layers.drawer : null}</aside>
      <div className={"modal" + (layers.modalOn ? " on" : "")} role="dialog" aria-modal="true" aria-hidden={!layers.modalOn}>{layers.modalOn ? layers.modal : null}</div>
      <div className={"toast" + (toastMsg ? " on" : "") + (toastMsg?.undo ? " act" : "")} role="status" aria-live="polite">
        {toastMsg?.m}{toastMsg?.undo && <button type="button" className="tundo" onClick={async () => { const u = toastMsg.undo!; layers.clearToast(); await u(); }}>Undo</button>}
      </div>
    </PanelCtx.Provider>
  );
}

// what each More item is for, in a few words
const MORE_SUB: Record<string, string> = { "/admin/pickups": "Every collection", "/admin/moves": "Bins to take back or place", "/admin/locations": "Map pins for the route", "/admin/trips": "Km and fuel",
  "/admin/stock": "What is in the godown", "/admin/payouts": "Paying venues", "/admin/people": "Who brought which clients", "/admin/staff": "Attendance and pay", "/admin/history": "Who changed what", "/admin/settings": "Rates, team, Excel" };
function MoreSheet({ onLogOut }: { onLogOut: () => void }) {
  const c = usePanel();
  return (<>
    <div className="dr-h"><h2>More</h2><button className="x" onClick={c.closeModal} aria-label="Close">{I.x}</button></div>
    <div className="more-b"><div className="ph-list flat">
      {MORE.map((h) => { const s = SCREENS.find((x) => x.href === h)!; const b = c.badges[h];
        return <Link key={h} href={h} className="ph-row" onClick={c.closeModal}><span className="ph-cnt icon">{I[s.icon]}</span><span className="ph-m"><span className="ph-t">{s.t}</span><span className="ph-d">{MORE_SUB[h]}</span></span>
          {b ? <span className="ph-badge">{b}</span> : null}<span className="ph-chev">{I.chev}</span></Link>; })}
    </div>
    <div className="ph-me"><span className="av">{c.me.name[0]}</span><span className="ph-m"><span className="ph-t">{c.me.name}</span><span className="ph-d">{c.me.role} · full access</span></span>
      <button className="btn btn-g" onClick={onLogOut}>{I.logout}Log out</button></div></div>
  </>);
}

