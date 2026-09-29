import type { NextConfig } from "next";

/** Laravel stays the system of record; every path Next.js does not own is proxied there. */
const LARAVEL_ORIGIN = process.env.LARAVEL_ORIGIN ?? "https://indexecoresort.com";
const cmsHost = new URL(LARAVEL_ORIGIN).hostname;
const isDev = process.env.NODE_ENV === "development";

/** Hosts that serve CMS media today and after the CMS moves to its own subdomain. */
const mediaHosts = [...new Set(["indexecoresort.com", cmsHost])];

/**
 * A static CSP: pages are statically rendered and revalidated, so per-request
 * nonces (which force dynamic rendering) are not an option. 'unsafe-inline' is
 * needed for the framework's own inline scripts; 'unsafe-eval' only in dev.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // PARITY: demo.awaikenthemes.com hosts two images hotlinked by the CMS (audit §9.8).
  `img-src 'self' data: blob: ${mediaHosts.map((h) => `https://${h}`).join(" ")} https://i.ytimg.com https://demo.awaikenthemes.com`,
  `media-src 'self' ${mediaHosts.map((h) => `https://${h}`).join(" ")}`,
  "font-src 'self' data:",
  `connect-src 'self' https://${cmsHost}${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' https://${cmsHost}`,
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...mediaHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/public/**",
      })),
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // PARITY: two CMS images are hotlinked from a WordPress theme demo (audit §9.8).
      { protocol: "https", hostname: "demo.awaikenthemes.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // Checked after every Next.js route and static asset, just before the 404:
      // /admin, /public/storage/*, PDFs and any legacy URL keep reaching Laravel.
      fallback: [{ source: "/:path*", destination: `${LARAVEL_ORIGIN}/:path*` }],
    };
  },
};

export default nextConfig;
