import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Per-request client that acts as the logged-in team member.
export async function adminDbServer() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_ADMIN_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ADMIN_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (list) => {
          // Server components can't write cookies; proxy.ts keeps the session fresh instead.
          try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {}
        },
      },
    },
  );
}

// Full-access client for owner-only jobs (adding team members). Server only, never sent to a browser.
export function adminDbSecret() {
  return createClient(process.env.NEXT_PUBLIC_ADMIN_SUPABASE_URL!, process.env.ADMIN_SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// The logged-in team member, or null if not logged in or not on the team.
export async function currentMember() {
  const db = await adminDbServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { user: null, member: null };
  const { data: member } = await db.from("team").select("name, role, email").eq("user_id", user.id).maybeSingle();
  return { user, member: member as { name: string; role: string; email: string } | null };
}
