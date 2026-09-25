"use client";
import { useState } from "react";
import { usePanel } from "../Panel";
import { EditAdvance, EditExpense } from "../forms2";
import { FormModal, Field } from "../forms";
import { type Mark, type StaffRow, DATA_START, addDays, dayName, dnice, monthDays, monthLabel, monthOf, rs, shiftMonth, staffDue } from "@/lib/admin/logic";

const ATT = { P: "Present", H: "Half day", A: "Absent" } as const;
type K = keyof typeof ATT;

export default function Staff() {
  const c = usePanel(); const [tab, setTab] = useState<"att" | "sal">("att");
  const [day, setDay] = useState(c.today); const [mo, setMo] = useState(monthOf(c.today));
  const staff = c.staff.filter((s) => s.active);
  const mark = (d: string, id: number) => c.marks.find((m) => m.d === d && m.staff_id === id)?.mark ?? "";
  async function setMark(d: string, s: StaffRow, val: K | "") {
    const before = mark(d, s.id); if (before === val) return;
    const { error } = val ? await c.db.from("attendance").upsert({ d, staff_id: s.id, mark: val }, { onConflict: "d,staff_id" }) : await c.db.from("attendance").delete().eq("d", d).eq("staff_id", s.id);
    if (c.fail(error)) return;
    c.patch((x) => ({ ...x, marks: [...x.marks.filter((m) => !(m.d === d && m.staff_id === s.id)), ...(val ? [{ d, staff_id: s.id, mark: val } as Mark] : [])] }));
    await c.logIt("Marked", "Attendance", `${s.name} · ${dnice(d)} · ${val ? ATT[val] : "cleared"}`);
  }
  const segs = <div className="seg" role="group" aria-label="Staff view"><button aria-pressed={tab === "att"} onClick={() => setTab("att")}>Attendance</button><button aria-pressed={tab === "sal"} onClick={() => setTab("sal")}>Salary &amp; advances</button></div>;
  const addStaff = () => c.openModal(<FormModal title="Add staff member" onSave={async (fd) => {
    const name = String(fd.get("n")).trim(); if (!name) return { n: "Enter their name." };
    if (c.staff.some((s) => s.name.toLowerCase() === name.toLowerCase())) return { n: "Someone with this name is already on the list." };
    const { data, error } = await c.db.from("staff").insert({ name, salary: Number(fd.get("sal")) || null }).select("id, name, salary, active").single(); if (c.fail(error)) return false;
    c.patch((x) => ({ ...x, staff: [...x.staff, data as StaffRow] })); await c.logIt("Added", "Staff member", name); c.toast(`${name} added`);
  }}>{(e) => <><Field id="stN" label="Name" err={e.n}><input id="stN" name="n" /></Field><Field id="stS" label={<>Monthly salary (₹) <span className="muted">(optional)</span></>}><input id="stS" name="sal" type="number" inputMode="numeric" min={0} /></Field></>}</FormModal>);

  const setActive = async (s: StaffRow, active: boolean) => {
    const { error } = await c.db.from("staff").update({ active }).eq("id", s.id); if (c.fail(error)) return false;
    c.patch((x) => ({ ...x, staff: x.staff.map((y) => (y.id === s.id ? { ...y, active } : y)) })); await c.logIt(active ? "Brought back" : "Removed", "Staff member", s.name); return true;
  };
  const editStaff = (s: StaffRow) => c.openModal(<FormModal title={"Edit " + s.name} deleteLabel="Remove from staff" onDelete={async () => {
    if (await setActive(s, false)) c.toast(`${s.name} removed from staff`, async () => { if (await setActive(s, true)) c.toast(`${s.name} is back on staff`); });
  }} onSave={async (fd) => {
    const name = String(fd.get("n")).trim(); if (!name) return { n: "Enter their name." }; if (name === s.name) return;
    if (c.staff.some((x) => x.id !== s.id && x.name.toLowerCase() === name.toLowerCase())) return { n: "Someone with this name is already on the list." };
    const { error } = await c.db.from("staff").update({ name }).eq("id", s.id); if (c.fail(error)) return false;
    c.patch((x) => ({ ...x, staff: x.staff.map((y) => (y.id === s.id ? { ...y, name } : y)) })); await c.logIt("Edited", "Staff member", name, `Name ${s.name} → ${name}`); c.toast("Name saved");
  }}>{(e) => <><Field id="esN" label="Name" err={e.n} help="Past pickups and trips keep the name they were saved with."><input id="esN" name="n" defaultValue={s.name} /></Field>
    <p className="meta">Removing takes them off attendance and the pickup forms. Their past attendance, advances and pay stay, and you can bring them back.</p></>}</FormModal>);
  const past = c.staff.filter((s) => !s.active);

  if (tab === "att") {
    const m = monthOf(day), n = monthDays(m), days = Array.from({ length: n }, (_, i) => `${m}-${String(i + 1).padStart(2, "0")}`);
    const marked = staff.filter((s) => mark(day, s.id)).length, cyc: Record<string, K | ""> = { "": "P", P: "H", H: "A", A: "" };
    return (<>
      {segs}
      <div className="card"><div className="card-h"><div className="daynav"><button className="btn btn-g btn-sm" aria-label="Previous day" onClick={() => setDay(addDays(day, -1))}>‹</button><h2>{dayName(day)} {dnice(day)}{day === c.today ? " · today" : ""}</h2>
        <button className="btn btn-g btn-sm" aria-label="Next day" disabled={day >= c.today} onClick={() => setDay(addDays(day, 1) > c.today ? c.today : addDays(day, 1))}>›</button></div><span className="sp" /><span className="hint">{marked} of {staff.length} marked</span>
        {day !== c.today && <button className="btn btn-g btn-sm" onClick={() => setDay(c.today)}>Back to today</button>}</div>
        <div className="att">{staff.map((s) => { const v = mark(day, s.id); return <div key={s.id} className="att-row"><span className="av" style={{ background: "var(--ink-soft)" }}>{s.name[0]}</span><span className="nm">{s.name}</span>
          <span className="pa" role="group" aria-label={s.name}>{(["P", "H", "A"] as K[]).map((k) => <button key={k} data-v={k} aria-pressed={v === k} title={ATT[k]} onClick={() => setMark(day, s, v === k ? "" : k)}>{k === "H" ? "Half" : ATT[k]}</button>)}</span></div>; })}</div></div>
      <div className="card"><div className="card-h"><h2>{monthLabel(m)}</h2><span className="hint">Tap any past day to change it: present, half day, absent, clear</span><span className="sp" /><button className="btn btn-g btn-sm" onClick={addStaff}>+ Add staff member</button></div>
        <div className="legend" style={{ marginBottom: 8 }}><span><i style={{ background: "var(--good)" }} />Present</span><span><i style={{ background: "var(--warn)" }} />Half day</span><span><i style={{ background: "var(--bad)" }} />Absent</span></div>
        <div className="tbl-wrap"><div className="cal" style={{ gridTemplateColumns: `110px repeat(${n},minmax(18px,1fr))` }}><span />
          {days.map((x) => <span key={x} className={"d" + (x === c.today ? " today" : "")}>{+x.slice(8)}</span>)}
          {staff.map((s) => [<span key={"n" + s.id} className="nm"><button className="linkb" title="Edit or remove" onClick={() => editStaff(s)}>{s.name}</button></span>, ...days.map((x) => x > c.today ? <span key={x + s.id} className="c fut" />
            : <button key={x + s.id} className={`c ${mark(x, s.id)} ${x === day ? "on" : ""}`} aria-label={`${s.name}, ${dnice(x)}: ${ATT[mark(x, s.id) as K] || "not marked"}`} onClick={() => { setMark(x, s, cyc[mark(x, s.id)]); setDay(x); }} />)])}
        </div></div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Tap a name to fix it or remove someone who has left.</p>
        {past.length > 0 && <div className="kv" style={{ marginTop: 10 }}>{past.map((s) => <div key={s.id}><span>{s.name} <span className="muted">· removed</span></span>
          <button className="btn btn-g btn-sm" onClick={async () => { if (await setActive(s, true)) c.toast(`${s.name} is back on staff`); }}>Bring back</button></div>)}</div>}</div>
    </>);
  }
  const first = DATA_START > monthOf(c.set.goLive || c.today) ? DATA_START : monthOf(c.set.goLive || c.today), last = monthOf(c.today);
  const advs = c.advances.filter((a) => !a.deleted && monthOf(a.d) === mo);
  const payStaff = c.staff.filter((s) => s.active || c.marks.some((m) => m.staff_id === s.id && monthOf(m.d) === mo) || advs.some((a) => a.staff_id === s.id));
  async function setSal(s: StaffRow, raw: string) {
    const val = raw ? Number(raw) : null; if (val === (s.salary == null ? null : Number(s.salary))) return;
    const { error } = await c.db.from("staff").update({ salary: val }).eq("id", s.id); if (c.fail(error)) return;
    c.patch((x) => ({ ...x, staff: x.staff.map((y) => (y.id === s.id ? { ...y, salary: val } : y)) })); await c.logIt("Edited", "Salary", `${s.name} · ${val ? rs(val) : "cleared"}`); c.toast("Salary saved");
  }
  return (<>
    {segs}
    <div className="card"><div className="card-h"><div className="daynav"><button className="btn btn-g btn-sm" aria-label="Previous month" disabled={mo <= first} onClick={() => setMo(shiftMonth(mo, -1))}>‹</button><h2>{monthLabel(mo)} salary</h2>
      <button className="btn btn-g btn-sm" aria-label="Next month" disabled={mo >= last} onClick={() => setMo(shiftMonth(mo, 1))}>›</button></div><span className="sp" /><button className="btn btn-g btn-sm" onClick={() => c.openModal(<EditAdvance />)}>+ Record advance</button></div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>Monthly salary ÷ 30 × days present, minus advances and salary already paid this month.</p>
      <div className="tbl-wrap"><table><thead><tr><th>Staff</th><th className="n">Monthly salary</th><th className="n">Days present</th><th className="n">Earned</th><th className="n">Advances</th><th className="n">Paid so far</th><th className="n">To pay</th><th /></tr></thead><tbody>
        {payStaff.map((s) => { const d = staffDue(s, mo, c.marks, c.advances, c.expenses);
          return <tr key={s.id}><td><b>{s.name}</b>{!s.active && <span className="muted"> · removed</span>}</td><td className="n"><input className="inl" type="number" inputMode="numeric" min={0} defaultValue={s.salary ?? ""} placeholder="Set ₹" aria-label={`${s.name} monthly salary`} onBlur={(e) => setSal(s, e.target.value)} /></td>
            <td className="n">{d.days}</td><td className="n">{d.earned != null ? rs(d.earned) : "–"}</td><td className="n">{d.adv ? rs(-d.adv) : "–"}</td><td className="n">{d.paid ? rs(-d.paid) : "–"}</td><td className="n"><b>{d.pay != null ? rs(d.pay) : "–"}</b></td>
            <td className="n">{d.pay ? <button className="btn btn-g btn-sm" onClick={() => c.openModal(<EditExpense preset={{ category: "Salaries", staff_id: s.id, amount: d.pay!, note: monthLabel(mo) + " salary", d: c.today }} />)}>Pay</button> : null}</td></tr>; })}
      </tbody></table></div>
      {advs.length ? <div className="kv" style={{ marginTop: 14 }}>{advs.map((a) => <div key={a.id}><span><button className="linkb" onClick={() => c.openModal(<EditAdvance rec={a} />)}>{dnice(a.d)} · {c.staff.find((s) => s.id === a.staff_id)?.name} · advance</button></span><b>{rs(Number(a.amount))}</b></div>)}</div>
        : <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>No advances this month.</p>}
    </div>
  </>);
}
