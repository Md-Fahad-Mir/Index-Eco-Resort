import variants from "@/../public/media/VARIANTS.json";

/**
 * The web variants of a CMS video, derived by `pnpm media:variants`.
 *
 * The CMS stores one large original and no poster, which is no use on a phone:
 * the hero clip is 18MB and there is nothing to show while it loads. This maps
 * a source URL to the poster frame and the phone-sized encode built from it.
 */
export type VideoVariants = {
  /** The original, for wide screens. */
  src: string;
  /** Phone-sized H.264, under 4MB, no audio track. */
  mobile: string | null;
  /** A representative frame — the pre-video state, and the LCP element. */
  poster: string | null;
};

const BY_SOURCE = new Map(variants.videos.map((v) => [v.source, v]));

export function videoVariants(src: string | null | undefined): VideoVariants | null {
  if (!src) return null;
  const match = BY_SOURCE.get(src);
  // A video with no variants still plays; it simply has no poster and no
  // smaller encode, and the components fall back accordingly.
  return { src, mobile: match?.mobile ?? null, poster: match?.poster ?? null };
}

/** Below this width the phone encode is used (design-system breakpoint `md`). */
export const MOBILE_VIDEO_QUERY = "(max-width: 1023px)";
