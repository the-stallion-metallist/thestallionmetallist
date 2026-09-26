// Line icons from the approved mockup.
const s = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;
export const I: Record<string, React.ReactElement> = {
  overview: <svg {...s}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
  venues: <svg {...s}><path d="M5 7h14l-1.3 13a1 1 0 0 1-1 .9H7.3a1 1 0 0 1-1-.9z" /><path d="M3 7h18M9 7V4h6v3M10 11v6M14 11v6" /></svg>,
  pickups: <svg {...s}><rect x="7" y="3" width="10" height="18" rx="3" /><path d="M7 8h10M7 16h10" /></svg>,
  history: <svg {...s}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>,
  settings: <svg {...s}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>,
  moves: <svg {...s}><path d="M3 11h7l-.8 8.2a1 1 0 0 1-1 .8H4.8a1 1 0 0 1-1-.8zM14 11h7l-.8 8.2a1 1 0 0 1-1 .8h-3.4a1 1 0 0 1-1-.8z" /><path d="M6 7.5c2.5-3 8.5-3 11.5 0M15.5 4.5l2 3-3 .8" /></svg>,
  trips: <svg {...s}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>,
  stock: <svg {...s}><path d="M3 9l9-5 9 5v11H3z" /><path d="M8 20v-6h8v6" /></svg>,
  money: <svg {...s}><path d="M7 4h11M7 9h11M11 4c4 0 5 2.2 5 5s-2 5-6 5H7l8 7" /></svg>,
  staff: <svg {...s}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2" /></svg>,
  routes: <svg {...s}><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="5" r="2.2" /><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16" /></svg>,
  locations: <svg {...s}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>,
  payouts: <svg {...s}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 15h2" /></svg>,
  run: <svg {...s}><path d="M10 6h10M10 12h10M10 18h10M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2 2.3-2.2M4 18l1.2 1.2 2.3-2.2" /></svg>,
  more: <svg {...s}><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>,
  search: <svg {...s} strokeWidth={2.2}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>,
  logout: <svg {...s} width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
  plus: <svg {...s} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>,
  x: <svg {...s} strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  chev: <svg {...s} strokeWidth={2.2} width="16" height="16"><path d="M9 6l6 6-6 6" /></svg>,
  empty: <svg {...s} strokeWidth={1.8}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>,
  ok: <svg {...s} strokeWidth={2.2}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 10" /></svg>,
  home: <svg {...s}><path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" /></svg>,
  tick: <svg {...s} strokeWidth={2.6}><path d="m5 12 5 5 9-10" /></svg>,
  play: <svg {...s}><path d="M7 4v16l13-8z" /></svg>,
  map: <svg {...s}><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v14M15 6v14" /></svg>,
  phone: <svg {...s}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>,
};

export function Empty({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return <div className="empty">{I.empty}<b>{title}</b><p>{text}</p>{children}</div>;
}
