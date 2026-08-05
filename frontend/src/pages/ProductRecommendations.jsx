import React from 'react';
import userData from '../data/userData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductRecommendations() {
  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Product Recommendations', path: '/dashboard/recommendations' }
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData.recommendations.map(prod => (
          <div 
            key={prod.id} 
            className="border border-brand-100 bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Product Image Placeholder */}
              <div className="aspect-square w-full bg-brand-50 border border-brand-100 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden group">
                {prod.image ? (
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ShoppingBag className="w-12 h-12 text-brand-350 stroke-1" />
                )}
                
                {/* Suitability Badge */}
                <div className="absolute top-3 left-3 bg-brand-600 text-white text-[9px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                  {prod.matchScore}% Match
                </div>

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 border border-brand-100 text-[9px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                  {prod.category}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-sans font-medium text-brand-800">{prod.brand}</span>
                <h3 className="font-display text-base font-bold text-slate-950 line-clamp-1">{prod.name}</h3>
                
                {/* Why recommended */}
                <div className="bg-brand-50/50 border border-brand-100/50 p-3 rounded-2xl mt-2 text-[11px] text-brand-900 leading-relaxed font-sans">
                  <span className="font-display font-bold text-brand-700 block mb-0.5">Why it is recommended:</span>
                  Formulated with active ceramides to restore moisture and alleviate redness on sensitive cheek areas.
                </div>

                {/* Suitability details */}
                <div className="flex items-center gap-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-emerald-700 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  <span>Highly Suitable for Sensitive Skin</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-brand-100/60 pt-4 mt-5">
              <div>
                <span className="text-[10px] text-brand-800 font-sans block leading-none">Price Range</span>
                <span className="font-display font-bold text-base text-slate-950">${prod.price.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => toast.success(`Added ${prod.name} to skincare shopping cart!`)}
                className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 font-display"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
