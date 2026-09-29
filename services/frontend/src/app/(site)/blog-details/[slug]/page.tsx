import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPosts, getPost } from "@/lib/data";

/** Phase 4 placeholder for `/blog-details/[slug]`; the real page is built in a later phase. */
export async function generateStaticParams() {
  const data = await getPosts();
  return data.posts.map((item) => ({ slug: item.slug }));
}

export default async function Page({ params }: PageProps<"/blog-details/[slug]">) {
  const { slug } = await params;
  const item = await getPost(slug);
  if (!item) notFound();

  const list = await getPosts();
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
          <p className="text-ink-muted text-body">
            Phase 4 placeholder — this page is built in a later phase.
          </p>
        </Container>
      </Section>
    </>
  );
}
