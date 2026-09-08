import { formatPriceINR } from '../utils/currency';
import { useCompare } from '../context/CompareContext';
import StoreButton from './StoreButton';

function RatingStars({ rating }) {
  if (rating == null || Number.isNaN(Number(rating))) return null;
  const value = Number(rating);
  return (
    <span className="product-card-rating" title={`${value.toFixed(1)} / 5`}>
      ★ {value.toFixed(1)}
    </span>
  );
}

/**
 * Displays one recommended (or browsed) product: image, brand/name,
 * price, rating, why it was recommended (AI Match %), key ingredients,
 * a shopping call-to-action, and — when rendered inside a page that
 * supports it — a "Compare" checkbox. `reason`/`routine_category`/
 * `ai_suitability_score` come from the product recommendation or
 * comparison engine when shown personalized; all are optional for a
 * plain catalog browse.
 *
 * Defensive by design: a missing/malformed `product` never crashes the
 * page — it just renders nothing for that card.
 */
export default function ProductCard({ product, showCompare = true }) {
  if (!product || typeof product !== 'object' || !product.name) return null;

  const {
    name, brand, category, description, image_url, rating,
    skin_types, skin_concerns, ingredients, usage_instructions,
    sensitivity_warnings, reason, routine_category, ai_suitability_score,
    fragrance_free, sensitive_skin_friendly,
  } = product;

  const safeSkinTypes = Array.isArray(skin_types) ? skin_types : [];
  const safeConcerns = Array.isArray(skin_concerns) ? skin_concerns : [];
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
  const safeWarnings = Array.isArray(sensitivity_warnings) ? sensitivity_warnings : [];

  const priceLabel = formatPriceINR(product);
  const { isSelected, toggle } = useCompare();
  const selected = product.id != null && isSelected(product.id);

  return (
    <div className={`product-card${selected ? ' is-selected' : ''}`}>
      {image_url && (
        <div className="product-card-media">
          <img src={image_url} alt={name} loading="lazy" />
        </div>
      )}

      <div className="product-card-head">
        <div>
          {brand && <div className="product-card-brand">{brand}</div>}
          <h4>{name}</h4>
          <RatingStars rating={rating} />
        </div>
        {priceLabel && <span className="product-card-price">{priceLabel}</span>}
      </div>

      <div className="card-tag-row">
        {(routine_category || category) && <span className="badge badge-purple">{routine_category || category}</span>}
        {safeSkinTypes.map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
        {fragrance_free && <span className="badge badge-green">Fragrance-Free</span>}
        {sensitive_skin_friendly && <span className="badge badge-green">Sensitive-Skin Friendly</span>}
      </div>

      {typeof ai_suitability_score === 'number' && (
        <div className="ai-match-row">
          <div className="ai-match-track">
            <div className="ai-match-fill" style={{ width: `${ai_suitability_score}%` }} />
          </div>
          <span className="ai-match-label">AI Match: {ai_suitability_score}%</span>
        </div>
      )}

      {description && <p className="product-card-desc">{description}</p>}

      {safeConcerns.length > 0 && (
        <>
          <div className="card-mini-label">Targets</div>
          <p className="product-card-desc">{safeConcerns.join(', ')}</p>
        </>
      )}

      {safeIngredients.length > 0 && (
        <>
          <div className="card-mini-label">Key Ingredients</div>
          <p className="product-card-desc">{safeIngredients.join(', ')}</p>
        </>
      )}

      {usage_instructions && (
        <>
          <div className="card-mini-label">How to Use</div>
          <p className="product-card-desc">{usage_instructions}</p>
        </>
      )}

      {reason && <div className="product-card-reason">{reason}</div>}

      {safeWarnings.length > 0 && (
        <div className="card-warning">⚠️ Contains: {safeWarnings.join(', ')} — check against your sensitivities.</div>
      )}

      <div className="product-card-actions">
        <StoreButton product={product} />
        {showCompare && product.id != null && (
          <label className="compare-checkbox">
            <input type="checkbox" checked={selected} onChange={() => toggle(product)} />
            Compare
          </label>
        )}
      </div>
    </div>
  );
}
