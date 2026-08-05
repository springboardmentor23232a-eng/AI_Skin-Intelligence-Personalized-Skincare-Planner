import React from 'react';
import adminData from '../data/adminData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import { Sparkles, TrendingUp, Calendar, Cpu } from 'lucide-react';

export default function PlatformAnalytics() {
  const crumbs = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Platform Analytics', path: '/admin/analytics' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Platform Analytics
        </h1>
        <p className="text-sm text-brand-850">
          Global metrics tracking active accounts growth, feature usage, and daily interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core platform stats */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Platform Performance</h3>
            <p className="text-xs text-brand-800">Monthly telemetry aggregate statistics</p>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-1">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Daily Active Users (DAU)</span>
              <div className="text-xl font-black text-brand-950">482 Users</div>
              <p className="text-[10px] text-brand-800 leading-normal">High user density checking off checklists between 8 AM and 9 PM.</p>
            </div>

            <div className="p-4 bg-accent-50/50 border border-accent-100/50 rounded-2xl space-y-1">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-accent-700 block">Feature Usage</span>
              <div className="text-xl font-black text-slate-950">Skincare Checklist (74%)</div>
              <p className="text-[10px] text-brand-800 leading-normal">Followed closely by AI Skin Health Scoring scans (68%) and Clinical Treatments requests (42%).</p>
            </div>
          </div>
        </div>

        {/* User growth chart */}
        <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 font-display">User Registrations Growth</h3>
            <p className="text-xs text-brand-800">Daily platform signup trends monitored over 7 days</p>
          </div>
          <div>
            <PremiumChart type="bar" data={adminData.registrationsChart} height={180} color="brand" />
          </div>
        </div>

      </div>

      {/* Feature telemetry */}
      <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">Feature Engagement Matrix</h3>
          <p className="text-xs text-brand-800">Usage parameters across system components</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
            <h4 className="font-semibold text-slate-900">AI Skin Scanner</h4>
            <p className="text-[10.5px] text-brand-850 leading-normal">3,240 diagnostic scans completed. Overall scan rating: 98.4% success.</p>
          </div>

          <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
            <h4 className="font-semibold text-slate-900">EMR Treatment Portal</h4>
            <p className="text-[10.5px] text-brand-850 leading-normal">412 overrides processed by clinical doctors. Average approval time: 14 mins.</p>
          </div>

          <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
            <h4 className="font-semibold text-slate-900">Routine Checklists</h4>
            <p className="text-[10.5px] text-brand-850 leading-normal">14,812 checklist logs marked off by active users over 30 days.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
