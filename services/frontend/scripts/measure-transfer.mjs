/**
 * Measures what a route actually transfers: JS and font bytes as sent over the
 * wire (compressed), after a full scroll so lazy chunks and fonts are counted.
 * Used for the Phase 5b JS / font deltas.
 *
 *   node scripts/measure-transfer.mjs http://localhost:3200/ [width]
 */
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:3000/";
const width = Number(process.argv[3] ?? 1440);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 } });
const entries = [];
page.on("requestfinished", async (request) => {
  const type = request.resourceType();
  if (type !== "script" && type !== "font" && type !== "stylesheet") return;
  const sizes = await request.sizes().catch(() => null);
  entries.push({ type, url: request.url(), bytes: sizes?.responseBodySize ?? 0 });
});

await page.goto(url, { waitUntil: "load" });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 60));
  }
});
await page.waitForTimeout(1500);
await browser.close();

const sum = (type) => entries.filter((e) => e.type === type).reduce((n, e) => n + e.bytes, 0);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(JSON.stringify({ url, width, js: kb(sum("script")), css: kb(sum("stylesheet")), fonts: kb(sum("font")) }));
for (const e of entries.filter((e) => e.type === "font"))
  console.log("  font", kb(e.bytes), e.url.split("/").pop());
