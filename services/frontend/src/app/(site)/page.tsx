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
import { getHome } from "@/lib/data";

/** Phone browser chrome matches the Midnight hero: me-night (§4). Home only. */
export const viewport: Viewport = { themeColor: "#0e1a15" };

export const metadata: Metadata = {
  title: "INDEX Eco Resort",
  description:
    "INDEX Eco Resort — ownership shares in an eco resort, with stays, dining and event spaces.",
};

/**
 * Home — the Midnight Estate pilot (prompts/06b-home-redesign.md). Section
 * order is the live site's; the tones follow the redesign's rhythm (§2.6),
 * night for imagery and signature moments, ivory for long reading:
 *
 *   hero · highlights   night, the panel straddling into ivory
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
  const home = await getHome();

  return (
    <>
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
      />
      <WhyBuy whyBuy={home.whyBuy} />
      <Villa villa={home.villa} />
      <Restaurant restaurant={home.restaurant} />
      <Testimonials testimonials={home.testimonials} />
      <LatestPosts latestPosts={home.latestPosts} />
    </>
  );
}
