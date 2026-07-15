import { expect, test } from "@playwright/test";

async function stabilize(page: import("@playwright/test").Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
  await page.waitForLoadState("networkidle");
}

test("login visual baseline", async ({ page }) => {
  await page.goto("/");
  await stabilize(page);
  await expect(page).toHaveScreenshot("login-1280.png", { fullPage: true });
});

test("home visual baseline", async ({ page }) => {
  await page.goto("/home");
  await stabilize(page);
  await expect(page).toHaveScreenshot("home-1280.png", { fullPage: true });
});

test("monitoring editor visual baseline", async ({ page }) => {
  await page.goto("/editor?solution=monitoring");
  await expect(page.locator('[data-monitoring-selection-id="header"]')).toBeVisible();
  await stabilize(page);
  await expect(page).toHaveScreenshot("monitoring-editor-1280.png", { fullPage: true });
});

test("monitoring runtime visual baseline", async ({ page }) => {
  await page.goto("/monitoring");
  await expect(page.locator('[data-monitoring-selection-id="header"]')).toBeVisible();
  await stabilize(page);
  await expect(page).toHaveScreenshot("monitoring-runtime-1280.png", { fullPage: true });
});
