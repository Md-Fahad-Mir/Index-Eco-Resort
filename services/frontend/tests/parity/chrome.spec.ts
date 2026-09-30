import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { describeViolations } from "../helpers/audit";
import { en } from "../helpers/routes";

/**
 * The global chrome's behaviour. These run in every parity project, so the
 * mobile menu, dock and contact modal are each exercised on both Chromium and
 * WebKit at 390px — the live site's JavaScript menu had no focus trap, no
 * Escape and no focus return, and those are the parts most likely to differ
 * between engines.
 */

const isMobileViewport = async (page: import("@playwright/test").Page) =>
  (page.viewportSize()?.width ?? 1440) < 1024;

/** The dock's three actions sit folded behind one message button. */
const openDock = async (page: import("@playwright/test").Page) => {
  const dock = page.getByTestId("floating-dock");
  await dock.getByRole("button", { name: "Contact us" }).click();
  return dock;
};

test.describe("header", () => {
  test("becomes solid after scrolling and stays readable", async ({ page }) => {
    await page.goto(en("/about-us"));
    const header = page.locator("header");
    await expect(header).toHaveAttribute("data-solid", "false");

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveAttribute("data-solid", "true");

    // The header is fixed, so turning solid must not move the page content.
    const heroBefore = await page.locator('[data-testid="page-hero"]').boundingBox();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).toHaveAttribute("data-solid", "false");
    const heroAfter = await page.locator('[data-testid="page-hero"]').boundingBox();
    expect(heroBefore?.width).toBe(heroAfter?.width);
  });

  test("marks the current page", async ({ page }) => {
    if (await isMobileViewport(page)) test.skip();
    await page.goto(en("/offer"));
    await expect(page.locator('nav[data-region="header"] [aria-current="page"]')).toHaveText(
      "Offer",
    );
  });

  test("the packages dropdown opens by keyboard and lists all four", async ({ page }) => {
    if (await isMobileViewport(page)) test.skip();
    await page.goto(en("/"));
    // Scoped to the header: the footer lists the same four packages.
    const nav = page.locator('nav[data-region="header"]');
    const trigger = nav.getByRole("button", { name: /Ownership Packages/i });
    await trigger.focus();
    await page.keyboard.press("Enter");
    for (const name of [
      "Gold Ownership",
      "Platinum Ownership",
      "Signature Ownership",
      "Silver Ownership",
    ]) {
      await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(nav.getByRole("link", { name: "Gold Ownership", exact: true })).toBeHidden();
  });
});

