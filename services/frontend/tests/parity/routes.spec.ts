import { expect, test } from "@playwright/test";
import { OWNED_ROUTES } from "../helpers/routes";

/** Every route Next.js owns: renders, one non-empty <h1> (CLAUDE.md rule 9e), no console errors. */
for (const route of OWNED_ROUTES) {
  test(`${route} renders with exactly one non-empty h1 and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    page.on("pageerror", (err) => errors.push(err.message));

    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    expect((await h1s.first().innerText()).trim()).not.toBe("");

    expect(errors, `console errors on ${route}`).toEqual([]);
  });
}
