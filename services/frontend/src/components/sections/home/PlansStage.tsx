import { PlanGrid } from "@/components/ownership/PlanGrid";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { PackageSummary } from "@/lib/data";

/**
 * The signature section (design-system §2.3, §8.1): the membership cards on a
 * canopy-deep stage with a soft light behind them, so the one place we spend
 * boldness reads as a display case. Reused by About and the package pages.
 */
export function PlansStage({
  eyebrow,
  title,
  packages,
  currentSlug,
}: {
  eyebrow: string;
  title: string;
  packages: PackageSummary[];
  currentSlug?: string;
}) {
  return (
    <Section tone="canopy-deep" className="relative overflow-hidden">
      {/* The light the cards sit in. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_38%,rgb(176_141_87/0.18),transparent_70%)]"
      />
      <Container className="relative flex flex-col gap-14">
        <SectionHeader eyebrow={eyebrow} title={title} tone="dark" align="center" />
        <PlanGrid packages={packages} currentSlug={currentSlug} />
      </Container>
    </Section>
  );
}
