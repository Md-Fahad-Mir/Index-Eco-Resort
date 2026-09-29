/** Phase 0 backend probe — looks for existing JSON endpoints on the Laravel origin. */
import { writeFile } from "node:fs/promises";
const ORIGIN = "https://indexecoresort.com";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36";

const PATHS = [
  "/api", "/api/v1", "/api/settings", "/api/events", "/api/posts", "/api/packages", "/api/gallery",
  "/events/filter", "/events/filter?category_id=1",
  "/event-details/2", "/blog-details/2",
  "/contact-form/submit",
  "/people-leading", "/who-we-are", "/who_we_are",
  "/blogs?page=2", "/event?page=2",
  "/sitemap.xml", "/robots.txt", "/storage/images", "/public/storage",
  "/admin", "/login",
  "/this-path-should-not-exist-404check",
];

const results = [];
for (const p of PATHS) {
  try {
    const res = await fetch(ORIGIN + p, { headers: { "User-Agent": UA, Accept: "application/json, text/html" }, redirect: "manual" });
    const ct = res.headers.get("content-type") || "";
    const body = await res.text();
    let note = "";
    if (ct.includes("json")) { try { const j = JSON.parse(body); note = "json keys: " + Object.keys(j).join(","); } catch { note = "json parse failed"; } }
    else { const t = body.match(/<title>([^<]*)<\/title>/i); note = t ? "title: " + t[1].slice(0, 80) : ""; }
    results.push({ path: p, status: res.status, location: res.headers.get("location"), contentType: ct.split(";")[0], bytes: body.length, note });
    console.log(`${String(res.status).padEnd(4)} ${p.padEnd(42)} ${ct.split(";")[0].padEnd(26)} ${note.slice(0,70)}`);
  } catch (err) {
    results.push({ path: p, error: String(err) });
    console.log(`ERR  ${p}: ${err}`);
  }
}
await writeFile(new URL("../api-probe.json", import.meta.url), JSON.stringify(results, null, 2));
