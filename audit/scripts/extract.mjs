/**
 * Phase 0 extractor — reads the crawled HTML and produces links.json, forms.json
 * and meta.json, the machine-readable parity baseline the tests compare against.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { load } from "cheerio";

const HTML = new URL("../html/", import.meta.url);
const ORIGIN = "https://indexecoresort.com";

/** Region selectors discovered from the live markup. */
const REGIONS = [
  ["topbar", ".header_top"],
  ["header", "header.header_area"],
  ["mobile-nav", "#mobileMenu, .mobileMenu"],
  ["dock", "#mystickyWidget, .mystickyWidget, .fixed_footer_whatsapp_icon"],
  ["footer", "footer.footer"],
];

const fileToPath = (f) => {
  const n = f.replace(/\.html$/, "");
  return n === "home" ? "/" : "/" + n.replace(/__/g, "/");
};

const norm = (t) => (t || "").replace(/\s+/g, " ").trim();

const files = (await readdir(HTML)).filter((f) => f.endsWith(".html")).sort();

const links = {};
const meta = {};
const forms = {};

for (const file of files) {
  const path = fileToPath(file);
  const html = await readFile(new URL(file, HTML), "utf8");
  const $ = load(html);

  // ---- metadata ---------------------------------------------------------
  const metaTag = (sel, attr = "content") => $(sel).attr(attr) ?? null;
  meta[path] = {
    title: norm($("title").first().text()) || null,
    description: metaTag('meta[name="description"]'),
    keywords: metaTag('meta[name="keywords"]'),
    robots: metaTag('meta[name="robots"]'),
    canonical: metaTag('link[rel="canonical"]', "href"),
    csrfToken: $('meta[name="csrf-token"]').length ? "<present>" : null,
    og: Object.fromEntries(
      $('meta[property^="og:"]').map((_, el) => [[$(el).attr("property"), $(el).attr("content")]]).get()
    ),
    twitter: Object.fromEntries(
      $('meta[name^="twitter:"]').map((_, el) => [[$(el).attr("name"), $(el).attr("content")]]).get()
    ),
    favicon: metaTag('link[rel="icon"], link[rel="shortcut icon"]', "href"),
    h1: $("h1").map((_, el) => norm($(el).text())).get(),
  };

  // ---- links ------------------------------------------------------------
  // Tag every anchor with its region, then walk the document in order.
  const tagged = new Map();
  for (const [region, sel] of REGIONS) {
    $(sel).find("a[href]").each((_, el) => { if (!tagged.has(el)) tagged.set(el, region); });
  }
  const pageLinks = [];
  $("a[href]").each((_, el) => {
    const $a = $(el);
    const href = $a.attr("href") ?? "";
    const region = tagged.get(el) ?? "main";
    const text = norm($a.text()) || norm($a.find("img").attr("alt")) || "";
    const entry = { region, text, href };
    const target = $a.attr("target"); if (target) entry.target = target;
    const rel = $a.attr("rel"); if (rel) entry.rel = rel;
    const download = $a.attr("download"); if (download !== undefined) entry.download = download || true;
    const cls = $a.attr("class"); if (cls) entry.class = norm(cls);
    const onclick = $a.attr("onclick"); if (onclick) entry.onclick = norm(onclick);
    pageLinks.push(entry);
  });
  links[path] = pageLinks;

  // ---- forms ------------------------------------------------------------
  const pageForms = [];
  $("form").each((_, el) => {
    const $f = $(el);
    const fields = [];
    $f.find("input, textarea, select").each((_, f) => {
      const $i = $(f);
      const tag = f.tagName.toLowerCase();
      const type = tag === "input" ? ($i.attr("type") || "text") : tag;
      const field = {
        name: $i.attr("name") ?? null,
        id: $i.attr("id") ?? null,
        type,
        required: $i.attr("required") !== undefined,
        placeholder: $i.attr("placeholder") ?? null,
        maxlength: $i.attr("maxlength") ?? null,
        pattern: $i.attr("pattern") ?? null,
        // Hidden values are captured (e.g. address="N/A" is a parity fact), except
        // CSRF tokens, which are per-request secrets and must never be committed.
        value:
          type === "hidden"
            ? $i.attr("name") === "_token"
              ? "<redacted: per-request CSRF token>"
              : ($i.attr("value") ?? null)
            : null,
      };
      if (tag === "select") {
        field.options = $i.find("option").map((_, o) =>
          ({ value: $(o).attr("value") ?? "", label: norm($(o).text()) })).get();
      }
      // The visible label, matched by `for` or by wrapping.
      const id = $i.attr("id");
      let label = id ? norm($f.find(`label[for="${id}"]`).first().text()) : "";
      if (!label) label = norm($i.closest("label").clone().children().remove().end().text());
      field.label = label || null;
      fields.push(field);
    });
    const buttons = $f.find('button, input[type=submit]').map((_, b) =>
      ({ type: $(b).attr("type") ?? "submit", text: norm($(b).text()) || $(b).attr("value") || null, id: $(b).attr("id") ?? null })).get();
    pageForms.push({
      id: $f.attr("id") ?? null,
      class: norm($f.attr("class") || "") || null,
      action: $f.attr("action") ?? null,
      method: ($f.attr("method") || "GET").toUpperCase(),
      enctype: $f.attr("enctype") ?? null,
      fields,
      buttons,
    });
  });
  if (pageForms.length) forms[path] = pageForms;
}

await writeFile(new URL("../links.json", import.meta.url), JSON.stringify(links, null, 2));
await writeFile(new URL("../meta.json", import.meta.url), JSON.stringify(meta, null, 2));
await writeFile(new URL("../forms.json", import.meta.url), JSON.stringify(forms, null, 2));

const total = Object.values(links).reduce((n, l) => n + l.length, 0);
console.log(`links.json: ${Object.keys(links).length} pages, ${total} anchors`);
console.log(`forms.json: ${Object.keys(forms).length} pages with forms`);
console.log(`meta.json:  ${Object.keys(meta).length} pages`);
