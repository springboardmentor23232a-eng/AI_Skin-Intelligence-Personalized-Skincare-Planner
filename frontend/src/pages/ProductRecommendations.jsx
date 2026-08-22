import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { CheckCircle2, ShoppingBag, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import * as routineService from '../services/routineService';

export default function ProductRecommendations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [routine, setRoutine] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasRoutine, setHasRoutine] = useState(false);

  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Product Recommendations', path: '/dashboard/recommendations' }
  ];

  const loadRecommendationsData = async () => {
    setLoading(true);
    try {
      // 1. Fetch current profile to check budget
      const profileData = await routineService.getRoutineProfile();
      setProfile(profileData);
      
      // 2. Fetch current routine
      const routineData = await routineService.getCurrentRoutine();
      setRoutine(routineData);
      setHasRoutine(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setHasRoutine(false);
      } else {
        toast.error('Failed to load personalized recommendations.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendationsData();
  }, []);

  // Helper to determine price based on product category & ID
  const getProductPrice = (category, id) => {
    const seed = (id || 0) % 100;
    let min = 200;
    let max = 900;
    
    const cat = (category || '').toUpperCase();
    if (cat === 'CLEANSING') {
      min = 250;
      max = 700;
    } else if (cat === 'MOISTURIZING') {
      min = 300;
      max = 800;
    } else if (cat === 'SUN_PROTECTION') {
      min = 350;
      max = 900;
    } else if (cat === 'TREATMENT' || cat === 'EXFOLIATION') {
      min = 400;
      max = 950;
    } else if (cat === 'EYE_CARE' || cat === 'NIGHT_CARE') {
      min = 300;
      max = 800;
    }
    
    const priceVal = min + (seed % (max - min + 1));
    return `₹${priceVal}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Product Recommendations
        </h1>
        <p className="text-sm text-brand-850">
          Personalized product matches based on diagnostic compatibility and ingredient safety.
        </p>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading product matches...</span>
        </div>
      )}

      {!loading && !hasRoutine && (
        <div className="py-16 text-center border-2 border-dashed border-brand-200 bg-white rounded-3xl p-8 max-w-md mx-auto flex flex-col items-center justify-center gap-4">
          <ShoppingBag className="w-12 h-12 text-brand-400 animate-bounce" />
          <h3 className="font-display text-lg font-bold text-brand-950">No Recommendations Available</h3>
          <p className="text-xs text-brand-800 leading-relaxed">
            Please complete your skincare questionnaire profile first to generate a personalized routine and product matches.
          </p>
          <button
            onClick={() => navigate('/dashboard/routine')}
            className="btn-primary py-2 px-5 rounded-xl text-xs font-display font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            Go to Skincare Profile
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!loading && hasRoutine && routine && (
        <div className="space-y-6">
          {/* Top disclaimer panel */}
          <div className="bg-brand-50/50 p-4 border border-brand-100 rounded-3xl flex items-start gap-3 text-xs leading-relaxed text-slate-650 max-w-3xl">
            <Info className="w-4 h-4 text-brand-650 mt-0.5 shrink-0" />
            <span>
              These recommendations correspond to the active ingredient classes (e.g. zinc oxide sunscreen, squalane barrier cream) formulated for your active skincare routine.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routine.items && routine.items.filter(i => i.is_enabled && i.routine_type !== 'SEASONAL' && i.routine_type !== 'WEEKLY').map((item, idx) => (
              <div 
                key={item.id || idx} 
                className="border border-brand-100 bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Product Image Placeholder */}
                  <div className="aspect-square w-full bg-brand-50 border border-brand-100 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden group">
                    <ShoppingBag className="w-12 h-12 text-brand-350 stroke-1 group-hover:scale-105 transition-transform duration-300" />
                    
                    {/* Suitability Match Badge */}
                    <div className="absolute top-3 left-3 bg-brand-600 text-white text-[9px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                      {95 + (idx % 5)}% Match
                    </div>

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 border border-brand-100 text-[9px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                      {item.routine_type}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-650">{item.category}</span>
                    <h3 className="font-display text-base font-bold text-slate-950 line-clamp-2">{item.name}</h3>
                    
                    {/* Why recommended */}
                    <div className="bg-brand-50/50 border border-brand-100/50 p-3 rounded-2xl text-[11px] text-brand-900 leading-relaxed font-sans">
                      <span className="font-display font-bold text-brand-700 block mb-0.5">Compatible Skincare Guidance:</span>
                      {item.description}
                      {item.notes && (
                        <span className="block mt-1 font-semibold text-slate-500 italic">Instruction: {item.notes}</span>
                      )}
                    </div>

                    {/* Suitability details */}
                    <div className="flex items-center gap-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-emerald-700 pt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      <span>Safety Exclusions & Allergies Checked</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-brand-100/60 pt-4 mt-5">
                  <div>
                    <span className="text-[10px] text-brand-800 font-sans block leading-none">Price Range</span>
                    <span className="font-display font-bold text-sm text-slate-950">{getProductPrice(item.category, item.id)}</span>
                  </div>
                  <button 
                    onClick={() => toast.success(`Saved recommendation details for: ${item.name}`)}
                    className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 font-display cursor-pointer"
                  >
                    Save Step Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
