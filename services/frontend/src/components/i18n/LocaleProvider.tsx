"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { defaultLocale, format, localizeDigits, splitLocale, type Locale } from "@/lib/i18n/config";
import { dictionaryFor, type Dictionary } from "@/lib/i18n/dictionaries";

const LocaleContext = createContext<Locale>(defaultLocale);

/** Set once by the root layout from the `[lang]` segment. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useDictionary(): Dictionary {
  return dictionaryFor(useLocale());
}

/**
 * The current route without its language prefix — `/about-us` whether the
 * address bar says `/about-us` or `/en/about-us` — which is what nav hrefs and
 * route-keyed lookups compare against.
 */
export function useRoutePathname(): string {
  return splitLocale(usePathname()).path;
}

/**
 * `format()` for the current language: numbers passed in are written in its
 * digits, so "Slide 2 of 5" becomes "স্লাইড ২, মোট ৫টি" on the Bangla site.
 */
export function useFormatter(): {
  t: (template: string, values: Record<string, string | number>) => string;
  digits: (text: string | number) => string;
} {
  const locale = useLocale();
  const digits = (text: string | number) => localizeDigits(String(text), locale);
  const t = (template: string, values: Record<string, string | number>) =>
    format(
      template,
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          typeof value === "number" ? digits(value) : value,
        ]),
      ),
    );
  return { t, digits };
}
