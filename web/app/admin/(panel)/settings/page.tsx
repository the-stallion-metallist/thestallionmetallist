"use client";
import { useEffect, useState } from "react";
import { usePanel } from "../Panel";
import { removeTeamMember, syncAppPickups, teamLink } from "../../actions";
import { type Settings, areaName, parsePin, vstatus } from "@/lib/admin/logic";
import { downloadWorkbook } from "@/lib/admin/excel";
import { vname } from "../forms";

type K = keyof Settings;
export default function SettingsPage() {
  const c = usePanel();
  const [team, setTeam] = useState<{ name: string; role: string; email: string }[]>([]);
  useEffect(() => { c.db.from("team").select("name, role, email").order("created_at").then(({ data }) => setTeam(data ?? [])); }, [c.db]);

  async function save(k: K, raw: string) {
    const before = c.set[k]; const val = raw === "" ? null : Number(raw);
    if (val === before) return;
    const data = { ...c.set, [k]: val };
    const { error } = await c.db.from("settings").update({ data }).eq("id", 1);
    if (c.fail(error)) return;
    c.patch((d) => ({ ...d, set: data }));
    await c.logIt("Edited", "Setting", LABEL[k] ?? String(k), `${before ?? "–"} → ${val ?? "–"}`);
    c.toast("Saved. All numbers updated.");
  }
  const inp = (k: K, l: string, help: string, unit: string) => <div className="field" key={k}><label htmlFor={"set_" + k}>{l}</label>
    <div className="inrow"><input id={"set_" + k} type="number" step="any" inputMode="decimal" defaultValue={(c.set[k] as number | null) ?? ""} placeholder="Not set" onBlur={(e) => save(k, e.target.value)} /><span>{unit}</span></div>
    {help && <span className="help">{help}</span>}</div>;

  return (
    <section className="set-grid">
      <div className="card"><div className="card-h"><h2>Rates</h2><span className="hint">Every screen updates when you change these</span></div>
        {inp("ubcRate", "Can (UBC) sale rate", "What buyers pay you. Update when the market moves.", "₹ per kg")}
        {inp("cansPerKg", "Cans per kg", "About 15 g per can. Weigh a full bag once to make this exact.", "cans")}
        {inp("plasticSale", "Plastic sale rate", "Needed to value plastic in profit.", "₹ per kg")}
        {inp("canRate", "Default payout per can", "Used for new venues. Each venue can have its own rate.", "₹ per can")}
        {inp("plasticBuy", "Default plastic payout", "Used when a venue has no plastic rate.", "₹ per kg")}
      </div>
      <div className="card"><div className="card-h"><h2>Bin rules</h2><span className="hint">Set from your September numbers</span></div>
        {inp("add", "Add a bin at", "Top quarter of venues. Bins this full overflow and you lose cans.", "cans per bin / month")}
        {inp("pull", "Take a bin back under", "Two months in a row under this flags a take-back (leaving 1 bin). Bottom quarter of venues.", "cans per bin / month")}
        {inp("grace", "Give new venues", "New venues are not judged until their bin has been out this long.", "days")}
      </div>
      <div className="card"><div className="card-h"><h2>Route planner</h2></div>
        {inp("vehCap", "Vehicle capacity", "How many cans the vehicle carries in one run. Days above this get an unload stop.", "cans")}
        {inp("capSteel", "Full steel bin holds", "Used to add extra visits before a bin overflows.", "cans")}
        {inp("capPl", "Full plastic bin holds", "", "cans")}
        {inp("routeHours", "Route length", "Half a day by default.", "hours")}
        {inp("stopMin", "Time per stop", "Emptying bins, counting and paying.", "minutes")}
        {inp("traffic", "Traffic buffer", "Road times assume empty roads. This adds time on top.", "%")}
        <Godown />
        <div className="kv"><div><span>Working days</span><b>Mon–Sat, 1 run a day</b></div><div><span>Road data</span><b>OpenRouteService</b></div></div>
      </div>
      <TeamCard team={team} onAdded={(t) => setTeam((l) => [...l.filter((x) => x.email !== t.email), t])} onRemoved={(email) => setTeam((l) => l.filter((x) => x.email !== email))} />
      <ExcelCard />
    </section>
  );
}
function Godown() {
  const c = usePanel(); const [err, setErr] = useState("");
  const g = c.set.godown ?? [30.27847, 78.00318];
  return <div className="field"><label htmlFor="set_godown">Godown location (start and end of every route)</label>
    <input id="set_godown" defaultValue={g.join(", ")} placeholder="Paste a Google Maps link or 30.27, 78.00" onBlur={async (e) => {
      const r = parsePin(e.target.value); if (r.err) { setErr(r.err); return; } setErr("");
      if (r.p!.join() === g.join()) return;
      const data = { ...c.set, godown: r.p }; const { error } = await c.db.from("settings").update({ data }).eq("id", 1); if (c.fail(error)) return;
      c.patch((d) => ({ ...d, set: data })); await c.logIt("Edited", "Setting", "Godown location", `${g.join(", ")} → ${r.p!.join(", ")}`);
      c.toast("Godown saved. Refresh road data on Venue locations so routes use it.");
    }} />
    <span className="help">{c.set.godown ? "Set by the team." : "Approximate point on Turner Road. Paste the exact spot from Google Maps."}</span>{err && <span className="err">{err}</span>}</div>;
}

