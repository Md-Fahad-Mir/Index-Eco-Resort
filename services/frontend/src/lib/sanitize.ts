import DOMPurify from "isomorphic-dompurify";

/**
 * Allowlist sanitizer for CMS HTML (blog and event bodies). The CMS is trusted
 * but its markup is not: it contains nested <p><p>, inline styles and the
 * occasional stray tag, and it is rendered into our own layout.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "a",
  "img",
  "figure",
  "figcaption",
  "span",
  "div",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "colspan",
  "rowspan",
  "lang",
];

/** Sanitized CMS HTML, safe to pass to `<Prose>`. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Inline styles and classes from the CMS would fight the design system.
    FORBID_ATTR: ["style", "class", "id", "onerror", "onload"],
    ALLOW_DATA_ATTR: false,
  });
}
