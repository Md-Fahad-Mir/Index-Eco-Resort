import type { MetadataRoute } from "next";
import { previewMode, usingSnapshot } from "@/config/env";
import { site } from "@/config/site";

/**
 * A preview deployment serves the content snapshot, so it is closed to crawlers
 * entirely — an indexed copy would compete with the real site. The production
 * build allows everything (the live site has no robots.txt at all today).
 */
export default function robots(): MetadataRoute.Robots {
  if (previewMode || usingSnapshot) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
