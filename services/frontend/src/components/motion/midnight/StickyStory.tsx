"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RevealGroup } from "./RevealGroup";
import { RevealItem } from "./RevealItem";
import { LARGE_UP } from "./tokens";
import { useMedia, useMotionOn } from "./useMotionOn";

/**
 * Sticky media beside a column of items, the item at the viewport's centre
 * marked active (§5.8). Native scroll: the media is `position: sticky`, and
 * an IntersectionObserver on a zero-height line through the middle of the
 * viewport picks the active item — no scroll listener, no scroll hijacking.
 *
 * Each item is rendered in a box carrying `data-active`; style it with
 * `group-data-[active=true]/story:` variants. Below 1024px, and under reduced
 * motion, every item is active: the media comes first and the items follow as
 * a staggered reveal.
 */
export function StickyStory({
  media,
  header,
  items,
  className,
}: {
  media: ReactNode;
  /** Eyebrow and heading, above the items in the text column. */
  header?: ReactNode;
  items: ReactNode[];
  className?: string;
}) {
  const on = useMotionOn();
  const large = useMedia(LARGE_UP);
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const story = on && large;

  useEffect(() => {
    if (!story) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const el of refs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [story]);

  return (
    <div
      data-story={story ? "sticky" : "stacked"}
      className={cn("flex flex-col gap-12 lg:grid lg:grid-cols-12 lg:gap-x-8", className)}
    >
      <div className="lg:col-span-6">
        <div className="lg:sticky lg:top-24 lg:h-[80vh]">{media}</div>
      </div>
      <div className="flex flex-col gap-10 lg:col-span-5 lg:col-start-8">
        {header}
        <RevealGroup as="ol" className="flex flex-col">
          {items.map((item, index) => (
            <RevealItem key={index} as="li">
              <div
                ref={(el) => {
                  refs.current[index] = el;
                }}
                data-index={index}
                data-active={!story || index === active}
                className="group/story lg:flex lg:min-h-[40vh] lg:items-center"
              >
                {item}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}
