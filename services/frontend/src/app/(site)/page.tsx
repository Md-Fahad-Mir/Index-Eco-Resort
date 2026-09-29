import type { Metadata } from "next";
import { AboutBlock } from "@/components/sections/home/AboutBlock";
import { CtaStrip } from "@/components/sections/home/CtaStrip";
import { GallerySection } from "@/components/sections/home/GallerySection";
import { HeroCarousel } from "@/components/sections/home/HeroCarousel";
import { Highlights } from "@/components/sections/home/Highlights";
import { LatestPosts } from "@/components/sections/home/LatestPosts";
import { PlansStage } from "@/components/sections/home/PlansStage";
import { ProjectGlance } from "@/components/sections/home/ProjectGlance";
import { Restaurant } from "@/components/sections/home/Restaurant";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { Villa } from "@/components/sections/home/Villa";
import { WhyBuy } from "@/components/sections/home/WhyBuy";
import { getHome } from "@/lib/data";

export const metadata: Metadata = {
  title: "INDEX Eco Resort",
  description:
    "INDEX Eco Resort — ownership shares in an eco resort, with stays, dining and event spaces.",
};

/**
 * Home. Section order and background tones follow docs/02-DESIGN-SYSTEM.md
 * §2.3, which alternates paper, mist and canopy so the page has a rhythm
 * rather than one long scroll of cards.
 */
export default async function HomePage() {
  const home = await getHome();

  return (
    <>
      <HeroCarousel hero={home.hero} />
      <Highlights highlights={home.highlights} />
      <AboutBlock about={home.about} />
      <ProjectGlance glance={home.glance} />
      <GallerySection gallery={home.gallery} />
      <CtaStrip cta={home.ctaStrip} />
      <PlansStage
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
