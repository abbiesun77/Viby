import { POST } from "./route";

describe("POST /api/projects/[projectId]/brief", () => {
  it("returns the sample creative brief payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/projects/proj_test_1/brief", {
        method: "POST",
      }),
      {
        params: {
          projectId: "proj_test_1",
        },
      },
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.brief.genre).toBe("科幻剧情");
    expect(payload.brief.tone).toBe("克制、轻微荒诞、电影感");
    expect(payload.brief.goal).toBe("先稳定角色和便利店场景，再展开镜头");
  });

  it("rejects a blank project id", async () => {
    await expect(
      POST(
        new Request("http://localhost/api/projects//brief", {
          method: "POST",
        }),
        {
          params: {
            projectId: "   ",
          },
        },
      ),
    ).rejects.toThrow();
  });
});
