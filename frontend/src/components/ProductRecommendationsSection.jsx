import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from './ProductCard';
import { Loading, Empty } from './Shared';

/**
 * The "Product Recommendations" block, shared verbatim between the
 * Skincare Plan tab and the Ingredients & Products page so there is
 * exactly one implementation of this feature.
 *
 * Two modes:
 *  - `recommendations` prop provided (SkincarePlan already has the
 *    latest plan in state) → renders directly, no extra network call.
 *  - `recommendations` prop omitted → self-fetches the latest plan from
 *    GET /api/skincare-plan (the same endpoint/response shape
 *    SkincarePlan.jsx itself uses) and reads
 *    `plan.product_recommendations` from it.
 *
 * A failed self-fetch shows an inline error, never a blank page, and
 * never blocks anything else on the page from rendering.
 */
export default function ProductRecommendationsSection({
  recommendations: providedRecommendations,
  title = 'Product Recommendations',
  description = "Matched to your skin type, concerns, and current routine — never a product that conflicts with a declared allergy.",
}) {
  const shouldSelfFetch = providedRecommendations === undefined;
  const [fetched, setFetched] = useState(undefined); // undefined = loading, [] = loaded/empty
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shouldSelfFetch) return;
    api.get('/skincare-plan')
      .then(({ data }) => setFetched(Array.isArray(data?.plan?.product_recommendations) ? data.plan.product_recommendations : []))
      .catch((err) => {
        setFetched([]);
        setError(err.response?.data?.message || 'Could not load your product recommendations right now.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shouldSelfFetch && fetched === undefined) {
    return (
      <div className="card plan-section">
        <div className="routine-card-head">
          <span className="routine-icon">🛍️</span>
          <h3>{title}</h3>
        </div>
        <Loading />
      </div>
    );
  }

  const list = Array.isArray(shouldSelfFetch ? fetched : providedRecommendations)
    ? (shouldSelfFetch ? fetched : providedRecommendations)
    : [];

  if (!shouldSelfFetch && list.length === 0 && !error) return null;

  return (
    <div className="card plan-section">
      <div className="routine-card-head">
        <span className="routine-icon">🛍️</span>
        <h3>{title}</h3>
      </div>
      {description && <p className="text-muted" style={{ fontSize: 13, marginTop: -6 }}>{description}</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {list.length > 0 ? (
        <div className="card-grid">
          {list.map((p, idx) => (
            <ProductCard key={p?.recommendation_id ?? p?.id ?? idx} product={p} />
          ))}
        </div>
      ) : (
        !error && <Empty label="No product recommendations yet — generate your skincare plan first." />
      )}
    </div>
  );
}
