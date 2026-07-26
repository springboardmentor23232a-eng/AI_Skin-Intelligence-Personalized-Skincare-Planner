import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sun, Moon, Calendar, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export default function RoutinePlannerPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Personalized Routine Generator</h1>
        <p className="text-sm text-slate-400 mt-1">
          Document Module 4: Morning, Evening, Weekly Treatment & Seasonal Regimens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AM Routine */}
        <GlassCard className="space-y-4 border-amber-500/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Morning Routine (AM)</h2>
            </div>
            <Badge variant="amber">4 Steps</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-sm">Step 1: Cleansing</span>
                <span className="text-slate-400">Gentle Hydrating Cleanser (Ceramides)</span>
              </div>
              <Badge variant="slate">60 secs</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-sm">Step 2: Antioxidant Treatment</span>
                <span className="text-slate-400">10% Vitamin C + Ferulic Acid Serum</span>
              </div>
              <Badge variant="emerald">Brightening</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-sm">Step 3: Moisturizing</span>
                <span className="text-slate-400">Barrier Repair Gel Cream (Niacinamide)</span>
              </div>
              <Badge variant="cyan">Moisture Lock</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-sm">Step 4: Sun Protection</span>
                <span className="text-slate-400">Broad Spectrum SPF 50+ Fluid</span>
              </div>
              <Badge variant="amber">Essential UV Shield</Badge>
            </div>
          </div>
        </GlassCard>

        {/* PM Routine */}
        <GlassCard className="space-y-4 border-violet-500/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">Evening Routine (PM)</h2>
            </div>
            <Badge variant="violet">3 Steps</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-sm">Step 1: Double Cleansing</span>
                <span className="text-slate-400">Oil Cleansing Balm followed by Gentle Wash</span>
              </div>
              <Badge variant="slate">Makeup & Dirt Removal</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-sm">Step 2: Targeted Active</span>
                <span className="text-slate-400">0.3% Encapsulated Retinol Serum</span>
              </div>
              <Badge variant="violet">Cell Turnover</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-sm">Step 3: Overnight Recovery</span>
                <span className="text-slate-400">Peptide & Ceramide Barrier Cream</span>
              </div>
              <Badge variant="teal">Cellular Repair</Badge>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Weekly & Seasonal skincare recommendations */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calendar className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-white">Weekly Treatment & Seasonal Skincare</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-1">
            <span className="font-bold text-teal-300 block text-sm">Sunday Clarifying Mask</span>
            <p className="text-slate-300">2% BHA Salicylic Acid mask for deep pore cleansing. Follow with hydrating hyaluronic serum.</p>
          </div>
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
            <span className="font-bold text-cyan-300 block text-sm">Seasonal Adjustment (Summer)</span>
            <p className="text-slate-300">Increased ambient humidity requires lighter gel-based moisturizers and non-comedogenic SPF 50+.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
