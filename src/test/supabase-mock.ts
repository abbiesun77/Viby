import { vi } from "vitest";

/**
 * Build a chainable Supabase client mock for route tests.
 *
 * `tables` maps table name → handlers. Each handler can define what
 * `.insert().select().single()` and `.select().eq().single()` resolve to.
 *
 * This is intentionally small: it covers the query shapes our routes use,
 * not the full Supabase surface.
 */
export type TableResult = { data?: unknown; error?: unknown };

export interface MockTableConfig {
  insert?: TableResult;
  select?: TableResult;
  update?: TableResult;
  delete?: TableResult;
}

export function createSupabaseMock(options: {
  userId?: string | null;
  tables?: Record<string, MockTableConfig>;
}) {
  const { userId = "user_test_1", tables = {} } = options;

  function makeQuery(config: MockTableConfig | undefined) {
    // A thenable, chainable object. Terminal calls (.single()) and awaiting
    // the chain both resolve to the configured result for the last verb used.
    let lastVerb: keyof MockTableConfig = "select";

    const result = () => {
      const r = config?.[lastVerb] ?? { data: null, error: null };
      return Promise.resolve(r);
    };

    const chain: Record<string, unknown> = {
      insert: vi.fn(() => {
        lastVerb = "insert";
        return chain;
      }),
      update: vi.fn(() => {
        lastVerb = "update";
        return chain;
      }),
      delete: vi.fn(() => {
        lastVerb = "delete";
        return chain;
      }),
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      single: vi.fn(() => result()),
      maybeSingle: vi.fn(() => result()),
      then: (resolve: (v: unknown) => unknown) => result().then(resolve),
    };
    return chain;
  }

  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: userId ? { id: userId } : null },
          error: null,
        })
      ),
    },
    from: vi.fn((table: string) => makeQuery(tables[table])),
  };
}
