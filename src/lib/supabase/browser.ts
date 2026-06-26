import { createBrowserClient } from "@supabase/ssr";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Demo mode: return a no-op browser client. Auth calls resolve to
    // a synthetic user; the email-auth-form already short-circuits to
    // /app in this case, so this client is rarely actually called.
    return createMockBrowserClient();
  }

  return createBrowserClient(url, anonKey);
}

const DEMO_USER = {
  id: "demo-user-0000-0000-0000-000000000000",
  email: "demo@viby.local",
};

function createMockBrowserClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: DEMO_USER }, error: null }),
      signUp: async () => ({ data: { user: DEMO_USER }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => makeChain(),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: "demo" }, error: null }),
        getPublicUrl: (p: string) => ({ data: { publicUrl: `/demo-storage/${p}` } }),
      }),
    },
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }),
    removeChannel: () => {},
  };
}

function emptyResult() {
  return { data: [], error: null, count: 0 };
}

function makeChain() {
  const chain = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    insert: () => chain,
    update: () => chain,
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    then: (resolve: (v: ReturnType<typeof emptyResult>) => void) =>
      Promise.resolve(emptyResult()).then(resolve),
    catch: () => Promise.resolve(emptyResult()),
  };
  return chain;
}
