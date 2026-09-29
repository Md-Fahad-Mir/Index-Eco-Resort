import { expect, test } from "@playwright/test";

/**
 * Architecture §7: any path Next.js does not own must reach the Laravel origin
 * unchanged. These requests go through the running Next server to the live site.
 */
test.describe("Laravel fallback", () => {
  test("an unowned JSON endpoint is proxied verbatim", async ({ request }) => {
    const res = await request.get("/events/filter", { headers: { accept: "application/json" } });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { status: boolean; data: unknown[] };
    expect(body.status).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("CMS media under /public/storage still resolves", async ({ request }) => {
    const res = await request.get(
      "/public/storage/images/general-settings/fav_icon/HSBQrgk1PzynpNN2f8h8WNQnq9WGNskR1XqTP459.png",
    );
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/");
  });

  test("an unknown single-segment path is proxied, not 404'd by Next", async ({ request }) => {
    const res = await request.get("/this-path-does-not-exist-anywhere", {
      headers: { accept: "application/json" },
    });
    // Laravel answers this with its own 404 (JSON when asked for JSON); Next's 404 would be HTML.
    expect(res.status()).toBe(404);
    expect(res.headers()["content-type"]).toContain("application/json");
  });
});
