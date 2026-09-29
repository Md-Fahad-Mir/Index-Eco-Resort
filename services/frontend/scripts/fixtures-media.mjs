/**
 * Mirrors every media file the fixtures reference into public/media/, keeping
 * the original relative path, then rewrites the fixture URLs to /media/....
 *
 * Together with src/fixtures/*.json this is the content snapshot that will seed
 * the Django database, so the frontend stops depending on the old site being up.
 *
 *   pnpm fixtures:media            mirror + rewrite
 *   pnpm fixtures:media --dry-run  report what would be fetched
 */
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FIXTURES = path.join(ROOT, "src/fixtures");
const MEDIA = path.join(ROOT, "public/media");

/** The site the snapshot was taken from; its paths are kept verbatim. */
const PRIMARY = "indexecoresort.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const MEDIA_RE = /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm|mov|pdf|ico)$/i;
const DRY = process.argv.includes("--dry-run");

/** Local path under public/media for a remote URL. Other hosts are namespaced. */
function localPathFor(url) {
  const u = new URL(url);
  const rel = decodeURIComponent(u.pathname).replace(/^\/+/, "");
  return u.hostname === PRIMARY ? rel : path.join("_external", u.hostname, rel);
}

const collect = (node, out) => {
  if (typeof node === "string") {
    if (/^https?:\/\//.test(node) && MEDIA_RE.test(new URL(node).pathname)) out.add(node);
  } else if (Array.isArray(node)) {
    for (const v of node) collect(v, out);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collect(v, out);
  }
  return out;
};

const files = (await readdir(FIXTURES)).filter((f) => f.endsWith(".json")).sort();
const parsed = new Map();
const urls = new Set();
for (const f of files) {
  const json = JSON.parse(await readFile(path.join(FIXTURES, f), "utf8"));
  parsed.set(f, json);
  collect(json, urls);
}
console.log(`${urls.size} remote media URLs referenced by ${files.length} fixture files`);

if (urls.size === 0) {
  // Expected on a re-run: the fixtures already point at /media/..., so there is
  // nothing remote left to fetch. To refresh the snapshot, re-run the Phase 0
  // pipeline first (pnpm audit:crawl && pnpm audit:extract && pnpm audit:fixtures),
  // which restores the absolute URLs, then run this again.
  console.log("Nothing to mirror — the fixtures already reference the local mirror.");
  process.exit(0);
}

if (DRY) {
  for (const u of [...urls].sort()) console.log("  ", localPathFor(u));
  process.exit(0);
}

const mapping = new Map();
const failures = [];
let bytes = 0;
let skipped = 0;

const limit = 6;
const queue = [...urls];
await Promise.all(
  Array.from({ length: limit }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const rel = localPathFor(url);
      const dest = path.join(MEDIA, rel);
      try {
        const existing = await stat(dest).catch(() => null);
        if (existing?.size) {
          bytes += existing.size;
          skipped += 1;
          mapping.set(url, `/media/${rel}`);
          continue;
        }
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) {
          failures.push({ url, status: res.status });
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        await mkdir(path.dirname(dest), { recursive: true });
        await writeFile(dest, buf);
        bytes += buf.byteLength;
        mapping.set(url, `/media/${rel}`);
      } catch (err) {
        failures.push({ url, status: String(err).slice(0, 60) });
      }
    }
  }),
);

// Rewrite only the URLs that were actually mirrored; a missing file keeps its
// original URL so the gap stays visible rather than turning into a broken path.
let rewritten = 0;
for (const [file, json] of parsed) {
  const text = JSON.stringify(json, null, 2);
  let next = text;
  for (const [url, local] of mapping) {
    const before = next;
    next = next.split(url).join(local);
    if (next !== before) rewritten += 1;
  }
  if (next !== text) await writeFile(path.join(FIXTURES, file), next + "\n");
}

const mb = (n) => (n / 1048576).toFixed(1);
console.log(`\nmirrored ${mapping.size} files (${skipped} already present) — ${mb(bytes)} MB`);
console.log(`rewrote ${rewritten} URL occurrences across the fixtures`);
if (failures.length) {
  console.log(`\n${failures.length} could NOT be fetched (left pointing at the original URL):`);
  for (const f of failures) console.log(`  ${f.status}  ${f.url}`);
}
await writeFile(
  path.join(MEDIA, "MANIFEST.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      primaryHost: PRIMARY,
      count: mapping.size,
      bytes,
      failures,
    },
    null,
    2,
  ) + "\n",
);
