import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PRODUCT_CATEGORIES, API_BASE_URL } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Scale,
  RefreshCw,
  X,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function ProductsPage() {
  const { fetchWithAuth } = useAuth();

  // State Management for Module 6 Features
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState('match_score');

  const [products, setProducts] = useState([]);
  const [userProfileSummary, setUserProfileSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comparison State
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Alternative Products State
  const [activeAlternativesProduct, setActiveAlternativesProduct] = useState(null);
  const [alternativesList, setAlternativesList] = useState([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);

  // Expanded details toggle per product card ID
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Fetch Personalized Recommendations from Backend API
  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        category: selectedCategory,
        max_price: maxPrice,
        sort_by: sortBy,
      });

      const response = await fetchWithAuth(`${API_BASE_URL}/products/recommendations?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to load recommendations (HTTP ${response.status})`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      setUserProfileSummary(data.user_profile_summary || null);
    } catch (err) {
      console.error('Error fetching product recommendations:', err);
      setError(err.message || 'Unable to load personalized product recommendations.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, maxPrice, sortBy, fetchWithAuth]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Toggle selection for comparison (Max 4 products)
  const toggleCompareSelection = (productId) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 products at a time.');
        return prev;
      }
      return [...prev, productId];
    });
  };

  // Open Product Comparison Modal
  const handleOpenComparison = async () => {
    if (selectedCompareIds.length < 2) {
      alert('Please select at least 2 products to compare.');
      return;
    }
    setIsCompareModalOpen(true);
    setCompareLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/products/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: selectedCompareIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate comparison data');
      }

      const data = await response.json();
      setComparisonData(data.comparison || null);
    } catch (err) {
      console.error('Error fetching product comparison:', err);
      alert('Unable to load product comparison.');
    } finally {
      setCompareLoading(false);
    }
  };

  // Fetch Alternative Product Suggestions
  const handleViewAlternatives = async (product) => {
    setActiveAlternativesProduct(product);
    setAlternativesLoading(true);
    setAlternativesList([]);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/products/${product.id}/alternatives?max_price=${maxPrice}`);

      if (!response.ok) {
        throw new Error('Failed to load alternative products');
      }

      const data = await response.json();
      setAlternativesList(data.alternatives || []);
    } catch (err) {
      console.error('Error fetching alternatives:', err);
    } finally {
      setAlternativesLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Product Recommendation</h1>
            
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Personalized product suitability scoring, allergy conflict detection, price filtering & side-by-side comparisons.
          </p>
        </div>

        {/* Action Bar for Comparison */}
        {selectedCompareIds.length > 0 && (
          <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/30 p-2.5 rounded-xl animate-fade-in">
            <span className="text-xs font-semibold text-emerald-300">
              {selectedCompareIds.length} Selected for Compare
            </span>
            <Button size="sm" onClick={handleOpenComparison} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold">
              <Scale className="w-3.5 h-3.5 mr-1.5" />
              Compare Now
            </Button>
            <button
              onClick={() => setSelectedCompareIds([])}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* User Assessment Summary Bar */}
      {userProfileSummary && (
        <GlassCard className="p-4 bg-slate-900/60 border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Matched Assessment Profile</span>
              <span className="text-sm font-bold text-white">
                {userProfileSummary.skin_type} Skin • {userProfileSummary.sensitivity} Sensitivity
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {userProfileSummary.concerns && userProfileSummary.concerns.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 mr-1">Concerns:</span>
                {userProfileSummary.concerns.map((c) => (
                  <Badge key={c} variant="cyan" className="text-[10px]">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
            {userProfileSummary.allergies && userProfileSummary.allergies.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 mr-1">Allergies:</span>
                {userProfileSummary.allergies.map((a) => (
                  <Badge key={a} variant="rose" className="text-[10px]">
                    ⚠️ {a}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Controls & Filter Toolbar */}
      <GlassCard className="p-4 space-y-4">
        {/* Category Tabs */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
            Product Category ({PRODUCT_CATEGORIES.length} Categories)
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              All Categories
            </button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Slider & Sorting Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Budget Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Budget Filter (Max Price):
              </span>
              <span className="font-bold text-emerald-400 text-sm">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="400"
              max="3000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹400</span>
              <span>₹1,500</span>
              <span>₹3,000+</span>
            </div>
          </div>

          {/* Sort Control */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              Sort Recommendations By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="match_score">Highest Suitability Match Score</option>
              <option value="price_low_to_high">Price: Low to High</option>
              <option value="price_high_to_low">Price: High to Low</option>
              <option value="rating">Community Rating</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <GlassCard key={n} className="p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-1/3"></div>
              <div className="h-6 bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-800 rounded w-1/2"></div>
              <div className="h-10 bg-slate-800 rounded"></div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <GlassCard className="p-6 bg-rose-950/30 border-rose-500/30 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Error Loading Products</h3>
          <p className="text-xs text-rose-300">{error}</p>
          <Button size="sm" onClick={loadRecommendations} className="bg-rose-500 hover:bg-rose-600 text-white font-bold">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry
          </Button>
        </GlassCard>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <GlassCard className="p-12 text-center space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Products Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No products match your current budget filter (₹{maxPrice.toLocaleString('en-IN')}) or category filter ({selectedCategory}). Try increasing your budget or selecting 'All Categories'.
          </p>
          <Button size="sm" onClick={() => { setSelectedCategory('All'); setMaxPrice(3000); }}>
            Reset Filters
          </Button>
        </GlassCard>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((prod) => {
            const isSelectedForCompare = selectedCompareIds.includes(prod.id);
            const isExpanded = expandedCardId === prod.id;

            return (
              <GlassCard
                key={prod.id}
                glow={prod.match_score >= 85}
                className={`space-y-4 flex flex-col justify-between transition-all ${
                  !prod.is_suitable ? 'border-rose-500/40 bg-rose-950/10' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Suitability Match Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="cyan" className="mb-1">
                        {prod.category}
                      </Badge>
                      <span className="text-[10px] text-slate-400 block font-medium">{prod.brand}</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{prod.name}</h3>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right">
                      {prod.match_score >= 85 ? (
                        <Badge variant="emerald" className="font-extrabold text-xs">
                          {prod.match_score}% Match
                        </Badge>
                      ) : prod.match_score >= 60 ? (
                        <Badge variant="cyan" className="font-extrabold text-xs">
                          {prod.match_score}% Match
                        </Badge>
                      ) : (
                        <Badge variant="rose" className="font-extrabold text-xs">
                          {prod.match_score}% Unsuitable
                        </Badge>
                      )}
                      <span className="text-[10px] font-semibold text-slate-400 block mt-1">{prod.status}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{prod.description}</p>

                  {/* Target Concerns & Actives */}
                  <div className="text-xs space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 font-medium">Target Concerns:</span>{' '}
                      <span className="text-slate-200">{prod.target_concerns?.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Key Actives:</span>{' '}
                      <span className="text-emerald-400 font-semibold">{prod.key_ingredients?.join(', ')}</span>
                    </div>
                  </div>

                  {/* Match Reasons & Conflict Details (Expandable) */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setExpandedCardId(isExpanded ? null : prod.id)}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      {isExpanded ? 'Hide Match Analysis' : 'Why it matches your skin profile'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs animate-fade-in">
                        {prod.match_reasons && prod.match_reasons.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-semibold text-emerald-300 text-[11px] block">Suitability Pros:</span>
                            {prod.match_reasons.map((reason, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {prod.conflicts && prod.conflicts.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-slate-800">
                            <span className="font-semibold text-rose-400 text-[11px] block">Safety Warnings & Conflicts:</span>
                            {prod.conflicts.map((conflict, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-rose-300 text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                <span>{conflict}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Price, Compare Toggle, Alternatives & Action */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-white">₹{prod.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({prod.rating} ★)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Compare Checkbox Button */}
                      <button
                        onClick={() => toggleCompareSelection(prod.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                          isSelectedForCompare
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        <Scale className="w-3 h-3" />
                        {isSelectedForCompare ? 'Selected' : 'Compare'}
                      </button>

                      {/* Alternatives Button */}
                      {prod.alternative_suggestions && prod.alternative_suggestions.length > 0 && (
                        <button
                          onClick={() => handleViewAlternatives(prod)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
                        >
                          Alternatives ({prod.alternative_suggestions.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Product Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-400" />
                  Side-by-Side Product Comparison
                </h2>
                <p className="text-xs text-slate-400">Comparing selected products against your personal skin profile</p>
              </div>
              <button onClick={() => setIsCompareModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {compareLoading ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Calculating comparative suitability scores...</p>
              </div>
            ) : comparisonData && comparisonData.products ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 text-slate-400 font-semibold w-1/5">Metric</th>
                      {comparisonData.products.map((p) => (
                        <th key={p.id} className="p-3 font-bold text-white text-sm">
                          {p.name}
                          <span className="block text-[10px] font-normal text-slate-400">{p.brand}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Category</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3 font-medium text-cyan-400">{p.category}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Price</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3 font-bold text-white">₹{p.price.toLocaleString('en-IN')}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Suitability Match</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3">
                          <Badge variant={p.match_score >= 85 ? 'emerald' : p.match_score >= 60 ? 'cyan' : 'rose'}>
                            {p.match_score}% {p.status}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Key Actives</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3 text-emerald-400 font-medium">
                          {p.key_ingredients?.join(', ')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Target Concerns</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3 text-slate-300">
                          {p.target_concerns?.join(', ')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">Safety & Warnings</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3 text-xs">
                          {p.conflicts && p.conflicts.length > 0 ? (
                            <span className="text-rose-400 font-semibold">{p.conflicts[0]}</span>
                          ) : (
                            <span className="text-emerald-400 font-semibold">✓ Safe for skin profile</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button size="sm" onClick={() => setIsCompareModalOpen(false)}>
                Close Comparison
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Suggestions Drawer/Modal */}
      {activeAlternativesProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Better Alternative Suggestions
                </h2>
                <p className="text-xs text-slate-400">
                  Alternatives for <span className="text-white font-semibold">{activeAlternativesProduct.name}</span>
                </p>
              </div>
              <button onClick={() => setActiveAlternativesProduct(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {alternativesLoading ? (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Finding higher-scoring or lower-priced alternatives...</p>
              </div>
            ) : alternativesList.length > 0 ? (
              <div className="space-y-4">
                {alternativesList.map((alt) => (
                  <GlassCard key={alt.id} glow className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="cyan" className="mb-1">
                          {alt.reason_for_alternative}
                        </Badge>
                        <h4 className="text-sm font-bold text-white">{alt.name}</h4>
                        <span className="text-xs text-slate-400">{alt.brand}</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="emerald" className="font-extrabold text-xs">
                          {alt.match_score}% Match
                        </Badge>
                        <span className="text-sm font-bold text-white block mt-1">₹{alt.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-400">Key Actives:</span>{' '}
                      <span className="text-emerald-400 font-semibold">{alt.key_ingredients?.join(', ')}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No alternative suggestions found for this category and budget.</p>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button size="sm" onClick={() => setActiveAlternativesProduct(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
