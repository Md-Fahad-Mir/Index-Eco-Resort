/**
 * The site's two languages. Bangla is the default and lives at the bare paths
 * (`/about-us`); English is prefixed (`/en/about-us`). Internally every route
 * sits under `app/[lang]`, and src/proxy.ts rewrites the bare paths to `/bn/…`
 * so the default language never shows in the address bar.
 *
 * Pure and dependency-free: the proxy, server components and client components
 * all import it.
 */
export const locales = ["bn", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bn";

/** Remembers an explicit choice from the language switch, for the next visit. */
export const LOCALE_COOKIE = "locale";

/** Values for `<html lang>`, Open Graph and `Intl`. */
export const localeTags: Record<Locale, { lang: string; og: string; intl: string }> = {
  bn: { lang: "bn", og: "bn_BD", intl: "bn-BD" },
  en: { lang: "en", og: "en_US", intl: "en-US" },
};

export function hasLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/**
 * Splits a pathname into its language and the route path that the data and the
 * nav know about: `/en/about-us` → `en` + `/about-us`, `/about-us` → `bn` +
 * `/about-us`.
 *
 * `/bn/about-us` is accepted too. No public URL carries the default prefix, but
 * a page prerendered as `/bn/about-us` and served through the proxy's rewrite
 * reads that path from `usePathname()` on the server and `/about-us` in the
 * browser — both must come out the same or hydration fails.
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return { locale, path: "/" };
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) };
    }
  }
  return { locale: defaultLocale, path: pathname };
}

/**
 * The public URL of an internal path in a language: `/about-us` in `en` →
 * `/en/about-us`; anything already carrying a prefix, or not an app path, is
 * returned unchanged.
 */
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (locale === defaultLocale) return path;
  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) return path;
  if (path === "/") return `/${locale}`;
  // Keep a query or hash attached to the path it belongs to.
  if (path.startsWith("/?") || path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/** Bangla digits for display numerals (counters, "02 / 05"). */
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function localizeDigits(text: string, locale: Locale): string {
  if (locale !== "bn") return text;
  return text.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]!);
}

/** Fills `{name}` placeholders in a dictionary string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
