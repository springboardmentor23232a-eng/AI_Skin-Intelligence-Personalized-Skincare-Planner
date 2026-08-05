import React from 'react';
import userData from '../data/userData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import { Sparkles, Calendar, Droplet, Smile, ShieldAlert } from 'lucide-react';

export default function SkinHealthScore() {
  const score = userData.userProfile.scores.overall;

  const breakdown = [
    { label: 'Skin Condition', val: 85, icon: Smile, desc: 'Overall moisture level and barrier strength' },
    { label: 'Lifestyle & Diet', val: 78, icon: Calendar, desc: 'Impact of exercise, diet, and stress logs' },
    { label: 'Routine Consistency', val: userData.userProfile.scores.adherence, icon: Sparkles, desc: 'Checklist compliance rate over 14 days' },
    { label: 'Sleep Quality', val: userData.userProfile.scores.sleep, icon: Sparkles, desc: 'Average sleep duration against target' },
    { label: 'Hydration Status', val: userData.userProfile.scores.hydration, icon: Droplet, desc: 'Water intake log compliance rate' },
  ];

  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Skin Health Score', path: '/dashboard/score' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Skin Health Score
        </h1>
        <p className="text-sm text-brand-850">
          In-depth diagnostic assessment from your active skin scanner scans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Dial */}
        <div className="glass-effect border border-brand-100 p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-600">
            Overall Health Index
          </span>
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#f4fbf7" strokeWidth="2.5" />
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="#2d8f66" 
                strokeWidth="2.5" 
                strokeDasharray={`${score}, 100`} 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black font-display text-brand-950">{score}</span>
              <span className="text-[10px] font-display font-bold uppercase text-brand-600 tracking-wider">/ 100</span>
            </div>
          </div>

          <div className="bg-brand-50/50 px-4 py-2 rounded-2xl border border-brand-100 max-w-xs text-xs text-brand-900 leading-normal">
            Your skin barrier is <strong>Healthy</strong>. Continue adhering to the morning protection SPF sequence to maintain metrics.
          </div>
        </div>

        {/* Breakdown progress bars */}
        <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Diagnostic Breakdown</h3>
            <p className="text-xs text-brand-800">Score parameters evaluated by AI skin diagnostic layers</p>
          </div>

          <div className="space-y-4">
            {breakdown.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-brand-50 border border-brand-100 rounded-lg text-brand-600">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">{item.label}</span>
                        <span className="hidden md:inline text-[10px] text-brand-800 ml-2">— {item.desc}</span>
                      </div>
                    </div>
                    <span className="font-bold text-brand-950">{item.val}%</span>
                  </div>
                  <div className="w-full bg-brand-100/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Improvement trend chart */}
      <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">Score Trend Over Time</h3>
          <p className="text-xs text-brand-800">Visual index improvements monitored across weekly check-in scans</p>
        </div>
        <div className="pt-2">
          <PremiumChart type="line" data={userData.progressChart} height={180} color="brand" />
        </div>
      </div>

    </div>
  );
}
