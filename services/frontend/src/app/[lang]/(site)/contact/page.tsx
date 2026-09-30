import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getContactPage } from "@/lib/data";
import { languageAlternates } from "@/lib/i18n/metadata";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: languageAlternates("/contact", await getLocale()) };
}

/** Phase 4 placeholder for `/contact`; the real page is built in a later phase. */
export default async function Page() {
  const [data, dict] = await Promise.all([getContactPage(await getLocale()), getDictionary()]);
  return (
    <>
      <PageHero hero={data.hero} />
      <Section tone="mist">
        <Container>
          <p className="text-ink-muted text-body">{dict.placeholder}</p>
        </Container>
      </Section>
    </>
  );
}
