import { POST } from "./route";

describe("POST /api/settings/ai-mode", () => {
  it("stores whether the user prefers Viby AI or BYOK", async () => {
    const request = new Request("http://localhost/api/settings/ai-mode", {
      method: "POST",
      body: JSON.stringify({
        mode: "viby_ai",
        byokBaseUrl: "",
        byokApiKey: "",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.mode).toBe("viby_ai");
  });
});
