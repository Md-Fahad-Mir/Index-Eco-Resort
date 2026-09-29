import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { CoreValues } from "@/components/sections/about/CoreValues";
import { VisionMissionTabs } from "@/components/sections/about/VisionMissionTabs";
import { AboutBlock } from "@/components/sections/home/AboutBlock";
import { PlansStage } from "@/components/sections/home/PlansStage";
import { getAboutPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us | INDEX Eco Resort",
  description: "INDEX Eco Resort — who we are, what we are building, and the values behind it.",
};

/**
 * About. Section order follows the live page: hero, about block, ownership
 * packages, vision/mission, core values. The about block and the plans stage
 * are the same components Home uses — this page is where that reuse is proved.
 */
export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <>
      {/* PARITY: the breadcrumb "Home" is href="#" on the live site (rule 9b). */}
      <PageHero hero={about.hero} />
      <AboutBlock about={about.about} />
      <PlansStage
        eyebrow={about.plans.eyebrow}
        title={about.plans.title}
        packages={about.plans.packages}
      />
      <VisionMissionTabs visionMission={about.visionMission} />
      <CoreValues coreValues={about.coreValues} />
    </>
  );
}
