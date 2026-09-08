const IRRITATION_BADGE = { low: 'badge-green', medium: 'badge-amber', high: 'badge-red' };

/**
 * Displays one ingredient: what it does, who it suits, and any
 * sensitivity/irritation warning. `reason` (optional) is the
 * personalized explanation attached by getPersonalizedIngredients on the
 * backend when this card is shown inside a "for you" list; omit it for a
 * plain catalog browse.
 */
export default function IngredientCard({ ingredient, reason, verdict }) {
  if (!ingredient || typeof ingredient !== 'object' || !ingredient.name) return null;

  const {
    name, category, description, benefits = [], suitable_skin_types = [],
    suitable_concerns = [], irritation_potential, allergy_notes, usage_guidance,
  } = ingredient;

  const safeBenefits = Array.isArray(benefits) ? benefits : [];
  const safeSkinTypes = Array.isArray(suitable_skin_types) ? suitable_skin_types : [];
  const safeConcerns = Array.isArray(suitable_concerns) ? suitable_concerns : [];

  return (
    <div className="ingredient-card">
      <div className="ingredient-card-head">
        <div>
          <h4>{name}</h4>
          {category && <span className="text-soft" style={{ fontSize: 12 }}>{category}</span>}
        </div>
        {irritation_potential && (
          <span className={`badge ${IRRITATION_BADGE[irritation_potential] || 'badge-gray'}`}>
            {irritation_potential} irritation
          </span>
        )}
      </div>

      {description && <p className="ingredient-card-desc">{description}</p>}

      {safeBenefits.length > 0 && (
        <>
          <div className="card-mini-label">Benefits</div>
          <p className="ingredient-card-desc">{safeBenefits.join(' • ')}</p>
        </>
      )}

      {safeSkinTypes.length > 0 && (
        <div className="card-tag-row">
          {safeSkinTypes.map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
        </div>
      )}

      {safeConcerns.length > 0 && (
        <div className="card-tag-row">
          {safeConcerns.map((c) => <span key={c} className="badge badge-purple">{c}</span>)}
        </div>
      )}

      {usage_guidance && (
        <>
          <div className="card-mini-label">Usage</div>
          <p className="ingredient-card-desc">{usage_guidance}</p>
        </>
      )}

      {reason && (
        <div className={verdict === 'avoid' ? 'card-warning' : 'product-card-reason'}>
          {reason}
        </div>
      )}

      {!reason && allergy_notes && (
        <div className="card-warning">⚠️ {allergy_notes}</div>
      )}
    </div>
  );
}
