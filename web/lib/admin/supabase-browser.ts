import { createBrowserClient } from "@supabase/ssr";

// The team panel's database (a separate Supabase project from the app).
// Safe in the browser: every table only answers people listed on the team.
export function adminDb() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_ADMIN_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ADMIN_SUPABASE_PUBLISHABLE_KEY!,
  );
}
