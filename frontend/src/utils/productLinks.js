// Field names, in priority order, that might carry a real product/shop
// link depending on where the catalog data came from. Never invents or
// constructs a URL — only ever returns a URL that was actually present
// on the product object.
const URL_FIELDS = ['product_url', 'productUrl', 'url', 'link', 'buyLink', 'purchase_url', 'website'];

function isValidHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {object} product
 * @returns {string|null} the first valid http(s) URL found on the
 *   product, checked across every known field name, or null if none is
 *   present/valid — callers should render a "Product link unavailable"
 *   state in that case, never a guessed link.
 */
export function resolveProductUrl(product) {
  if (!product) return null;
  for (const field of URL_FIELDS) {
    if (isValidHttpUrl(product[field])) return product[field];
  }
  return null;
}

// Real, safe, publicly-documented *search* endpoints for each supported
// retailer — never a guessed product page. Given only a product/brand
// name, this points the user at that retailer's own search results for
// it, which is honest about what is and isn't verified: "search on X",
// never "buy on X" when no exact URL is on file.
const STORE_SEARCH_BUILDERS = {
  Nykaa: (q) => `https://www.nykaa.com/search/result/?q=${q}`,
  Purplle: (q) => `https://www.purplle.com/search?q=${q}`,
  Amazon: (q) => `https://www.amazon.in/s?k=${q}`,
  Myntra: (q) => `https://www.myntra.com/${q.replace(/%20/g, '-')}`,
};

export const SUPPORTED_STORES = Object.keys(STORE_SEARCH_BUILDERS);

/**
 * @param {object} product
 * @param {string} [storeName] one of SUPPORTED_STORES; defaults to the
 *   product's own `store_name` field, then falls back to 'Amazon' as a
 *   generic catch-all so a search link is always constructible.
 * @returns {{store: string, url: string}|null} a safely-constructed
 *   retailer search URL, or null if there isn't even a product name to
 *   search with.
 */
export function buildStoreSearchUrl(product, storeName) {
  if (!product?.name) return null;
  const store = storeName && STORE_SEARCH_BUILDERS[storeName] ? storeName : (product.store_name || 'Amazon');
  const builder = STORE_SEARCH_BUILDERS[store] || STORE_SEARCH_BUILDERS.Amazon;
  const query = encodeURIComponent([product.brand, product.name].filter(Boolean).join(' '));
  return { store, url: builder(query) };
}
