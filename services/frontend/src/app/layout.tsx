import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PreviewBar } from "@/components/layout/PreviewBar";
import { assertDataSourceIsSafe, siteUrl } from "@/config/env";
import "@/styles/globals.css";

/**
 * The one face, for display and UI alike: a Futura-style geometric sans. The
 * variable font, so every weight the components ask for is a real one.
 */
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  style: ["normal", "italic"],
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
      className={`${jost.variable} h-full antialiased`}
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
