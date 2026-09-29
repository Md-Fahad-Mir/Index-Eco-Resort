import type { Metadata } from "next";
import { Anek_Bangla, Tiro_Bangla } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
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
});

/** UI and body face. Variable, with the width axis used for small labels. */
const anekBangla = Anek_Bangla({
  variable: "--font-anek",
  subsets: ["bengali", "latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "INDEX Eco Resort",
  description: "INDEX Eco Resort — ownership shares, stays, dining and events.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${tiroBangla.variable} ${anekBangla.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
