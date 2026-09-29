import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

/** Laravel stays the system of record; every path Next.js does not own is proxied there. */
const LARAVEL_ORIGIN = process.env.LARAVEL_ORIGIN ?? "https://indexecoresort.com";
const cmsHost = new URL(LARAVEL_ORIGIN).hostname;

/** Hosts that serve CMS media today and after the CMS moves to its own subdomain. */
const mediaHosts = [...new Set(["indexecoresort.com", cmsHost])];

/**
 * `upgrade-insecure-requests` only makes sense when this deployment is actually
 * served over https, so it follows NEXT_PUBLIC_SITE_URL (https by default).
 * On a local http origin it is not just useless: WebKit applies it to
 * http://localhost and every subresource then fails TLS.
 */
const servesHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://indexecoresort.com").startsWith(
  "https://",
);

/**
 * A static CSP: pages are statically rendered and revalidated, so per-request
 * nonces (which force dynamic rendering) are not an option. 'unsafe-inline' is
 * needed for the framework's own inline scripts; 'unsafe-eval' only in dev.
 */
const contentSecurityPolicy = (isDev: boolean) =>
  [
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
    ...(servesHttps ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

const securityHeaders = (isDev: boolean) => [
  { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/**
 * Built per phase rather than from NODE_ENV: `next.config.ts` is evaluated before
 * `next start` sets NODE_ENV, so NODE_ENV would read as development in production.
 */
const buildConfig = (isDev: boolean): NextConfig => ({
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
    return [{ source: "/(.*)", headers: securityHeaders(isDev) }];
  },
  async redirects() {
    return [
      {
        // PARITY (rule 9c): the live /about_us is a separate Laravel route
        // (`who.we.are`) that returns 500 — its Blade view reads photo_one/two/three
        // off a model that has no such columns. The mobile menu links here, so the
        // evident working target is the About page. Recorded in
        // tests/parity/allowed-diffs.ts.
        source: "/about_us",
        destination: "/about-us",
        permanent: true,
      },
    ];
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
});

const config = (phase: string): NextConfig => buildConfig(phase === PHASE_DEVELOPMENT_SERVER);

export default config;
