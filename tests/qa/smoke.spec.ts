import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { path: "/", marker: "AIMNIS" },
  { path: "/home", marker: "AIMNIS" },
  { path: "/editor", marker: "AIMNIS" },
  { path: "/editor?solution=monitoring", marker: "AIM Monitoring" },
  { path: "/projects", marker: "AIMNIS" },
  { path: "/guard", marker: "AIM GUARD" },
  { path: "/monitoring", marker: "AIM Monitoring" },
] as const;

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  return errors;
}

test.describe("AIMNIS route smoke", () => {
  for (const route of ROUTES) {
    test(`${route.path} renders without runtime errors`, async ({ page }) => {
      const errors = captureRuntimeErrors(page);
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route.path} HTTP status`).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(route.marker);
      await expect(page.locator("body")).not.toContainText("Server Error");
      await page.waitForLoadState("networkidle");
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }
});

test("demo login accepts empty values and enters home", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "플랫폼 접속" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.locator("nav")).toBeVisible();
});

test.describe("AIM Monitoring UI contracts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor?solution=monitoring");
    await expect(page.locator('[data-monitoring-selection-id="header"]')).toBeVisible();
  });

  test("header logo area stays fixed when sidebar collapses", async ({ page }) => {
    const logoArea = page.locator('[data-monitoring-selection-id="header"] header > div').first();
    const sidebar = page.locator('[data-monitoring-selection-id="sidebar"] aside');
    await expect(logoArea).toHaveCSS("width", "220px");
    await expect(sidebar).toHaveCSS("width", "220px");

    await page.getByRole("button", { name: "메뉴 접기" }).click();

    await expect(sidebar).toHaveCSS("width", "72px");
    await expect(logoArea).toHaveCSS("width", "220px");
  });

  test("fullscreen and runtime hide page management", async ({ page }) => {
    await page.getByRole("button", { name: "확대" }).click();
    const fullscreen = page.locator("div.fixed.inset-0.z-\\[100\\]");
    await expect(fullscreen).toBeVisible();
    await expect(fullscreen.getByText("페이지 추가", { exact: true })).toHaveCount(0);

    await page.goto("/monitoring");
    await expect(page.getByText("페이지 추가", { exact: true })).toHaveCount(0);
  });

  test("panel line control changes the selected default widget border", async ({ page }) => {
    const selection = page.locator('[data-monitoring-selection-id="summary-equipment-status"]').first();
    await selection.click();
    await page.getByRole("button", { name: "전체 설비 상태 설정" }).click();
    const input = page.getByText("패널 라인", { exact: true }).locator("..").locator('input[type="text"]');
    await expect(input).toBeVisible();
    await input.fill("#ff00aa");

    await expect.poll(async () =>
      selection.locator("div").evaluateAll((elements) =>
        elements
          .filter((element) => {
            const style = getComputedStyle(element);
            return style.borderTopStyle !== "none" && parseFloat(style.borderTopWidth) > 0;
          })
          .map((element) => getComputedStyle(element).borderTopColor)
      )
    ).toContain("rgb(255, 0, 170)");
  });
});
