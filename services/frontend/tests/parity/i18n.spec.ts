import { expect, test } from "@playwright/test";

/**
 * Bangla and English. Bangla is the default and has the bare paths; English is
 * under /en (src/proxy.ts). The switch beside Book Now moves between the two
 * copies of the same page. Runs in every parity project, so the switch is
 * exercised at 390px on WebKit as well.
 */

test.describe("languages", () => {
  test("Bangla is the default, at the bare paths", async ({ page }) => {
    await page.goto("/about-us");
    await expect(page).toHaveURL(/\/about-us$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.locator("h1")).toHaveText("আমাদের সম্পর্কে");
  });

  test("English is the same page under /en", async ({ page }) => {
    await page.goto("/en/about-us");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText("About Us");
  });

  test("the switch changes the language in place, both ways", async ({ page, context }) => {
    await page.goto("/gold-ownership-2");
    await expect(page.locator("h1")).toHaveText("গোল্ড মালিকানা");

    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/gold-ownership-2$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText("Gold Ownership");
    expect((await context.cookies()).find((c) => c.name === "locale")?.value).toBe("en");

    await page.getByRole("link", { name: "বাংলা" }).click();
    await expect(page).toHaveURL(/\/gold-ownership-2$/);
    await expect(page).not.toHaveURL(/\/en\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    expect((await context.cookies()).find((c) => c.name === "locale")?.value).toBe("bn");
  });

  test("the current language is marked, not linked", async ({ page }) => {
    await page.goto("/");
    const group = page.getByRole("group", { name: "ভাষা" });
    await expect(group.locator('[aria-current="true"]')).toHaveAttribute("lang", "bn");
    await expect(group.getByRole("link")).toHaveCount(1);
    await expect(group.getByRole("link")).toHaveAttribute("href", "/en");
  });

  test("a chosen language is remembered for bare URLs", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "locale", value: "en", url: baseURL! }]);
    await page.goto("/offer");
    await expect(page).toHaveURL(/\/en\/offer$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("links on the English site stay English", async ({ page }) => {
    await page.goto("/en");
    const internal = await page
      .locator("header a[href^='/'], footer a[href^='/']")
      .evaluateAll((links) =>
        links.filter((a) => !a.hasAttribute("hreflang")).map((a) => a.getAttribute("href") ?? ""),
      );
    expect(internal.length).toBeGreaterThan(0);
    expect(internal.filter((href) => href !== "/en" && !href.startsWith("/en/"))).toEqual([]);
  });

  test("each page names its other-language twin", async ({ page }) => {
    await page.goto("/about-us");
    const alternates = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) =>
        Object.fromEntries(
          links.map((l) => [l.getAttribute("hreflang"), new URL(l.getAttribute("href")!).pathname]),
        ),
      );
    expect(alternates).toEqual({ bn: "/about-us", en: "/en/about-us", "x-default": "/about-us" });
  });
});

test.describe("language redirects", () => {
  test("/bn/… is not a second URL for a Bangla page", async ({ request }) => {
    const res = await request.get("/bn/about-us", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(new URL(res.headers()["location"]!, "http://x").pathname).toBe("/about-us");
  });

  test("the rule 9c redirect works in English too", async ({ request }) => {
    const res = await request.get("/en/about_us", { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toBe("/en/about-us");
  });

  test("an unknown English path is a 404", async ({ request }) => {
    const res = await request.get("/en/this-path-does-not-exist-anywhere");
    expect(res.status()).toBe(404);
  });
});
