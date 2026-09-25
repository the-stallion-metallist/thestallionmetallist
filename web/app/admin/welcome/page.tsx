"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminDb } from "@/lib/admin/supabase-browser";

// Where "set your password" links land: a new team member's first link, or a forgotten password.
export default function Welcome() {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ready" | "bad">("checking");
  const [why, setWhy] = useState("");
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const db = adminDb();
      const hash = new URLSearchParams(location.hash.slice(1));
      if (hash.get("error_description")) { setWhy(hash.get("error_description")!); setState("bad"); return; }
      if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await db.auth.setSession({ access_token: hash.get("access_token")!, refresh_token: hash.get("refresh_token")! });
        history.replaceState(null, "", location.pathname);
        if (error) { setWhy(error.message); setState("bad"); return; }
      }
      const { data } = await db.auth.getSession(); // also finishes a ?code= link sent from the login page
      history.replaceState(null, "", location.pathname);
      setState(data.session ? "ready" : "bad");
      if (!data.session) setWhy("This link has expired or was already used.");
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (pw.length < 10) { setErr("Use at least 10 characters."); return; }
    if (pw !== pw2) { setErr("The two passwords don't match."); return; }
    setBusy(true);
    const { error } = await adminDb().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.replace("/admin"); router.refresh();
  }

  return (
    <div className="login">
      <div className="lg-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.png" alt="" />
        <h2>Welcome to the <em>team panel</em>.</h2>
        <p>Set a password once. After that you log in with your email and this password.</p>
        <div className="ring" />
      </div>
      <div className="lg-form">
        {state === "checking" && <p className="sub">Checking your link…</p>}
        {state === "bad" && (
          <div style={{ width: "min(360px,100%)" }}>
            <h1>Link not working</h1>
            <p className="sub" style={{ marginTop: 8 }}>{why} Ask the owner for a new link, or use &quot;Forgot your password&quot; on the login page.</p>
            <a className="btn btn-p" href="/admin/login">Go to login</a>
          </div>
        )}
        {state === "ready" && (
          <form onSubmit={save} noValidate>
            <h1>Set your password</h1>
            <p className="sub">At least 10 characters. A short sentence is easy to remember.</p>
            <div className="field"><label htmlFor="pw1">New password</label>
              <input id="pw1" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <div className="field"><label htmlFor="pw2">Type it again</label>
              <input id="pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
            {err && <p className="lg-err" role="alert">{err}</p>}
            <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} type="submit" disabled={busy}>{busy ? "Saving…" : "Save and open the panel"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
