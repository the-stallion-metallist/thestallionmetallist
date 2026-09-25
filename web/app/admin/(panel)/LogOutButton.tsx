"use client";
import { adminDb } from "@/lib/admin/supabase-browser";

export default function LogOutButton() {
  return <button className="btn btn-g" onClick={async () => { await adminDb().auth.signOut(); location.href = "/admin/login"; }}>Log out</button>;
}
