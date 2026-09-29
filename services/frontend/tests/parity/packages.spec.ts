import { expect, test } from "@playwright/test";
import packages from "../../src/fixtures/packages.json";

/**
 * Ownership pages are one dynamic route fed by the package data, so every slug
 * in the data must render. When the backend adds a package it gets a page
 * automatically; this is the check that it actually does — and the alarm if a
 * slug ever stops resolving.
 *
 * The route exists since Phase 4 (a placeholder until Phase 7 fills it in).
 */
test.describe("ownership packages", () => {
  for (const pkg of packages) {
    test(`/${pkg.slug} renders ${pkg.name}`, async ({ page }) => {
      const response = await page.goto(`/${pkg.slug}`);
      expect(response?.status(), `/${pkg.slug}`).toBe(200);
      await expect(page.locator("h1")).toHaveText(pkg.name);
    });
  }

  test("an unknown ownership-shaped slug is a 404", async ({ page }) => {
    const response = await page.goto("/definitely-not-a-package-9");
    expect(response?.status()).toBe(404);
  });
});
