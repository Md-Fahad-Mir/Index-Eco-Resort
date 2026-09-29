import { Heading } from "@/components/typography/Heading";
import { HeroImage } from "@/components/media/HeroImage";
import { Container } from "@/components/ui/Container";
import type { PageHero as PageHeroData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * The inner-page opener (design-system §8): a photograph with the breadcrumb
 * and title bottom-left, magazine style.
 *
 * When the CMS image is missing the hero does not degrade into a grey box — it
 * becomes a deliberate canopy panel with a faint leaf-vein pattern, keeping the
 * same layout so the page reads as designed rather than broken. One package
 * hero is missing from the current data (docs/OWNER-REPORT.md §E), which is
 * exactly the case this covers.
 */
export function PageHero({
  hero,
  /** Overrides the breadcrumb home target where the captured one is broken. */
  homeHref,
  className,
}: {
  hero: PageHeroData;
  homeHref?: string;
  className?: string;
}) {
  const hasImage = Boolean(hero.image?.src);
  const home = homeHref ? { ...hero.breadcrumb.home, href: homeHref } : hero.breadcrumb.home;

  return (
    <section
      data-testid="page-hero"
      data-has-image={hasImage}
      className={cn(
        "bg-canopy-deep on-dark relative flex min-h-[clamp(420px,62vh,640px)] items-end overflow-hidden",
        className,
      )}
    >
      {/* The panel is always the backdrop; the photograph covers it when it
          loads, and is what falls away when the file is missing. */}
      <PatternBackdrop />
      {hasImage && <HeroImage image={hero.image} />}

      <Container className="relative z-10 flex flex-col gap-4 pb-14">
        <Breadcrumbs home={home} current={hero.breadcrumb.current} />
        <Heading level={1} size="h1" className="text-mist max-w-[16ch]">
          {hero.title}
        </Heading>
      </Container>
    </section>
  );
}

/** The designed stand-in when there is no photograph to show. */
function PatternBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="text-lichen absolute inset-0 [background-image:url('/patterns/leaf-vein.svg')] [background-size:360px_360px] opacity-[0.07]"
      />
      {/* A soft brass glow keeps the panel from reading as a flat error state. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_100%,rgb(176_141_87/0.16),transparent_70%)]"
      />
    </>
  );
}
