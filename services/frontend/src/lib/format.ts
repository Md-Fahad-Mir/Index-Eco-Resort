/**
 * Display-only helpers. None of these change what the data means: raw CMS
 * strings (times like "20:51:00 - 17:54:00") are rendered as they are stored.
 */

/** Splits an event card's date into its badge parts. */
export function dateBadge(day: string, monthYear: string): { day: string; monthYear: string } {
  return { day: day.trim(), monthYear: monthYear.trim() };
}

/** "02 / 05" for carousel counters, in tabular numerals. */
export function fraction(index: number, total: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(index + 1)} / ${pad(total)}`;
}

/**
 * Splits a CMS paragraph blob into paragraphs on blank lines. Used where the
 * CMS stores plain text with line breaks rather than HTML.
 */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
