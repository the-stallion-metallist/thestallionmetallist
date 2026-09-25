"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminDb } from "@/lib/admin/supabase-browser";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function logIn(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setNote("");
    if (!email || !password) { setErr("Enter your email and password."); return; }
    setBusy(true);
    const { error } = await adminDb().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setErr(error.message === "Invalid login credentials" ? "That email and password don't match. Check them, or set a new password below." : error.message); return; }
    router.replace("/admin"); router.refresh();
  }

  async function sendLink() {
    setErr(""); setNote("");
    if (!email) { setErr("Enter your email first, then tap this again."); return; }
    setBusy(true);
    const { error } = await adminDb().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/admin/welcome` });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setNote("If this email is on the team, a link to set your password is on its way. Open it in this same browser.");
  }

  return (
    <form onSubmit={logIn} noValidate>
      <h1>Team login</h1>
      <p className="sub">For the Stallion team.</p>
      <div className="field"><label htmlFor="lgEmail">Email</label>
        <input id="lgEmail" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label htmlFor="lgPass">Password</label>
        <input id="lgPass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {err && <p className="lg-err" role="alert">{err}</p>}
      {note && <p className="lg-ok" role="status">{note}</p>}
      <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} type="submit" disabled={busy}>{busy ? "Checking…" : "Log in"}</button>
      <button className="linkb lg-forgot" type="button" onClick={sendLink} disabled={busy}>Forgot your password, or first time here?</button>
      <div className="lg-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        <span>Only your team&apos;s accounts can open these pages. They&apos;re hidden from Google and AI search, so your public website&apos;s ranking isn&apos;t affected.</span>
      </div>
    </form>
  );
}
