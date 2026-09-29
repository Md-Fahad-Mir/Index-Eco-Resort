import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getBookNow } from "@/lib/data";

/** Phase 4 placeholder for `/book-now`; the real page is built in a later phase. */
export default async function Page() {
  const data = await getBookNow();
  return (
    <>
      <PageHero hero={data.hero} />
      <Section tone="mist">
        <Container>
          <p className="text-ink-muted text-body">
            Phase 4 placeholder — this page is built in a later phase.
          </p>
        </Container>
      </Section>
    </>
  );
}
