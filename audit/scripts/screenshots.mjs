/**
 * Phase 0 "before" screenshots — full-page captures of every public route at
 * 390 / 768 / 1440 px, the visual baseline later phases are compared against.
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";

const ORIGIN = "https://indexecoresort.com";
const OUT = fileURLToPath(new URL("../screenshots/before/", import.meta.url));
const WIDTHS = [390, 768, 1440];

const ROUTES = [
  "/", "/about-us", "/about_us",
  "/gold-ownership-2", "/platinum-ownership-3", "/signature-ownership-4", "/silver-ownership-5",
  "/offer", "/book-now", "/event", "/blogs", "/gallery", "/contact",
  "/blog-details/sustainable-living-eco-friendly-home-features-1",
  "/blog-details/kuzakataz-adhunik-risort-binizoger-ntun-smvabna-2",
  "/events/royal-wedding-celebration-2026-1",
  "/events/annual-corporate-summit-2026-2",
  "/events/joyful-birthday-family-gathering-celebration-3",
  "/events/index-eco-resort-coxs-bazar-2026-business-conference-4",
];

const slug = (p) => (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "__"));

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    userAgent: width === 390 ? devices["iPhone 13"].userAgent : undefined,
    isMobile: width === 390,
    hasTouch: width === 390,
  });
  const page = await ctx.newPage();
  page.on("console", () => {});
  for (const route of ROUTES) {
    const file = `${OUT}${slug(route)}@${width}.png`;
    try {
      await page.goto(ORIGIN + route, { waitUntil: "domcontentloaded", timeout: 60000 });
      // Let lazy images and carousels settle, then freeze animations for a stable shot.
      await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important}` });
      await page.waitForLoadState("load", { timeout: 45000 }).catch(() => {});
      // Scroll through the page so lazy images decode, then return to the top.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 600));
      });
      await page.screenshot({ path: file, fullPage: true });
      console.log(`OK   ${width}px ${route}`);
    } catch (err) {
      console.log(`FAIL ${width}px ${route}: ${String(err).split("\n")[0]}`);
      try { await page.screenshot({ path: file, fullPage: false }); } catch {}
    }
  }
  await ctx.close();
}
await browser.close();
console.log("screenshots done");
