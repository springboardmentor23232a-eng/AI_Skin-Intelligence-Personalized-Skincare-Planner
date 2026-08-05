import React from 'react';
import consultantData from '../data/consultantData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';

export default function ProgressMonitoring() {
  const crumbs = [
    { label: 'Dashboard', path: '/consultant' },
    { label: 'Progress Monitoring', path: '/consultant/progress' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Progress Monitoring
        </h1>
        <p className="text-sm text-brand-850">
          Track active routine adherence rates and overall score improvements across your client roster.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core metrics overview */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Roster Statistics</h3>
            <p className="text-xs text-brand-800">Aggregated client metrics over 30 days</p>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-1">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Routine Adherence</span>
              <div className="text-xl font-black text-brand-950">84.2% Average</div>
              <p className="text-[10px] text-brand-800 leading-normal">Clients successfully check off their AM/PM steps 6 out of 7 days on average.</p>
            </div>

            <div className="p-4 bg-accent-50/50 border border-accent-100/50 rounded-2xl space-y-1">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-accent-700 block">Skin Barrier Improvement</span>
              <div className="text-xl font-black text-slate-950">+12.4 Points</div>
              <p className="text-[10px] text-brand-800 leading-normal">Average score gain calculated from week 0 to week 4 check-in face scans.</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Weekly Progress Distribution</h3>
            <p className="text-xs text-brand-800">Improvement scores classified across diagnostic zones</p>
          </div>
          <div>
            <PremiumChart type="bar" data={consultantData.improvementTrends} height={180} color="accent" />
          </div>
        </div>

      </div>

      {/* Roster logs table */}
      <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">Roster Compliance & History</h3>
          <p className="text-xs text-brand-800">Detailed compliance matrix of client check-ins</p>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                <th className="py-2.5 px-2">Client Name</th>
                <th className="py-2.5 px-2">Diagnostic Score</th>
                <th className="py-2.5 px-2">AM/PM Adherence</th>
                <th className="py-2.5 px-2">Weekly Face Scan</th>
                <th className="py-2.5 px-2">Last Consultant Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/50">
              <tr className="text-brand-900 font-sans">
                <td className="py-3 px-2 font-semibold text-slate-900">Sarah Connor</td>
                <td className="py-3 px-2 font-bold text-brand-600">82 / 100</td>
                <td className="py-3 px-2">92%</td>
                <td className="py-3 px-2 text-emerald-700 font-bold">✓ Logged</td>
                <td className="py-3 px-2">August 1, 2026</td>
              </tr>
              <tr className="text-brand-900 font-sans">
                <td className="py-3 px-2 font-semibold text-slate-900">John Doe</td>
                <td className="py-3 px-2">78 / 100</td>
                <td className="py-3 px-2">80%</td>
                <td className="py-3 px-2 text-emerald-700 font-bold">✓ Logged</td>
                <td className="py-3 px-2">July 28, 2026</td>
              </tr>
              <tr className="text-brand-900 font-sans">
                <td className="py-3 px-2 font-semibold text-slate-900">Kate Austin</td>
                <td className="py-3 px-2">74 / 100</td>
                <td className="py-3 px-2 font-semibold text-amber-700">65%</td>
                <td className="py-3 px-2 text-amber-700 font-semibold">⚠️ Pending</td>
                <td className="py-3 px-2">July 25, 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
