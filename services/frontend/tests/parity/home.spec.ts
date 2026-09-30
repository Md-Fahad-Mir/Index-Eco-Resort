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

  test("exactly one non-empty h1, and it survives a slide change", async ({ page }) => {
    await page.goto(en("/"));
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Index Eco Resort");

    // The title lives on slide 2. Inactive slides must not be hidden from
    // assistive tech, or the page would lose its heading while slide 1 shows.
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
    // Slide 1's subline and title are empty in the data; nothing should stand in.
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
  test("has one control that pauses both the rotation and the video", async ({ page }) => {
    await page.goto(en("/"));
    const pause = page.getByRole("button", { name: "Pause slideshow" });
    await expect(pause).toBeVisible();

    await pause.click();
    await expect(page.getByRole("button", { name: "Play slideshow" })).toBeVisible();

    const paused = await page.evaluate(() => {
      const video = document.querySelector("video");
      return video ? video.paused : null;
    });
    expect(paused, "the video pauses with the slideshow").toBe(true);
  });

  test("the video is muted, inline and not looping", async ({ page }) => {
    await page.goto(en("/"));
    const attrs = await page.evaluate(() => {
      const v = document.querySelector("video");
      if (!v) return null;
      return {
        muted: v.muted,
        playsInline: v.playsInline,
        loop: v.loop,
        // The attribute is what we ask for; `v.preload` reports what the
        // browser decided, and mobile browsers force "none" to save data.
        preloadAttr: v.getAttribute("preload"),
      };
    });
    expect(attrs).toMatchObject({ muted: true, playsInline: true, loop: false });
    // Nothing is fetched up front: the clip is 18MB with no smaller variant,
    // and a full-viewport video that paints late becomes the LCP element.
    expect(attrs?.preloadAttr).toBe("none");
  });
});

test.describe("media budget", () => {
  test("no video is fetched before the largest paint", async ({ page }) => {
    const videoRequests: { url: string; atMs: number }[] = [];
    const started = Date.now();
    page.on("request", (r) => {
      if (/\.mp4(\?|$)/.test(r.url()))
        videoRequests.push({ url: r.url(), atMs: Date.now() - started });
    });

    await page.goto(en("/"));
    // Read the largest paint the browser actually recorded.
    const lcpMs = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let last = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) last = entry.startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });
          setTimeout(() => resolve(last), 1200);
        }),
    );
    expect(lcpMs, "the page should record a largest paint").toBeGreaterThan(0);

    // The clip must not compete with it: nothing requested before it painted.
    const early = videoRequests.filter((r) => r.atMs < lcpMs);
    expect(
      early.map((r) => r.url),
      "video requested before LCP",
    ).toEqual([]);
  });

  test("Save-Data is honoured: the poster is the whole experience", async ({ browser }) => {
    const context = await browser.newContext({ extraHTTPHeaders: { "Save-Data": "on" } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        get: () => ({ saveData: true, effectiveType: "4g" }),
      });
    });
    let videoBytes = 0;
    page.on("response", (r) => {
      if (/\.mp4(\?|$)/.test(r.url())) videoBytes += Number(r.headers()["content-length"] ?? 1);
    });
    await page.goto(en("/"));
    await page.waitForTimeout(4000);
    expect(videoBytes, "no video on a metered connection").toBe(0);

    // But the poster is there, so the hero is not an empty panel.
    const posterVisible = await page
      .locator("section img")
      .first()
      .isVisible()
      .catch(() => false);
    expect(posterVisible).toBe(true);
    await context.close();
  });

  test("the phone encode is offered below 1024px, the original above", async ({ page }) => {
    await page.goto(en("/"));
    // Press play so the sources are attached regardless of connection.
    await page
      .getByRole("button", { name: /slideshow/i })
      .first()
      .click();
    await page.waitForTimeout(500);
    const sources = await page.evaluate(() =>
      [...document.querySelectorAll("video source")].map((s) => ({
        src: s.getAttribute("src"),
        media: s.getAttribute("media"),
      })),
    );
    const phone = sources.find((s) => s.media);
    expect(phone?.media).toBe("(max-width: 1023px)");
    expect(phone?.src).toMatch(/-720p\.mp4$/);
    expect(sources.some((s) => !s.media && /\.mp4$/.test(s.src ?? ""))).toBe(true);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing autoplays and the control is still offered", async ({ page }) => {
    await page.goto(en("/"));
    // Starts paused, so the control invites playing rather than pausing.
    await expect(page.getByRole("button", { name: "Play slideshow" })).toBeVisible();
    await page.waitForTimeout(1200);
    const paused = await page.evaluate(() => document.querySelector("video")?.paused ?? null);
    expect(paused).toBe(true);
  });

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
