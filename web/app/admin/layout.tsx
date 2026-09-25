import type { Metadata } from "next";
import "./admin.css";

// The team panel: private, never indexed, not in the sitemap.
export const metadata: Metadata = {
  title: { default: "Team panel", template: "%s · Stallion team" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
