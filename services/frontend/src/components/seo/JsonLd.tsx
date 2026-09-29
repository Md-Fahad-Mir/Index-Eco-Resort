/**
 * A structured-data block. The object is serialised here rather than by the
 * caller so `<` can be escaped in one place — a raw one inside a JSON string
 * would end the script element early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
