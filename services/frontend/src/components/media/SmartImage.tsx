import Image from "next/image";
import { cn } from "@/lib/utils";

/** The CMS image shape from the data layer. */
export type ImgData = { src: string; alt: string; width?: number; height?: number };

/** Fixed ratios keep CMS images from shifting the layout (§7). */
export type ImageRatio =
  "hero" | "gallery" | "card" | "room" | "portrait" | "card-face" | "square" | "auto";

const RATIO_CLASS: Record<ImageRatio, string> = {
  hero: "aspect-video", // 16:9
  gallery: "aspect-3/2",
  card: "aspect-4/3",
  room: "aspect-4/3",
  portrait: "aspect-4/5",
  "card-face": "aspect-[1.586/1]", // a real payment-card face
  square: "aspect-square",
  auto: "",
};

type SmartImageProps = {
  image: ImgData | null | undefined;
  /** Required: without it every image downloads at full width (§8 budgets). */
  sizes: string;
  ratio?: ImageRatio;
  className?: string;
  /** Frame classes — the ratio box that clips the image. */
  frameClassName?: string;
  priority?: boolean;
  /** Adds the card-hover scale; the frame stays fixed (§7). */
  zoomOnHover?: boolean;
  /** Decorative images get an empty alt regardless of CMS text. */
  decorative?: boolean;
};

/**
 * Every CMS image goes through here: remote Laravel URLs, a correct `sizes`,
 * a fixed aspect box to prevent CLS, and a lichen-soft tint standing in for a
 * blur placeholder (the CMS gives us no LQIP).
 */
export function SmartImage({
  image,
  sizes,
  ratio = "auto",
  className,
  frameClassName,
  priority,
  zoomOnHover,
  decorative,
}: SmartImageProps) {
  if (!image?.src) {
    // Missing CMS media degrades to a quiet tinted box, never a broken icon.
    return <div aria-hidden className={cn("bg-lichen-soft", RATIO_CLASS[ratio], frameClassName)} />;
  }

  return (
    <div
      className={cn("bg-lichen-soft relative overflow-hidden", RATIO_CLASS[ratio], frameClassName)}
    >
      <Image
        src={image.src}
        alt={decorative ? "" : image.alt}
        fill={ratio !== "auto"}
        {...(ratio === "auto" ? { width: image.width ?? 1600, height: image.height ?? 1200 } : {})}
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover",
          zoomOnHover &&
            "transition-transform duration-[var(--dur-media)] ease-[var(--ease-out-soft)] group-hover:scale-104",
          className,
        )}
      />
    </div>
  );
}
