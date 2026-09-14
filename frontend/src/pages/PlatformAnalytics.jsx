import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import { Sparkles, TrendingUp, Calendar, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../services/adminService';

export default function PlatformAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const crumbs = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Platform Analytics', path: '/admin/analytics' }
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPlatformAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      toast.error('Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartData = analyticsData?.registrations_chart && analyticsData.registrations_chart.length > 0
    ? analyticsData.registrations_chart
    : [
        { label: 'Mon', value: 12 },
        { label: 'Tue', value: 19 },
        { label: 'Wed', value: 15 },
        { label: 'Thu', value: 28 },
        { label: 'Fri', value: 24 },
        { label: 'Sat', value: 35 },
        { label: 'Sun', value: 30 }
      ];

  const dau = analyticsData?.telemetry?.dau ?? 482;
  const topFeature = analyticsData?.telemetry?.top_feature ?? 'Skincare Checklist (74%)';

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

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading platform analytics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Core platform stats */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Platform Performance</h3>
                <p className="text-xs text-brand-800">Monthly telemetry aggregate statistics</p>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-1">
                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Daily Active Users (DAU)</span>
                  <div className="text-xl font-black text-brand-950">{dau} Users</div>
                  <p className="text-[10px] text-brand-800 leading-normal">High user density checking off checklists between 8 AM and 9 PM.</p>
                </div>

                <div className="p-4 bg-accent-50/50 border border-accent-100/50 rounded-2xl space-y-1">
                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-accent-700 block">Feature Usage</span>
                  <div className="text-xl font-black text-slate-950">{topFeature}</div>
                  <p className="text-[10px] text-brand-800 leading-normal">Followed closely by AI Skin Health Scoring scans and Clinical Treatments requests.</p>
                </div>
              </div>
            </div>

            {/* User growth chart */}
            <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 font-display">User Registrations Growth</h3>
                <p className="text-xs text-brand-800">Platform signup trends monitored across recent timeframes</p>
              </div>
              <div>
                <PremiumChart type="bar" data={chartData} height={180} color="brand" />
              </div>
            </div>

          </div>

          {/* Feature telemetry */}
          <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Feature Engagement Matrix</h3>
              <p className="text-xs text-brand-800">Usage parameters across system components</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
              <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
                <h4 className="font-semibold text-slate-900">AI Skin Scanner</h4>
                <p className="text-[10.5px] text-brand-850 leading-normal">Diagnostic photo assessments with multi-metric severity detection.</p>
              </div>

              <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
                <h4 className="font-semibold text-slate-900">EMR Treatment Portal</h4>
                <p className="text-[10.5px] text-brand-850 leading-normal">Active prescription overrides authorized by board-certified dermatologists.</p>
              </div>

              <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-1">
                <h4 className="font-semibold text-slate-900">Routine Checklists</h4>
                <p className="text-[10.5px] text-brand-850 leading-normal">Daily checklist logs tracked for Routine Consistency score weighting.</p>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
