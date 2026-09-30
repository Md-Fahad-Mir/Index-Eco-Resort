import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getEvents, getEvent } from "@/lib/data";
import { languageAlternates } from "@/lib/i18n/metadata";
import { getDictionary, getLocale } from "@/lib/i18n/server";

/** Phase 4 placeholder for `/events/[slug]`; the real page is built in a later phase. */
export async function generateStaticParams() {
  const data = await getEvents(await getLocale());
  return data.events.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { alternates: languageAlternates(`/events/${slug}`, await getLocale()) };
}

export default async function Page({ params }: PageProps<"/[lang]/events/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const item = await getEvent(slug, locale);
  if (!item) notFound();

  const [list, dict] = await Promise.all([getEvents(locale), getDictionary()]);
  const title = list.events.find((e) => e.slug === slug)?.title ?? slug;
  return (
    <>
      <PageHero
        hero={{ ...list.hero, title, breadcrumb: { ...list.hero.breadcrumb, current: title } }}
      />
      <Section tone="mist">
        <Container>
          <p className="text-ink-muted text-body">{dict.placeholder}</p>
        </Container>
      </Section>
    </>
  );
}
