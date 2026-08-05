import React from 'react';
import dermatologistData from '../data/dermatologistData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import { Sparkles, Calendar, HeartPulse } from 'lucide-react';

export default function ProgressAnalytics() {
  const crumbs = [
    { label: 'Dashboard', path: '/dermatologist' },
    { label: 'Progress Analytics', path: '/dermatologist/analytics' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Progress Analytics
        </h1>
        <p className="text-sm text-brand-850">
          Monitor clinical treatment recovery ratios and active disease distribution metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recovery stats overview */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Recovery Ratios</h3>
            <p className="text-xs text-brand-800">Aggregated patient data over 30 days</p>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-1">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Treatment Success Rate</span>
              <div className="text-xl font-black text-brand-950">91.5% Stable</div>
              <p className="text-[10px] text-brand-800 leading-normal">Percentage of escalated critical acne/dermatitis cases that reached stable metrics post 4-week active check-in.</p>
            </div>

            <div className="p-4 bg-red-50/20 border border-red-100 rounded-2xl space-y-1">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-red-750 block">Avg Healing Period</span>
              <div className="text-xl font-black text-red-950">24 Days</div>
              <p className="text-[10px] text-brand-800 leading-normal">Average time elapsed before skin barrier indicators recover above dry/erythema baseline ranges.</p>
            </div>
          </div>
        </div>

        {/* Donut chart for disease distribution */}
        <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 font-display">Condition Categories Ratio</h3>
            <p className="text-xs text-brand-800">Primary patient diagnosis distributions logged on network</p>
          </div>
          <div>
            <PremiumChart type="donut" data={dermatologistData.diseaseDistribution} color="red" />
          </div>
        </div>

      </div>

      {/* Recovery Timeline */}
      <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">Patient Recovery Timeline milestones</h3>
          <p className="text-xs text-brand-800">Clinical benchmarks monitored during active prescription plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
          <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-display font-bold uppercase text-brand-600 block">Day 1 - 7</span>
            <h4 className="font-semibold text-slate-900">Active Retinization</h4>
            <p className="text-[10.5px] text-brand-850 leading-normal">Initial mild peeling and sensitivity. Recommended moisture buffering routines.</p>
          </div>

          <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-display font-bold uppercase text-brand-600 block">Day 8 - 21</span>
            <h4 className="font-semibold text-slate-900">Pustular Clearance</h4>
            <p className="text-[10.5px] text-brand-850 leading-normal">Active inflammation reduction. Deep papules begin drying out and healing.</p>
          </div>

          <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-display font-bold uppercase text-brand-600 block">Day 22 - 30</span>
            <h4 className="font-semibold text-slate-900">Barrier Consolidation</h4>
            <p className="text-[10.5px] text-brand-850 leading-normal">Epidermis normalization. Elasticity and moisture parameters return to standard ranges.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
