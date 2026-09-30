import bnCatalog from "@/fixtures/translations/bn.json";
import enCatalog from "@/fixtures/translations/en.json";
import type { Locale } from "@/lib/i18n/config";

/**
 * Translation for the snapshot, used by the mock adapter only — a real backend
 * returns each language itself (`?lang=`, see adapters/api.ts).
 *
 * The snapshot is the live site's content as captured: mostly English, some
 * Bangla. Each catalog maps a captured string to its translation, exactly as
 * written, and is applied to every text value in a payload. One entry covers
 * every place a string repeats (a package name appears in a dozen payloads),
 * and a string with no entry stays as captured rather than breaking.
 */
const catalogs: Record<Locale, Record<string, string>> = { bn: bnCatalog, en: enCatalog };

/**
 * Values that are addresses or identifiers, never prose: translating one would
 * break a link, an image or a lookup. `html` is a whole CMS body; bodies are
 * not rendered anywhere yet and would be translated by the backend, not here.
 */
const SKIP_KEYS = new Set([
  "src",
  "href",
  "fullSrc",
  "videoUrl",
  "youtubeSrc",
  "mapEmbedUrl",
  "favicon",
  "endpoint",
  "ajaxDetailHrefPattern",
  "slug",
  "id",
  "youtubeId",
  "network",
  "target",
  "type",
  "kind",
  "method",
  "mechanism",
  "params",
  "dateFormat",
  "pane",
  "tone",
  "html",
]);

export function translate<T>(value: T, locale: Locale): T {
  const catalog = catalogs[locale];
  return walk(value, catalog) as T;
}

function walk(value: unknown, catalog: Record<string, string>, key?: string): unknown {
  if (typeof value === "string") {
    if (key && SKIP_KEYS.has(key)) return value;
    return catalog[value] ?? value;
  }
  if (Array.isArray(value)) return value.map((item) => walk(item, catalog, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, catalog, k)]));
  }
  return value;
}
