/**
 * Checks a deployed preview URL for the things that must be true of it.
 *
 *   pnpm verify:preview https://index-eco-resort.vercel.app
 *
 * The point is to catch the failures that only happen once deployed:
 *  - a preview that is indexable, so a stale copy competes with the real site
 *  - a legacy proxy left switched on, mirroring the client's live site
 *  - Git LFS not resolved by the build, so every image is a text pointer
 */
import { readFile } from "node:fs/promises";

const base = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!base) {
  console.error("Usage: pnpm verify:preview <url>");
  process.exit(2);
}

const UA = "verify-preview (+https://indexecoresort.com)";
const results = [];
const record = (group, check, ok, detail = "") => results.push({ group, check, ok, detail });

/** Enough entity decoding to print a heading back readably. */
const decodeEntities = (text) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

const get = (path, init = {}) =>
  fetch(`${base}${path}`, { headers: { "User-Agent": UA }, redirect: "manual", ...init });

/** Routes the app owns. Kept in step with docs/03-ARCHITECTURE.md §3. */
const ROUTES = [
  "/",
  "/about-us",
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
  "/events/royal-wedding-celebration-2026-1",
  "/events/annual-corporate-summit-2026-2",
  "/events/joyful-birthday-family-gathering-celebration-3",
  "/events/index-eco-resort-coxs-bazar-2026-business-conference-4",
  "/blog-details/sustainable-living-eco-friendly-home-features-1",
  "/blog-details/kuzakataz-adhunik-risort-binizoger-ntun-smvabna-2",
];

/* ── 1. Not indexable ───────────────────────────────────────────────────── */
{
  const home = await get("/");
  const tag = home.headers.get("x-robots-tag") ?? "";
  record(
    "Indexability",
    "X-Robots-Tag on HTML",
    /noindex/.test(tag) && /nofollow/.test(tag),
    tag || "(absent)",
  );

  const api = await get("/api/events/filter");
  const apiTag = api.headers.get("x-robots-tag") ?? "";
  record(
    "Indexability",
    "X-Robots-Tag on API routes",
    /noindex/.test(apiTag),
    apiTag || "(absent)",
  );

  const robots = await get("/robots.txt");
  const body = robots.ok ? await robots.text() : "";
  const disallowsAll = /Disallow:\s*\/\s*$/m.test(body) && !/^\s*Allow:/m.test(body);
  record(
    "Indexability",
    "robots.txt disallows everything",
    robots.status === 200 && disallowsAll,
    robots.status === 200 ? body.replace(/\s+/g, " ").trim().slice(0, 60) : `HTTP ${robots.status}`,
  );
}

/* ── 2. Nothing is proxied to the old site ─────────────────────────────── */
{
  // The legacy CMS media path must NOT resolve — if it does, LEGACY_ORIGIN is
  // set and this deployment is mirroring the client's live site.
  const legacyMedia = await get(
    "/public/storage/images/general-settings/logo/zr9Bx3ILzkGWw1KDwhlCkUNz3sk3GfxQozHRYjqJ.png",
  );
  record(
    "Isolation",
    "legacy /public/storage/* not served",
    legacyMedia.status === 404,
    `HTTP ${legacyMedia.status}`,
  );

  const unknown = await get("/definitely-not-a-page-9182");
  const unknownBody = unknown.ok ? "" : await unknown.text().catch(() => "");
  const looksLegacy = /header_area|mysticky|owl-carousel/.test(unknownBody);
  record(
    "Isolation",
    "unknown path is this app's 404",
    unknown.status === 404 && !looksLegacy,
    looksLegacy ? "served the OLD site" : `HTTP ${unknown.status}`,
  );

  // The decisive one: an owned route must be rendered by this app. A legacy
  // proxy answers 404 for unknown paths too, so only this notices a mirror.
  const owned = await get("/about-us");
  const ownedHtml = owned.status === 200 ? await owned.text() : "";
  const legacyMarkup = /header_area|mysticky|owl-carousel|main_menu_list/.test(ownedHtml);
  const ourMarkup = /data-region="footer"/.test(ownedHtml);
  record(
    "Isolation",
    "/about-us rendered by this app",
    ourMarkup && !legacyMarkup,
    legacyMarkup ? "served the OLD Laravel page" : ourMarkup ? "our markup" : "unrecognised",
  );

  const styleguide = await get("/styleguide");
  record(
    "Isolation",
    "styleguide not exposed",
    styleguide.status === 404,
    `HTTP ${styleguide.status}`,
  );
}

