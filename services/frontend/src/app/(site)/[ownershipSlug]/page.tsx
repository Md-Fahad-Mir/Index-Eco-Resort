import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPackage, getPackages } from "@/lib/data";

/**
 * Phase 4 placeholder for the four ownership pages. One dynamic segment driven
 * by the package data, so a package added in the backend gets a page
 * automatically (architecture §3).
 */
export async function generateStaticParams() {
  const packages = await getPackages();
  return packages.map((pkg) => ({ ownershipSlug: pkg.slug }));
}

export const dynamicParams = false;

export default async function Page({ params }: PageProps<"/[ownershipSlug]">) {
  const { ownershipSlug } = await params;
  const pkg = await getPackage(ownershipSlug);
  if (!pkg) notFound();

  return (
    <>
      <PageHero hero={pkg.hero} />
      <Section tone="mist">
        <Container>
          <p className="text-ink-muted text-body">
            Phase 4 placeholder — this page is built in Phase 7.
          </p>
        </Container>
      </Section>
    </>
  );
}
