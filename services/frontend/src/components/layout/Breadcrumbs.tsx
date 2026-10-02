import Link from "@/components/i18n/Link";
import { getDictionary } from "@/lib/i18n/server";
import { autoLang } from "@/lib/lang";
import { internalHref, isInternal } from "@/lib/links";
import { cn } from "@/lib/utils";

/** The link's hit area grows to 44px without moving the line. */
const TOUCH = "hover:text-mist -mx-3 -my-3 inline-block px-3 py-3 transition-colors";

/**
 * Breadcrumb above a page-hero title. The separator is a thin slanted rule
 * rather than a slash glyph (design-system §8).
 */
export async function Breadcrumbs({
  home,
  current,
  className,
}: {
  home: { label: string; href: string | null };
  current: string;
  className?: string;
}) {
  const href = internalHref(home.href) ?? "#";
  const dict = await getDictionary();
  return (
    <nav aria-label={dict.chrome.breadcrumb} className={cn("text-small text-mist/80", className)}>
      {/* The current crumb keeps to one line; the title below it says it in full. */}
      <ol className="flex items-center gap-3">
        <li className="shrink-0">
          {isInternal(href) ? (
            <Link href={href} className={TOUCH}>
              {home.label}
            </Link>
          ) : (
            <a href={href} className={TOUCH}>
              {home.label}
            </a>
          )}
        </li>
        <li aria-hidden className="bg-mist/40 h-3.5 w-px shrink-0 rotate-[20deg]" />
        <li className="min-w-0">
          <span lang={autoLang(current)} aria-current="page" className="text-mist block truncate">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
