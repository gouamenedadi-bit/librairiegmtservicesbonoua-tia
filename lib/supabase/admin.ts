import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { fetchWithTimeout } from "@/lib/supabase/fetch-with-timeout";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client. Bypasses RLS entirely — server-only, never
 * import this from a Client Component or expose it to the browser bundle.
 * Reserved for the import script and admin server actions that must write
 * data no RLS policy grants to `anon`/`authenticated`.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // Longer than the interactive clients' default: the import script can
      // upload sizeable images over a slow connection and shouldn't be cut
      // off prematurely.
      global: { fetch: fetchWithTimeout(20000) },
    },
  );
}
