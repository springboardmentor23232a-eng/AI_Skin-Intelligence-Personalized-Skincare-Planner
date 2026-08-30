import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Info, 
  AlertTriangle, 
  ExternalLink, 
  Search, 
  Filter, 
  ArrowLeftRight, 
  Check, 
  X,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as productService from '../services/productService';
import * as routineService from '../services/routineService';

export default function ProductRecommendations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  
  // Products states
  const [recommendedList, setRecommendedList] = useState([]);
  const [catalogList, setCatalogList] = useState([]); // General browse if no profile
  const [categories, setCategories] = useState([]);
  
  // Filters states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suitabilityDetails, setSuitabilityDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Alternatives state
  const [alternativesProduct, setAlternativesProduct] = useState(null);
  const [alternativesList, setAlternativesList] = useState([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  // Comparison state
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Product Recommendations', path: '/dashboard/recommendations' }
  ];

  // Load initial configuration
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const cats = await productService.listCategories();
      setCategories(['All', ...cats]);

      // 2. Fetch profile to check configuration
      const userProfile = await routineService.getRoutineProfile();
      setProfile(userProfile);
      setHasProfile(true);

      // Load Q27 budget preference as default budget filter
      if (userProfile && userProfile.budget) {
        setSelectedBudget(userProfile.budget);
      }

      // 3. Fetch personalized recommendations
      const recs = await productService.getPersonalizedRecommendations();
      setRecommendedList(recs);
    } catch (err) {
      if (err.response?.status === 400) {
        setHasProfile(false);
        // Load general product catalog for browsing instead
        const generalProducts = await productService.listProducts();
        setCatalogList(generalProducts);
      } else {
        toast.error('Failed to load products database.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selection dynamically if profile budget is updated later
  useEffect(() => {
    if (profile && profile.budget) {
      setSelectedBudget(profile.budget);
    }
  }, [profile]);

  // Handle open details modal
  const handleViewDetails = async (product) => {
    setSelectedProduct(product);
    setSuitabilityDetails(null);
    setLoadingDetails(true);
    try {
      if (hasProfile) {
        const details = await productService.getProductSuitability(product.id);
        setSuitabilityDetails(details);
      } else {
        setSuitabilityDetails({
          suitability_score: 75,
          match_reason: "Connect skin profile to calculate personalized score.",
          is_allergy_excluded: false,
          warnings: ["No skin profile found."],
          usage_guidance: product.usage_guidance
        });
      }
    } catch (err) {
      toast.error('Failed to compute compatibility details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle open alternatives panel
  const handleViewAlternatives = async (product) => {
    setAlternativesProduct(product);
    setAlternativesList([]);
    setLoadingAlternatives(true);
    try {
      if (hasProfile) {
        const alts = await productService.getProductAlternatives(product.id);
        setAlternativesList(alts);
      } else {
        toast.error('Complete your profile to view personalized alternatives.');
      }
    } catch (err) {
      toast.error('Failed to load product alternatives.');
    } finally {
      setLoadingAlternatives(false);
    }
  };

  // Handle toggle comparison selection
  const handleToggleCompare = (id) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        toast.error('You can compare a maximum of 3 products side-by-side.');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Trigger comparison analysis
  const handleCompareTrigger = async () => {
    if (selectedCompareIds.length < 2) {
      toast.error('Please select at least 2 products to compare.');
      return;
    }
    setLoadingComparison(true);
    setShowComparisonModal(true);
    try {
      const data = await productService.compareProducts(selectedCompareIds);
      setComparisonData(data);
    } catch (err) {
      toast.error('Failed to run product comparisons.');
      setShowComparisonModal(false);
    } finally {
      setLoadingComparison(false);
    }
  };

  // Filter lists locally based on selection parameters
  const getFilteredItems = () => {
    const activeList = hasProfile ? recommendedList : catalogList.map(p => ({ product: p, suitability_score: 70, match_reason: "Complete skin profile to rank." }));
    
    return activeList.filter(item => {
      const prod = item.product;
      
      // Category Match
      const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
      
      // Budget Match (₹ Range Mapping)
      let matchesBudget = true;
      if (selectedBudget !== 'All') {
        const price = prod.price;
        if (selectedBudget === 'Budget') {
          matchesBudget = price < 500;
        } else if (selectedBudget === 'Moderate') {
          matchesBudget = price >= 500 && price < 1000;
        } else if (selectedBudget === 'Premium') {
          matchesBudget = price >= 1000;
        }
      }
      
      // Search Match
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm || 
        prod.name.toLowerCase().includes(searchLower) ||
        prod.brand.toLowerCase().includes(searchLower) ||
        prod.category.toLowerCase().includes(searchLower) ||
        (prod.ingredients && prod.ingredients.some(ing => ing.toLowerCase().includes(searchLower)));
        
      return matchesCategory && matchesBudget && matchesSearch;
    });
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Header and comparison bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            Personalized Skincare Recommendations
          </h1>
          <p className="text-sm text-brand-850">
            Rule-based product recommendations optimized against your skincare profile and ingredient safety thresholds.
          </p>
        </div>

        {selectedCompareIds.length >= 2 && (
          <button
            onClick={handleCompareTrigger}
            className="btn-primary py-2.5 px-5 rounded-xl text-xs font-display font-bold flex items-center gap-2 cursor-pointer shadow-md bg-brand-700 hover:bg-brand-800 text-white transition-all transform hover:-translate-y-0.5"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Compare {selectedCompareIds.length} Products
          </button>
        )}
      </div>

      {/* Profile summary strip */}
      {hasProfile && profile && (
        <div className="bg-brand-50/40 border border-brand-100/60 p-5 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-brand-650 font-semibold block uppercase tracking-wider text-[10px]">Your Skin Type</span>
            <span className="font-display font-bold text-sm text-brand-950">{profile.skin_type}</span>
          </div>
          <div>
            <span className="text-brand-650 font-semibold block uppercase tracking-wider text-[10px]">Primary Goal</span>
            <span className="font-display font-bold text-sm text-brand-950">{profile.skincare_goal}</span>
          </div>
          <div>
            <span className="text-brand-650 font-semibold block uppercase tracking-wider text-[10px]">Sensitivity Level</span>
            <span className="font-display font-bold text-sm text-brand-950">{profile.sensitivity}</span>
          </div>
          <div>
            <span className="text-brand-650 font-semibold block uppercase tracking-wider text-[10px]">Profile Budget preference</span>
            <span className="font-display font-bold text-sm text-brand-950">{profile.budget} Tier</span>
          </div>
        </div>
      )}

      {/* Warnings safety overlay */}
      <div className="bg-brand-50/50 p-4 border border-brand-100 rounded-3xl flex items-start gap-3 text-xs leading-relaxed text-slate-650">
        <Info className="w-4 h-4 text-brand-650 mt-0.5 shrink-0" />
        <span>
          <strong className="text-brand-950 font-display">Cosmetic Guidance Boundary:</strong> This recommendation dashboard provides cosmetic recommendations based on your skincare routine questions. It is not a medical diagnosis system. For severe acne, deep scarring, or serious allergies, please consult a qualified dermatologist.
        </span>
      </div>

      {/* Profile missing banner if hasProfile is false */}
      {!loading && !hasProfile && (
        <div className="py-16 text-center border-2 border-dashed border-brand-200 bg-white rounded-3xl p-8 max-w-lg mx-auto flex flex-col items-center justify-center gap-4">
          <ShoppingBag className="w-12 h-12 text-brand-400 animate-bounce" />
          <h3 className="font-display text-lg font-bold text-brand-950">Complete Your Skin Profile</h3>
          <p className="text-xs text-brand-800 leading-relaxed max-w-md">
            Personalized suitability scoring, allergy screening, active ingredients validation, and interaction checks require completing your Module 4 profile questionnaire.
          </p>
          <button
            onClick={() => navigate('/dashboard/routine')}
            className="btn-primary py-2.5 px-6 rounded-xl text-xs font-display font-semibold flex items-center gap-1.5 cursor-pointer shadow-md bg-brand-700 hover:bg-brand-800 text-white transition-all"
          >
            Complete Skin Profile
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Catalog browser section */}
      <div className="space-y-6">
        {/* Search, category and budget filters strip */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white p-4 border border-brand-100/80 rounded-3xl shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-4.5 rounded-full text-xs font-display font-bold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat 
                    ? 'bg-brand-900 text-white shadow-sm' 
                    : 'bg-brand-50 text-brand-850 hover:bg-brand-100/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, brand, active..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60 text-xs pl-9 pr-4 py-2 border border-brand-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Budget Selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-brand-650 shrink-0" />
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="text-xs p-2 border border-brand-200 rounded-xl focus:outline-none focus:border-brand-500 bg-white"
              >
                <option value="All">All Price Tiers</option>
                <option value="Budget">Budget (&lt; ₹500)</option>
                <option value="Moderate">Moderate (₹500 - ₹1000)</option>
                <option value="Premium">Premium (&ge; ₹1000)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-brand-850 font-semibold tracking-wide">Evaluating compatibility matrices...</span>
          </div>
        )}

        {/* Product recommendations list grid */}
        {!loading && (
          <>
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 border border-brand-100 bg-white rounded-3xl max-w-md mx-auto space-y-2 p-8">
                <AlertTriangle className="w-10 h-10 text-brand-500 mx-auto" />
                <h3 className="font-display text-sm font-bold text-slate-800">No matching products found</h3>
                <p className="text-xs text-slate-500">Try modifying your filter selections or clearing the search text.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const prod = item.product;
                  const isSelected = selectedCompareIds.includes(prod.id);
                  return (
                    <div 
                      key={prod.id} 
                      className={`border bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                        isSelected ? 'border-brand-600 ring-1 ring-brand-600' : 'border-brand-100'
                      }`}
                    >
                      <div>
                        {/* Image panel placeholder */}
                        <div className="aspect-video w-full bg-brand-50 border border-brand-100/60 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden group">
                          <ShoppingBag className="w-10 h-10 text-brand-350 stroke-1 group-hover:scale-105 transition-transform duration-300" />
                          
                          {/* Match rating badge */}
                          {hasProfile && (
                            <div className={`absolute top-3 left-3 text-[10px] font-display font-black px-2.5 py-0.5 rounded-full shadow-sm text-white ${
                              item.suitability_score >= 85 
                                ? 'bg-emerald-600' 
                                : item.suitability_score >= 60 
                                  ? 'bg-amber-600' 
                                  : 'bg-red-600'
                            }`}>
                              {item.suitability_score}% Match
                            </div>
                          )}

                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-900 border border-brand-100 text-[9px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                            {prod.category}
                          </div>
                        </div>

                        {/* Text description details */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-650">{prod.brand}</span>
                            <span className="text-xs font-display font-bold text-slate-900 leading-none">₹{prod.price}</span>
                          </div>
                          
                          <h3 className="font-display text-base font-extrabold text-slate-950 leading-snug line-clamp-1">{prod.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">{prod.description}</p>
                          
                          {/* Active score match reason */}
                          {hasProfile && (
                            <div className="bg-brand-50/50 border border-brand-100/50 p-3 rounded-2xl text-[11px] text-brand-900 leading-relaxed font-sans mt-3">
                              <span className="font-display font-bold text-brand-700 block mb-0.5">Compatibility rationale:</span>
                              {item.match_reason}
                            </div>
                          )}

                          {/* Ingredient allergy safety indicator */}
                          {hasProfile && (
                            <div className="flex items-center gap-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-emerald-700 pt-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                              <span>Safe active ingredients</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="border-t border-brand-100/60 pt-4 mt-5 flex flex-col gap-2">
                        <div className="flex justify-between items-center gap-2">
                          {/* Comparison Checkbox */}
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none font-medium text-slate-650 hover:text-slate-800">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleCompare(prod.id)}
                              className="rounded border-slate-350 text-brand-600 focus:ring-brand-500"
                            />
                            <span>Compare</span>
                          </label>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewAlternatives(prod)}
                              className="text-[10px] font-display font-bold text-brand-850 hover:text-brand-950 hover:underline px-2 py-1 cursor-pointer"
                            >
                              Alternatives
                            </button>
                            <button
                              onClick={() => handleViewDetails(prod)}
                              className="btn-primary px-3 py-1.5 rounded-lg text-[10px] font-display font-bold bg-brand-700 hover:bg-brand-800 text-white cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* --- SIDEBAR DRAWER MODAL 1: PRODUCT DETAILS --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between shadow-2xl animate-slide-left">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-650">{selectedProduct.brand}</span>
                  <h2 className="font-display text-xl font-black text-slate-900 leading-snug">{selectedProduct.name}</h2>
                  <span className="inline-block mt-1 text-xs font-display font-bold text-slate-900">Price: ₹{selectedProduct.price}</span>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 hover:bg-slate-150 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Compatibility score details */}
              {loadingDetails ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : suitabilityDetails ? (
                <div className="bg-brand-50/50 border border-brand-100 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-display font-black text-xs text-brand-950 uppercase tracking-wide">Suitability Assessment:</span>
                    <span className="font-display font-black text-sm text-brand-950">{suitabilityDetails.suitability_score}/100</span>
                  </div>
                  <p className="text-xs text-slate-650 leading-relaxed font-sans">{suitabilityDetails.match_reason}</p>
                  
                  {suitabilityDetails.warnings && suitabilityDetails.warnings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-brand-100/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Precautions / Cautions:</span>
                      </div>
                      {suitabilityDetails.warnings.map((w, idx) => (
                        <p key={idx} className="text-[11px] text-amber-900 font-sans pl-5">{w}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Specifications Info list */}
              <div className="space-y-4 text-xs font-sans">
                <div>
                  <h4 className="font-display font-black text-slate-900 mb-1">Product Description</h4>
                  <p className="text-slate-650 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                  <div>
                    <h4 className="font-display font-black text-slate-900 mb-1">Skin Suitability</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.suitable_skin_types.map(t => (
                        <span key={t} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display font-black text-slate-900 mb-1">Irritation Level</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      selectedProduct.irritation_level.toLowerCase() === 'high' 
                        ? 'bg-red-50 text-red-700' 
                        : selectedProduct.irritation_level.toLowerCase() === 'medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {selectedProduct.irritation_level}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-black text-slate-900 mb-1">Product Ingredients</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedProduct.ingredients.map(ing => (
                      <span key={ing} className="bg-brand-50/50 border border-brand-100/50 text-brand-900 text-[10px] px-2.5 py-0.5 rounded-full">{ing}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-black text-slate-900 mb-1">Expected Benefits</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-650 leading-relaxed">
                    {selectedProduct.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-display font-black text-slate-900 mb-1">Usage Instructions</h4>
                  <p className="text-slate-650 leading-relaxed">{selectedProduct.usage_guidance}</p>
                </div>

                <div>
                  <h4 className="font-display font-black text-slate-900 mb-1">Standard Precautions</h4>
                  <p className="text-slate-650 leading-relaxed">{selectedProduct.precautions}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full btn-primary py-2.5 rounded-xl font-display text-xs bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              >
                Close Specifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR DRAWER MODAL 2: SAFE ALTERNATIVES --- */}
      {alternativesProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between shadow-2xl animate-slide-left">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-black text-slate-900 leading-snug">Compatible Alternatives</h2>
                  <p className="text-xs text-slate-500">Safe replacements for: <strong className="text-brand-900">{alternativesProduct.name}</strong></p>
                </div>
                <button 
                  onClick={() => setAlternativesProduct(null)}
                  className="p-1 hover:bg-slate-150 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {loadingAlternatives ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {alternativesList.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50/50">
                      <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-sans">No safe alternative products identified in this category.</p>
                    </div>
                  ) : (
                    alternativesList.map((item) => (
                      <div 
                        key={item.product.id}
                        className="border border-slate-150 p-4 rounded-2xl bg-white hover:border-brand-200 transition-all space-y-2.5"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <span className="text-[9px] font-display font-bold uppercase tracking-wider text-brand-650">{item.product.brand}</span>
                            <h4 className="font-display text-sm font-bold text-slate-950 leading-tight">{item.product.name}</h4>
                            <span className="inline-block mt-0.5 text-xs text-slate-900 font-semibold font-display">₹{item.product.price}</span>
                          </div>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-display font-black px-2 py-0.5 rounded-full shrink-0">
                            {item.suitability_score}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-650 line-clamp-2 leading-relaxed">{item.product.description}</p>
                        <div className="bg-brand-50/40 p-2.5 rounded-xl border border-brand-100/50 text-[10px] text-brand-900 font-sans">
                          {item.match_reason}
                        </div>
                        <button
                          onClick={() => {
                            setAlternativesProduct(null);
                            handleViewDetails(item.product);
                          }}
                          className="w-full text-center text-[10px] font-display font-black text-brand-700 hover:text-brand-900 pt-1"
                        >
                          View Alternative Specifications &rarr;
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <button
                onClick={() => setAlternativesProduct(null)}
                className="w-full btn-primary py-2.5 rounded-xl font-display text-xs bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              >
                Close Alternatives List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAWER MODAL 3: SIDE-BY-SIDE COMPARE CONSOLE --- */}
      {showComparisonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-xl font-black text-slate-900 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-brand-650" />
                    Product Comparison Console
                  </h2>
                  <p className="text-xs text-slate-500">Side-by-side attributes analysis and personalized compatibility match.</p>
                </div>
                <button 
                  onClick={() => setShowComparisonModal(false)}
                  className="p-1 hover:bg-slate-150 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {loadingComparison ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-semibold font-display">Running rule comparison matrices...</span>
                </div>
              ) : comparisonData ? (
                <div className="space-y-6 font-sans">
                  {/* Verdict Banner */}
                  <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-brand-650 fill-brand-100 shrink-0" />
                    <span className="text-xs font-display font-black text-brand-950">{comparisonData.verdict}</span>
                  </div>

                  {/* Comparison Grid Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 font-display text-slate-800">
                          <th className="p-3 border-r border-slate-100 font-bold">Parameters</th>
                          {comparisonData.comparison_results.map((res) => (
                            <th key={res.product.id} className="p-3 border-r border-slate-100 font-black">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-display font-bold uppercase tracking-wider text-brand-600 leading-none">{res.product.brand}</span>
                                <span className="text-sm font-black text-slate-900 leading-tight">{res.product.name}</span>
                                {res.is_more_suitable && (
                                  <span className="inline-block self-start mt-1 bg-brand-650 text-white text-[8px] font-display font-black uppercase px-2 py-0.5 rounded">
                                    ★ Best Profile Match
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-650 leading-relaxed font-sans">
                        {/* Suitability Score */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Match score</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100">
                              <span className="text-sm font-display font-black text-slate-900">{res.suitability_score}% Match</span>
                            </td>
                          ))}
                        </tr>
                        {/* Suitability Reason */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Why it matches</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100 font-sans leading-relaxed text-[11px]">
                              {res.match_reason}
                            </td>
                          ))}
                        </tr>
                        {/* Price */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Price in ₹</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100 font-display font-bold text-slate-900">
                              ₹{res.product.price}
                            </td>
                          ))}
                        </tr>
                        {/* Category */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Category</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100 font-display font-semibold">
                              {res.product.category}
                            </td>
                          ))}
                        </tr>
                        {/* Skin Types */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Skin compatibility</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100">
                              {res.product.suitable_skin_types.join(', ')}
                            </td>
                          ))}
                        </tr>
                        {/* Irritation */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Irritation level</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                res.product.irritation_level.toLowerCase() === 'high' 
                                  ? 'bg-red-50 text-red-700' 
                                  : res.product.irritation_level.toLowerCase() === 'medium'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {res.product.irritation_level}
                              </span>
                            </td>
                          ))}
                        </tr>
                        {/* Ingredients */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Ingredients</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100 font-sans text-[11px] leading-relaxed">
                              {res.product.ingredients.join(', ')}
                            </td>
                          ))}
                        </tr>
                        {/* Benefits */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Benefits</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100 font-sans text-[11px] leading-relaxed">
                              {res.product.benefits.join(' | ')}
                            </td>
                          ))}
                        </tr>
                        {/* Guidance */}
                        <tr>
                          <td className="p-3 border-r border-slate-100 font-bold bg-slate-50/50 text-slate-800">Usage Guidance</td>
                          {comparisonData.comparison_results.map((res) => (
                            <td key={res.product.id} className="p-3 border-r border-slate-100 font-sans text-[11px] leading-relaxed">
                              {res.product.usage_guidance}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedCompareIds([]);
                  setShowComparisonModal(false);
                }}
                className="btn-primary py-2.5 px-6 rounded-xl font-display text-xs border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="btn-primary py-2.5 px-6 rounded-xl font-display text-xs bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
