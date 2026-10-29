// Serializes structured data for a <script type="application/ld+json"> block.
// Plain JSON.stringify leaves "</script>" intact, so any user-supplied field (provider
// name, description, ...) could close the tag and inject markup. Escaping "<" and the
// JS line separators keeps the output valid JSON and inert inside a script element.
export function ldJson(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
