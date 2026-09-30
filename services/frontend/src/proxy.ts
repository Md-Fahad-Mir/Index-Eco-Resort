import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, hasLocale, localizePath } from "@/lib/i18n/config";

/**
 * Language routing. Every page lives under `app/[lang]`; the public URLs are
 *
 *   /about-us      Bangla, the default — rewritten to /bn/about-us
 *   /en/about-us   English — served as it is
 *   /bn/about-us   never linked; redirected to /about-us so each page has one URL
 *
 * A visitor who picked English with the language switch carries a cookie, and
 * a bare URL sends them to its English twin instead.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (segment === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (hasLocale(segment)) return NextResponse.next();

  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(preferred) && preferred !== defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(pathname, preferred);
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Pages only: not route handlers, build output, public files or anything
  // with an extension (favicon.ico, robots.txt, media).
  matcher: ["/((?!api|_next|media|patterns|.*\\..*).*)"],
};
