import { getDictionary } from "@/lib/i18n/server";

/** Keyboard users reach the content without walking the whole header (§11). */
export async function SkipLink() {
  const dict = await getDictionary();
  return (
    <a
      href="#main"
      className="bg-paper text-ink rounded-btn text-small sr-only z-100 px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {dict.chrome.skipToContent}
    </a>
  );
}
