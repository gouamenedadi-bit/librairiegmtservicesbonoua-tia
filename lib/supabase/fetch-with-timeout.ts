const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Bounds every Supabase request (auth, database, storage) to a sane timeout.
 * Without this, a Supabase project that's unreachable — wrong/placeholder
 * credentials during local setup, or a real network hiccup in production —
 * makes `supabase-js` hang on the platform's default fetch timeout (tens of
 * seconds), which stalls `proxy.ts` on *every* request (it awaits
 * `auth.getUser()` unconditionally) and makes the whole site feel broken,
 * not just whichever page happened to query the database.
 */
export function fetchWithTimeout(timeoutMs: number = DEFAULT_TIMEOUT_MS): typeof fetch {
  return (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}
