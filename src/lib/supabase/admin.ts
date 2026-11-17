import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client cu service role: ocoleste RLS. Se foloseste DOAR pe server (comenzi, statusul "platita", seed).
// Cheia nu are prefix NEXT_PUBLIC_, deci nu ajunge niciodata in browser.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
