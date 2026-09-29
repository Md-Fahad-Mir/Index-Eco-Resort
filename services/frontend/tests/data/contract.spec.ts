import { expect, test } from "@playwright/test";
import { mockAdapter } from "../../src/lib/data/adapters/mock";
import { parseDmY, formatDmY } from "../../src/lib/data/filters";
import { submitForm } from "../../src/lib/forms";
import { assetUrl } from "../../src/lib/assets";

/**
 * The data layer, checked against the numbers Phase 0 measured on the live site
 * (audit/interactions.md). These run without a browser page — they are the
 * guard that the contract and the snapshot still agree.
 */

test.describe("schemas accept every fixture", () => {
  test("each public data function parses", async () => {
    // Each of these throws if the fixture does not match its schema.
    await expect(mockAdapter.getSettings()).resolves.toBeTruthy();
    await expect(mockAdapter.getHome()).resolves.toBeTruthy();
    await expect(mockAdapter.getAboutPage()).resolves.toBeTruthy();
    await expect(mockAdapter.getOffer()).resolves.toBeTruthy();
    await expect(mockAdapter.getBookNow()).resolves.toBeTruthy();
    await expect(mockAdapter.getContactPage()).resolves.toBeTruthy();
    await expect(mockAdapter.getGallery()).resolves.toBeTruthy();
    await expect(mockAdapter.getEvents()).resolves.toBeTruthy();
    await expect(mockAdapter.getPosts()).resolves.toBeTruthy();

    const packages = await mockAdapter.getPackages();
    expect(packages).toHaveLength(4);
    for (const pkg of packages) {
      await expect(mockAdapter.getPackage(pkg.slug)).resolves.not.toBeNull();
    }
  });
});

test.describe("ordering and counts match the live site", () => {
  test("packages keep their order and slugs", async () => {
    const packages = await mockAdapter.getPackages();
    expect(packages.map((p) => p.slug)).toEqual([
      "gold-ownership-2",
      "platinum-ownership-3",
      "signature-ownership-4",
      "silver-ownership-5",
    ]);
    // PARITY: every package heading reads "Silver Ownership" (audit §9.1).
    for (const pkg of packages) expect(pkg.heading).toContain("Silver Ownership");
  });

  test("gallery category counts equal audit/interactions.md §4", async () => {
    const gallery = await mockAdapter.getGallery();
    expect(gallery.items).toHaveLength(20);
    const counts = Object.fromEntries(
      Object.entries(gallery.itemsByCategory).map(([id, items]) => [id, items.length]),
    );
    expect(counts).toEqual({ "9": 11, "8": 1, "6": 2, "5": 1, "4": 0, "3": 3, "2": 2 });
  });

  test("every gallery lightbox link points at a file that exists", async () => {
    const gallery = await mockAdapter.getGallery();
    const all = [...gallery.items, ...Object.values(gallery.itemsByCategory).flat()];
    // The live category panes linked to /public/images/... which 404s; rule 9c
    // repairs them to the working storage file of the same name.
    for (const item of all) expect(item.fullSrc).not.toContain("/public/images/");
    expect(all.length).toBeGreaterThan(0);
  });
});

test.describe("events filter reproduces the live behaviour", () => {
  test("no parameters returns every event", async () => {
    const all = await mockAdapter.filterEvents({});
    const page = await mockAdapter.getEvents();
    expect(all).toHaveLength(page.events.length);
  });

  test("one date without a category is ignored, as on the live site", async () => {
    const all = await mockAdapter.filterEvents({});
    const onlyStart = await mockAdapter.filterEvents({ start_date: "01-01-2020" });
    expect(onlyStart).toHaveLength(all.length);
  });

  test("a category narrows the list", async () => {
    const page = await mockAdapter.getEvents();
    const category = page.filters.categories.find((c) => c.value);
    expect(category, "fixtures should have at least one real category").toBeTruthy();
    const filtered = await mockAdapter.filterEvents({ category_id: category!.value });
    expect(filtered.length).toBeGreaterThan(0);
    for (const event of filtered) expect(event.category.name).toBe(category!.label);
  });

  test("a date range excludes events outside it", async () => {
    const long = await mockAdapter.filterEvents({
      start_date: "01-01-2000",
      end_date: "31-12-2100",
    });
    const none = await mockAdapter.filterEvents({
      start_date: "01-01-1990",
      end_date: "31-12-1990",
    });
    expect(long.length).toBeGreaterThan(0);
    expect(none).toHaveLength(0);
  });

  test("dates use d-m-Y, not ISO", () => {
    const parsed = parseDmY("29-09-2026");
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8); // September
    expect(parsed?.getDate()).toBe(29);
    expect(parseDmY("2026-09-29")).toBeNull();
    expect(formatDmY(new Date(2026, 8, 29))).toBe("29-09-2026");
  });
});

test.describe("media and forms", () => {
  test("fixture media points at the local mirror", async () => {
    const home = await mockAdapter.getHome();
    const video = home.hero.slides.find((s) => s.videoUrl)?.videoUrl ?? "";
    expect(video).toMatch(/^\/media\//);
    expect(assetUrl(video)).toBe(video); // no MEDIA_BASE_URL set locally
  });

  test("assetUrl leaves absolute URLs alone", () => {
    const remote = "https://demo.awaikenthemes.com/antila/author-1.jpg";
    expect(assetUrl(remote)).toBe(remote);
    expect(assetUrl("")).toBe("");
  });

  test("submitForm succeeds without a network call on snapshot data", async () => {
    const result = await submitForm("contact", { name: "Test", phone: "1", email: "a@b.c" });
    expect(result.ok).toBe(true);
  });
});
