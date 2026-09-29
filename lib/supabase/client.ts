import { createBrowserClient } from "@supabase/ssr";

import { fetchWithTimeout } from "@/lib/supabase/fetch-with-timeout";
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: fetchWithTimeout() } },
  );
}
