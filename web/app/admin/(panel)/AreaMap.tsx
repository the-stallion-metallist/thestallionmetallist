"use client";
// Street map (OpenStreetMap) with a dot per venue, coloured by this week's state. Leaflet loads in the browser only.
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { type Pin, type VRow, type VState, kmBetween } from "@/lib/admin/areas";

// fill colours for the dots (the legend and the written lists say the same thing, so colour is never the only clue)
export const DOT: Record<VState, string> = { done: "#2f8a55", due: "#d08a1e", full: "#b8432d", low: "#a39d94", new: "#a39d94" };
export const STATE_TXT: Record<VState, string> = { done: "Collected this week", due: "Due", full: "Bins likely full", low: "Few cans waiting", new: "No pickup yet" };

export default function AreaMap({ rows, sel, god, onVenue }: { rows: VRow[]; sel: string | null; god: Pin; onVenue: (id: number) => void }) {
  const box = useRef<HTMLDivElement>(null), map = useRef<Leaflet.Map | null>(null), layer = useRef<Leaflet.LayerGroup | null>(null), L = useRef<typeof Leaflet | null>(null);
  const pick = useRef(onVenue); pick.current = onVenue;

  useEffect(() => { // create the map once
    let gone = false;
    import("leaflet").then((mod) => {
      if (gone || !box.current || map.current) return;
      const lf = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet); L.current = lf;
      const m = lf.map(box.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false, fadeAnimation: false }).setView(god, 12);
      lf.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(m);
      map.current = m; layer.current = lf.layerGroup().addTo(m);
      setTimeout(() => m.invalidateSize(), 0);
      draw(true);
    });
    return () => { gone = true; map.current?.remove(); map.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // redraw the dots when the week's states or the chosen area change; zoom to the chosen area
  const draw = (fit: boolean) => {
    const lf = L.current, m = map.current, g = layer.current; if (!lf || !m || !g) return;
    g.clearLayers();
    const pinned = rows.filter((r) => r.pin), inSel = (r: VRow) => !sel || (r.v.area ?? "") === sel;
    for (const r of [...pinned].sort((a, b) => Number(inSel(a)) - Number(inSel(b)))) { // chosen area drawn last, on top
      const on = inSel(r);
      lf.circleMarker(r.pin!, { radius: on && sel ? 9 : 7, color: "#ffffff", weight: 2, fillColor: DOT[r.st], fillOpacity: on ? 0.95 : 0.3, opacity: on ? 1 : 0.4 })
        .bindTooltip(`${r.v.name} · ${STATE_TXT[r.st]}${r.st !== "done" && r.cans ? ` · ~${r.cans} cans` : ""}`, { direction: "top", offset: [0, -6] })
        .on("click", () => pick.current(r.v.id)).addTo(g);
    }
    lf.marker(god, { icon: lf.divIcon({ className: "ar-god", html: "<span></span>", iconSize: [16, 16] }), keyboard: false }).bindTooltip("Godown", { direction: "top", offset: [0, -8] }).addTo(g);
    if (fit) {
      // whole map: start on the city (venues within 15 km of the godown); far venues stay on the map, one zoom out away
      const city = pinned.filter((r) => kmBetween(r.pin!, god) <= 15), base = city.length >= 5 ? city : pinned;
      const pts = (sel ? pinned.filter(inSel) : base).map((r) => r.pin!);
      if (pts.length) m.fitBounds(lf.latLngBounds(sel ? pts : [...pts, god]), { padding: [28, 28], maxZoom: 15 });
    }
  };
  useEffect(() => { draw(true); }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { draw(false); }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="ar-map" ref={box} role="region" aria-label="Map of venues, coloured by whether they were collected this week" />;
}
