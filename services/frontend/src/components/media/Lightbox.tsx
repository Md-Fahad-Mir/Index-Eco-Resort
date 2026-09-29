"use client";

import dynamic from "next/dynamic";
import type { ImgData } from "./SmartImage";

/** Loaded only when a visitor actually opens an image (§8 budgets). */
const YARL = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });

export type LightboxSlide = ImgData & { title?: string; description?: string };

/**
 * Full-size image view with caption, counter, keyboard and swipe. The CSS ships
 * with the library and is imported by the consumer route to keep it off pages
 * that never open a lightbox.
 */
export function Lightbox({
  slides,
  index,
  open,
  onClose,
}: {
  slides: LightboxSlide[];
  index: number;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <YARL
      open={open}
      close={onClose}
      index={index}
      slides={slides.map((s) => ({
        src: s.src,
        alt: s.alt,
        title: s.title,
        description: s.description,
      }))}
      styles={{ container: { backgroundColor: "rgb(12 33 22 / 0.94)" } }}
    />
  );
}
