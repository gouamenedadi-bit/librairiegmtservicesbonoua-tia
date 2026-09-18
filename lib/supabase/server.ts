import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database.types";

/**
 * Server-side Supabase client for use in Server Components, Server Actions
 * and Route Handlers. Runs under RLS as the anon/authenticated role — never
 * use this for privileged writes, use `lib/supabase/admin.ts` instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component: session refresh is handled by
            // the proxy (see proxy.ts), so this can be safely ignored here.
          }
        },
      },
    },
  );
}
