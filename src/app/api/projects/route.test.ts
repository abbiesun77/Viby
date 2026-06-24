import { POST } from "./route";

describe("POST /api/projects", () => {
  it("creates a project from the one-line idea path", async () => {
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
  });
});
