/**
 * Mock Supabase client used in demo mode (no env vars configured).
 *
 * Goals:
 *   - `auth.getUser()` returns a synthetic demo user so protected routes
 *     don't redirect to /sign-in.
 *   - `from(table).select(...)` style queries resolve to empty results
 *     so server components render their "empty" state instead of throwing.
 *   - `storage.from(bucket).upload(...)` returns a fake public URL.
 *
 * This is NOT a real backend. Writes are silently dropped. Any route that
 * creates real data (POST /api/projects, asset generation, etc.) will
 * return a friendly error in demo mode.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const DEMO_USER = {
  id: "demo-user-0000-0000-0000-000000000000",
  email: "demo@viby.local",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
} as const;

type QueryResult = { data: unknown[] | null; error: null; count: number | null };

function emptyResult(): QueryResult {
  return { data: [], error: null, count: 0 };
}

/**
 * A thenable query chain. Every chainable method returns `chain` so calls
 * can be composed (.select().eq().order()). Awaiting the chain resolves to
 * an empty result. Terminal methods (.single / .maybeSingle) return a real
 * Promise resolving to { data: null }.
 */
function makeChain() {
  const chain = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    gt: () => chain,
    gte: () => chain,
    lt: () => chain,
    lte: () => chain,
    like: () => chain,
    ilike: () => chain,
    in: () => chain,
    is: () => chain,
    not: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    filter: () => chain,
    insert: () => chain,
    update: () => chain,
    upsert: () => chain,
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    single: () =>
      Promise.resolve({ data: null, error: null }),
    maybeSingle: () =>
      Promise.resolve({ data: null, error: null }),
    // Thenable protocol: `await chain` resolves to an empty result.
    then: (resolve: (v: QueryResult) => void) =>
      Promise.resolve(emptyResult()).then(resolve),
    catch: () => Promise.resolve(emptyResult()),
  };
  return chain;
}

export function createMockServerClient() {
  // Demo-mode runtime stub. We assert it to the real SupabaseClient type so
  // callers (which receive `realClient | mockClient`) keep precise query
  // result types instead of collapsing to `unknown` on the union. The shape
  // below only implements what the app actually calls; the cast is the
  // single, intentional seam where that partial impl meets the full type.
  const client = {
    auth: {
      getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      getSession: async () => ({
        data: { session: null },
        error: null,
      }),
      signOut: async () => ({ error: null }),
    },
    from: () => makeChain(),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: "demo/path" }, error: null }),
        uploadAsync: async () => ({ data: { path: "demo/path" }, error: null }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `/demo-storage/${path}` },
        }),
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: [], error: null }),
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
    removeChannel: () => {},
  };
  return client as unknown as SupabaseClient;
}
