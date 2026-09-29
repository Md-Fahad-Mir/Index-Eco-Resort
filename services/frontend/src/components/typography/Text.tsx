import type { ElementType, ReactNode } from "react";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

type TextProps = {
  /** CMS string. Its script decides the `lang` attribute. */
  children: string | null | undefined;
  as?: ElementType;
  className?: string;
};

/**
 * Renders a CMS string and tags it `lang="bn"` when it contains Bangla, so the
 * `:lang(bn)` typography rules apply. Every piece of CMS text goes through this.
 */
export function Text({ children, as: Tag = "span", className }: TextProps) {
  if (!children) return null;
  return (
    <Tag lang={autoLang(children)} className={className}>
      {children}
    </Tag>
  );
}

type ParagraphProps = { children: string | null | undefined; className?: string };

/** A CMS paragraph at body size, held to a comfortable measure. */
export function Paragraph({ children, className }: ParagraphProps) {
  if (!children) return null;
  const lang = autoLang(children);
  return (
    <p
      lang={lang}
      className={cn(
        "text-body max-w-[var(--measure)]",
        lang === "bn" && "max-w-[var(--measure-bn)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Wraps arbitrary children with a language tag derived from a sample string. */
export function LangScope({
  sample,
  children,
  className,
  as: Tag = "div",
}: {
  sample: string | null | undefined;
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag lang={autoLang(sample)} className={className}>
      {children}
    </Tag>
  );
}
