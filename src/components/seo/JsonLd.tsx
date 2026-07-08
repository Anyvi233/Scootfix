/**
 * JsonLd — injects a JSON-LD <script> tag into the document head.
 * Invisible to users; read by search engine crawlers.
 * Safe: dangerouslySetInnerHTML is acceptable here because we control the data.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
