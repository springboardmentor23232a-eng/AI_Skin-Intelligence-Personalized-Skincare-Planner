import { useEffect, useState } from 'react';
import api from '../../api/axios';
import ProductRecommendationsSection from '../../components/ProductRecommendationsSection';
import ProductCard from '../../components/ProductCard';
import IngredientCard from '../../components/IngredientCard';
import { Loading, Empty } from '../../components/Shared';

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
const CATEGORIES = ['Active', 'Antioxidant', 'Emollient', 'Exfoliant', 'Humectant', 'Soothing Agent', 'Sunscreen Filter', 'Surfactant', 'Treatment', 'Additive'];
const PRODUCT_CATEGORIES = ['Cleansing', 'Toner', 'Exfoliation', 'Treatment', 'Moisturizing', 'Sun Protection', 'Night Care'];

/**
 * Personalized Ingredient Recommendations: Suitable / Avoid / Caution.
 * Fetches independently of ProductRecommendationsSection above it, so a
 * failure here never blanks the product recommendations (or vice versa).
 */
function PersonalizedIngredientsSection() {
  const [insights, setInsights] = useState(undefined); // undefined = loading, null = error, object = loaded
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/ingredients/for-me')
      .then(({ data }) => setInsights(data && typeof data === 'object' ? data : {}))
      .catch((err) => {
        setInsights(null);
        setError(err.response?.data?.message || 'Could not load your personalized ingredient insights right now.');
      });
  }, []);

  if (insights === undefined) {
    return (
      <div className="card plan-section">
        <h3 style={{ marginTop: 0 }}>Personalized Ingredient Recommendations</h3>
        <Loading />
      </div>
    );
  }

  if (insights === null) {
    return (
      <div className="card plan-section">
        <h3 style={{ marginTop: 0 }}>Personalized Ingredient Recommendations</h3>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const profile = insights.profile && typeof insights.profile === 'object' ? insights.profile : {};
  const hasProfile = profile.skin_type || (Array.isArray(profile.concerns) && profile.concerns.length > 0);

  if (!hasProfile) {
    return (
      <div className="card plan-section">
        <h3 style={{ marginTop: 0 }}>Personalized Ingredient Recommendations</h3>
        <Empty label="Complete a skin assessment (and optionally set your allergies/preferences) to see personalized ingredient guidance here." />
      </div>
    );
  }

  const suitable = Array.isArray(insights.suitable) ? insights.suitable : [];
  const avoid = Array.isArray(insights.avoid) ? insights.avoid : [];
  const caution = Array.isArray(insights.caution) ? insights.caution : [];

  return (
    <>
      <div className="card plan-section">
        <h3 style={{ marginTop: 0 }}>Personalized Ingredient Recommendations</h3>
        <p className="text-muted" style={{ fontSize: 13.5, marginTop: -6 }}>
          Based on your skin type{profile.skin_type ? ` (${profile.skin_type})` : ''}, concerns, and any saved allergies/sensitivities.
        </p>
      </div>

      <div className="card plan-section">
        <h3 style={{ marginTop: 0 }}>Suitable Ingredients</h3>
        {suitable.length > 0 ? (
          <div className="card-grid">
            {suitable.map((i, idx) => <IngredientCard key={i?.id ?? idx} ingredient={i} reason={i?.reason} verdict="suitable" />)}
          </div>
        ) : (
          <Empty label="No suitable ingredients identified yet." />
        )}
      </div>

      {avoid.length > 0 && (
        <div className="card plan-section">
          <h3 style={{ marginTop: 0 }}>Ingredients to Avoid</h3>
          <p className="text-muted" style={{ fontSize: 13.5, marginTop: -6 }}>Flagged against your saved allergies/sensitivities.</p>
          <div className="card-grid">
            {avoid.map((i, idx) => <IngredientCard key={i?.id ?? idx} ingredient={i} reason={i?.reason} verdict="avoid" />)}
          </div>
        </div>
      )}

      {caution.length > 0 && (
        <div className="card plan-section">
          <h3 style={{ marginTop: 0 }}>Use With Caution</h3>
          <div className="card-grid">
            {caution.map((i, idx) => <IngredientCard key={i?.id ?? idx} ingredient={i} reason={i?.reason} verdict="caution" />)}
          </div>
        </div>
      )}
    </>
  );
}

function ForYouTab() {
  return (
    <div>
      <ProductRecommendationsSection />
      <PersonalizedIngredientsSection />
    </div>
  );
}

function BrowseTab() {
  const [ingredients, setIngredients] = useState(undefined); // undefined = loading, null = error
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [skinType, setSkinType] = useState('');
  const [category, setCategory] = useState('');

  const load = () => {
    setIngredients(undefined);
    setError('');
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (skinType) params.set('skinType', skinType);
    if (category) params.set('category', category);
    api.get(`/ingredients?${params.toString()}`)
      .then(({ data }) => setIngredients(Array.isArray(data?.ingredients) ? data.ingredients : []))
      .catch((err) => {
        setIngredients(null);
        setError(err.response?.data?.message || 'Could not load ingredients right now.');
      });
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const submit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div>
      <form className="catalog-toolbar" onSubmit={submit}>
        <input type="text" placeholder="Search ingredients..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={skinType} onChange={(e) => setSkinType(e.target.value)}>
          <option value="">All Skin Types</option>
          {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" type="submit">Search</button>
      </form>

      {ingredients === undefined ? (
        <Loading />
      ) : ingredients === null ? (
        <div className="alert alert-error">{error}</div>
      ) : ingredients.length === 0 ? (
        <Empty label="No ingredients match your search." />
      ) : (
        <div className="card-grid">
          {ingredients.map((i, idx) => <IngredientCard key={i?.id ?? idx} ingredient={i} />)}
        </div>
      )}
    </div>
  );
}

function BrowseProductsTab() {
  const [products, setProducts] = useState(undefined); // undefined = loading, null = error
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [skinType, setSkinType] = useState('');
  const [category, setCategory] = useState('');

  const load = () => {
    setProducts(undefined);
    setError('');
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (skinType) params.set('skinType', skinType);
    if (category) params.set('category', category);
    api.get(`/products?${params.toString()}`)
      .then(({ data }) => setProducts(Array.isArray(data?.products) ? data.products : []))
      .catch((err) => {
        setProducts(null);
        setError(err.response?.data?.message || 'Unable to load products. Please try again.');
      });
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const submit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div>
      <form className="catalog-toolbar" onSubmit={submit}>
        <input type="text" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={skinType} onChange={(e) => setSkinType(e.target.value)}>
          <option value="">All Skin Types</option>
          {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" type="submit">Search</button>
      </form>

      {products === undefined ? (
        <Loading />
      ) : products === null ? (
        <div className="alert alert-error">{error}</div>
      ) : products.length === 0 ? (
        <Empty label="No products match your search." />
      ) : (
        <div className="card-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: 'for-you', label: 'For You' },
  { key: 'browse-products', label: 'Browse All Products' },
  { key: 'browse', label: 'Browse All Ingredients' },
];

export default function IngredientsProducts() {
  const [tab, setTab] = useState('for-you');

  return (
    <div>
      <div className="plan-toolbar">
        <div>
          <h3 style={{ margin: 0 }}>Ingredients &amp; Products</h3>
          <p className="text-muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
            Explore personalized ingredient intelligence and skincare products recommended for your skin.
            Select up to 4 products anywhere on this page to compare them side-by-side.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`btn ${tab === t.key ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'for-you' && <ForYouTab />}
      {tab === 'browse-products' && <BrowseProductsTab />}
      {tab === 'browse' && <BrowseTab />}
    </div>
  );
}
