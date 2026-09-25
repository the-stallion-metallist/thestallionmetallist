"use client";
import { useState } from "react";
import { usePanel } from "../Panel";
import { Empty } from "../icons";
import VenueDrawer from "../VenueDrawer";
import { openLogPickup, vname } from "../forms";
import { dayName, dnice, fmt, inP, kg } from "@/lib/admin/logic";

export default function Pickups() {
  const c = usePanel(); const p = c.per; const [show, setShow] = useState(25);
  const ps = c.pickups.filter((x) => !x.deleted && inP(x.d, p)).sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : b.id - a.id));

  // A CSV file that opens in Excel.
  function download() {
    const q = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const lines = [["Date", "Venue", "Cans", "Plastic kg", "Source", "Staff", "Bin fill", "Added by"].join(","),
      ...ps.map((x) => [x.d, q(vname(c, x.venue_id)), x.cans, x.plastic_kg, x.src, q(x.staff), q(x.fill), q(x.created_by)].join(","))];
    const url = URL.createObjectURL(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `Stallion pickups ${p.label}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <div className="card-h"><h2>{ps.length} pickups in {p.label}</h2><span className="sp" />{ps.length > 0 && <button className="btn btn-g btn-sm" onClick={download}>Download for Excel</button>}</div>
      <div className="tbl-wrap"><table>
        <thead><tr><th>Date</th><th>Venue</th><th className="n">Cans</th><th className="n">Plastic kg</th><th className="hide-m">Source</th><th className="hide-m">Staff</th><th className="hide-m">Bin fill</th><th className="hide-m">Added by</th></tr></thead>
        <tbody>
          {!ps.length && <tr><td colSpan={8}><Empty title="No pickups in this period" text="Log one with the Log pickup button." /></td></tr>}
          {ps.slice(0, show).map((x) => <tr key={x.id} className="click" onClick={() => openLogPickup(c, undefined, x)}>
            <td>{dayName(x.d)} {dnice(x.d)}</td>
            <td>{x.venue_id != null ? <button className="linkb" onClick={(e) => { e.stopPropagation(); c.openDrawer(<VenueDrawer id={x.venue_id!} />); }}>{vname(c, x.venue_id)}</button> : vname(c, null)}</td>
            <td className="n">{x.cans ? fmt(x.cans) : "–"}</td><td className="n">{Number(x.plastic_kg) ? kg(Number(x.plastic_kg)) : "–"}</td>
            <td className="hide-m"><span className={"src" + (x.src === "App" ? " app" : "")}>{x.src}</span></td>
            <td className="hide-m muted">{x.staff || "–"}</td><td className="hide-m muted">{x.fill || "–"}</td>
            <td className="hide-m muted">{x.created_by}{x.updated_by ? " · edited" : ""}</td>
          </tr>)}
        </tbody>
      </table></div>
      {ps.length > show && <div className="more"><button className="btn btn-g btn-sm" onClick={() => setShow(show + 25)}>Show {Math.min(25, ps.length - show)} more</button></div>}
      <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Tap a pickup to edit or delete it. Imported pickups have no staff or bin fill because the Excel didn&apos;t record them.</p>
    </div>
  );
}
