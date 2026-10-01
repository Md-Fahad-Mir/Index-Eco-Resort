import type { Metadata } from "next";
import { Jost } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { assertDataSourceIsSafe, siteUrl } from "@/config/env";
import { hasLocale, localeTags, locales } from "@/lib/i18n/config";
import { dictionaryFor } from "@/lib/i18n/dictionaries";
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

/**
 * Jost has no Bengali glyphs, so Bangla falls through to this face, stacked
 * right behind it (globals.css). Anek Bangla's Bengali subset from Google
 * Fonts, variable like Jost. Kept in the repo rather than loaded through
 * next/font/google so its face can carry `size-adjust`: Anek's letters sit
 * larger on the em than Jost's, and this brings Bangla down to sit with Latin
 * at every size, in Bangla-only and mixed lines alike. Its `unicode-range`
 * means a page with no Bangla never downloads it.
 */
const anekBangla = localFont({
  src: "../../fonts/AnekBangla-Bengali.woff2",
  variable: "--font-bangla",
  weight: "100 800",
  display: "swap",
  preload: false,
  declarations: [
    { prop: "size-adjust", value: "90%" },
    {
      prop: "unicode-range",
      value:
        "U+0951-0952, U+0964-0965, U+0980-09FE, U+1CD0, U+1CD2, U+1CD5-1CD6, U+1CD8, U+1CE1, U+1CEA, U+1CED, U+1CF2, U+1CF5-1CF7, U+200C-200D, U+20B9, U+25CC, U+A8F1",
    },
  ],
});

// Refuses a production build that would serve snapshot content as if it were
// live. Runs at module scope so the build fails rather than the request.
assertDataSourceIsSafe();

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = dictionaryFor(lang);
  return {
    // Without this, a page's relative `alternates.canonical` stays relative and
    // is not a valid canonical URL.
    metadataBase: new URL(siteUrl),
    title: meta.siteTitle,
    description: meta.siteDescription,
    openGraph: { locale: localeTags[lang].og },
  };
}

/**
 * Marks the document `data-motion="on"` before first paint, only when JS runs
 * and reduced motion is off. Midnight's entrance states are hidden only under
 * that flag (styles/midnight.css), so without JS everything is visible. If the
 * page has not hydrated within 6s — a failed bundle — the flag is withdrawn
 * and everything shows in its final state.
 */
const MOTION_FLAG = `(function(){try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.setAttribute("data-motion","on");setTimeout(function(){if(!window.__meMotionReady)d.removeAttribute("data-motion")},6000)}catch(e){}})()`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    // The flag above is set before React hydrates, hence the suppression — it
    // covers this element's own attributes only.
    <html
      lang={localeTags[lang].lang}
      className={`${jost.variable} ${anekBangla.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={lang}>
          <MotionProvider>{children}</MotionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
