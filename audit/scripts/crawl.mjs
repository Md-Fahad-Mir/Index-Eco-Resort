/**
 * Phase 0 crawler — fetches every public route of the live Laravel site and
 * stores raw HTML (desktop + mobile UA) plus the site's own JS/CSS assets.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { load } from "cheerio";

const ORIGIN = "https://indexecoresort.com";
const OUT = new URL("../html/", import.meta.url);
const ASSETS = new URL("../assets/", import.meta.url);

const UA_DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

/** Routes from docs/01-SITE-AUDIT.md §3 — the frozen public route map. */
const SEEDS = [
  "/",
  "/about-us",
  "/about_us",
  "/gold-ownership-2",
  "/platinum-ownership-3",
  "/signature-ownership-4",
  "/silver-ownership-5",
  "/offer",
  "/book-now",
  "/event",
  "/blogs",
  "/gallery",
  "/contact",
];

/** Turns a path into a flat filename: "/" -> "home", "/events/x" -> "events__x". */
export const slugOf = (path) =>
  path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "__");

async function fetchText(url, ua) {
  const res = await fetch(url, { headers: { "User-Agent": ua, Accept: "*/*" }, redirect: "follow" });
  const body = await res.text();
  return { status: res.status, finalUrl: res.url, body, headers: Object.fromEntries(res.headers) };
}

const seen = new Set();
const queue = [...SEEDS];
const report = [];
const assetUrls = new Set();

await mkdir(OUT, { recursive: true });
await mkdir(ASSETS, { recursive: true });

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);

  const url = ORIGIN + path;
  let r;
  try {
    r = await fetchText(url, UA_DESKTOP);
  } catch (err) {
    report.push({ path, error: String(err) });
    console.log(`ERR  ${path}: ${err}`);
    continue;
  }
  const name = slugOf(path);
  await writeFile(new URL(`${name}.html`, OUT), r.body);
  report.push({ path, status: r.status, finalUrl: r.finalUrl, bytes: r.body.length, file: `${name}.html` });
  console.log(`${r.status}  ${path}  ${r.body.length}B`);

  const $ = load(r.body);

  // Discover detail pages (events + blog posts) and any missed internal route.
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    let p = null;
    if (href.startsWith(ORIGIN)) p = href.slice(ORIGIN.length) || "/";
    else if (href.startsWith("/")) p = href;
    if (!p) return;
    p = p.split("#")[0].split("?")[0];
    if (!p.startsWith("/")) return;
    if (/^\/(events|blog-details)\//.test(p) && !seen.has(p)) queue.push(p);
  });

  // Collect the site's own scripts/styles for interaction analysis.
  $("script[src], link[rel=stylesheet][href]").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("href") || "";
    const abs = src.startsWith("http") ? src : src.startsWith("/") ? ORIGIN + src : null;
    if (abs && abs.startsWith(ORIGIN)) assetUrls.add(abs);
  });
}

// Mobile-UA pass over the seeds (mobile menu markup can differ).
await mkdir(new URL("mobile/", OUT), { recursive: true });
for (const path of SEEDS) {
  try {
    const r = await fetchText(ORIGIN + path, UA_MOBILE);
    await writeFile(new URL(`mobile/${slugOf(path)}.html`, OUT), r.body);
    console.log(`MOB ${r.status}  ${path}  ${r.body.length}B`);
  } catch (err) {
    console.log(`MOB ERR ${path}: ${err}`);
  }
}

// Site assets (JS/CSS) so we can read the real interaction config.
for (const url of assetUrls) {
  try {
    const r = await fetchText(url, UA_DESKTOP);
    const name = url.slice(ORIGIN.length).replace(/^\//, "").replace(/\//g, "__");
    await writeFile(new URL(name, ASSETS), r.body);
    console.log(`AST ${r.status}  ${name}  ${r.body.length}B`);
  } catch (err) {
    console.log(`AST ERR ${url}: ${err}`);
  }
}

await writeFile(new URL("../crawl-report.json", import.meta.url), JSON.stringify({ crawledAt: new Date().toISOString(), origin: ORIGIN, pages: report, assets: [...assetUrls] }, null, 2));
console.log(`\nDone. ${report.length} pages, ${assetUrls.size} assets.`);
