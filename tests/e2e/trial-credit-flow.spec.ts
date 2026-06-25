import { expect, test } from "@playwright/test";

test("trial workspace shows credits and project prep surfaces", async ({ page }) => {
  await page.goto("/app");

  await expect(page.getByText("Viby Credit")).toBeVisible();
  await expect(page.getByText("当前模式：Viby AI 试用")).toBeVisible();

  await page.goto("/app/projects/proj_1/storyboard");
  await expect(
    page.getByRole("heading", { name: "镜头清单" }),
  ).toBeVisible();
  await expect(page.getByText("缺少人物三视图")).toBeVisible();

  await page.goto("/app/projects/proj_1/assets");
  await expect(page.getByRole("heading", { name: "项目资产" })).toBeVisible();
  await expect(page.getByText("主角角色设定")).toBeVisible();
});
