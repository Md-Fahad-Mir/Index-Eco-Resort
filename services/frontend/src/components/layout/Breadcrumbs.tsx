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
      <ol className="flex items-center gap-3">
        <li>
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
        <li aria-hidden className="bg-mist/40 h-3.5 w-px rotate-[20deg]" />
        <li>
          <span lang={autoLang(current)} aria-current="page" className="text-mist">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
