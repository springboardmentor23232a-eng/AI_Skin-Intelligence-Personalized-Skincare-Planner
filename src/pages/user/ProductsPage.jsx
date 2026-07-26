import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const products = [
    {
      id: 1,
      name: 'Brightening Vitamin C 15% Serum',
      category: 'Serum',
      matchScore: 98,
      price: '$42',
      keyIngredients: ['Vitamin C', 'Ferulic Acid', 'Hyaluronic Acid'],
      suitableFor: 'Hyperpigmentation, Dark Spots',
      badge: '98% Match',
    },
    {
      id: 2,
      name: 'Barrier Defense Ceramide Gel Moisturizer',
      category: 'Moisturizer',
      matchScore: 94,
      price: '$34',
      keyIngredients: ['Ceramides', 'Niacinamide', 'Peptides'],
      suitableFor: 'Barrier Repair, Dry Skin',
      badge: '94% Match',
    },
    {
      id: 3,
      name: 'Invisible Shield Broad Spectrum SPF 50+',
      category: 'Sunscreen',
      matchScore: 96,
      price: '$28',
      keyIngredients: ['Zinc Oxide', 'Niacinamide', 'Vitamin E'],
      suitableFor: 'Daily UV Protection',
      badge: '96% Match',
    },
    {
      id: 4,
      name: 'BHA 2% Pore Clarifying Cleanser',
      category: 'Face Wash',
      matchScore: 91,
      price: '$24',
      keyIngredients: ['Salicylic Acid', 'Tea Tree', 'Aloe Vera'],
      suitableFor: 'Acne, Oily T-Zone',
      badge: '91% Match',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Product Recommendation Engine</h1>
        <p className="text-sm text-slate-400 mt-1">
          Document Module 6: Personalized product suitability scoring, comparison, and budget filtering.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((prod) => (
          <GlassCard key={prod.id} glow className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="cyan" className="mb-1">{prod.category}</Badge>
                  <h3 className="text-base font-bold text-white">{prod.name}</h3>
                </div>
                <Badge variant="emerald" className="font-extrabold text-xs">{prod.badge}</Badge>
              </div>

              <div className="text-xs space-y-1.5 text-slate-300">
                <div><span className="text-slate-400 font-medium">Target Concerns:</span> {prod.suitableFor}</div>
                <div>
                  <span className="text-slate-400 font-medium">Key Actives:</span>{' '}
                  <span className="text-emerald-400">{prod.keyIngredients.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-lg font-extrabold text-white">{prod.price}</span>
              <Button size="sm">Add to Routine</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
