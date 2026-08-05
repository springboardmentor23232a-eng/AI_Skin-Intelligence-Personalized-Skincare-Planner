import React from 'react';
import { TestTube } from 'lucide-react';

export default function IngredientIntelligence() {
  return (
    <div className="p-6">
      <div className="glass-effect p-8 rounded-2xl shadow-lg border border-brand-100 animate-slide-up max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-100 rounded-xl text-brand-600">
            <TestTube className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-950">Ingredient Intelligence</h1>
            <p className="font-sans text-sm text-brand-800">Chemical interaction, compatibility, and conflict diagnostic database</p>
          </div>
        </div>
        <p className="font-sans text-brand-800 mt-4 leading-relaxed">
          Verify product formulations, inspect chemical conflicts (e.g. Retinoids + AHAs), check personal allergens, and research chemical ingredients.
        </p>
      </div>
    </div>
  );
}
