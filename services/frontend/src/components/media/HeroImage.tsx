"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImgData } from "./SmartImage";

/**
 * The hero photograph, with a real fallback.
 *
 * A CMS image can be missing from storage — one package hero is, today
 * (docs/OWNER-REPORT.md §E) — and a broken <img> would make a designed page
 * look broken. Here the patterned panel is always the backdrop and the photo
 * simply covers it; if the photo fails, the panel is what remains.
 */
export function HeroImage({ image, onResolved }: { image: ImgData; onResolved?: () => void }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <>
      <Image
        src={image.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover [filter:saturate(.92)_contrast(1.02)]"
        onError={() => setFailed(true)}
        onLoad={onResolved}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(12_33_22/0.85),rgb(12_33_22/0.15)_55%,rgb(12_33_22/0.45))]"
      />
    </>
  );
}
