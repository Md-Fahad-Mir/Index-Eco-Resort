import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { describeViolations } from "../helpers/audit";
import home from "../../src/fixtures/home.json";
import { en } from "../helpers/routes";

/**
 * Home: every section from the audit, the hero's carousel behaviour, and the
 * quirks that are data rather than bugs. Runs in all three parity projects, so
 * the hero and the tabs are exercised on WebKit as well as Chromium.
 */

const mobile = async (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024;

test.describe("sections", () => {
  test("all twelve sections render in order", async ({ page }) => {
    await page.goto(en("/"));
    await expect(page.locator("main > *")).toHaveCount(12);
  });

  test("exactly one non-empty h1, in the accessibility tree", async ({ page }) => {
    await page.goto(en("/"));
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Index Eco Resort");

    // The hero's lockup holds the title; nothing may hide it from assistive
    // tech, or the page would lose its heading.
    const hiddenFromA11y = await h1.evaluate((el) => {
      let node: Element | null = el;
      while (node) {
        if (node.getAttribute("aria-hidden") === "true") return true;
        const style = getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return true;
        node = node.parentElement;
      }
      return false;
    });
    expect(hiddenFromA11y, "the h1 must stay in the accessibility tree").toBe(false);
  });

  test("empty CMS text is not rendered", async ({ page }) => {
    await page.goto(en("/"));
    // Empty CMS fields render nothing; no blank element should stand in.
    const empties = await page.evaluate(
      () =>
        [...document.querySelectorAll("section p, section h1, section h2, section h3")].filter(
          (el) => el.textContent?.trim() === "",
        ).length,
    );
    expect(empties).toBe(0);
  });
});

test.describe("hero", () => {
  test("shows no slide counter, progress line or pause control", async ({ page }) => {
    await page.goto(en("/"));
    // The owner asked for the media to stand clear; the lockup's link is all.
    const hero = page.getByTestId("hero");
    await expect(hero.getByRole("button")).toHaveCount(0);
    await expect(hero.getByText("01")).toHaveCount(0);
  });

  test("is a single still: no video, no carousel", async ({ page }) => {
    const videoRequests: string[] = [];
    page.on("request", (r) => {
      if (/\.mp4(\?|$)/.test(r.url())) videoRequests.push(r.url());
    });
    await page.goto(en("/"));
    const hero = page.getByTestId("hero");
    await expect(hero.locator("video")).toHaveCount(0);
    await expect(hero.locator("img").first()).toBeVisible();
    // One slide is not announced as a carousel.
    await expect(hero).not.toHaveAttribute("aria-roledescription", "carousel");
    await page.waitForTimeout(1000);
    expect(videoRequests, "the hero fetches no video").toEqual([]);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the page still shows all of its sections", async ({ page }) => {
    await page.goto(en("/"));
    await expect(page.locator("main > *")).toHaveCount(12);
  });

  test("every entrance is at its final state without scrolling", async ({ page }) => {
    await page.goto(en("/"));
    expect(await page.evaluate(withheld)).toEqual([]);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the server markup alone shows every entrance's final state", async ({ page }) => {
    await page.goto(en("/"));
    await expect(page.locator("main > *")).toHaveCount(12);
    expect(await page.evaluate(withheld)).toEqual([]);
  });
});

/**
 * Midnight's entrances that are still withholding content: a revealed element
 * not fully opaque or still clipped, or a "lights on" veil not yet lifted.
 * Runs in the page.
 */
function withheld(): string[] {
  return [...document.querySelectorAll("main [data-me-reveal], main [data-me-veil]")]
    .filter((el) => {
      const style = getComputedStyle(el);
      if (el.hasAttribute("data-me-veil")) return Number(style.opacity) > 0.01;
      return Number(style.opacity) < 0.99 || style.clipPath !== "none";
    })
    .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
}

test.describe("gallery", () => {
  test("reproduces the live counts, capped All included", async ({ page }) => {
    await page.goto(en("/"));
    const grid = page.locator("section", { has: page.getByRole("button", { name: /^All$/ }) });
    const tiles = grid.locator("ul li");

    // PARITY: the live Home caps "All" at 12 of 21 while a category shows its
    // full set, so filtering can show *more* (audit §11.2).
    await expect(tiles).toHaveCount(home.gallery.items.length);

    const biggest = Object.entries(home.gallery.itemsByCategory).sort(
      (a, b) => b[1].length - a[1].length,
    )[0]!;
    const name = home.gallery.categories.find((c) => c.id === biggest[0])?.name;
    expect(name).toBeTruthy();
    const chip = grid.getByRole("button", { name: name!, exact: true });
    await chip.scrollIntoViewIfNeeded();
    await chip.click();
    await expect(tiles).toHaveCount(biggest[1].length);

    // The oddity worth preserving: "All" is capped, so images exist that a
    // visitor can only ever reach through a category tab.
    const inAll = new Set(home.gallery.items.map((i) => i.image.src));
    const onlyInCategories = Object.values(home.gallery.itemsByCategory)
      .flat()
      .filter((i) => !inAll.has(i.image.src));
    expect(onlyInCategories.length).toBeGreaterThan(0);
  });

  test("a tile opens the lightbox and Escape closes it", async ({ page }) => {
    await page.goto(en("/"));
    await page
      .getByRole("button", { name: /View .* full size/ })
      .first()
      .click();
    const lightbox = page.locator(".yarl__container, [class*='yarl']").first();
    await expect(lightbox).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(lightbox).toBeHidden();
  });
});

test.describe("villa", () => {
  test("both room tabs switch, quirks and all", async ({ page }) => {
    await page.goto(en("/"));
    const rooms = home.villa.rooms;
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(rooms.length);

    // PARITY: the tab labelled "Cottage" contains "Executive Suite".
    await page.getByRole("tab", { name: rooms[1]!.tabLabel, exact: true }).click();
    await expect(page.getByRole("heading", { name: rooms[1]!.name })).toBeVisible();
  });

  test("a room description keeps the author's paragraph breaks", async ({ page }) => {
    const rooms = home.villa.rooms;
    // The stored value carries the blank line; the live template printed the
    // field inside one <p>, where HTML collapses it (allowed-diffs, rule 9e).
    const expected = rooms.map((room) => splitOnBlankLines(room.description));
    expect(
      Math.max(...expected.map((parts) => parts.length)),
      "the room descriptions should still hold two paragraphs",
    ).toBe(2);

    await page.goto(en("/"));
    for (const [index, room] of rooms.entries()) {
      if (index > 0) {
        await page.getByRole("tab", { name: room.tabLabel, exact: true }).click();
      }
      const panel = page.getByRole("tabpanel");
      await expect(panel.getByRole("heading", { name: room.name })).toBeVisible();

      const parts = expected[index]!;
      for (const part of parts) {
        await expect(panel.getByText(part, { exact: true })).toHaveCount(1);
      }
    }
  });
});

/** The only split the frontend is allowed to make: blank lines, nothing else. */
function splitOnBlankLines(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

test.describe("accessibility", () => {
  test("Home has no serious or critical violations", async ({ page }) => {
    await page.goto(en("/"));
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(describeViolations(blocking)).toEqual([]);
  });

  test("the whole page is reachable by keyboard", async ({ page }) => {
    if (await mobile(page)) test.skip();
    await page.goto(en("/"));
    // Walk forward and make sure focus keeps landing on real controls rather
    // than getting stuck or disappearing into a trap.
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const description = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        return `${el.tagName}:${(el.textContent ?? el.getAttribute("aria-label") ?? "").trim().slice(0, 24)}`;
      });
      if (description) seen.add(description);
    }
    expect(seen.size, "focus should move through many distinct controls").toBeGreaterThan(12);
  });
});
