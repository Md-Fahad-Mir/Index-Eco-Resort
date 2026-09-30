import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { en } from "../helpers/routes";

/**
 * About page behaviour (Phase 6).
 *
 * The fixture is read here rather than hard-coding strings, so a CMS change
 * moves these assertions with the content instead of breaking them.
 */
const about = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../src/fixtures/about.json"), "utf8"),
) as {
  hero: { title: string };
  visionMission: { tabs: { label: string; kicker: string; title: string; text: string }[] };
  coreValues: { items: { tone: string; title: string }[] };
};

const tabs = about.visionMission.tabs;

test.beforeEach(async ({ page }) => {
  await page.goto(en("/about-us"));
});

test("the hero renders one non-empty h1 at the h1 scale", async ({ page }) => {
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText(about.hero.title);

  // Regression guard for the Phase 4 tailwind-merge fault: `cn("text-h1",
  // "text-mist")` kept only the colour and the title rendered at 17px. Rather
  // than hard-coding a pixel size across three viewports, a probe element is
  // given the theme's own `--text-h1` and the two are compared.
  const sizes = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.fontSize = "var(--text-h1)";
    document.body.append(probe);
    const expected = getComputedStyle(probe).fontSize;
    probe.remove();
    const heading = document.querySelector("h1");
    return { expected, actual: heading ? getComputedStyle(heading).fontSize : null };
  });
  expect(sizes.actual, "the h1 does not render at the h1 scale").toBe(sizes.expected);
  expect(Number.parseFloat(sizes.expected)).toBeGreaterThan(38);
});

test("the about block and the plans stage are the ones Home uses", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Watch video" })).toBeVisible();
  // The four membership cards, in the data's order.
  for (const name of [
    "Gold Ownership",
    "Platinum Ownership",
    "Signature Ownership",
    "Silver Ownership",
  ]) {
    await expect(page.locator("main").getByRole("link", { name })).toBeVisible();
  }
});

test("every vision/mission tab has a valid aria-controls target", async ({ page }) => {
  const triggers = page.getByRole("tab");
  await expect(triggers).toHaveCount(tabs.length);

  for (const [index, tab] of tabs.entries()) {
    const trigger = triggers.nth(index);
    await expect(trigger).toHaveText(tab.label);
    const controls = await trigger.getAttribute("aria-controls");
    expect(controls, `tab "${tab.label}" has no aria-controls`).toBeTruthy();
    // An IDREF may not contain whitespace; the CMS labels do.
    expect(controls).not.toMatch(/\s/);
    expect(
      await page.locator(`[id="${controls}"]`).count(),
      `aria-controls="${controls}" points at nothing`,
    ).toBe(1);
  }
});

test("a panel is active on load and the tabs switch with arrow keys", async ({ page }) => {
  const firstTab = tabs[0]!;
  const secondTab = tabs[1]!;

  await expect(page.getByRole("tab", { name: firstTab.label })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tabpanel")).toContainText(firstTab.title);

  await page.getByRole("tab", { name: firstTab.label }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: secondTab.label })).toBeFocused();
  await expect(page.getByRole("tab", { name: secondTab.label })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tabpanel")).toContainText(secondTab.title);
});

test("the kicker is rendered as stored, not rewritten", async ({ page }) => {
  const firstTab = tabs[0]!;
  const panel = page.getByRole("tabpanel");
  // Exact text: no uppercasing, no invented prefix.
  await expect(panel.getByText(firstTab.kicker, { exact: true })).toBeVisible();
});

test("the panel body is split only where the stored text has breaks", async ({ page }) => {
  // Guards the fixture as much as the page: if the snapshot ever flattened
  // these fields again, the per-tab assertions below would pass on 1 === 1.
  expect(
    Math.max(...tabs.map((tab) => splitOnBlankLines(tab.text).length)),
    "the Approach tab should still hold the author's six paragraphs",
  ).toBe(6);

  for (const [index, tab] of tabs.entries()) {
    if (index > 0) await page.getByRole("tab", { name: tab.label }).click();
    const expected = splitOnBlankLines(tab.text).length;
    const panel = page.getByRole("tabpanel");
    await expect(panel).toContainText(tab.title);
    const count = await panel.getByTestId("vm-body").locator("p").count();
    expect(count, `"${tab.label}" should render ${expected} paragraph(s)`).toBe(expected);
  }
});

test("core values keep the stored order and alternate at every width", async ({ page }) => {
  const tiles = page.getByTestId("core-values").locator("li");
  await expect(tiles).toHaveCount(about.coreValues.items.length);

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const rendered = await tilesAt(page);
    expect(
      rendered.map((tile) => tile.title),
      `core value order changed at ${width}px`,
    ).toEqual(about.coreValues.items.map((item) => item.title));

    // Alternation is what makes the block read as a checkerboard: no two
    // neighbours in the flow may share a background.
    const backgrounds = rendered.map((tile) => tile.background);
    for (let i = 1; i < backgrounds.length; i += 1) {
      expect(backgrounds[i], `tiles ${i - 1} and ${i} share a background at ${width}px`).not.toBe(
        backgrounds[i - 1],
      );
    }

    // …and the grid is never two columns, which would stack one tone per column.
    const columns = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="core-values"]');
      if (!grid) return 0;
      return getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
    });
    expect(
      columns,
      `${columns} columns at ${width}px turns the checkerboard into stripes`,
    ).not.toBe(2);
  }
});

/**
 * The only split the frontend is allowed to make. A single newline inside a
 * sentence, or a sentence boundary, must never start a new paragraph.
 */
function splitOnBlankLines(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

async function tilesAt(page: Page): Promise<{ title: string; background: string }[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="core-values"] li')].map((li) => ({
      title: li.querySelector("h3")?.textContent?.trim() ?? "",
      background: getComputedStyle(li).backgroundColor,
    })),
  );
}

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("every section is present and the tabs still work", async ({ page }) => {
    await page.goto(en("/about-us"));
    await expect(page.locator("main > *")).toHaveCount(5);

    // The unveil is the only entrance on this page; under reduce it must not
    // leave the image invisible.
    const image = page.getByRole("tabpanel").locator("img").first();
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect(image).toHaveCSS("opacity", "1");

    const second = tabs[1]!;
    await page.getByRole("tab", { name: second.label }).click();
    await expect(page.getByRole("tabpanel")).toContainText(second.title);
  });
});

test.describe("keyboard", () => {
  test("the whole page is reachable, and tabbing leaves the tab strip", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1440;
    if (width < 1024) test.skip();
    await page.goto(en("/about-us"));

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

    // Radix gives the tab strip a single stop: Tab moves into the panel, not
    // across the other two tabs.
    await page.getByRole("tab", { name: tabs[0]!.label }).focus();
    await page.keyboard.press("Tab");
    const stillATab = await page.evaluate(
      () => document.activeElement?.getAttribute("role") === "tab",
    );
    expect(stillATab, "the tab strip should be one stop, not three").toBe(false);
  });
});
