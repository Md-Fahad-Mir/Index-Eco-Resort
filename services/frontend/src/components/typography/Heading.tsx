import type { ReactNode } from "react";
import { autoLang } from "@/lib/lang";
import { cn } from "@/lib/utils";

/** Visual size, chosen independently of the semantic level. */
export type HeadingSize = "display" | "h1" | "h2" | "h3" | "h4";

const SIZE_CLASS: Record<HeadingSize, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
};

type HeadingProps = {
  /** Semantic level. Exactly one `h1` per page (CLAUDE.md rule 9e). */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size; defaults to the one matching `level`. */
  size?: HeadingSize;
  children: ReactNode;
  /** CMS text used to detect the script when `children` is not a plain string. */
  sample?: string;
  className?: string;
  id?: string;
};

const DEFAULT_SIZE: Record<number, HeadingSize> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h4",
  6: "h4",
};

/**
 * A heading in the display face at a scale step, tagged `lang="bn"` when its
 * text is Bangla so the Bangla line-height and optical size rules apply.
 */
export function Heading({ level, size, children, sample, className, id }: HeadingProps) {
  const Tag = `h${level}` as const;
  const text = sample ?? (typeof children === "string" ? children : undefined);
  const resolved = size ?? DEFAULT_SIZE[level] ?? "h4";
  return (
    <Tag id={id} lang={autoLang(text)} className={cn(SIZE_CLASS[resolved], className)}>
      {children}
    </Tag>
  );
}