test.describe("mobile menu", () => {
  test("opens, traps focus, closes on Escape and returns focus", async ({ page }) => {
    if (!(await isMobileViewport(page))) test.skip();
    await page.goto(en("/"));

    const trigger = page.getByRole("button", { name: "Open menu" });
    await trigger.click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();

    // Focus is inside the sheet, not left behind on the page.
    const focusInside = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return Boolean(dialog && document.activeElement && dialog.contains(document.activeElement));
    });
    expect(focusInside).toBe(true);

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("About points at the working page and packages expand", async ({ page }) => {
    if (!(await isMobileViewport(page))) test.skip();
    await page.goto(en("/"));
    await page.getByRole("button", { name: "Open menu" }).click();

    // PARITY (rule 9c): the live href is /about_us, which returns 500.
    await expect(page.getByRole("link", { name: "About Us" })).toHaveAttribute(
      "href",
      en("/about-us"),
    );

    const sheet = page.getByRole("dialog");
    await sheet.getByRole("button", { name: "Ownership Packages" }).click();
    await expect(sheet.getByRole("link", { name: "Gold Ownership", exact: true })).toBeVisible();

    // PARITY: Call Now dials a third number, different from the top bar and footer.
    await expect(page.getByRole("link", { name: "Call Now" })).toHaveAttribute(
      "href",
      "tel:09638657301",
    );
  });

  test("closes when a link is followed", async ({ page }) => {
    if (!(await isMobileViewport(page))) test.skip();
    await page.goto(en("/"));
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("link", { name: "Offer" }).click();
    await expect(page).toHaveURL(/\/offer$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("floating dock", () => {
  test("keeps the live hrefs exactly, contradictions included", async ({ page }) => {
    await page.goto(en("/"));
    await expect(page.getByTestId("floating-dock")).toBeVisible();
    const dock = await openDock(page);

    // PARITY: the button dials +8801700729312 while displaying 01711307580.
    await expect(dock.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
      "href",
      "https://web.whatsapp.com/send?phone=+8801700729312",
    );
    await expect(dock.getByRole("link", { name: /Phone/ })).toHaveAttribute(
      "href",
      "tel:+8801700729312",
    );
  });

  test("sits clear of the home indicator on mobile", async ({ page }) => {
    if (!(await isMobileViewport(page))) test.skip();
    await page.goto(en("/"));
    const dock = page.getByTestId("floating-dock");
    const bottom = await dock.evaluate((el) => getComputedStyle(el).bottom);
    // max(1rem, env(safe-area-inset-bottom)) resolves to at least 16px.
    expect(parseFloat(bottom)).toBeGreaterThanOrEqual(16);
  });

  test("starts folded and opens from the message button", async ({ page }) => {
    await page.goto(en("/"));
    const dock = page.getByTestId("floating-dock");
    const toggle = dock.getByRole("button", { name: "Contact us" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(dock.getByRole("link", { name: /WhatsApp/ })).toBeHidden();

    await toggle.click();
    await expect(dock.getByRole("link", { name: /WhatsApp/ })).toBeVisible();
    const close = dock.getByRole("button", { name: "Close contact options" });
    await expect(close).toHaveAttribute("aria-expanded", "true");

    // Escape folds it and leaves focus on the toggle.
    await page.keyboard.press("Escape");
    await expect(dock.getByRole("link", { name: /WhatsApp/ })).toBeHidden();
    await expect(toggle).toBeFocused();

    // So does a press anywhere else on the page.
    await toggle.click();
    await page.mouse.click(10, 300);
    await expect(dock.getByRole("link", { name: /WhatsApp/ })).toBeHidden();
  });

  test("its buttons meet the touch-target minimum", async ({ page }) => {
    await page.goto(en("/"));
    const dock = await openDock(page);
    const buttons = dock.locator("a, button");
    for (const button of await buttons.all()) {
      // Polled, since the list scales up as it fans out.
      await expect
        .poll(async () => (await button.boundingBox())?.width ?? 0)
        .toBeGreaterThanOrEqual(44);
      await expect
        .poll(async () => (await button.boundingBox())?.height ?? 0)
        .toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("contact modal", () => {
  test("opens from the dock, validates, submits and returns focus", async ({ page }) => {
    await page.goto(en("/"));
    const dock = await openDock(page);
    await dock.getByRole("button", { name: /Contact Form/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Contact Form" })).toBeVisible();

    // The live modal marks name, phone and email required; nothing else.
    await dialog.getByRole("button", { name: "Submit" }).click();
    await expect(dialog.getByText(/is required/).first()).toBeVisible();

    await dialog.getByLabel(/^Name/).fill("Test Person");
    await dialog.getByLabel(/^Phone/).fill("01700000000");
    await dialog.getByLabel(/^Email/).fill("test@example.com");
    await dialog.getByRole("button", { name: "Submit" }).click();

    // The live site's own success text.
    await expect(dialog.getByText("✓ Message sent successfully!")).toBeVisible();

    // The dock folds as the dialog opens, so focus returns to its toggle.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(dock.getByRole("button", { name: "Contact us" })).toBeFocused();
  });

  test("submits the field names the live form used", async ({ page }) => {
    await page.goto(en("/"));
    const payloads: unknown[] = [];
    // The page's language rides along as ?lang=, outside the payload.
    await page.route(/\/api\/forms\/contact(\?|$)/, async (route) => {
      payloads.push(route.request().postDataJSON());
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });

    const dock = await openDock(page);
    await dock.getByRole("button", { name: /Contact Form/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/^Name/).fill("Test Person");
    await dialog.getByLabel(/^Phone/).fill("01700000000");
    await dialog.getByLabel(/^Email/).fill("test@example.com");
    await dialog.getByRole("button", { name: "Submit" }).click();
    await expect(dialog.getByText("✓ Message sent successfully!")).toBeVisible();

    expect(payloads).toHaveLength(1);
    const payload = payloads[0] as Record<string, string>;
    expect(Object.keys(payload).sort()).toEqual(
      ["_token", "address", "email", "message", "name", "phone"].sort(),
    );
    // PARITY: the live modal always sends address="N/A".
    expect(payload.address).toBe("N/A");
  });
});

test.describe("accessibility", () => {
  for (const route of ["/", "/about-us", "/silver-ownership-5"]) {
    test(`${route} has no serious or critical violations`, async ({ page }) => {
      await page.goto(en(route));
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(describeViolations(blocking), `axe on ${route}`).toEqual([]);
    });
  }
});
