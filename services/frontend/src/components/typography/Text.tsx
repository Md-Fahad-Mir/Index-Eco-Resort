import type { ElementType, ReactNode } from "react";
import { paragraphs } from "@/lib/format";
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

type ParagraphProps = {
  children: string | null | undefined;
  className?: string;
  /** Sets the first paragraph at `lead` size — only when there is more than one. */
  lead?: boolean;
};

/**
 * CMS body text at body size, held to a comfortable measure.
 *
 * A blank line in a plain-text CMS field is the author's paragraph break, so
 * the text is split there and nowhere else — never on a single newline and
 * never on sentence boundaries. The old Blade templates printed these fields
 * inside one `<p>`, where HTML collapses the blank lines; that was a template
 * limitation, not an editorial choice (see tests/parity/allowed-diffs.ts).
 */
export function Paragraph({ children, className, lead }: ParagraphProps) {
  if (!children) return null;
  const parts = paragraphs(children);
  if (parts.length === 0) return null;

  const render = (text: string, index: number) => {
    const lang = autoLang(text);
    return (
      <p
        key={index}
        lang={lang}
        className={cn(
          "text-body max-w-[var(--measure)]",
          lang === "bn" && "max-w-[var(--measure-bn)]",
          className,
          lead && parts.length > 1 && index === 0 && "text-lead",
        )}
      >
        {text}
      </p>
    );
  };

  const first = parts[0];
  if (parts.length === 1 && first !== undefined) return render(first, 0);
  return <div className="flex flex-col gap-5">{parts.map(render)}</div>;
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
