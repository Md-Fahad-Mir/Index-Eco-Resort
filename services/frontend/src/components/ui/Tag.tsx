import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

/** A pill for categories and filter chips (§8). */
export function Tag({
  children,
  tone = "light",
  className,
}: {
  children: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      lang={autoLang(children)}
      className={cn(
        "rounded-pill text-label label-track inline-flex items-center px-3 py-1 font-semibold",
        tone === "light" ? "bg-lichen text-ink" : "border-hairline-dark text-lichen border",
        className,
      )}
    >
      {children}
    </span>
  );
}
