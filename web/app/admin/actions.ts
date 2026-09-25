"use server";
import { headers } from "next/headers";
import { adminDbSecret, currentMember } from "@/lib/admin/supabase-server";
import { roadMatrix } from "@/lib/admin/roads";
import { createClient } from "@supabase/supabase-js";

// Any team member: fetch fresh road times between the godown and every venue with a map location.
export async function refreshRoads(): Promise<{ ok?: number; err?: string }> {
  const { member } = await currentMember();
  if (!member) return { err: "Log in again." };
  const db = adminDbSecret();
  const [{ data: set }, { data: venues }] = await Promise.all([
    db.from("settings").select("data").eq("id", 1).single(),
    db.from("venues").select("lat, lng").not("lat", "is", null).neq("status", "Pulled"),
  ]);
  const god = (set?.data?.godown ?? [30.27847, 78.00318]) as [number, number];
  const key = (p: [number, number]) => p[0].toFixed(5) + "," + p[1].toFixed(5);
  const seen = new Set([key(god)]); const pts: [number, number][] = [god];
  for (const v of venues ?? []) { const p: [number, number] = [Number(v.lat), Number(v.lng)]; if (!seen.has(key(p))) { seen.add(key(p)); pts.push(p); } }
  try {
    const { dur, dist } = await roadMatrix(pts);
    const { error } = await db.from("road_matrix").update({ pts, dur, dist, fetched_at: new Date().toISOString(), updated_by: member.name }).eq("id", 1);
    if (error) return { err: error.message };
    await db.from("change_log").insert({ action: "Refreshed", what: "Road data", label: `${pts.length - 1} venue locations`, who: member.name });
    return { ok: pts.length - 1 };
  } catch (e) { return { err: (e as Error).message }; }
}

// Copy collected household pickups from the customer app into the panel (one way; the app is never changed).
// Runs when the panel opens, at most every 5 minutes. Needs APP_SUPABASE_URL and APP_SUPABASE_SECRET_KEY on the server.
export async function syncAppPickups(force = false): Promise<{ added?: number; updated?: number; removed?: number; skipped?: string; err?: string }> {
  const { member } = await currentMember();
  if (!member) return { err: "Log in again." };
  const url = process.env.APP_SUPABASE_URL, key = process.env.APP_SUPABASE_SECRET_KEY;
  if (!url || !key) return { skipped: "App sync isn't set up yet." };
  const db = adminDbSecret();
  const { data: st } = await db.from("plan_state").select("value").eq("key", "appSync").single();
  const last = (st?.value as { at: string | null } | null)?.at;
  if (!force && last && Date.now() - Date.parse(last) < 5 * 60000) return { skipped: "Synced a few minutes ago." };
  const app = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  type AppPickup = { id: string; status: string; can_count: number; final_cans: number | null; final_payout: number | null; est_payout: number; scheduled_date: string | null; updated_at: string };
  const rows: AppPickup[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await app.from("pickups").select("id, status, can_count, final_cans, final_payout, est_payout, scheduled_date, updated_at").order("created_at").range(from, from + 999);
    if (error) return { err: "Couldn't read the app: " + error.message };
    rows.push(...(data as AppPickup[])); if (!data || data.length < 1000) break;
  }
  const { data: mine } = await db.from("pickups").select("id, app_id, d, cans, app_payout, deleted").not("app_id", "is", null);
  const byApp = new Map((mine ?? []).map((p) => [p.app_id as string, p]));
  const ist = (t: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(t));
  let added = 0, updated = 0, removed = 0;
  for (const r of rows) {
    const have = byApp.get(r.id);
    if (r.status !== "collected") { // cancelled or undone in the app after it was copied
      if (have && !have.deleted) { await db.from("pickups").update({ deleted: true, updated_by: "App sync" }).eq("id", have.id); removed++; }
      continue;
    }
    const vals = { d: r.scheduled_date ?? ist(r.updated_at), cans: r.final_cans ?? r.can_count, app_payout: r.final_payout ?? r.est_payout };
    if (!have) {
      const { error } = await db.from("pickups").insert({ ...vals, venue_id: null, src: "App", app_id: r.id, created_by: "App sync" });
      if (!error) added++;
    } else if (have.deleted || have.d !== vals.d || have.cans !== vals.cans || Number(have.app_payout) !== Number(vals.app_payout)) {
      await db.from("pickups").update({ ...vals, deleted: false, updated_by: "App sync" }).eq("id", have.id); updated++;
    }
  }
  await db.from("plan_state").update({ value: { at: new Date().toISOString(), count: rows.filter((r) => r.status === "collected").length } }).eq("key", "appSync");
  if (added || updated || removed) await db.from("change_log").insert({ action: "Synced", what: "App pickups", label: `${added} new · ${updated} changed · ${removed} removed`, who: "App sync" });
  return { added, updated, removed };
}

// Owner only: add a team member (or give an existing one a new password link).
// Returns a one-time link the owner sends them; it opens /admin/welcome, where they set their password.
export async function teamLink(input: { name: string; role: string; email: string }): Promise<{ link?: string; err?: string }> {
  const { member } = await currentMember();
  if (member?.role !== "Owner") return { err: "Only the owner can add team members or reset their passwords." };
  const name = input.name.trim(), role = input.role.trim() || "Team", email = input.email.trim().toLowerCase();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { err: "Enter a name and a valid email." };
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const db = adminDbSecret();
  const redirectTo = `${origin}/admin/welcome`;
  let res = await db.auth.admin.generateLink({ type: "invite", email, options: { redirectTo } });
  if (res.error && /already|registered|exists/i.test(res.error.message)) res = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo } });
  if (res.error || !res.data.user) return { err: res.error?.message ?? "Couldn't create the link." };
  const { error } = await db.from("team").upsert({ user_id: res.data.user.id, name, role, email }, { onConflict: "user_id" });
  if (error) return { err: error.message };
  await db.from("change_log").insert({ action: "Sent", what: "Login link", label: `${name} · ${email}`, who: member.name });
  return { link: res.data.properties.action_link };
}

// Owner only: take away someone's login when they leave. Their account is deleted, so they can't log in again,
// and the database stops answering them straight away. Everything they added stays, with their name on it.
export async function removeTeamMember(email: string): Promise<{ ok?: true; err?: string }> {
  const { user, member } = await currentMember();
  if (member?.role !== "Owner") return { err: "Only the owner can remove team logins." };
  const e = email.trim().toLowerCase();
  if (e === user?.email?.toLowerCase()) return { err: "You can't remove your own login." };
  const db = adminDbSecret();
  const { data: t } = await db.from("team").select("user_id, name, role").eq("email", e).maybeSingle();
  if (!t) return { err: "That person isn't on the team." };
  if (t.role === "Owner") return { err: "The owner's login can't be removed here." };
  const { error } = await db.auth.admin.deleteUser(t.user_id);   // also removes their team row
  if (error) return { err: error.message };
  await db.from("team").delete().eq("user_id", t.user_id);
  await db.from("change_log").insert({ action: "Removed", what: "Team login", label: `${t.name} · ${e}`, who: member.name });
  return { ok: true };
}
