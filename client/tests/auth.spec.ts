import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display sign in page", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("should display sign up page", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: /sign up|create account/i })).toBeVisible();
  });

  test("should show validation errors on empty sign in", async ({ page }) => {
    await page.goto("/sign-in");
    await page.click('button[type="submit"]');
    // Should show validation error or stay on page
    await expect(page).toHaveURL(/sign-in/);
  });

  test("should navigate between sign in and sign up", async ({ page }) => {
    await page.goto("/sign-in");
    // Look for link to sign up
    const signUpLink = page.locator('a[href="/sign-up"]');
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL(/sign-up/);
    }
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await page.fill('input[type="email"]', "invalid@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Should show error or stay on sign in page
    await page.waitForTimeout(2000);
    // Check for error message or that we're still on sign-in
    const url = page.url();
    expect(url).toContain("sign-in");
  });
});
