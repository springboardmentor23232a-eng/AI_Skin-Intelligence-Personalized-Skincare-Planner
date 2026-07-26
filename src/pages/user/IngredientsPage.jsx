import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { ACTIVE_INGREDIENTS } from '@/lib/constants';
import { ShieldAlert, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function IngredientsPage() {
  const interactions = [
    {
      combo: 'Retinoids + AHAs/BHAs',
      status: 'Conflict',
      severity: 'High Risk',
      badge: 'rose',
      desc: 'Simultaneous application strips barrier lipids and causes inflammation. Use Retinoids at night, AHAs on alternate evenings.',
    },
    {
      combo: 'Vitamin C + Niacinamide',
      status: 'Compatible / Synergistic',
      severity: 'Safe',
      badge: 'emerald',
      desc: 'Modern stabilized formulas boost antioxidant protection and hyperpigmentation reduction.',
    },
    {
      combo: 'Salicylic Acid + Ceramides',
      status: 'Synergistic',
      severity: 'Safe',
      badge: 'emerald',
      desc: 'Ceramides restore moisture lost during chemical exfoliation.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Ingredient Intelligence Module</h1>
        <p className="text-sm text-slate-400 mt-1">
          Document Module 5: Ingredient suitability, interaction matrix, allergy alerts & active education.
        </p>
      </div>

      {/* Ingredient Interaction Matrix */}
      <GlassCard className="space-y-4 border-rose-500/20">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg font-bold text-white">AI Interaction & Conflict Detection Matrix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {interactions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{item.combo}</span>
                <Badge variant={item.badge}>{item.status}</Badge>
              </div>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Supported Active Ingredients Catalog */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Core Active Ingredients Knowledge Base</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIVE_INGREDIENTS.map((ing) => (
            <GlassCard key={ing.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-400 text-sm">{ing.name}</h3>
                <Badge variant="cyan">{ing.riskLevel}</Badge>
              </div>
              <p className="text-xs text-slate-400">{ing.category}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
