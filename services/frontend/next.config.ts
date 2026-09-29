import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

/**
 * The frontend is self-contained: it serves the Phase 0 snapshot from
 * public/media and src/fixtures. A Django backend replaces the data source
 * later; nothing here is specific to the old Laravel site.
 */

/** Empty = serve public/media from this origin. Later: Django's media origin. */
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL ?? "";

/**
 * Opt-in only. When set, any path Next.js does not own is proxied here — for a
 * transitional deployment where the old site still answers /admin and legacy
 * URLs. Unset by default: the frontend needs no other origin.
 */
const LEGACY_ORIGIN = process.env.LEGACY_ORIGIN ?? "";

/**
 * `upgrade-insecure-requests` only makes sense when this deployment is actually
 * served over https, so it follows NEXT_PUBLIC_SITE_URL (https by default).
 * On a local http origin it is not just useless: WebKit applies it to
 * http://localhost and every subresource then fails TLS.
 */
const servesHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://indexecoresort.com").startsWith(
  "https://",
);

/** Hosts we load media or embeds from, for CSP and next/image. */
const extraOrigins = [MEDIA_BASE_URL, LEGACY_ORIGIN]
  .filter(Boolean)
  .map((value) => new URL(value).origin);

const contentSecurityPolicy = (isDev: boolean) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // PARITY: two CMS images are hotlinked from a WordPress theme demo (audit §9.8).
    `img-src 'self' data: blob: https://i.ytimg.com https://demo.awaikenthemes.com ${extraOrigins.join(" ")}`.trim(),
    `media-src 'self' ${extraOrigins.join(" ")}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: wss:" : ""} ${extraOrigins.join(" ")}`.trim(),
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(servesHttps ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

/**
 * A preview serves snapshot content, so it must never reach a search index —
 * duplicate, out-of-date copies of the real site would compete with it.
 * Paired with a disallow-all robots.txt in app/robots.ts.
 */
const previewMode = process.env.PREVIEW_MODE === "true";

const securityHeaders = (isDev: boolean) => [
  { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
  ...(previewMode ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
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
      ...(MEDIA_BASE_URL
        ? [
            {
              protocol: new URL(MEDIA_BASE_URL).protocol.replace(":", "") as "https" | "http",
              hostname: new URL(MEDIA_BASE_URL).hostname,
            },
          ]
        : []),
      { protocol: "https" as const, hostname: "i.ytimg.com", pathname: "/vi/**" },
      // PARITY: the CMS hotlinks two images from a theme demo (audit §9.8).
      { protocol: "https" as const, hostname: "demo.awaikenthemes.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders(isDev) }];
  },
  async redirects() {
    return [
      {
        // PARITY (rule 9c): the live /about_us is a separate route that returns
        // 500 — its template reads photo_one/two/three off a model with no such
        // columns. The mobile menu links here, so the evident working target is
        // the About page. Recorded in tests/parity/allowed-diffs.ts.
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
      // Opt-in: only when LEGACY_ORIGIN is set does anything leave this app.
      fallback: LEGACY_ORIGIN
        ? [{ source: "/:path*", destination: `${LEGACY_ORIGIN}/:path*` }]
        : [],
    };
  },
});

const config = (phase: string): NextConfig => buildConfig(phase === PHASE_DEVELOPMENT_SERVER);

export default config;
