import type { Metadata } from "next";
import { Anek_Bangla, Tiro_Bangla } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PreviewBar } from "@/components/layout/PreviewBar";
import { assertDataSourceIsSafe, siteUrl } from "@/config/env";
import "@/styles/globals.css";

/**
 * Display face. A true bilingual serif — Bangla and Latin were designed
 * together, so a mixed heading keeps one voice. One weight, by design.
 */
const tiroBangla = Tiro_Bangla({
  variable: "--font-tiro",
  subsets: ["bengali", "latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  // The Bengali subsets are large (350KB across both faces) and preloading
  // them competes with first paint. `swap` already renders in the fallback
  // first, so they are fetched when the CSS asks for them instead.
  preload: false,
});

/**
 * UI and body face.
 *
 * The design system also calls for the `wdth` axis at 110 on small labels, but
 * carrying that axis across the Bengali range costs 284KB on its own (440KB vs
 * 156KB) — a third of the page's transfer for an effect few would name. Dropped
 * in favour of the mobile performance budget; noted in docs/PROGRESS.md.
 */
const anekBangla = Anek_Bangla({
  variable: "--font-anek",
  subsets: ["bengali", "latin"],
  display: "swap",
  preload: false,
});

// Refuses a production build that would serve snapshot content as if it were
// live. Runs at module scope so the build fails rather than the request.
assertDataSourceIsSafe();

export const metadata: Metadata = {
  // Without this, a page's relative `alternates.canonical` stays relative and
  // is not a valid canonical URL.
  metadataBase: new URL(siteUrl),
  title: "INDEX Eco Resort",
  description: "INDEX Eco Resort — ownership shares, stays, dining and events.",
};

/**
 * Marks the document `data-motion="on"` before first paint, only when JS runs
 * and reduced motion is off. Midnight's entrance states are hidden only under
 * that flag (styles/midnight.css), so without JS everything is visible. If the
 * page has not hydrated within 6s — a failed bundle — the flag is withdrawn
 * and everything shows in its final state.
 */
const MOTION_FLAG = `(function(){try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.setAttribute("data-motion","on");setTimeout(function(){if(!window.__meMotionReady)d.removeAttribute("data-motion")},6000)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The flag above is set before React hydrates, hence the suppression — it
    // covers this element's own attributes only.
    <html
      lang="en"
      className={`${tiroBangla.variable} ${anekBangla.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body className="flex min-h-full flex-col">
        <PreviewBar />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
