/**
 * Script detection for the bilingual CMS content. Bangla and English are mixed
 * freely — often inside one sentence — so the language is derived from the text
 * itself rather than from a CMS field (docs/02-DESIGN-SYSTEM.md §4.1).
 */

/** Bengali Unicode block. */
const BANGLA = /[ঀ-৿]/;

/** True when the string contains any Bangla character. */
export function isBangla(text: unknown): boolean {
  return typeof text === "string" && BANGLA.test(text);
}

/**
 * The `lang` attribute a node holding this text should carry, or `undefined`
 * when it is Latin-only and should inherit the document language.
 *
 * Returning `undefined` matters: writing `lang="en"` everywhere would stop
 * `:lang(bn)` inheriting into nested CMS markup.
 */
export function autoLang(text: unknown): "bn" | undefined {
  return isBangla(text) ? "bn" : undefined;
}

/** Plain text of an HTML string, used to language-tag CMS rich text. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

/** `autoLang` for a CMS HTML fragment. */
export function autoLangHtml(html: string): "bn" | undefined {
  return autoLang(stripHtml(html));
}
