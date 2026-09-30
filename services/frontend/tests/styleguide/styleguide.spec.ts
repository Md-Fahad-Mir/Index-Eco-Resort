import { mkdirSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { AFTER_SCREENSHOTS_DIR, describeViolations } from "../helpers/audit";

/**
 * Proves the design system: the Bangla rules hold in *computed* styles, the page
 * is accessible and keyboard-operable, and captures the artifacts used in the
 * phase report.
 */

mkdirSync(AFTER_SCREENSHOTS_DIR, { recursive: true });
const shot = (name: string) => path.join(AFTER_SCREENSHOTS_DIR, name);

/** Freezes transitions so a screenshot is deterministic. */
async function settle(page: Page) {
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}" +
      // The dev-server badge is not part of the design.
      "nextjs-portal{display:none!important}",
  });
  await page.evaluate(() => document.fonts.ready);
  // Wait out any running animation so contrast and screenshots are measured on
  // final pixels, not mid-fade.
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
  );
}

const computed = (locator: Locator, prop: string) =>
  locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

test.describe("styleguide", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/styleguide", { waitUntil: "load" });
    await settle(page);
  });

  test("Bangla typography rules hold in computed styles", async ({ page }) => {
    const bangla = page.locator('[lang="bn"]').first();
    await expect(bangla).toBeVisible();

    // §4.3 — tracking breaks conjunct shaping, so it must be exactly zero.
    for (const el of await page.locator('[lang="bn"]').all()) {
      expect(await computed(el, "letter-spacing")).toBe("normal");
    }

    // §4.4 — no synthetic italics anywhere, and the Book Now paragraph in
    // particular renders upright (the live site fakes an italic).
    const bookNow = page.getByTestId("sg-booknow-bangla").locator('[lang="bn"]');
    expect(await computed(bookNow, "font-style")).toBe("normal");
    expect(await computed(page.locator("html"), "font-synthesis")).toContain("none");

    // §4.2 — Bangla body gets the taller line.
    const fontSize = parseFloat(await computed(bookNow, "font-size"));
    const lineHeight = parseFloat(await computed(bookNow, "line-height"));
    expect(lineHeight / fontSize).toBeGreaterThan(1.6);

    // The display face is actually Jost, not a fallback.
    expect(await computed(bookNow, "font-family")).toContain("Jost");
  });

  test("a mixed Bangla + English heading uses one family and one baseline", async ({ page }) => {
    const heading = page.getByTestId("sg-mixed-heading").locator("h2");
    await expect(heading).toBeVisible();
    expect(await computed(heading, "font-family")).toContain("Jost");
    expect(await computed(heading, "letter-spacing")).toBe("normal");
  });

  test("no serious or critical accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(describeViolations(blocking)).toEqual([]);
  });

  test("controls are keyboard operable with a visible focus ring", async ({ page }) => {
    const button = page.getByRole("button", { name: "Book Now" });
    await button.focus();
    await expect(button).toBeFocused();
    expect(await computed(button, "outline-color")).toBe("rgb(46, 107, 64)"); // index

    // Tabs move with the arrow keys (Radix roving focus).
    const firstTab = page.getByRole("tab").first();
    await firstTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab").nth(1)).toBeFocused();
  });

  test("no horizontal page scroll at 320 or 390 px", async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await settle(page);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `document scrolls horizontally at ${width}px`).toBeLessThanOrEqual(width);
    }
  });

  test("captures: full page at 390 and 1440, plus the two close-ups", async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await settle(page);
      await page.screenshot({ path: shot(`styleguide-${width}.png`), fullPage: true });
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await settle(page);
    await page
      .getByTestId("sg-mixed-heading")
      .screenshot({ path: shot("styleguide-mixed-heading.png") });
    await page
      .getByTestId("sg-booknow-bangla")
      .screenshot({ path: shot("styleguide-booknow-bangla.png") });
  });

  test("MembershipCard tilts toward the pointer and catches light", async ({ page }) => {
    const card = page.getByTestId("sg-card");
    await card.scrollIntoViewIfNeeded();
    await settle(page);

    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    const face = card.getByTestId("membership-card-face");
    const restTransform = await computed(face, "transform");

    // Trace a slow arc across the card so the recorded video shows the tilt and
    // the sheen following the pointer.
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy, { steps: 5 });
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * Math.PI * 2;
      await page.mouse.move(
        cx + Math.cos(t) * box.width * 0.35,
        cy + Math.sin(t) * box.height * 0.35,
      );
      await page.waitForTimeout(25);
    }

    // A real 3D transform means the tilt is applied, not just a hover colour.
    const tiltedTransform = await computed(face, "transform");
    expect(tiltedTransform).not.toBe(restTransform);
    expect(tiltedTransform).toContain("matrix3d");

    await page.screenshot({ path: shot("styleguide-membership-card-tilt.png"), clip: box });

    // Back to rest.
    await page.mouse.move(box.x - 200, box.y - 200, { steps: 10 });
    await page.waitForTimeout(600);
  });
});
