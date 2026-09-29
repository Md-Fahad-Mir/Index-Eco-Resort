import type { ReactNode } from "react";
import { Heading, type HeadingSize } from "@/components/typography/Heading";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

type SectionHeaderProps = {
  eyebrow?: string | null;
  title: string;
  /** Intro copy or controls (filter chips, carousel arrows) — column 8–12 on desktop. */
  aside?: ReactNode;
  tone?: "light" | "dark";
  /** Heading level; the visual size stays `h2`. */
  level?: 2 | 3;
  size?: HeadingSize;
  align?: "start" | "center";
  className?: string;
};

/**
 * Eyebrow + H2, with an optional slot that sits in columns 8–12 on desktop and
 * aligns to the heading's baseline (§5). Centered only where the content is a
 * single statement.
 */
export function SectionHeader({
  eyebrow,
  title,
  aside,
  tone = "light",
  level = 2,
  size = "h2",
  align = "start",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "gap-x-[clamp(1rem,2vw,2rem)] gap-y-6",
        centered
          ? "flex flex-col items-center text-center"
          : "lg:grid lg:grid-cols-12 lg:items-end",
        className,
      )}
    >
      <div className={cn(!centered && "lg:col-span-6")}>
        {eyebrow ? (
          <Eyebrow tone={tone} className="mb-4">
            {eyebrow}
          </Eyebrow>
        ) : null}
        <Heading level={level} size={size}>
          {title}
        </Heading>
      </div>
      {aside ? (
        <div className={cn(!centered && "lg:col-span-5 lg:col-start-8 lg:justify-self-end")}>
          {aside}
        </div>
      ) : null}
    </div>
  );
}
