"use client";

import dynamic from "next/dynamic";
import type { ImgData } from "./SmartImage";

/**
 * Loaded only when a visitor actually opens an image (§8 budgets). The view
 * module carries the library's stylesheet and its caption and counter
 * plugins, so they load with it rather than with the page.
 */
const LightboxView = dynamic(() => import("./LightboxView"), { ssr: false });

export type LightboxSlide = ImgData & { title?: string; description?: string };

/**
 * Full-size image view with caption, counter, keyboard and swipe. `tone`
 * paints the backdrop: Canopy by default, `midnight` on Home (docs/02 §13).
 */
export function Lightbox({
  slides,
  index,
  open,
  onClose,
  tone = "canopy",
}: {
  slides: LightboxSlide[];
  index: number;
  open: boolean;
  onClose: () => void;
  tone?: "canopy" | "midnight";
}) {
  if (!open) return null;
  return <LightboxView slides={slides} index={index} onClose={onClose} tone={tone} />;
}
