"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Heading } from "@/components/typography/Heading";
import type { PackageSummary } from "@/lib/data";
import { internalHref } from "@/lib/links";
import { cn } from "@/lib/utils";
import { MembershipCard } from "./MembershipCard";

/**
 * The four membership cards in data order (design-system §8, §8.1). Reused by
 * Home, About and every package page, so the "current" package can be marked.
 *
 * Desktop is a four-column grid; below `md` it becomes a snap carousel of 80%
 * wide cards, because four cards stacked would bury everything under them.
 */
export function PlanGrid({
  packages,
  currentSlug,
  className,
}: {
  packages: PackageSummary[];
  /** Marks the package whose page we are on. */
  currentSlug?: string;
  className?: string;
}) {
  const [emblaRef] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  return (
    <>
      {/* Grid from md up. */}
      <ul className={cn("hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4", className)}>
        {packages.map((pkg) => (
          <li key={pkg.slug}>
            <PlanCard pkg={pkg} current={pkg.slug === currentSlug} />
          </li>
        ))}
      </ul>

      {/* Snap carousel below md. */}
      <div ref={emblaRef} className={cn("overflow-hidden md:hidden", className)}>
        <ul className="flex gap-4">
          {packages.map((pkg) => (
            <li key={pkg.slug} className="min-w-0 shrink-0 grow-0 basis-[80%]">
              <PlanCard pkg={pkg} current={pkg.slug === currentSlug} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function PlanCard({ pkg, current }: { pkg: PackageSummary; current: boolean }) {
  return (
    <div
      className={cn(
        "rounded-media flex flex-col gap-4 p-2 transition-colors",
        // The package you are already on gets a brass ring rather than a badge.
        current && "ring-brass/70 ring-1",
      )}
      {...(current ? { "aria-current": "page" as const } : {})}
    >
      <MembershipCard
        card={pkg.card}
        name={pkg.name}
        href={internalHref(pkg.href) ?? undefined}
        sizes="(min-width: 1024px) 300px, (min-width: 768px) 45vw, 80vw"
      />
      <Heading level={3} size="h4" className="text-mist text-center">
        {pkg.name}
      </Heading>
    </div>
  );
}
