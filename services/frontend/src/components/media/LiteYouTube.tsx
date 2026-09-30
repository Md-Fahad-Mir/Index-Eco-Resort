"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDictionary, useFormatter } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * A YouTube facade (§8, §8 budgets): the poster comes from i.ytimg.com and the
 * iframe — youtube-nocookie, same video id — is only created on click. The live
 * site loads a full YouTube iframe on every package page.
 */
export function LiteYouTube({
  videoId,
  title,
  className,
}: {
  videoId: string;
  /** Names the video for screen readers; also the iframe title. */
  title: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const dict = useDictionary();
  const { t } = useFormatter();

  return (
    <div
      className={cn(
        "rounded-media bg-canopy-deep relative overflow-hidden",
        "aspect-video",
        className,
      )}
    >
      {active ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 size-full cursor-pointer"
          aria-label={t(dict.media.playVideo, { title })}
        >
          {/* ytimg serves one fixed size (480x360); next/image still re-encodes
              it and holds it to the width the layout actually uses. */}
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 40vw, 92vw"
            className="object-cover"
          />
          <span className="bg-canopy-deep/25 group-hover:bg-canopy-deep/10 absolute inset-0 transition-colors duration-[var(--dur-micro)]" />
          <span className="rounded-pill border-brass bg-canopy/70 text-mist absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center border-2 backdrop-blur-sm transition-transform duration-[var(--dur-ui)] ease-[var(--ease-out-soft)] group-hover:scale-105">
            <Play aria-hidden className="size-7 translate-x-0.5 fill-current" strokeWidth={1} />
          </span>
        </button>
      )}
    </div>
  );
}
