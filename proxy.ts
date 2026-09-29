import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { fetchWithTimeout } from "@/lib/supabase/fetch-with-timeout";

// Next.js 16 renamed `middleware` to `proxy`; this keeps the Supabase auth
// session cookie refreshed on every request (required by @supabase/ssr).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
      // Short timeout on purpose: this runs on *every* navigation, so a
      // Supabase outage (or, during local setup, placeholder credentials)
      // must never stall every page load site-wide.
      global: { fetch: fetchWithTimeout(3000) },
    },
  );

  try {
    await supabase.auth.getUser();
  } catch {
    // Refreshing the session is best-effort — if Supabase is unreachable,
    // let the request through unauthenticated rather than fail the page.
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
