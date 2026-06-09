import { test, expect } from "@playwright/test";

test.describe("Portfolio page", () => {
  test("loads the portfolio page", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(page.getByRole("heading", { name: /Portofoliu/i })).toBeVisible();
  });

  test("has category filter buttons", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(page.getByRole("button", { name: /Toate/i })).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /Contact/i })).toBeVisible();
    await expect(page.getByRole("form")).toBeVisible();
  });

  test("contact form has required fields", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel(/Nume/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Mesaj/i)).toBeVisible();
  });

  test("sitemap.xml returns valid XML", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const content = await response.text();
    expect(content).toContain("<?xml");
  });

  test("robots.txt blocks admin paths", async ({ page }) => {
    const response = await page.request.get("/robots.txt");
    const text = await response.text();
    expect(text).toContain("Disallow: /admin/");
  });
});
