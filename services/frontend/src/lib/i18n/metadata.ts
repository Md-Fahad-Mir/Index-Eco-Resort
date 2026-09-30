import type { Metadata } from "next";
import { localizePath, locales, type Locale } from "./config";

/**
 * Canonical and hreflang links for a page that exists in both languages, from
 * its unprefixed path. Relative, resolved against `metadataBase`.
 */
export function languageAlternates(path: string, locale: Locale): Metadata["alternates"] {
  return {
    canonical: localizePath(path, locale),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localizePath(path, l)])),
      "x-default": path,
    },
  };
}
