import { expect, test } from "@playwright/test";

/**
 * Architecture §7: any path Next.js does not own must reach the Laravel origin
 * unchanged. These requests go through the running Next server to the live site.
 */
/**
 * The legacy proxy is opt-in (architecture §7). With LEGACY_ORIGIN unset the
 * frontend is self-contained and there is nothing to test, so these skip.
 */
const LEGACY_ORIGIN = process.env.LEGACY_ORIGIN ?? "";

test.describe("legacy fallback (opt-in)", () => {
  test.skip(!LEGACY_ORIGIN, "LEGACY_ORIGIN is unset — the frontend serves everything itself.");

  test("an unowned path is proxied to the legacy origin", async ({ request }) => {
    const response = await request.get("/events/filter", {
      headers: { accept: "application/json" },
    });
    expect(response.status()).toBe(200);
  });

  test("legacy media still resolves", async ({ request }) => {
    const response = await request.get(
      "/public/storage/images/general-settings/fav_icon/HSBQrgk1PzynpNN2f8h8WNQnq9WGNskR1XqTP459.png",
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/");
  });
});

test.describe("self-contained by default", () => {
  test.skip(Boolean(LEGACY_ORIGIN), "LEGACY_ORIGIN is set, so unknown paths are proxied.");

  test("an unknown path is this app's own 404, not a proxy", async ({ request }) => {
    const response = await request.get("/this-path-does-not-exist-anywhere");
    expect(response.status()).toBe(404);
    expect(response.headers()["content-type"]).toContain("text/html");
  });

  test("mirrored media is served from public/media", async ({ request }) => {
    const response = await request.get(
      "/media/public/storage/images/general-settings/logo/zr9Bx3ILzkGWw1KDwhlCkUNz3sk3GfxQozHRYjqJ.png",
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/");
  });
});

/**
 * Rule 9c redirects. `/about_us` is the mobile menu's About target and returns
 * 500 on the live site, so it points at the working page instead
 * (tests/parity/allowed-diffs.ts).
 */
test.describe("rule 9c redirects", () => {
  test("/about_us permanently redirects to /about-us", async ({ request }) => {
    const res = await request.get("/about_us", { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toBe("/about-us");
  });
});
