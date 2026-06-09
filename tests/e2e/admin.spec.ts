import { test, expect } from "@playwright/test";

test.describe("Admin authentication", () => {
  test("redirects to login when accessing admin without auth", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/parolă/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /autentificare/i })).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/parolă/i).fill("wrongpassword");
    await page.getByRole("button", { name: /autentificare/i }).click();
    await expect(page.getByText(/email sau parolă/i)).toBeVisible({ timeout: 5000 });
  });
});
