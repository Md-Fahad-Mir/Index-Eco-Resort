import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import packages from "../../src/fixtures/packages.json";

/**
 * Ownership pages use one static route folder per package, not a root dynamic
 * segment: Phase 1 proved `app/[slug]/page.tsx` swallows the Laravel fallback for
 * every unknown single-segment path (architecture §3).
 *
 * The cost of that choice is that a package added in the admin panel has no route
 * until someone adds its folder — until then Laravel serves it in the old design.
 * This test is that alarm: it fails when package data holds a slug with no folder.
 *
 * It stays skipped until Phase 7 builds the first folder, then guards every
 * package from then on.
 */
const SITE_APP_DIR = path.resolve(__dirname, "../../src/app/(site)");

const packageSlugs = packages.map((p) => p.slug);

/** Route folders that correspond to a known package slug. */
const builtSlugs = existsSync(SITE_APP_DIR)
  ? readdirSync(SITE_APP_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && packageSlugs.includes(e.name))
      .filter((e) => existsSync(path.join(SITE_APP_DIR, e.name, "page.tsx")))
      .map((e) => e.name)
  : [];

test.describe("ownership routes", () => {
  test.skip(
    builtSlugs.length === 0,
    "Ownership pages are built in Phase 7 (prompts/08-ownership.md); this guard activates with the first route folder.",
  );

  test("every package slug in the data has a route folder", () => {
    const missing = packageSlugs.filter((slug) => !builtSlugs.includes(slug));
    expect(
      missing,
      `These packages exist in the CMS data but have no src/app/(site)/<slug>/page.tsx, so Laravel ` +
        `serves them in the old design. Add a route folder for each (see prompts/08-ownership.md).`,
    ).toEqual([]);
  });

  test("every package route responds 200 and names its package", async ({ page }) => {
    for (const pkg of packages.filter((p) => builtSlugs.includes(p.slug))) {
      const res = await page.goto(`/${pkg.slug}`);
      expect(res?.status(), `/${pkg.slug}`).toBe(200);
      await expect(page.locator("h1")).toHaveText(pkg.name);
    }
  });
});
