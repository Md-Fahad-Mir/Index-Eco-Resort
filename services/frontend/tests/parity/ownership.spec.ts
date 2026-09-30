import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { AUDIT_DIR } from "../helpers/audit";
import packages from "../../src/fixtures/packages.json";

/**
 * The four ownership pages, all from one dynamic route.
 *
 * The signature element lives here, so this spec covers the card's behaviour
 * as well as the content: tilt for fine pointers only, a sweep on touch, and
 * nothing moving at all under reduced motion.
 */

/** The YouTube id the live page carried, read from the Phase 0 capture. */
function capturedVideoId(slug: string): string {
  const html = readFileSync(path.join(AUDIT_DIR, "html", `${slug}.html`), "utf8");
  const match = html.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]+)/);
  expect(match, `no YouTube embed captured for /${slug}`).toBeTruthy();
  return match![1]!;
}

const fine = async (page: Page) => page.evaluate(() => matchMedia("(pointer: fine)").matches);

/**
 * Everything about the card, measured in one evaluate against a fresh query.
 *
 * `useReducedMotion` resolves only after hydration, so the card renders once
 * more with a different motion path — a Playwright handle taken before that can
 * detach. Nothing here is held across the re-render.
 */
async function cardState(page: Page) {
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="membership-card-face"]');
    el?.scrollIntoView({ block: "center" });
  });
  return page.evaluate(() => {
    const el = document.querySelector('[data-testid="membership-card-face"]');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      transform: getComputedStyle(el).transform.replace(/\s/g, ""),
      corner: { x: rect.x + rect.width * 0.85, y: rect.y + rect.height * 0.2 },
      away: { x: rect.x + rect.width / 2, y: Math.max(1, rect.y - 120) },
    };
  });
}

const transformOf = (page: Page) =>
  page.evaluate(() => {
    const el = document.querySelector('[data-testid="membership-card-face"]');
    return el ? getComputedStyle(el).transform.replace(/\s/g, "") : null;
  });

