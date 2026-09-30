import { expect, test, type Page } from "@playwright/test";
import { routeSlug } from "../helpers/audit";
import { en, FROZEN_ROUTES } from "../helpers/routes";

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
      await page.goto(en(route), { waitUntil: "load" });
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
    await page.goto(en("/styleguide"), { waitUntil: "load" });
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

/**
 * The chrome's open and hover states, which a page at rest never shows. The
 * Phase 5b chrome tokens restyle exactly these on Home, so their defaults are
 * pinned here too. Captured on /about-us; viewport-sized, not full page.
 */
test.describe("chrome states on /about-us are unchanged", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "styleguide", "production routes run in `non-home`");
  });

  const shot = { animations: "disabled", threshold: 0 } as const;

  const open = async (page: Page, width: number) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(en("/about-us"), { waitUntil: "load" });
    await settle(page);
  };

  for (const width of WIDTHS) {
    test(`solid header @ ${width}px`, async ({ page }) => {
      await open(page, width);
      await page.evaluate(() => window.scrollTo(0, 600));
      await expect(page.locator("header").first()).toHaveAttribute("data-solid", "true");
      await expect(page).toHaveScreenshot(`chrome-solid-header@${width}.png`, shot);
    });

    test(`contact modal @ ${width}px`, async ({ page }) => {
      await open(page, width);
      await page
        .getByTestId("floating-dock")
        .getByRole("button", { name: /Contact Form/i })
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      // With the validation messages showing, so the error styling is pinned too.
      await dialog.getByRole("button", { name: "Submit" }).click();
      await expect(dialog.getByText(/is required/).first()).toBeVisible();
      await expect(page).toHaveScreenshot(`chrome-contact-modal@${width}.png`, shot);
    });
  }

  test("mobile nav, packages expanded @ 390px", async ({ page }) => {
    await open(page, 390);
    await page.getByRole("button", { name: "Open menu" }).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByRole("button", { name: "Ownership Packages" }).click();
    await expect(sheet.getByRole("link", { name: "Gold Ownership", exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot("chrome-mobile-nav@390.png", shot);
  });

  test("packages dropdown, first row hovered @ 1440px", async ({ page }) => {
    await open(page, 1440);
    const nav = page.locator('nav[data-region="header"]');
    await nav.getByRole("button", { name: /Ownership Packages/i }).click();
    const gold = nav.getByRole("link", { name: "Gold Ownership", exact: true });
    await expect(gold).toBeVisible();
    await gold.hover();
    await expect(page).toHaveScreenshot("chrome-packages-menu@1440.png", shot);
  });

  test("hover states: dock label, Book Now, social icon @ 1440px", async ({ page }) => {
    await open(page, 1440);
    await page
      .getByTestId("floating-dock")
      .getByRole("link", { name: /WhatsApp/ })
      .hover();
    await expect(page).toHaveScreenshot("chrome-dock-hover@1440.png", shot);

    await page.locator('[data-region="topbar"] a').first().hover();
    await expect(page).toHaveScreenshot("chrome-topbar-social-hover@1440.png", shot);

    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(page.locator("header").first()).toHaveAttribute("data-solid", "true");
    await page.locator("header").getByRole("link", { name: "Book Now" }).hover();
    await expect(page).toHaveScreenshot("chrome-book-now-hover@1440.png", shot);
  });

  test("footer link hover @ 1440px", async ({ page }) => {
    await open(page, 1440);
    const footer = page.locator('footer[data-region="footer"]');
    await footer.scrollIntoViewIfNeeded();
    await footer.getByRole("link", { name: "Offer", exact: true }).hover();
    await expect(page).toHaveScreenshot("chrome-footer-hover@1440.png", shot);
  });
});
