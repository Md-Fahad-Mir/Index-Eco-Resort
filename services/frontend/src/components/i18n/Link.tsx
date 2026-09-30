"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "./LocaleProvider";

/**
 * `next/link` that keeps the visitor in their language: an app path such as
 * `/about-us` becomes `/en/about-us` on the English site. Data and components
 * keep writing unprefixed paths; only the rendered href changes.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  return (
    <NextLink href={typeof href === "string" ? localizePath(href, locale) : href} {...props} />
  );
}
