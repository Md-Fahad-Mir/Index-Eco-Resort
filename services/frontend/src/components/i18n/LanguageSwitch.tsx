"use client";

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
 * The options are plain anchors, so switching is a full document load rather
 * than a client transition. The language is the root layout's segment, and a
 * client transition re-renders `<html>` without the head script that marks it
 * `data-motion="on"` (app/[lang]/layout.tsx) — every entrance on the new page
 * would then jump straight to its final state. A fresh document also brings
 * the new language's `lang`, fonts and metadata in before first paint.
 *
 * The choice is also stored in a cookie so a later visit to a bare URL opens
 * in it (src/proxy.ts). It is written on click, before the navigation starts.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const path = useRoutePathname();
  const dict = useDictionary();

  const segment =
    "grid h-full min-w-10 place-items-center rounded-(--chrome-btn-radius) px-2 text-label font-semibold lg:min-w-9 " +
    "transition-colors duration-[var(--dur-micro)]";

  return (
    <div
      role="group"
      aria-label={dict.language.label}
      className={cn(
        // 44px tall everywhere, level with the menu button on phones, so each
        // option is a 40px square to the thumb; desktop keeps its inset.
        "inline-flex h-11 items-center gap-0.5 rounded-(--chrome-btn-radius) p-0.5 lg:p-1",
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
          <a
            key={option}
            href={localizePath(path, option)}
            hrefLang={option}
            lang={option}
            onClick={() => rememberLocale(option)}
            aria-label={dict.language.names[option]}
            className={cn(
              segment,
              "text-chrome-text/65 hover:bg-chrome-control-hover hover:text-chrome-control-hover-fg",
            )}
          >
            {dict.language.short[option]}
          </a>
        ),
      )}
    </div>
  );
}
