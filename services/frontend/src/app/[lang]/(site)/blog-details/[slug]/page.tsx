import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPosts, getPost } from "@/lib/data";
import { languageAlternates } from "@/lib/i18n/metadata";
import { getDictionary, getLocale } from "@/lib/i18n/server";

/** Phase 4 placeholder for `/blog-details/[slug]`; the real page is built in a later phase. */
export async function generateStaticParams() {
  const data = await getPosts(await getLocale());
  return data.posts.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog-details/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { alternates: languageAlternates(`/blog-details/${slug}`, await getLocale()) };
}

export default async function Page({ params }: PageProps<"/[lang]/blog-details/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const item = await getPost(slug, locale);
  if (!item) notFound();

  const [list, dict] = await Promise.all([getPosts(locale), getDictionary()]);
  return (
    <>
      <PageHero
        hero={{
          ...list.hero,
          title: item.title ?? slug,
          breadcrumb: { ...list.hero.breadcrumb, current: item.title ?? slug },
        }}
      />
      <Section tone="mist">
        <Container>
          <p className="text-ink-muted text-body">{dict.placeholder}</p>
        </Container>
      </Section>
    </>
  );
}
