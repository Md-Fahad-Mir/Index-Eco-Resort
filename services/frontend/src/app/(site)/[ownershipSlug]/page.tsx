import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { PlansStage } from "@/components/sections/home/PlansStage";
import { PackageBenefits } from "@/components/sections/ownership/PackageBenefits";
import { PackageIntro } from "@/components/sections/ownership/PackageIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/config/env";
import { getPackage, getPackages } from "@/lib/data";

/**
 * The four ownership pages, from one dynamic segment fed by the package data,
 * so a package added in the backend gets a page automatically (architecture
 * §3). `dynamicParams = false` makes anything else a 404 rather than a build
 * of an empty page.
 */
export async function generateStaticParams() {
  const packages = await getPackages();
  return packages.map((pkg) => ({ ownershipSlug: pkg.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[ownershipSlug]">): Promise<Metadata> {
  const { ownershipSlug } = await params;
  const pkg = await getPackage(ownershipSlug);
  if (!pkg) return {};

  return {
    title: `${pkg.name} | INDEX Eco Resort`,
    description: pkg.discountText,
    alternates: { canonical: `/${pkg.slug}` },
    openGraph: {
      title: `${pkg.name} | INDEX Eco Resort`,
      description: pkg.discountText,
      url: `${siteUrl}/${pkg.slug}`,
      type: "website",
      ...(pkg.card ? { images: [{ url: `${siteUrl}${pkg.card.src}` }] } : {}),
    },
  };
}

export default async function Page({ params }: PageProps<"/[ownershipSlug]">) {
  const { ownershipSlug } = await params;
  const pkg = await getPackage(ownershipSlug);
  if (!pkg) notFound();

  return (
    <>
      {/* PARITY: the breadcrumb "Home" is href="#" on the live site (rule 9b),
          so the JSON-LD carries the real path the crumb describes. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: pkg.hero.breadcrumb.home.label,
              item: `${siteUrl}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: pkg.hero.breadcrumb.current,
              item: `${siteUrl}/${pkg.slug}`,
            },
          ],
        }}
      />

      <PageHero hero={pkg.hero} />
      <PackageIntro pkg={pkg} />
      <PackageBenefits pkg={pkg} />
      <PlansStage
        eyebrow={pkg.plans.eyebrow}
        title={pkg.plans.title}
        packages={pkg.plans.packages}
        currentSlug={pkg.slug}
      />
    </>
  );
}
