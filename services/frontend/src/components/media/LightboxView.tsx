"use client";

import YARL from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import type { LightboxSlide } from "./Lightbox";

/** Backdrops: Canopy's green, or Midnight's night room at 96% (docs/02 §13). */
const BACKDROP = {
  canopy: "rgb(12 33 22 / 0.94)",
  midnight: "rgb(9 18 14 / 0.96)",
} as const;

/**
 * The lightbox itself, with its stylesheet and plugins. Only ever loaded
 * through `Lightbox`'s dynamic import, so none of it — CSS included — is in a
 * page's first load: it arrives when a visitor first opens an image.
 */
export default function LightboxView({
  slides,
  index,
  onClose,
  tone,
}: {
  slides: LightboxSlide[];
  index: number;
  onClose: () => void;
  tone: keyof typeof BACKDROP;
}) {
  return (
    <YARL
      open
      close={onClose}
      index={index}
      plugins={[Captions, Counter]}
      className={tone === "midnight" ? "me-lightbox" : undefined}
      animation={{ fade: 450, swipe: 500 }}
      captions={{ descriptionTextAlign: "center", descriptionMaxLines: 2 }}
      slides={slides.map((s) => ({
        src: s.src,
        alt: s.alt,
        title: s.title,
        description: s.description,
      }))}
      styles={{ container: { backgroundColor: BACKDROP[tone] } }}
    />
  );
}
