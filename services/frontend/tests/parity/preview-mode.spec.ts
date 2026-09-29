import { expect, test } from "@playwright/test";

/**
 * A preview deployment serves the Phase 0 snapshot. It must not be indexable:
 * a crawled copy of stale content would compete with the real site, and its
 * forms accept input without sending it anywhere.
 */
const PREVIEW = process.env.PREVIEW_MODE === "true";

test.describe("preview mode", () => {
  test.skip(!PREVIEW, "PREVIEW_MODE is not enabled for this run.");

  test("every response carries X-Robots-Tag: noindex, nofollow", async ({ request }) => {
    for (const path of ["/", "/styleguide", "/api/events/filter"]) {
      const response = await request.get(path);
      expect(response.headers()["x-robots-tag"], `X-Robots-Tag on ${path}`).toBe(
        "noindex, nofollow",
      );
    }
  });

  test("robots.txt disallows everything", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Disallow: /");
    expect(body).not.toContain("Allow: /");
  });

  test("the preview banner is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Preview — forms are not sent")).toBeVisible();
  });
});

test.describe("production mode", () => {
  test.skip(PREVIEW, "This run is a preview.");

  test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Allow: /");
  });
});
