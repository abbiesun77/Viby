import { test, expect } from "@playwright/test";

test("landing page routes into auth", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "少抽卡，更稳地做出想要的视频",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "免费试用" })).toHaveAttribute(
    "href",
    "/sign-up",
  );
  await expect(page.getByRole("link", { name: "登录" })).toHaveAttribute(
    "href",
    "/sign-in",
  );
});

test("signed-in home shows trial credit and the three entry options", async ({
  page,
}) => {
  await page.goto("/app");

  await expect(page.getByText("Viby Credit")).toBeVisible();
  await expect(page.getByRole("button", { name: "一句话脑暴" })).toBeVisible();
  await expect(page.getByRole("button", { name: "段落转分镜" })).toBeVisible();
  await expect(page.getByRole("button", { name: "导入剧本" })).toBeVisible();
});
