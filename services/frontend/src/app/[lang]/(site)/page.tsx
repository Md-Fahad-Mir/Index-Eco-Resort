import type { Metadata, Viewport } from "next";
import { AboutEstate } from "@/components/sections/home/AboutEstate";
import { CtaInvitation } from "@/components/sections/home/CtaInvitation";
import { GalleryNight } from "@/components/sections/home/GalleryNight";
import { HeroCarousel } from "@/components/sections/home/HeroCarousel";
import { Highlights } from "@/components/sections/home/Highlights";
import { LatestPosts } from "@/components/sections/home/LatestPosts";
import { PlansVault } from "@/components/sections/home/PlansVault";
import { ProjectGlance } from "@/components/sections/home/ProjectGlance";
import { Restaurant } from "@/components/sections/home/Restaurant";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { Villa } from "@/components/sections/home/Villa";
import { WhyBuy } from "@/components/sections/home/WhyBuy";
import { getHome, getPackages } from "@/lib/data";
import { dictionaryFor } from "@/lib/i18n/dictionaries";
import { languageAlternates } from "@/lib/i18n/metadata";
import { getLocale } from "@/lib/i18n/server";

/** Phone browser chrome matches the Midnight hero: me-night (§4). Home only. */
export const viewport: Viewport = { themeColor: "#0e1a15" };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = dictionaryFor(locale);
  return {
    title: meta.siteTitle,
    description: meta.homeDescription,
    alternates: languageAlternates("/", locale),
  };
}

/**
 * Home — the Midnight Estate pilot (prompts/06b-home-redesign.md). Section
 * order is the live site's; the tones follow the redesign's rhythm (§2.6),
 * night for imagery and signature moments, ivory for long reading:
 *
 *   hero · highlights   night, the panel beneath it on ivory
 *   about               ivory — the reading room
 *   glance · gallery    night, night-deep
 *   cta                 ivory — the invitation
 *   plans               night-deep — the vault
 *   why buy             ivory
 *   villa · restaurant  night, night-deep
 *   voices · journal    ivory
 *
 * About, Gallery and the CTA are Home-only wrappers; the shared AboutBlock,
 * GallerySection and CtaStrip keep their Canopy look for the other pages.
 */
export default async function HomePage() {
  const locale = await getLocale();
  const [home, packages] = await Promise.all([getHome(locale), getPackages(locale)]);

  return (
    <>
      {/* The hero fills the whole first screen; the highlights panel starts
          where the photograph ends. */}
      <HeroCarousel hero={home.hero} />
      <Highlights highlights={home.highlights} />
      <AboutEstate about={home.about} />
      <ProjectGlance glance={home.glance} />
      <GalleryNight gallery={home.gallery} />
      <CtaInvitation cta={home.ctaStrip} />
      <PlansVault
        eyebrow={home.plans.eyebrow}
        title={home.plans.title}
        packages={home.plans.packages}
        details={packages}
      />
      <WhyBuy whyBuy={home.whyBuy} />
      <Villa villa={home.villa} />
      <Restaurant restaurant={home.restaurant} />
      <Testimonials testimonials={home.testimonials} />
      <LatestPosts latestPosts={home.latestPosts} />
    </>
  );
}