function ExcelCard() {
  const c = usePanel(); const live = <T extends { deleted: boolean }>(a: T[]) => a.filter((x) => !x.deleted);
  const sname = (id: number | null) => c.staff.find((s) => s.id === id)?.name ?? "";
  const go = () => downloadWorkbook(`Stallion team panel ${c.today}.xls`, [
    { name: "Venues", head: ["Venue", "Status", "Area", "Steel bins", "Plastic bins", "Payout per can", "Plastic per kg", "Added", "Bin placed", "Contact", "Phone", "Terms", "UPI", "Latitude", "Longitude"],
      rows: c.venues.map((v) => [v.name, vstatus(v.status), areaName(v.area), v.steel, v.plastic_bins, Number(v.can_rate), v.plastic_rate == null ? "" : Number(v.plastic_rate), v.added, v.bin_since, v.contact, v.phone, v.terms, v.upi, v.lat, v.lng]) },
    { name: "Pickups", head: ["Date", "Venue", "Cans", "Plastic kg", "Source", "Staff", "Bin fill", "Trip", "Added by"],
      rows: live(c.pickups).sort((a, b) => (a.d < b.d ? -1 : 1)).map((p) => [p.d, vname(c, p.venue_id), p.cans, Number(p.plastic_kg), p.src, p.staff, p.fill, p.trip, p.created_by]) },
    { name: "Payments", head: ["Date", "Venue", "Amount", "Paid by", "Note", "Added by"], rows: live(c.payments).map((p) => [p.d, vname(c, p.venue_id), Number(p.amount), p.mode, p.note, p.created_by]) },
    { name: "Expenses", head: ["Date", "Category", "Paid to", "Item", "How many", "Amount", "Paid by", "Note"], rows: live(c.expenses).map((e) => [e.d, e.category, sname(e.staff_id), e.item === "Other" ? e.other : e.item, e.qty || "", Number(e.amount), e.mode, e.note]) },
    { name: "Sales", head: ["Sale", "Date", "Buyer", "Material", "Kg", "Rate", "Invoice", "Transport", "Paid on"], rows: live(c.sales).map((s) => [s.code, s.d, s.buyer, s.material, Number(s.kg), Number(s.rate), Number(s.kg) * Number(s.rate), Number(s.transport), s.paid_on]) },
    { name: "Trips", head: ["Trip", "Date", "Vehicle", "Driver", "Start km", "End km", "Stops", "Fuel L", "Cost", "Cans", "Route"], rows: live(c.trips).map((t) => [t.code, t.d, t.vehicle, t.driver, t.km_start, t.km_end, t.stops, Number(t.fuel_l), Number(t.fuel_cost) + Number(t.other_cost), t.cans, t.route]) },
    { name: "Attendance", head: ["Date", "Staff", "Mark"], rows: c.marks.slice().sort((a, b) => (a.d < b.d ? -1 : 1)).map((m) => [m.d, sname(m.staff_id), { P: "Present", H: "Half day", A: "Absent" }[m.mark]]) },
    { name: "Advances", head: ["Date", "Staff", "Amount"], rows: live(c.advances).map((a) => [a.d, sname(a.staff_id), Number(a.amount)]) },
  ]);
  return <><AppSyncCard /><div className="card"><div className="card-h"><h2>Excel</h2></div>
    <div className="kv"><div><span>Venues</span><b>{c.venues.length}</b></div><div><span>Pickups</span><b>{c.pickups.filter((p) => !p.deleted).length}</b></div><div><span>Bins out</span><b>{c.venues.reduce((a, v) => a + v.steel + v.plastic_bins, 0)}</b></div></div>
    <p className="muted" style={{ fontSize: 13, margin: "10px 0" }}>Everything is entered here. Download all of it as one Excel file whenever you want, one sheet per list.</p>
    <button className="btn btn-g btn-sm" onClick={go}>Download everything as Excel</button></div></>;
}

