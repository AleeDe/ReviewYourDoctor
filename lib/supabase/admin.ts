import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service-role key.
 * BYPASSES Row Level Security. Use ONLY in server-side code (route handlers /
 * server actions) that is gated behind an admin check. NEVER import this into a
 * Client Component or expose the key to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
