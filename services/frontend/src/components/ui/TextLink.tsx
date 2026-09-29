import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  /**
   * Show the trailing arrow. Only where the original had one — the arrow is a
   * directional cue, not decoration (§8).
   */
  withArrow?: boolean;
};

/**
 * A text link whose underline is drawn from the left on hover, and whose
 * optional arrow shifts 4px. External and `#` hrefs render as a plain anchor so
 * their target behaviour is preserved exactly.
 */
export function TextLink({ href, children, withArrow, className, ...props }: TextLinkProps) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const content = (
    <>
      <span
        className={cn(
          // A background *image* (not bg-current, which would paint the whole box)
          // drawn from the left on hover.
          "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5",
          "transition-[background-size] duration-300 ease-[var(--ease-out-soft)]",
          "group-hover/link:bg-[length:100%_1px] group-focus-visible/link:bg-[length:100%_1px]",
        )}
      >
        {children}
      </span>
      {withArrow && (
        <ArrowRight
          aria-hidden
          strokeWidth={1.5}
          className="size-4 shrink-0 transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out-soft)] group-hover/link:translate-x-1 group-focus-visible/link:translate-x-1"
        />
      )}
    </>
  );

  const classes = cn("group/link inline-flex items-center gap-2 text-small font-medium", className);

  if (isInternal) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  const isExternal = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      className={classes}
      {...(isExternal ? { rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {content}
    </a>
  );
}
