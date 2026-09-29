/**
 * Link handling.
 *
 * The captured data stores internal links as absolute URLs on the old origin
 * (`https://indexecoresort.com/about-us`). Those are the same destinations as
 * our own paths, so they are converted for `next/link` — the parity tests
 * normalise both sides the same way.
 *
 * Everything else is left exactly as captured: `#`, `tel:`, `mailto:`, the
 * relative-and-therefore-broken Facebook href, and links with no href at all
 * (CLAUDE.md rule 9b).
 */

/** Origins whose paths are ours to route internally. */
const OWN_ORIGINS = [
  "https://indexecoresort.com",
  "http://indexecoresort.com",
  "https://www.indexecoresort.com",
];

/** The href to render: an internal path where possible, otherwise verbatim. */
export function internalHref(href: string | null | undefined): string | null {
  if (href === null || href === undefined) return null;
  const trimmed = href.trim();
  for (const origin of OWN_ORIGINS) {
    if (trimmed === origin) return "/";
    if (trimmed.startsWith(`${origin}/`)) return trimmed.slice(origin.length) || "/";
  }
  return trimmed;
}

/** True when `next/link` should handle it (same-app navigation). */
export function isInternal(href: string | null | undefined): href is string {
  return typeof href === "string" && href.startsWith("/") && !href.startsWith("//");
}

/** True for anything that leaves the site and needs rel="noopener noreferrer". */
export function isExternal(href: string | null | undefined): boolean {
  if (!href) return false;
  if (isInternal(href)) return false;
  if (/^(#|tel:|mailto:|sms:)/.test(href)) return false;
  return true;
}

/** Attributes an anchor needs for a given href, including the external rel. */
export function anchorProps(href: string | null | undefined, target?: string | null) {
  const props: { rel?: string; target?: string } = {};
  if (isExternal(href)) props.rel = "noopener noreferrer";
  if (target) props.target = target;
  return props;
}

/**
 * Whether a nav item is the current page. "Ownership Packages" has no href of
 * its own and is active on any of its children's routes.
 */
export function isActiveRoute(
  href: string | null | undefined,
  pathname: string,
  children?: { href: string | null }[],
): boolean {
  const path = internalHref(href);
  if (path && isInternal(path)) {
    if (path === "/") return pathname === "/";
    if (pathname === path || pathname.startsWith(`${path}/`)) return true;
  }
  return (children ?? []).some((child) => {
    const childPath = internalHref(child.href);
    return (
      isInternal(childPath) && (pathname === childPath || pathname.startsWith(`${childPath}/`))
    );
  });
}
