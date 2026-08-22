import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Search, Filter, TestTube, AlertTriangle, CheckCircle, ShieldAlert, BookOpen, Layers, CheckSquare, Square, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as ingredientService from '../services/ingredientService';

export default function IngredientIntelligence() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  
  // Profile context used for suitability checks
  const [profileContext, setProfileContext] = useState(null);
  
  // Modal states for educational view
  const [activeEduModal, setActiveEduModal] = useState(null);
  
  // Suitability check result state
  const [suitabilityResult, setSuitabilityResult] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(false);

  // Interaction analyzer selection state
  const [selectedActives, setSelectedActives] = useState([]);
  const [interactionResult, setInteractionResult] = useState(null);
  const [loadingInteraction, setLoadingInteraction] = useState(false);

  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Ingredient Intelligence', path: '/dashboard/ingredients' }
  ];

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profile context
      const ctx = await ingredientService.getProfileContext();
      setProfileContext(ctx);
      
      // 2. Fetch categories
      const cats = await ingredientService.getCategories();
      setCategories(['All', ...cats]);

      // 3. Fetch ingredients
      const list = await ingredientService.getIngredients(searchTerm, selectedCategory);
      setIngredients(list);
    } catch (err) {
      toast.error('Failed to load ingredient intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle live search or filter updates
  const handleSearchFilter = async () => {
    try {
      const list = await ingredientService.getIngredients(searchTerm, selectedCategory);
      setIngredients(list);
    } catch (err) {
      toast.error('Error applying filters.');
    }
  };

  useEffect(() => {
    handleSearchFilter();
  }, [searchTerm, selectedCategory]);

  // Check individual suitability
  const handleCheckSuitability = async (ingId) => {
    if (!profileContext?.has_profile) {
      toast.error('Please complete your skin profile first.');
      return;
    }
    setLoadingCheck(true);
    setSuitabilityResult(null);
    try {
      const res = await ingredientService.checkSuitability(ingId);
      setSuitabilityResult(res);
      toast.success(`Suitability calculated for ${res.ingredient}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to check suitability.');
    } finally {
      setLoadingCheck(false);
    }
  };

  // Toggle active selection for interaction analysis
  const toggleActiveForAnalysis = (id) => {
    if (selectedActives.includes(id)) {
      setSelectedActives(prev => prev.filter(activeId => activeId !== id));
    } else {
      setSelectedActives(prev => [...prev, id]);
    }
  };

  // Trigger combinations analysis
  const handleAnalyzeCombination = async () => {
    if (selectedActives.length < 2) {
      toast.error('Please select at least 2 ingredients to analyze.');
      return;
    }
    setLoadingInteraction(true);
    setInteractionResult(null);
    try {
      const res = await ingredientService.analyzeInteractions(selectedActives);
      setInteractionResult(res);
      toast.success('Combination analysis completed.');
    } catch (err) {
      toast.error('Failed to analyze combination.');
    } finally {
      setLoadingInteraction(false);
    }
  };

  // Suitability status styling helper
  const getSuitabilityStyle = (status) => {
    switch (status) {
      case 'SUITABLE':
        return {
          bg: 'bg-emerald-50 border-emerald-100',
          text: 'text-emerald-800',
          badge: 'bg-emerald-100 text-emerald-800',
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
        };
      case 'USE_WITH_CAUTION':
        return {
          bg: 'bg-amber-50 border-amber-100',
          text: 'text-amber-800',
          badge: 'bg-amber-100 text-amber-800',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
        };
      case 'NOT_RECOMMENDED':
        return {
          bg: 'bg-orange-50 border-orange-100',
          text: 'text-orange-800',
          badge: 'bg-orange-100 text-orange-800',
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
        };
      case 'AVOID':
        return {
          bg: 'bg-red-50 border-red-100',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800',
          icon: <ShieldAlert className="w-5 h-5 text-red-500" />
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-100',
          text: 'text-slate-800',
          badge: 'bg-slate-100 text-slate-800',
          icon: <Info className="w-5 h-5 text-slate-500" />
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight flex items-center gap-2">
            <TestTube className="w-8 h-8 text-brand-600" />
            Ingredient Intelligence
          </h1>
          <p className="text-sm text-brand-850">
            Research chemical compounds, check personalized allergens, and diagnose ingredient interaction compatibility.
          </p>
        </div>

        {/* Profile indicator banner */}
        {profileContext && (
          <div className="p-3 rounded-2xl bg-white border border-brand-100/60 shadow-sm flex items-center gap-3 max-w-sm">
            <div className={`w-3.5 h-3.5 rounded-full ${profileContext.has_profile ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <div>
              <span className="font-display font-bold text-xs text-slate-900 block">
                {profileContext.has_profile ? `Skin Profile: ${profileContext.skin_type}` : 'Skin Profile Incomplete'}
              </span>
              <span className="text-[10px] text-brand-800 font-sans block">
                {profileContext.has_profile ? `Sensitivity: ${profileContext.sensitivity}` : 'Personalized checks will be locked.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Profile missing banner */}
      {profileContext && !profileContext.has_profile && (
        <div className="p-4 border border-amber-100 bg-amber-50/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-display font-bold text-xs text-amber-950">Complete your Skin Profile</h5>
              <p className="text-[11.5px] text-amber-900 leading-normal font-sans">
                You can browse ingredient education materials, but personalized suitability matching requires answers from your skin questionnaire.
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard/routine')}
            className="px-4 py-1.5 bg-amber-900 text-white rounded-xl font-display text-xs font-semibold hover:bg-amber-850 transition-colors shrink-0"
          >
            Go to Questionnaire
          </button>
        </div>
      )}

      {/* Main interface layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area: Ingredients database explorer */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Filters Bar */}
          <div className="glass-effect border border-brand-100 p-4 rounded-3xl bg-white shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="w-4 h-4 text-brand-400 absolute left-3 top-3.5" />
              <input 
                type="text"
                placeholder="Search ingredient (e.g. Vitamin C, Retinoids)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full"
              />
            </div>

            <div className="flex flex-wrap gap-1 items-center">
              <Filter className="w-3.5 h-3.5 text-brand-500 mr-1" />
              <div className="flex flex-wrap gap-1 max-w-[400px]">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-display font-semibold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-brand-900 text-white shadow-sm'
                        : 'bg-brand-50/50 hover:bg-brand-100/50 text-brand-850'
                    }`}
                  >
                    {cat === 'All' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Database Grid */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-brand-850 font-semibold">Querying ingredient database...</span>
            </div>
          ) : ingredients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ingredients.map(ing => {
                const isSelected = selectedActives.includes(ing.id);
                return (
                  <div 
                    key={ing.id}
                    className="glass-effect border border-brand-100 p-5 rounded-3xl bg-white shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-display text-base font-bold text-slate-900">{ing.name}</h3>
                          <span className="text-[9px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-display font-bold uppercase tracking-wide">
                            {ing.category}
                          </span>
                        </div>

                        {/* Interaction selection toggle */}
                        <button
                          onClick={() => toggleActiveForAnalysis(ing.id)}
                          className="text-slate-450 hover:text-brand-700 transition-colors"
                          title="Select for interaction analysis"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-brand-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-650 font-sans mt-2.5 leading-relaxed">
                        {ing.short_description}
                      </p>

                      <div className="mt-3 space-y-1">
                        <span className="font-display font-bold text-[9px] text-slate-400 uppercase tracking-widest block">Main Benefits:</span>
                        <div className="flex flex-wrap gap-1">
                          {(ing.benefits || []).map((b, idx) => (
                            <span key={idx} className="bg-slate-50 border border-slate-100 text-[9.5px] text-slate-600 px-2 py-0.5 rounded-full font-sans">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-brand-100/50 mt-4">
                      <button
                        onClick={() => setActiveEduModal(ing)}
                        className="px-3 py-2 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl text-xs font-display font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Learn More
                      </button>
                      
                      <button
                        onClick={() => handleCheckSuitability(ing.id)}
                        disabled={!profileContext?.has_profile}
                        className={`px-3 py-2 rounded-xl text-xs font-display font-semibold transition-colors flex items-center justify-center gap-1 ${
                          profileContext?.has_profile
                            ? 'bg-brand-900 text-white hover:bg-brand-850'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <TestTube className="w-3.5 h-3.5" />
                        Check Suitability
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-brand-200 bg-white rounded-3xl p-8 max-w-md mx-auto flex flex-col items-center justify-center gap-4">
              <TestTube className="w-12 h-12 text-brand-400 animate-pulse" />
              <h3 className="font-display text-lg font-bold text-brand-950">No Ingredients Found</h3>
              <p className="text-xs text-brand-800 leading-relaxed font-sans">
                We couldn't find any ingredients matching your search query. Try searching 'Ceramides' or 'Retinoids'.
              </p>
            </div>
          )}

        </div>

        {/* Right Area: Diagnostic consoles */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Suitability Diagnostic panel */}
          {suitabilityResult && (
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-brand-100">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Suitability Report</h3>
                  <span className="text-[10px] text-slate-450 block font-sans">Active evaluation details</span>
                </div>
                <button 
                  onClick={() => setSuitabilityResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold border border-slate-200 rounded-lg px-2 py-0.5"
                >
                  Clear
                </button>
              </div>

              {/* Status Header */}
              {(() => {
                const style = getSuitabilityStyle(suitabilityResult.suitability);
                return (
                  <div className={`p-4 border rounded-2xl ${style.bg} space-y-2`}>
                    <div className="flex items-center gap-2">
                      {style.icon}
                      <span className="font-display font-black text-sm uppercase tracking-wide">
                        {suitabilityResult.ingredient} • {suitabilityResult.suitability.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed font-semibold">{suitabilityResult.reason}</p>
                  </div>
                );
              })()}

              {/* Warnings List */}
              {suitabilityResult.warnings && suitabilityResult.warnings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-display font-bold text-[9px] text-red-700 uppercase tracking-wider block">Warnings / Contraindications:</span>
                  <div className="space-y-1 text-[11px] font-sans text-red-950">
                    {suitabilityResult.warnings.map((w, idx) => (
                      <div key={idx} className="p-2 bg-red-50/50 border border-red-100/50 rounded-xl flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Guidance */}
              <div className="space-y-1.5">
                <span className="font-display font-bold text-[9px] text-brand-700 uppercase tracking-wider block">Recommended Usage Guidance:</span>
                <p className="p-3 bg-brand-50/50 border border-brand-100/50 rounded-xl text-[11px] text-brand-900 leading-relaxed font-sans">
                  {suitabilityResult.usage_guidance}
                </p>
              </div>

              {/* Legal disclaimer */}
              <span className="text-[9px] text-slate-400 block text-center leading-relaxed pt-1">
                * This diagnostic checklist is for cosmetic guidance purposes and is not a medical diagnosis. Never override explicit allergy avoidance records.
              </span>
            </div>
          )}

          {/* Interactions Analyzer panel */}
          <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-brand-100">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-600" />
                  Interaction Analyzer
                </h3>
                <span className="text-[10px] text-slate-450 block font-sans">Select multiple check-boxes on left to compare</span>
              </div>
              
              {selectedActives.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedActives([]);
                    setInteractionResult(null);
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline font-bold"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="text-xs space-y-3 font-sans">
              <p className="text-brand-850 text-[11px] leading-relaxed">
                Check multiple active acids, retinoids, or vitamins from the database to evaluate chemical conflicts or synergistic layering routines.
              </p>

              {/* Active Selection badges */}
              <div className="flex flex-wrap gap-1">
                {selectedActives.map(id => {
                  const ing = ingredients.find(i => i.id === id);
                  if (!ing) return null;
                  return (
                    <span 
                      key={id}
                      onClick={() => toggleActiveForAnalysis(id)}
                      className="bg-brand-50 border border-brand-200 text-brand-900 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-colors"
                    >
                      {ing.name}
                      <span className="font-bold text-[8px] opacity-60">×</span>
                    </span>
                  );
                })}
              </div>

              {selectedActives.length >= 2 ? (
                <button
                  onClick={handleAnalyzeCombination}
                  disabled={loadingInteraction}
                  className="btn-primary w-full py-2 rounded-xl text-xs font-display flex items-center justify-center gap-1.5"
                >
                  {loadingInteraction ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      Analyze {selectedActives.length} Ingredients
                    </>
                  )}
                </button>
              ) : (
                <div className="p-3 border border-slate-100 bg-slate-50 text-[10.5px] text-slate-500 rounded-xl text-center">
                  Select at least 2 ingredients to analyze combinations.
                </div>
              )}
            </div>

            {/* Interaction Result Display */}
            {interactionResult && (
              <div className="mt-4 border-t border-brand-100/50 pt-4 space-y-4 animate-fade-in">
                {/* Result header */}
                <div className={`p-3.5 border rounded-2xl text-xs space-y-1.5 ${
                  interactionResult.compatibility === 'AVOID_SAME_ROUTINE' 
                    ? 'bg-red-50 border-red-100 text-red-950'
                    : interactionResult.compatibility === 'USE_WITH_CAUTION'
                    ? 'bg-amber-50 border-amber-100 text-amber-950'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-950'
                }`}>
                  <div className="font-display font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                    {interactionResult.compatibility === 'AVOID_SAME_ROUTINE' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                    {interactionResult.compatibility === 'USE_WITH_CAUTION' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {interactionResult.compatibility === 'COMPATIBLE' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    Compatibility: {interactionResult.compatibility.replace(/_/g, ' ')}
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans font-medium">{interactionResult.explanation}</p>
                </div>

                {/* Usage Advice */}
                <div className="space-y-1 text-xs">
                  <span className="font-display font-bold text-[9px] text-brand-700 uppercase tracking-wider block">Recommended Usage Routine:</span>
                  <p className="p-3 bg-brand-50/30 border border-brand-100/40 rounded-xl text-[10.5px] text-slate-700 leading-relaxed font-sans">
                    {interactionResult.recommended_usage}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Educational details modal ("Learn More") */}
      {activeEduModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-brand-100 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-xl relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-brand-100">
              <div>
                <span className="text-[10px] bg-brand-100 text-brand-850 px-2 py-0.5 rounded font-display font-bold uppercase tracking-wider block w-max mb-1">
                  {activeEduModal.category}
                </span>
                <h3 className="font-display text-2xl font-black text-slate-900">{activeEduModal.name}</h3>
              </div>
              <button 
                onClick={() => setActiveEduModal(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold border border-slate-200 rounded-lg px-2.5 py-1"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs font-sans text-slate-700 leading-relaxed">
              
              {/* Description */}
              <div className="space-y-1 bg-brand-50/20 border border-brand-100/50 p-4 rounded-2xl">
                <span className="font-display font-bold text-[10px] text-brand-700 uppercase tracking-widest block">What is it?</span>
                <p>{activeEduModal.short_description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Benefits */}
                <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-2">
                  <span className="font-display font-bold text-[10px] text-slate-500 uppercase tracking-widest block">Main Benefits</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {(activeEduModal.benefits || []).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                {/* Skin types & concerns */}
                <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-2">
                  <span className="font-display font-bold text-[10px] text-slate-500 uppercase tracking-widest block">Skin Profile Fit</span>
                  <div className="space-y-1.5">
                    <div>
                      <span className="font-semibold block text-[10px] text-slate-500">Suitable Skin Types:</span>
                      <span>{activeEduModal.suitable_skin_types.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-[10px] text-slate-500">Targets Skin Concerns:</span>
                      <span>{activeEduModal.common_concerns.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Irritation level & frequency */}
                <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-2">
                  <span className="font-display font-bold text-[10px] text-slate-500 uppercase tracking-widest block">Strength & Frequency</span>
                  <div className="space-y-1.5">
                    <div>
                      <span className="font-semibold block text-[10px] text-slate-500">Potential Irritation Level:</span>
                      <span className={`font-bold ${activeEduModal.irritation_level === 'High' ? 'text-red-600' : activeEduModal.irritation_level === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {activeEduModal.irritation_level}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold block text-[10px] text-slate-500">Typical Frequency:</span>
                      <span>{activeEduModal.typical_frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Precautions */}
                <div className="p-4 border border-red-50 bg-red-50/15 rounded-2xl space-y-1">
                  <span className="font-display font-bold text-[10px] text-red-700 uppercase tracking-widest block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Important Precautions
                  </span>
                  <p className="text-red-950 text-[11px] leading-relaxed">{activeEduModal.precautions}</p>
                </div>
              </div>

              {/* Usage Guidance */}
              <div className="p-4 border border-brand-100/50 bg-brand-50/10 rounded-2xl space-y-1">
                <span className="font-display font-bold text-[10px] text-brand-850 uppercase tracking-widest block">Clinical Usage Guidelines</span>
                <p className="text-slate-800 text-[11px] leading-relaxed">{activeEduModal.usage_guidance}</p>
              </div>

              {/* Legal disclaimer */}
              <span className="text-[9px] text-slate-400 block text-center leading-relaxed">
                * Skincare compounds should be introduced incrementally. Perform a patch test. This resource is for educational reference and is not medical advice.
              </span>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
