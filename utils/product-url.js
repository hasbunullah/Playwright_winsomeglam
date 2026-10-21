export function productURLPattern(href, baseURL) {
  const url = new URL(href, baseURL);
  const match = url.pathname.match(/^(?:\/collections\/[^/]+)?\/products\/([^/]+)\/?$/);
  if (!match) throw new Error('Expected a product destination URL');
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Shopify can canonicalize a collection product URL. Keep the same origin,
  // exact product handle, and any explicitly selected variant requirement.
  const variant = url.searchParams.get('variant');
  const variantRequirement = variant ? `(?=[^#]*[?&]variant=${escape(variant)}(?:[&#]|$))` : '';
  return new RegExp(`^${escape(url.origin)}${variantRequirement}/(?:collections/[^/]+/)?products/${escape(match[1])}/?(?:\\?[^#]*)?(?:#.*)?$`);
}
