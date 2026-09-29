import { getHome } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/typography/Heading";
import { Section } from "@/components/ui/Section";

/** Phase 4 placeholder for `/`. The Home sections arrive in Phase 5. */
export default async function HomePage() {
  const home = await getHome();
  const slide = home.hero.slides.find((s) => s.title) ?? home.hero.slides[0];

  return (
    <>
      <section className="bg-canopy-deep on-dark relative flex min-h-svh items-end overflow-hidden">
        <Container className="relative z-10 flex flex-col gap-5 pb-24">
          <p className="text-mist/80 text-small">{slide?.subline}</p>
          <Heading level={1} size="display" className="text-mist">
            {slide?.title ?? "Index Eco Resort"}
          </Heading>
        </Container>
      </section>
      <Section tone="mist">
        <Container>
          <p className="text-ink-muted text-body">
            Phase 4 placeholder — the Home sections are built in Phase 5.
          </p>
        </Container>
      </Section>
    </>
  );
}
