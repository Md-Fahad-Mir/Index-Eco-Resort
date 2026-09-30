import { expect, test, type Page } from "@playwright/test";
import { routeSlug } from "../helpers/audit";
import { FROZEN_ROUTES } from "../helpers/routes";

/**
 * Phase 5b guard. Home is being redesigned ("Midnight Estate") and the global
 * chrome wears the new look only while Home is displayed, so every other route
 * must stay pixel-identical. These baselines were captured from the Phase 7
 * build before any Phase 5b code and must keep passing unchanged.
 *
 * Reduced motion and disabled animations, so nothing is caught mid-transition;
 * `threshold: 0` so even a one-step colour drift in a token default fails.
 *
 * The production routes run in the `non-home` project. The styleguide returns
 * 404 in production, so its two baselines run in the styleguide config against
 * a dev server:
 *
 *   pnpm test:non-home
 */

const WIDTHS = [390, 1440] as const;
const ROUTES = FROZEN_ROUTES.filter((route) => route !== "/");

test.use({ reducedMotion: "reduce" });

/** Loads every lazy image and web font, then returns to the top with the header at rest. */
async function settle(page: Page, { siteHeader = true } = {}) {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
  });
  await page
    .waitForFunction(
      () => [...document.images].every((img) => img.complete && img.naturalWidth > 0),
      undefined,
      { timeout: 15_000 },
    )
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  // The header turns solid past 24px; the capture is of the page at rest.
  if (siteHeader) {
    await expect(page.locator("header").first()).toHaveAttribute("data-solid", "false");
  }
}

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    test(`${route} @ ${width}px is unchanged`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === "styleguide", "production routes run in `non-home`");
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route, { waitUntil: "load" });
      await settle(page);
      await expect(page).toHaveScreenshot(`${routeSlug(route)}@${width}.png`, {
        fullPage: true,
        animations: "disabled",
        threshold: 0,
        // Third-party content we do not render: the Google Maps embed on /contact.
        mask: [page.locator("iframe")],
      });
    });
  }
}

for (const width of WIDTHS) {
  test(`styleguide @ ${width}px is unchanged`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "styleguide", "the styleguide exists only in dev");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/styleguide", { waitUntil: "load" });
    // The dev-server badge is not part of the design.
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    // The styleguide sits outside the site layout: no header to wait for.
    await settle(page, { siteHeader: false });
    await expect(page).toHaveScreenshot(`styleguide@${width}.png`, {
      fullPage: true,
      animations: "disabled",
      threshold: 0,
    });
  });
}