function AppSyncCard() {
  const c = usePanel(); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const app = c.pickups.filter((p) => p.app_id && !p.deleted);
  return <div className="card"><div className="card-h"><h2>Customer app</h2><span className="hint">Household pickups copy in by themselves</span></div>
    <div className="kv"><div><span>Pickups copied from the app</span><b>{app.length}</b></div><div><span>Cans from the app</span><b>{app.reduce((a, p) => a + p.cans, 0).toLocaleString("en-IN")}</b></div></div>
    <p className="muted" style={{ fontSize: 13, margin: "10px 0" }}>Each pickup marked collected in the app shows up in Pickups, with the payout the app paid. The app itself is never changed from here.</p>
    <button className="btn btn-g btn-sm" disabled={busy} onClick={async () => { setBusy(true); const r = await syncAppPickups(true); setBusy(false);
      setMsg(r.err ?? r.skipped ?? `${r.added} new, ${r.updated} changed, ${r.removed} removed`); if (r.added || r.updated || r.removed) c.reload(); }}>{busy ? "Syncing…" : "Sync now"}</button>
    {msg && <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>{msg}</p>}</div>;
}

const LABEL: Partial<Record<K, string>> = { ubcRate: "Can sale rate", cansPerKg: "Cans per kg", plasticSale: "Plastic sale rate", canRate: "Default payout per can", plasticBuy: "Default plastic payout", add: "Add a bin at", pull: "Take a bin back under", grace: "New venue grace days", vehCap: "Vehicle capacity", capSteel: "Full steel bin holds", capPl: "Full plastic bin holds", routeHours: "Route length", stopMin: "Time per stop", traffic: "Traffic buffer" };

function TeamCard({ team, onAdded, onRemoved }: { team: { name: string; role: string; email: string }[]; onAdded: (t: { name: string; role: string; email: string }) => void; onRemoved: (email: string) => void }) {
  const c = usePanel(); const owner = c.me.role === "Owner";
  const [form, setForm] = useState<{ name: string; role: string; email: string } | null>(null);
  const [link, setLink] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(""); // email of the login waiting for "Yes, remove"
  async function remove(t: { name: string; email: string }) {
    setBusy(true); setErr(""); setLink("");
    const r = await removeTeamMember(t.email); setBusy(false); setAsk("");
    if (r.err) { setErr(r.err); return; }
    onRemoved(t.email); c.toast(`${t.name}'s login removed`);
  }
  async function go(t: { name: string; role: string; email: string }) {
    setBusy(true); setErr(""); setLink("");
    const r = await teamLink(t); setBusy(false);
    if (r.err) { setErr(r.err); return; }
    setLink(r.link!); onAdded(t); setForm(null);
  }
  return (
    <div className="card"><div className="card-h"><h2>Team</h2><span className="hint">Everyone has full access</span></div>
      <div>{team.map((t) => <div key={t.email} className="team-row"><span className="av">{t.name[0]}</span><div><b>{t.name}</b><br /><span className="muted" style={{ fontSize: 12.5 }}>{t.role} · {t.email}</span></div>
        {owner && (ask === t.email
          ? <div className="team-act"><span className="muted" style={{ fontSize: 12.5 }}>They won&apos;t be able to log in.</span>
              <button className="btn btn-g btn-sm" disabled={busy} onClick={() => setAsk("")}>Keep</button><button className="btn btn-g btn-sm btn-del" disabled={busy} onClick={() => remove(t)}>{busy ? "Removing…" : "Yes, remove login"}</button></div>
          : <div className="team-act"><button className="btn btn-g btn-sm" disabled={busy} onClick={() => go(t)}>New password link</button>
              {t.role !== "Owner" && t.email !== c.me.email && <button className="btn btn-g btn-sm btn-del" disabled={busy} onClick={() => { setAsk(t.email); setErr(""); }}>Remove</button>}</div>)}</div>)}</div>
      {owner && !form && <button className="btn btn-g btn-sm" style={{ marginTop: 12 }} onClick={() => setForm({ name: "", role: "", email: "" })}>+ Add team member</button>}
      {form && <form style={{ marginTop: 12 }} onSubmit={(e) => { e.preventDefault(); go(form); }}>
        <div className="two">
          <div className="field"><label htmlFor="tmN">Name</label><input id="tmN" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="tmR">Role</label><input id="tmR" value={form.role} placeholder="e.g. Operations" onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
        </div>
        <div className="field"><label htmlFor="tmE">Email</label><input id="tmE" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="m-foot"><button type="button" className="btn btn-g" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-p" disabled={busy}>{busy ? "Creating…" : "Create login link"}</button></div>
      </form>}
      {err && <p className="lg-err" style={{ marginTop: 10 }}>{err}</p>}
      {link && <div className="lg-note" style={{ marginTop: 12, flexDirection: "column" }}>
        <b style={{ color: "var(--ink)" }}>Send this link to them (WhatsApp is fine). It works once, for a short time.</b>
        <input readOnly value={link} onFocus={(e) => e.target.select()} style={{ width: "100%" }} className="inl" />
        <button type="button" className="btn btn-g btn-sm" onClick={() => navigator.clipboard.writeText(link).then(() => c.toast("Link copied"), () => c.toast("Select the link and copy it"))}>Copy link</button>
      </div>}
      {!owner && <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Only the owner can add or remove people and send new password links.</p>}
    </div>
  );
}