/* ── 3. Every route renders with one non-empty <h1> ────────────────────── */
{
  for (const route of ROUTES) {
    const response = await get(route);
    if (response.status !== 200) {
      record("Routes", route, false, `HTTP ${response.status}`);
      continue;
    }
    const html = await response.text();
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
      decodeEntities(m[1].replace(/<[^>]+>/g, ""))
        .replace(/\s+/g, " ")
        .trim(),
    );
    const nonEmpty = headings.filter(Boolean);
    const ok = headings.length === 1 && nonEmpty.length === 1;
    record(
      "Routes",
      route,
      ok,
      ok ? `“${nonEmpty[0].slice(0, 40)}”` : `${headings.length} h1, ${nonEmpty.length} non-empty`,
    );
  }
}

/* ── 4. The preview banner is actually shown ───────────────────────────── */
{
  const html = await (await get("/")).text();
  record("Preview", "banner present", html.includes("Preview — forms are not sent"));
}

/* ── 5. Media are real files, not Git LFS pointers ─────────────────────── */
{
  // Sample across types; an LFS pointer is ~130 bytes of text starting with
  // "version https://git-lfs.github.com/spec/v1".
  const manifestPath = new URL("../public/media/MANIFEST.json", import.meta.url);
  let samples = [];
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    samples = (manifest.samples ?? []).slice(0, 6);
  } catch {
    /* fall through to the defaults below */
  }
  if (samples.length === 0) {
    samples = [
      "/media/public/storage/images/general-settings/logo/zr9Bx3ILzkGWw1KDwhlCkUNz3sk3GfxQozHRYjqJ.png",
      "/media/public/storage/images/admin/gallery/1gk0XLFyHQ9Vvd3mJnQB.webp",
      "/media/public/storage/images/admin/ownership/M7PT7o7U1pZ5zoj8HTmLOVBm2qSR1YEKJwXq4R30.jpg",
      "/media/public/storage/images/general-settings/background_video/6bRNJdyXHXxSzhwQwiHGrmpX9RyMcvBUkMXnLflZ.mp4",
    ];
  }

  for (const path of samples) {
    const response = await get(path);
    if (response.status !== 200) {
      record("Media", path.split("/").pop() ?? path, false, `HTTP ${response.status}`);
      continue;
    }
    const type = response.headers.get("content-type") ?? "";
    const size = Number(response.headers.get("content-length") ?? 0);
    const isMedia = /^(image|video)\//.test(type);
    // A pointer is tiny and text; a real asset is not.
    const isPointer = !isMedia || size < 1024;
    let detail = `${type || "?"} ${size ? `${(size / 1024).toFixed(0)}KB` : ""}`.trim();
    if (isPointer) {
      const head = (await response.text()).slice(0, 60);
      if (head.startsWith("version https://git-lfs"))
        detail = "GIT LFS POINTER — not resolved by the build";
    }
    record("Media", path.split("/").pop() ?? path, isMedia && !isPointer, detail);
  }
}

/* ── Report ────────────────────────────────────────────────────────────── */
const width = Math.max(...results.map((r) => r.check.length), 20);
let current = "";
console.log(`\nverify:preview — ${base}\n`);
for (const r of results) {
  if (r.group !== current) {
    current = r.group;
    console.log(`  ${current}`);
  }
  const mark = r.ok ? "PASS" : "FAIL";
  console.log(`    ${mark}  ${r.check.padEnd(width)}  ${r.detail}`);
}

const failed = results.filter((r) => !r.ok);
console.log(
  `\n  ${results.length - failed.length}/${results.length} checks passed` +
    (failed.length ? ` — ${failed.length} FAILED\n` : "\n"),
);
process.exit(failed.length ? 1 : 0);
