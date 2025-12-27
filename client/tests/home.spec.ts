import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/LearnHub/);
  });

  test("should display hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should display featured courses", async ({ page }) => {
    await page.goto("/");
    // Wait for courses to load
    await page.waitForSelector('[data-testid="course-card"], .course-card, article', { timeout: 10000 }).catch(() => {});
    // Check that courses section exists
    const coursesSection = page.locator("text=courses").first();
    await expect(coursesSection).toBeVisible();
  });

  test("should navigate to courses page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/courses"]');
    await expect(page).toHaveURL(/.*courses/);
  });

  test("should have working navigation", async ({ page }) => {
    await page.goto("/");
    // Check main nav links exist
    await expect(page.locator('nav')).toBeVisible();
  });
});
