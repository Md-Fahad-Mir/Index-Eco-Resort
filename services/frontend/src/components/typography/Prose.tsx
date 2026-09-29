import { autoLangHtml } from "@/lib/lang";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

type ProseProps = {
  /** Raw CMS HTML. Sanitized here; callers never pass it to dangerouslySetInnerHTML themselves. */
  html: string;
  className?: string;
  /** Long-form reading measure. Set false inside narrow cards. */
  measured?: boolean;
};

/**
 * CMS rich text in the design system's voice: Tiro headings, brass list
 * markers, a brass-ruled blockquote, scrollable tables — and Bangla tagged so
 * it gets the taller line-height and no tracking.
 */
export function Prose({ html, className, measured = true }: ProseProps) {
  const clean = sanitizeHtml(html);
  const lang = autoLangHtml(clean);
  return (
    <div
      lang={lang}
      className={cn(
        "prose-canopy text-body text-ink",
        measured && (lang === "bn" ? "max-w-[var(--measure-bn)]" : "max-w-[var(--measure)]"),
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
