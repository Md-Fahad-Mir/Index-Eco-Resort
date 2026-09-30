import { autoLang, isBangla } from "@/lib/lang";
import { cn } from "@/lib/utils";

/**
 * The small label above a section heading. The CMS supplies the text; we change
 * only the treatment (§3.3): Tiro italic for Latin, upright for Bangla, brass,
 * preceded by a 24px brass hairline. No tracking, no caps — deliberately not
 * the usual tracked ALL-CAPS eyebrow.
 *
 * `variant="home"` is Midnight Estate (docs/02 §13): the display face is Bodoni
 * there, champagne on dark and bronze on ivory, after a 32px hairline.
 */
export function Eyebrow({
  children,
  tone = "light",
  variant = "default",
  className,
}: {
  children: string | null | undefined;
  tone?: "light" | "dark";
  variant?: "default" | "home";
  className?: string;
}) {
  const home = variant === "home";
  if (!children) return null;
  const bangla = isBangla(children);
  return (
    <p
      lang={autoLang(children)}
      className={cn(
        "font-display flex items-center gap-3 text-[1.125rem]",
        // Bangla has no true italic; faking one is forbidden (§4.4).
        !bangla && "italic",
        home
          ? tone === "light"
            ? "text-me-bronze"
            : "text-me-champagne"
          : tone === "light"
            ? "text-brass-ink"
            : "text-brass",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("h-px shrink-0 bg-current opacity-70", home ? "w-8" : "w-6")}
      />
      {children}
    </p>
  );
}
