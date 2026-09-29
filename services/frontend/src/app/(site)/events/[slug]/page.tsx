import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getEvents, getEvent } from "@/lib/data";

/** Phase 4 placeholder for `/events/[slug]`; the real page is built in a later phase. */
export async function generateStaticParams() {
  const data = await getEvents();
  return data.events.map((item) => ({ slug: item.slug }));
}

export default async function Page({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const item = await getEvent(slug);
  if (!item) notFound();

  const list = await getEvents();
  return (
    <>
      <PageHero
        hero={{
          ...list.hero,
          title: list.events.find((e) => e.slug === slug)?.title ?? slug,
          breadcrumb: {
            ...list.hero.breadcrumb,
            current: list.events.find((e) => e.slug === slug)?.title ?? slug,
          },
        }}
      />
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
