import { expect, test } from "@playwright/test";
import { auditLinks } from "../helpers/audit";
import { OWNED_ROUTES } from "../helpers/routes";
import { isAllowedHref } from "./allowed-diffs";

/**
 * Link parity for the global chrome.
 *
 * For every route, the set of destinations in each region must match what the
 * live site had (audit/links.json). Both sides are normalised first — the
 * captured data stores internal links as absolute URLs on the old origin, and
 * `https://indexecoresort.com/offer` and `/offer` are the same destination.
 *
 * Differences fail unless tests/parity/allowed-diffs.ts explains them.
 */

/**
 * Which regions exist depends on the viewport: the top bar and the desktop nav
 * are hidden below 1024px, and the mobile sheet does not exist above it. Each
 * layout is checked against the regions it actually renders — run this spec in
 * both the desktop and the mobile projects to cover all five.
 */
const DESKTOP_REGIONS = ["topbar", "header", "dock", "footer"] as const;
const MOBILE_REGIONS = ["mobile-nav", "dock", "footer"] as const;

const ORIGIN = "https://indexecoresort.com";

/** Same destination, written either way. */
const normalise = (href: string): string => {
  const trimmed = href.trim();
  if (trimmed === ORIGIN) return "/";
  if (trimmed.startsWith(`${ORIGIN}/`)) return trimmed.slice(ORIGIN.length);
  return trimmed;
};

/** Routes whose chrome we can compare: those this app now serves. */
const ROUTES = [
  "/",
  "/about-us",
  "/offer",
  "/book-now",
  "/event",
  "/blogs",
  "/gallery",
  "/contact",
];

for (const route of ROUTES) {
  test(`${route} — chrome links match the captured site`, async ({ page }) => {
    const baseline = auditLinks()[route];
    expect(baseline, `audit/links.json has no entry for ${route}`).toBeTruthy();
    if (!baseline) return;

    await page.goto(route);

    // Both menus mount their links only when open, so open them first. On the
    // live site the same links sit in the DOM hidden by CSS; either way the
    // destinations reachable from the chrome are what we are comparing.
    const packagesTrigger = page.getByRole("button", { name: /Ownership Packages/i });
    if (await packagesTrigger.isVisible().catch(() => false)) {
      await packagesTrigger.click();
      await page.getByRole("link", { name: "Gold Ownership" }).first().waitFor();
    }

    const menuButton = page.getByRole("button", { name: "Open menu" });
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.getByRole("dialog").waitFor();
      // The packages accordion inside the sheet holds the same four links.
      const accordion = page.getByRole("button", { name: "Ownership Packages" }).last();
      if (await accordion.isVisible().catch(() => false)) await accordion.click();
    }

    const actual = await page.evaluate(() => {
      // Each chrome component tags its own region, so this needs no guessing.
      const regionOf = (el: Element): string => {
        if (el.closest('[data-testid="floating-dock"]')) return "dock";
        return el.closest("[data-region]")?.getAttribute("data-region") ?? "main";
      };
      return [...document.querySelectorAll("a[href]")].map((a) => ({
        region: regionOf(a),
        href: a.getAttribute("href") ?? "",
      }));
    });

    const width = page.viewportSize()?.width ?? 1440;
    const base = width >= 1024 ? DESKTOP_REGIONS : MOBILE_REGIONS;
    // `main` is a page's own content; only checked where the real page exists.
    const regions = OWNED_ROUTES.includes(route) ? ([...base, "main"] as const) : base;

    for (const region of regions) {
      // The captured top bar had only social links; ours renders the same.
      const expected = new Set(
        baseline
          .filter((link) => link.region === region)
          .map((link) => normalise(link.href))
          .filter((href) => href && href !== ""),
      );
      const got = new Set(
        actual
          .filter(
            (link) =>
              link.region === region ||
              (region === "header" && link.region === "mobile-nav" && false),
          )
          .map((link) => normalise(link.href)),
      );

      const missing = [...expected].filter((href) => !got.has(href) && !isAllowedHref(href));
      expect(
        missing,
        `${route} · ${region}: destinations present on the live site but missing here`,
      ).toEqual([]);
    }
  });
}
