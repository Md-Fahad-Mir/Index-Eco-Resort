"use client";

import NextLink from "next/link";
import { LOCALE_COOKIE, localizePath, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useDictionary, useLocale, useRoutePathname } from "./LocaleProvider";

/** A year: the choice should outlive the session. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

/**
 * বাং | EN, beside Book Now. Each option links to the same page in its
 * language; the current one is marked rather than linked.
 *
 * The choice is also stored in a cookie so a later visit to a bare URL opens
 * in it (src/proxy.ts). It is written on click, before the navigation starts,
 * and the links are not prefetched — a prefetch made under the old cookie
 * would carry the proxy's redirect back to the old language.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const path = useRoutePathname();
  const dict = useDictionary();

  const segment =
    "grid h-full min-w-9 place-items-center rounded-(--chrome-btn-radius) px-2 text-label font-semibold " +
    "transition-colors duration-[var(--dur-micro)]";

  return (
    <div
      role="group"
      aria-label={dict.language.label}
      className={cn(
        "inline-flex h-9 items-center gap-0.5 rounded-(--chrome-btn-radius) p-0.5 lg:h-11 lg:p-1",
        "shadow-[inset_0_0_0_1px_var(--chrome-hairline)]",
        className,
      )}
    >
      {locales.map((option) =>
        option === locale ? (
          <span
            key={option}
            lang={option}
            aria-current="true"
            aria-label={dict.language.names[option]}
            className={cn(segment, "bg-chrome-text/14 text-chrome-text")}
          >
            {dict.language.short[option]}
          </span>
        ) : (
          <NextLink
            key={option}
            href={localizePath(path, option)}
            hrefLang={option}
            lang={option}
            prefetch={false}
            onClick={() => rememberLocale(option)}
            aria-label={dict.language.names[option]}
            className={cn(
              segment,
              "text-chrome-text/65 hover:bg-chrome-control-hover hover:text-chrome-control-hover-fg",
            )}
          >
            {dict.language.short[option]}
          </NextLink>
        ),
      )}
    </div>
  );
}
