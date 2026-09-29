import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Section background tones — the page's rhythm comes from these, not from borders (§2.3). */
export type SectionTone = "mist" | "paper" | "lichen-soft" | "canopy" | "canopy-deep";

const TONE_CLASS: Record<SectionTone, string> = {
  mist: "bg-mist text-ink",
  paper: "bg-paper text-ink",
  "lichen-soft": "bg-lichen-soft text-ink",
  canopy: "bg-canopy text-mist on-dark",
  "canopy-deep": "bg-canopy-deep text-mist on-dark",
};

/** True for tones that need the on-dark treatment (brass focus ring, inverted links). */
export const isDarkTone = (tone: SectionTone) => tone === "canopy" || tone === "canopy-deep";

/**
 * A full-width band of one tone with the standard vertical rhythm.
 * Dark tones also carry `.on-dark`, which switches focus rings to brass.
 */
export function Section({
  tone = "mist",
  children,
  className,
  id,
  spacing = true,
}: {
  tone?: SectionTone;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Turn off to lay out the band's padding yourself. */
  spacing?: boolean;
}) {
  return (
    <section id={id} className={cn(TONE_CLASS[tone], spacing && "section-y", className)}>
      {children}
    </section>
  );
}
