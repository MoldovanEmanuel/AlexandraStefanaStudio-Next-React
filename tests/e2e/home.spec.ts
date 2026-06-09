import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows studio name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Alexandra Stefana/i);
    await expect(page.getByText(/Alexandra Stefana Studio/i).first()).toBeVisible();
  });

  test("navigation links are present", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation").first();
    await expect(nav.getByRole("link", { name: /portofoliu/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /contact/i })).toBeVisible();
  });

  test("footer contains contact info", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toContainText("Cluj-Napoca");
  });

  test("has Open Graph meta tags", async ({ page }) => {
    await page.goto("/");
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /Alexandra/i);
  });
});
