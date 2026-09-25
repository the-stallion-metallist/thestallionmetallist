import Panel from "./Panel";

// The panel pages are fixed shells, so switching screens is instant (the browser loads them ahead of time).
// Who can get in is checked three times: proxy.ts sends anyone not logged in to /admin/login, Panel checks the
// login is on the team, and the database itself only answers team members.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <Panel>{children}</Panel>;
}
