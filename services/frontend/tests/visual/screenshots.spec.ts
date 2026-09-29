import { mkdirSync } from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import { AFTER_SCREENSHOTS_DIR, routeSlug } from "../helpers/audit";
import { FROZEN_ROUTES, SCREENSHOT_WIDTHS } from "../helpers/routes";

/**
 * Full-page "after" screenshots at 390/768/1440, named exactly like the Phase 0
 * "before" set so the two folders can be compared side by side.
 */
mkdirSync(AFTER_SCREENSHOTS_DIR, { recursive: true });

for (const route of FROZEN_ROUTES) {
  for (const width of SCREENSHOT_WIDTHS) {
    test(`${route} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route, { waitUntil: "load" });
      await page.addStyleTag({
        content:
          "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}",
      });
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 300));
      });
      // Scrolling only starts the lazy images. Without waiting for them the
      // large CMS photographs are captured as empty placeholder boxes.
      // `naturalWidth`, not `complete`: the membership cards keep a request in
      // flight for a larger srcset candidate long after they have something to
      // draw, and waiting on `complete` would only ever time out.
      await page
        .waitForFunction(
          () => [...document.images].every((img) => img.naturalWidth > 0),
          undefined,
          {
            timeout: 15_000,
          },
        )
        .catch(() => {});
      await page.screenshot({
        path: path.join(AFTER_SCREENSHOTS_DIR, `${routeSlug(route)}@${width}.png`),
        fullPage: true,
      });
    });
  }
}
