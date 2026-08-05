import React from 'react';
import userData from '../data/userData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import { Camera, Calendar, ArrowRight, Check } from 'lucide-react';

export default function ProgressTracking() {
  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Progress Tracking', path: '/dashboard/progress' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Progress Tracking
        </h1>
        <p className="text-sm text-brand-850">
          Monitor your skin health index curve and capture weekly visual logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Before & After Photo Placeholders */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Before & After Visuals</h3>
            <p className="text-xs text-brand-800">Visual comparison of skin barrier restoration</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-600 block text-center">Before (Week 0)</span>
              <div className="aspect-square bg-brand-100/50 border border-brand-200 rounded-2xl flex flex-col items-center justify-center text-brand-500 relative overflow-hidden group">
                <Camera className="w-8 h-8 stroke-1" />
                <span className="text-[10px] font-display font-bold mt-1">July 1</span>
                {/* Simulated placeholder */}
                <div className="absolute inset-0 bg-brand-950/5 flex items-center justify-center" />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-accent-600 block text-center">After (Week 4)</span>
              <div className="aspect-square bg-accent-100/30 border border-accent-200 rounded-2xl flex flex-col items-center justify-center text-accent-650 relative overflow-hidden group">
                <Camera className="w-8 h-8 stroke-1" />
                <span className="text-[10px] font-display font-bold mt-1">Today</span>
                {/* Simulated placeholder */}
                <div className="absolute inset-0 bg-accent-950/5 flex items-center justify-center" />
              </div>
            </div>
          </div>
          
          <button className="w-full btn-primary py-2.5 rounded-xl text-xs font-display flex items-center justify-center gap-1.5 shadow-sm">
            <Camera className="w-4 h-4" />
            Upload Weekly Face Scan
          </button>
        </div>

        {/* Chart progress monitoring */}
        <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Skin Barrier Trend</h3>
            <p className="text-xs text-brand-800">Moisture retention and sensitivity improvements over 30 days</p>
          </div>
          <div className="pt-2">
            <PremiumChart type="line" data={userData.progressChart} height={180} color="brand" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module: Weekly comparison logs */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 md:col-span-2">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Weekly Comparison Logs</h3>
            <p className="text-xs text-brand-800">Weekly diagnostics scores audit compared side-by-side</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                  <th className="py-2 px-1">Week Period</th>
                  <th className="py-2 px-1">Moisture Level</th>
                  <th className="py-2 px-1">Redness Index</th>
                  <th className="py-2 px-1">Blemish Count</th>
                  <th className="py-2 px-1">Diagnostic Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/50">
                <tr className="text-brand-900">
                  <td className="py-2.5 px-1 font-semibold">Week 4 (Current)</td>
                  <td className="py-2.5 px-1">82% (Hydrated)</td>
                  <td className="py-2.5 px-1">Low</td>
                  <td className="py-2.5 px-1">2 Active</td>
                  <td className="py-2.5 px-1 font-bold text-brand-600">82/100</td>
                </tr>
                <tr className="text-brand-900">
                  <td className="py-2.5 px-1 font-semibold">Week 3</td>
                  <td className="py-2.5 px-1">79% (Hydrated)</td>
                  <td className="py-2.5 px-1">Low</td>
                  <td className="py-2.5 px-1">4 Active</td>
                  <td className="py-2.5 px-1">80/100</td>
                </tr>
                <tr className="text-brand-900">
                  <td className="py-2.5 px-1 font-semibold">Week 2</td>
                  <td className="py-2.5 px-1">72% (Mild Dry)</td>
                  <td className="py-2.5 px-1">Medium</td>
                  <td className="py-2.5 px-1">7 Active</td>
                  <td className="py-2.5 px-1">75/100</td>
                </tr>
                <tr className="text-brand-900">
                  <td className="py-2.5 px-1 font-semibold">Week 1</td>
                  <td className="py-2.5 px-1">65% (Dry)</td>
                  <td className="py-2.5 px-1">High</td>
                  <td className="py-2.5 px-1">11 Active</td>
                  <td className="py-2.5 px-1">68/100</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Module: Skin improvement timeline */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Improvement Timeline</h3>
            <p className="text-xs text-brand-800">Critical milestones reached during plan</p>
          </div>
          
          <div className="space-y-3 font-sans text-xs relative pl-3.5 border-l border-brand-100 ml-2">
            <div className="relative">
              <div className="absolute -left-[20px] top-1 w-2 h-2 rounded-full bg-brand-500 border border-white" />
              <div className="font-semibold text-slate-900">Barrier Shield Restored</div>
              <p className="text-[10px] text-brand-800 leading-normal">Moisture retention increased. Dry patch flakiness reduced by 90%.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[20px] top-1 w-2 h-2 rounded-full bg-brand-500 border border-white" />
              <div className="font-semibold text-slate-900">Redness Calmed</div>
              <p className="text-[10px] text-brand-800 leading-normal">Soothed inflamed cheek patches. Reduced vascular irritation flares.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[20px] top-1 w-2 h-2 rounded-full bg-brand-500 border border-white" />
              <div className="font-semibold text-slate-900">Plan Compliance Locked</div>
              <p className="text-[10px] text-brand-800 leading-normal">Maintained a consecutive 12-day routine checklist consistency.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
