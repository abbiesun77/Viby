import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Whether Supabase env vars are configured.
 * When false, the app runs in demo mode: server routes get a mock client
 * that returns an empty dataset and a synthetic demo user, so the UI is
 * navigable without a backend. See lib/supabase/mock.ts for the stub.
 */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Demo mode: return a mock client so server components don't throw.
    // Auth is bypassed (a synthetic demo user is returned) and all
    // table queries resolve to empty results.
    const { createMockServerClient } = await import("./mock");
    return createMockServerClient();
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Ignore writes in read-only server contexts.
            }
          });
        },
      },
    },
  );
}
