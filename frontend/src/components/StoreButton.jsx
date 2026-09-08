import { resolveProductUrl, buildStoreSearchUrl } from '../utils/productLinks';

/**
 * Renders the correct shopping call-to-action for a product, and only
 * that: a real stored product_url -> "Buy Now" / "View on <Store>"
 * opening that exact page; otherwise a safely-constructed retailer
 * search link -> "Search on <Store>". Never fabricates a product page.
 * Opens in a new tab so the AI Skincare Planner stays open per spec.
 */
export default function StoreButton({ product, size = 'sm', fullWidth = true }) {
  if (!product) return null;
  const productUrl = resolveProductUrl(product);
  const widthClass = fullWidth ? 'store-btn-full' : '';

  if (productUrl) {
    const label = product.store_name ? `Buy on ${product.store_name}` : 'View Product';
    return (
      <a
        className={`btn btn-primary btn-${size} ${widthClass}`}
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {label} ↗
      </a>
    );
  }

  const fallback = buildStoreSearchUrl(product);
  if (!fallback) {
    return (
      <span className={`btn btn-outline btn-${size} btn-disabled ${widthClass}`} aria-disabled="true">
        Store link unavailable
      </span>
    );
  }

  return (
    <a
      className={`btn btn-outline btn-${size} ${widthClass}`}
      href={fallback.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title="Exact product page not verified — opens a search on the retailer's site instead."
    >
      Search on {fallback.store} ↗
    </a>
  );
}
