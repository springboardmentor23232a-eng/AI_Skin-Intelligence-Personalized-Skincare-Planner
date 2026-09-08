import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useCompare } from '../context/CompareContext';
import { formatPriceINR } from '../utils/currency';
import StoreButton from './StoreButton';
import { Loading } from './Shared';

function Cell({ children }) {
  return <td>{children ?? <span className="text-soft">—</span>}</td>;
}

function YesNo({ value }) {
  if (value == null) return <span className="text-soft">—</span>;
  return value
    ? <span className="badge badge-green">Yes</span>
    : <span className="badge badge-gray">No</span>;
}

/**
 * Professional side-by-side Product Comparison modal.
 *
 * Always fetches GET /api/products/compare?ids=... on open — the AI
 * Suitability Score, "Best Match for You" flag, and every other
 * comparison field come straight from the backend (backend/src/services/
 * productRecommendation.js:scoreProductForUser), which is also what
 * powers the "AI Match %" shown on recommendation cards, so the two
 * never disagree. Never computes or guesses a score client-side.
 */
export default function ProductComparison() {
  const { selected, modalOpen, closeModal } = useCompare();
  const [state, setState] = useState({ status: 'idle', comparison: [], error: '' });

  useEffect(() => {
    if (!modalOpen) return;
    if (selected.length < 2) {
      setState({ status: 'error', comparison: [], error: 'Select at least 2 products to compare.' });
      return;
    }
    setState({ status: 'loading', comparison: [], error: '' });
    const ids = selected.map((p) => p.id).join(',');
    api.get(`/products/compare?ids=${ids}`)
      .then(({ data }) => setState({ status: 'ready', comparison: Array.isArray(data?.comparison) ? data.comparison : [], error: '' }))
      .catch((err) => setState({
        status: 'error',
        comparison: [],
        error: err.response?.data?.message || 'Unable to load the comparison right now. Please try again.',
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, selected.length]);

  if (!modalOpen) return null;

  const { status, comparison, error } = state;

  return (
    <div className="compare-modal-overlay" onClick={closeModal}>
      <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-head">
          <h3>Product Comparison</h3>
          <button className="btn btn-outline btn-sm" type="button" onClick={closeModal}>Close</button>
        </div>

        {status === 'loading' && <Loading label="Comparing products..." />}

        {status === 'error' && <div className="alert alert-error">{error}</div>}

        {status === 'ready' && comparison.length > 0 && (
          <div className="compare-table-wrap">
            <table className="compare-table">
              <tbody>
                <tr className="compare-row-image">
                  <th>&nbsp;</th>
                  {comparison.map((p) => (
                    <Cell key={p.id}>
                      {p.best_match && <div className="best-match-flag">★ BEST MATCH FOR YOU</div>}
                      {p.image_url && <img src={p.image_url} alt={p.name} className="compare-product-image" />}
                      <div className="compare-product-name">{p.name}</div>
                      {p.brand && <div className="text-soft" style={{ fontSize: 12 }}>{p.brand}</div>}
                    </Cell>
                  ))}
                </tr>

                <tr>
                  <th>AI Suitability</th>
                  {comparison.map((p) => (
                    <Cell key={p.id}>
                      <strong className={p.allergy_conflict ? 'text-danger' : ''}>{p.ai_suitability_score}/100</strong>
                    </Cell>
                  ))}
                </tr>
                <tr>
                  <th>Best For</th>
                  {comparison.map((p) => <Cell key={p.id}>{p.best_for}</Cell>)}
                </tr>
                <tr>
                  <th>Key Benefit</th>
                  {comparison.map((p) => <Cell key={p.id}>{p.key_benefit}</Cell>)}
                </tr>
                <tr>
                  <th>Potential Concern</th>
                  {comparison.map((p) => (
                    <Cell key={p.id}>
                      <span className={p.allergy_conflict ? 'text-danger' : ''}>{p.potential_concern}</span>
                    </Cell>
                  ))}
                </tr>

                <tr><th colSpan={comparison.length + 1} className="compare-section-label">Product Details</th></tr>
                <tr>
                  <th>Price</th>
                  {comparison.map((p) => <Cell key={p.id}>{formatPriceINR(p)}</Cell>)}
                </tr>
                <tr>
                  <th>Category</th>
                  {comparison.map((p) => <Cell key={p.id}>{p.category}</Cell>)}
                </tr>
                <tr>
                  <th>Rating</th>
                  {comparison.map((p) => <Cell key={p.id}>{p.rating != null ? `★ ${Number(p.rating).toFixed(1)}` : null}</Cell>)}
                </tr>
                <tr>
                  <th>Skin Type Suitability</th>
                  {comparison.map((p) => (
                    <Cell key={p.id}>{Array.isArray(p.skin_types) && p.skin_types.length ? p.skin_types.join(', ') : 'All skin types'}</Cell>
                  ))}
                </tr>
                <tr>
                  <th>Skin Concerns</th>
                  {comparison.map((p) => (
                    <Cell key={p.id}>{Array.isArray(p.skin_concerns) && p.skin_concerns.length ? p.skin_concerns.join(', ') : null}</Cell>
                  ))}
                </tr>
                <tr>
                  <th>Key Ingredients</th>
                  {comparison.map((p) => (
                    <Cell key={p.id}>{Array.isArray(p.ingredients) && p.ingredients.length ? p.ingredients.join(', ') : null}</Cell>
                  ))}
                </tr>
                <tr>
                  <th>Ingredients to Watch</th>
                  {comparison.map((p) => (
                    <Cell key={p.id}>{Array.isArray(p.sensitivity_warnings) && p.sensitivity_warnings.length ? p.sensitivity_warnings.join(', ') : 'None flagged'}</Cell>
                  ))}
                </tr>
                <tr>
                  <th>Fragrance-Free</th>
                  {comparison.map((p) => <Cell key={p.id}><YesNo value={p.fragrance_free} /></Cell>)}
                </tr>
                <tr>
                  <th>Sensitive-Skin Friendly</th>
                  {comparison.map((p) => <Cell key={p.id}><YesNo value={p.sensitive_skin_friendly} /></Cell>)}
                </tr>
                <tr>
                  <th>Store</th>
                  {comparison.map((p) => <Cell key={p.id}>{p.store_name || 'Not specified'}</Cell>)}
                </tr>
                <tr>
                  <th>&nbsp;</th>
                  {comparison.map((p) => (
                    <Cell key={p.id}><StoreButton product={p} /></Cell>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
