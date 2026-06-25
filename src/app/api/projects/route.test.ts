import { vi, describe, it, expect, beforeEach } from "vitest";
import { createSupabaseMock } from "../../../test/supabase-mock";

const mocks = vi.hoisted(() => ({
  client: null as ReturnType<typeof createSupabaseMock> | null,
}));

vi.mock("../../../lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mocks.client),
}));

vi.mock("../../../lib/ai/config", () => ({
  resolveAiConfig: () => Promise.resolve({ mode: "viby_ai" }),
  debitForAction: () => Promise.resolve(115),
}));

vi.mock("../../../lib/ai/client", () => ({
  generateText: () =>
    Promise.resolve("== 场景 1：便利店 ==\n夜晚，便利店冷光招牌亮着。"),
}));

import { POST } from "./route";

describe("POST /api/projects", () => {
  beforeEach(() => {
    mocks.client = createSupabaseMock({
      userId: "user_test_1",
      tables: {
        projects: {
          insert: {
            data: {
              id: "proj_test_1",
              entry_mode: "idea",
              title: "便利店宇航员",
              workflow_state: "script",
            },
          },
        },
        scripts: { insert: { data: {} } },
      },
    });
  });

  it("creates a project from the one-line idea path and generates a script", async () => {
    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({
        entryMode: "idea",
        title: "便利店宇航员",
        rawInput: "一个失业宇航员在便利店遇见未来的自己",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.project.entryMode).toBe("idea");
    expect(payload.project.title).toBe("便利店宇航员");
    expect(payload.workflowState).toBe("script");
  });

  it("rejects an unauthenticated request", async () => {
    mocks.client = createSupabaseMock({ userId: null });

    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify({
        entryMode: "idea",
        title: "x",
        rawInput: "y",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