for (const pkg of packages) {
  test.describe(`/${pkg.slug}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${pkg.slug}`);
    });

    test("hero, heading and call to action are exactly the captured data", async ({ page }) => {
      await expect(page.locator("h1")).toHaveText(pkg.name);

      // PARITY: every package's heading reads "Silver Ownership" (audit §9.1).
      await expect(page.getByRole("heading", { level: 2, name: pkg.heading })).toBeVisible();
      await expect(page.getByText(pkg.discountText, { exact: true })).toBeVisible();

      // PARITY: the captured href is "#", and it is kept verbatim (rule 9b).
      const cta = page.getByRole("link", { name: pkg.cta.label });
      await expect(cta).toHaveAttribute("href", pkg.cta.href);
    });

    test("all nine benefits render, two columns from 768px up", async ({ page }) => {
      const items = page.getByRole("listitem").filter({ hasText: pkg.benefits[0]! });
      await expect(items.first()).toBeVisible();

      for (const benefit of pkg.benefits) {
        await expect(page.getByText(benefit, { exact: true })).toHaveCount(1);
      }

      const columnsAt = async (width: number) => {
        await page.setViewportSize({ width, height: 900 });
        return page.evaluate((text) => {
          const item = [...document.querySelectorAll("li")].find(
            (li) => li.textContent?.trim() === text,
          );
          const list = item?.closest("ul");
          if (!list) return 0;
          return getComputedStyle(list).gridTemplateColumns.split(" ").filter(Boolean).length;
        }, pkg.benefits[0]!);
      };

      expect(await columnsAt(390), "one column on a phone").toBe(1);
      expect(await columnsAt(768), "two columns from 768px").toBe(2);
      expect(await columnsAt(1440), "two columns on desktop").toBe(2);
    });

    test("the video is the captured id and loads nothing until clicked", async ({ page }) => {
      const id = capturedVideoId(pkg.slug);
      expect(pkg.youtubeId, `/${pkg.slug} youtubeId drifted from the capture`).toBe(id);

      const youtubeRequests: string[] = [];
      page.on("request", (req) => {
        if (/youtube(-nocookie)?\.com/.test(req.url())) youtubeRequests.push(req.url());
      });

      const play = page.getByRole("button", { name: /^Play video:/ });
      await play.scrollIntoViewIfNeeded();
      await expect(play).toBeVisible();
      await expect(page.locator("iframe")).toHaveCount(0);
      expect(youtubeRequests, "the facade must not touch youtube.com before a click").toEqual([]);

      await play.click();
      const frame = page.locator("iframe");
      await expect(frame).toHaveCount(1);
      await expect(frame).toHaveAttribute(
        "src",
        new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${id}\\b`),
      );
    });

    test("the plan grid keeps the captured order and marks this package", async ({ page }) => {
      const expected = pkg.plans.packages.map((p) => p.name);
      // Both layouts carry the same cards; whichever is visible must match.
      for (const testId of ["plan-grid", "plan-carousel"]) {
        const names = await page.getByTestId(testId).locator("h3").allTextContents();
        expect(
          names.map((n) => n.trim()),
          `${testId} order`,
        ).toEqual(expected);
      }

      const current = page.getByTestId("plan-grid").locator('[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toContainText(pkg.name);
      await expect(current).toHaveClass(/ring-brass/);
    });

    test("BreadcrumbList JSON-LD describes this page", async ({ page }) => {
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const crumbs = blocks
        .map((raw) => JSON.parse(raw) as { "@type"?: string })
        .find((data) => data["@type"] === "BreadcrumbList") as
        { itemListElement: { position: number; name: string; item: string }[] } | undefined;

      expect(crumbs, "no BreadcrumbList on the page").toBeTruthy();
      expect(crumbs!.itemListElement).toHaveLength(2);
      expect(crumbs!.itemListElement[1]!.name).toBe(pkg.hero.breadcrumb.current);
      expect(crumbs!.itemListElement[1]!.item).toMatch(new RegExp(`/${pkg.slug}$`));
    });
  });
}

test.describe("the missing hero image", () => {
  test("Silver falls back to the designed panel, and the pattern is painted", async ({ page }) => {
    await page.goto("/silver-ownership-5");
    const hero = page.getByTestId("page-hero");
    await expect(hero).toHaveAttribute("data-has-image", "false");
    // Nothing is requested for an image the snapshot could not mirror.
    await expect(hero.locator("img")).toHaveCount(0);

    // The pattern layer exists, carries the file, and the file really draws:
    // it used to be stroke="currentColor", which a CSS background cannot
    // inherit, so the panel rendered blank.
    const pattern = await page.evaluate(() => {
      const layer = [...document.querySelectorAll('[data-testid="page-hero"] div')].find((el) =>
        getComputedStyle(el).backgroundImage.includes("leaf-vein"),
      );
      if (!layer) return null;
      const style = getComputedStyle(layer);
      return { opacity: Number(style.opacity), box: layer.getBoundingClientRect().height };
    });
    expect(pattern, "no leaf-vein layer in the hero").toBeTruthy();
    expect(pattern!.opacity).toBeGreaterThan(0.05);
    expect(pattern!.box).toBeGreaterThan(300);

    const svg = await page.request.get("/patterns/leaf-vein.svg");
    expect(svg.status()).toBe(200);
    // Comments stripped: one of them explains this very rule.
    const markup = (await svg.text()).replace(/<!--[\s\S]*?-->/g, "");
    expect(markup, "a CSS background cannot inherit currentColor").not.toContain("currentColor");
    expect(markup).toMatch(/stroke="#[0-9A-Fa-f]{6}"/);
  });
});

test.describe("the membership card", () => {
  test("tilts under a fine pointer and rests when it leaves", async ({ page }) => {
    await page.goto("/gold-ownership-2");
    if (!(await fine(page))) test.skip();

    await expect(page.getByTestId("membership-card-face").first()).toBeVisible();
    const card = (await cardState(page))!;

    await page.mouse.move(card.corner.x, card.corner.y);
    await expect
      .poll(() => transformOf(page), { message: "the card should tilt toward a fine pointer" })
      .not.toBe(card.transform);

    await page.mouse.move(card.away.x, card.away.y);
    await expect
      .poll(() => transformOf(page), { message: "the card should settle back" })
      .toBe(card.transform);
  });

  test("a touch gets a sweep instead of a tilt", async ({ page }) => {
    await page.goto("/gold-ownership-2");
    await expect(page.getByTestId("membership-card-face").first()).toBeVisible();
    const before = await transformOf(page);

    await page.dispatchEvent('[data-testid="membership-card-face"]', "pointerdown", {
      pointerType: "touch",
      isPrimary: true,
    });
    // The sweep is a one-off animation, not a persistent transform.
    await expect(
      page
        .getByTestId("membership-card-face")
        .first()
        .locator("span.animate-\\[card-sweep_600ms_ease-out\\]"),
    ).toHaveCount(1);
    expect(await transformOf(page)).toBe(before);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the card is static and every section still renders", async ({ page }) => {
    await page.goto("/gold-ownership-2");
    await expect(page.locator("main > section")).toHaveCount(4);

    await expect(page.getByTestId("membership-card-face").first()).toBeVisible();
    const card = (await cardState(page))!;

    await page.mouse.move(card.corner.x, card.corner.y);
    await page.waitForTimeout(400);
    expect(await transformOf(page), "no tilt under prefers-reduced-motion").toBe(card.transform);
  });
});

test.describe("keyboard", () => {
  test("the card in the plan grid is one focusable link", async ({ page }) => {
    await page.goto("/gold-ownership-2");
    const link = page.getByRole("link", { name: "Platinum Ownership" }).last();
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveAttribute("href", "/platinum-ownership-3");
  });

  test("the whole page is reachable by keyboard", async ({ page }) => {
    if ((page.viewportSize()?.width ?? 1440) < 1024) test.skip();
    await page.goto("/gold-ownership-2");

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
