import { expect, test } from "@playwright/test";

/**
 * A preview deployment serves the Phase 0 snapshot. It must not be indexable:
 * a crawled copy of stale content would compete with the real site, and its
 * forms accept input without sending it anywhere.
 *
 * The mode is read from the running server rather than from the test runner's
 * environment — the two are configured separately, and what matters is what the
 * server actually sends.
 */
async function isPreview(request: import("@playwright/test").APIRequestContext) {
  const response = await request.get("/");
  return response.headers()["x-robots-tag"] === "noindex, nofollow";
}

test.describe("indexability follows the data source", () => {
  test("a preview is closed to crawlers; a production build is open", async ({ request }) => {
    const preview = await isPreview(request);

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const body = await robots.text();

    if (preview) {
      expect(body, "preview robots.txt must disallow everything").toContain("Disallow: /");
      expect(body).not.toContain("Allow: /");
    } else {
      expect(body, "production robots.txt should allow crawling").toContain("Allow: /");
    }
  });

  test("every response carries the noindex header in preview", async ({ request }) => {
    test.skip(!(await isPreview(request)), "This server is not in preview mode.");
    for (const path of ["/", "/about-us", "/api/events/filter"]) {
      const response = await request.get(path);
      expect(response.headers()["x-robots-tag"], `X-Robots-Tag on ${path}`).toBe(
        "noindex, nofollow",
      );
    }
  });
});
