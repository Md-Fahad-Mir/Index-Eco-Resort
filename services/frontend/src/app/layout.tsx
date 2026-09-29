import type { Metadata } from "next";
import { Anek_Bangla, Tiro_Bangla } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PreviewBar } from "@/components/layout/PreviewBar";
import { assertDataSourceIsSafe } from "@/config/env";
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
  title: "INDEX Eco Resort",
  description: "INDEX Eco Resort — ownership shares, stays, dining and events.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${tiroBangla.variable} ${anekBangla.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <PreviewBar />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
