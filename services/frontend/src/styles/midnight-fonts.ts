import { Bodoni_Moda, Noto_Serif_Bengali } from "next/font/google";

/**
 * Midnight Estate's display faces (prompts/06b-home-redesign.md §2.2). Imported
 * by the Home page only, so their @font-face rules ship with that route and no
 * other page can request them.
 *
 * Neither is preloaded: `swap` renders the fallback first, and a preload would
 * compete with the hero poster for the first bytes.
 */

/**
 * Display Latin. The variable font, for its optical-size axis: with
 * `font-optical-sizing: auto` (the default) the hairlines thicken at small
 * sizes and sharpen at display sizes. next/font accepts a weight range only
 * for local fonts, so the full wght axis comes along; only 400–500 are used.
 */
export const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  preload: false,
});

/**
 * Display Bangla. It sits after Bodoni in the stack, so Latin never reaches it
 * and only its Bengali file is ever fetched.
 *
 * Weight 400 only. Asking Google for 400 and 500 together returns the whole
 * variable font — 191.5 KB for the Bengali file — while 400 alone is a 58.7 KB
 * static instance. With Bodoni's two styles (~100 KB) that is the difference
 * between breaking and keeping the 250 KB new-font budget (§7).
 */
export const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: "400",
  display: "swap",
  preload: false,
});

/**
 * The display stack's variables, declared at :root rather than on an element:
 * the chrome (header, footer, portalled dialogs) sits outside <main> and must
 * see them too. Rendered by the Home page as a hoisted <style>.
 */
export const midnightFontVars =
  `:root{--font-bodoni:${bodoniModa.style.fontFamily};` +
  `--font-noto-serif-bn:${notoSerifBengali.style.fontFamily}}`;
