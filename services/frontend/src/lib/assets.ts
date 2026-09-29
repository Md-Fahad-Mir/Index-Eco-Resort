/**
 * Resolves every media path the data layer hands us.
 *
 * Today the Phase 0 mirror lives in public/media, so a path like
 * "/media/public/storage/images/..." is served by this app. When Django serves
 * its own media, set MEDIA_BASE_URL and the same data works untouched.
 */
const MEDIA_BASE_URL = (process.env.MEDIA_BASE_URL ?? "").replace(/\/+$/, "");

/** True for URLs we must not rewrite (already absolute, data:, blob:). */
const isAbsolute = (src: string) => /^(https?:)?\/\//.test(src) || /^(data|blob):/.test(src);

/**
 * The URL to render for a CMS media path.
 *
 * Absolute URLs are returned untouched — the snapshot deliberately leaves the
 * original URL on anything it could not mirror, so those gaps stay visible
 * rather than turning into broken local paths.
 */
export function assetUrl(src: string | null | undefined): string {
  if (!src) return "";
  if (isAbsolute(src)) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return MEDIA_BASE_URL ? `${MEDIA_BASE_URL}${path}` : path;
}

/** `assetUrl` for an image object, preserving the rest of its fields. */
export function assetImage<T extends { src: string }>(image: T): T;
export function assetImage<T extends { src: string }>(image: T | null | undefined): T | null;
export function assetImage<T extends { src: string }>(image: T | null | undefined): T | null {
  if (!image) return null;
  return { ...image, src: assetUrl(image.src) };
}
