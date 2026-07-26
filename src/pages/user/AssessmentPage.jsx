import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SKIN_CONCERNS, SKIN_TYPES } from '@/lib/constants';
import { CheckCircle, AlertCircle, Sparkles, Sliders } from 'lucide-react';

export default function AssessmentPage() {
  const [selectedSkinType, setSelectedSkinType] = useState('Combination');
  const [selectedConcerns, setSelectedConcerns] = useState(['Hyperpigmentation', 'Uneven Skin Tone']);
  const [sleepHours, setSleepHours] = useState(7);
  const [waterGlasses, setWaterGlasses] = useState(8);

  const toggleConcern = (concern) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Skin Assessment Engine</h1>
        <p className="text-sm text-slate-400 mt-1">
          Document Module 3: Identify concerns, skin health score factors, and environmental exposure risks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Questionnaire Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Skin Type */}
          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" /> 1. Primary Skin Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SKIN_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedSkinType(type)}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    selectedSkinType === type
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Step 2: Skin Concerns */}
          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> 2. Skin Concerns (Select all that apply)
            </h3>
            <div className="flex flex-wrap gap-2">
              {SKIN_CONCERNS.map((concern) => {
                const isSelected = selectedConcerns.includes(concern);
                return (
                  <button
                    key={concern}
                    onClick={() => toggleConcern(concern)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {concern}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Step 3: Lifestyle Factors */}
          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" /> 3. Lifestyle & Hydration Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <label className="text-slate-300 font-medium block">Average Sleep per Night ({sleepHours} hrs)</label>
                <input
                  type="range"
                  min="4"
                  max="10"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-300 font-medium block">Daily Water Intake ({waterGlasses} glasses)</label>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={waterGlasses}
                  onChange={(e) => setWaterGlasses(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Realtime Risk Factor Analysis Side-Panel */}
        <GlassCard className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">AI Risk Factor Analysis</h3>
              <p className="text-xs text-slate-400">Document Section 3 Engine Output</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="font-semibold text-emerald-400 block">Skin Barrier Status</span>
                Healthy stratum corneum. High tolerance for active ingredients.
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="font-semibold text-amber-400 block">Prioritized Concern</span>
                Hyperpigmentation (Melanin overproduction triggered by UV/Pollution).
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="font-semibold text-cyan-400 block">Hydration Deficiency</span>
                Water intake of {waterGlasses} glasses meets optimal cellular hydration.
              </div>
            </div>
          </div>

          <Button className="w-full">Update Skin Assessment</Button>
        </GlassCard>
      </div>
    </div>
  );
}
