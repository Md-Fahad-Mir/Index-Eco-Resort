import { chromium, webkit } from "@playwright/test";
const BASE = process.env.BASE ?? "http://localhost:3123";
const PATHS = ["/", "/about-us", "/gallery", "/blogs", "/event", "/offer", "/contact", "/book-now"];
for (const [name, type] of [["chromium", chromium], ["webkit", webkit]]) {
  let browser;
  try { browser = await type.launch(); } catch (e) { console.log(name, "unavailable"); continue; }
  for (const path of PATHS) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 300)); });
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 300)));
    const snap = () => page.evaluate(() => ({
      motion: document.documentElement.getAttribute("data-motion"),
      ready: window.__meMotionReady ?? null,
      hidden: [...document.querySelectorAll("[data-me-reveal]")].filter((e) => getComputedStyle(e).opacity !== "1").length,
    }));
    try {
      await page.goto(BASE + (path === "/" ? "/en" : "/en" + path), { waitUntil: "networkidle", timeout: 90000 });
      await page.waitForTimeout(1500);
      const en = await snap();
      await page.click('a[hreflang="bn"] >> visible=true');
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const bn = await snap();
      const url = new URL(page.url()).pathname;
      console.log(`${name.padEnd(8)} ${path.padEnd(10)} EN ${JSON.stringify(en)}  →  BN ${url} ${JSON.stringify(bn)}${errs.length ? "\n   errors: " + errs.join("\n   ") : ""}`);
    } catch (e) {
      console.log(`${name} ${path} FAILED: ${e.message.split("\n")[0]}`);
    }
    await ctx.close();
  }
  await browser.close();
}
