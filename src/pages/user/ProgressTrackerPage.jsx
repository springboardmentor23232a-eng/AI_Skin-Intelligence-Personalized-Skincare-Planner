import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrendingUp, FileText, Download, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function ProgressTrackerPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Progress Tracking & Reports</h1>
          <p className="text-sm text-slate-400 mt-1">
            Document Section 8 & 11: Trend analysis, routine adherence, before/after analysis, and PDF/Excel export.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4 text-emerald-400" /> Export PDF Report
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Export Excel Log
          </Button>
        </div>
      </div>

      {/* Skin Health Progress Trend */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">30-Day Skin Health Progress Trend</h2>
          </div>
          <Badge variant="emerald">+14% Improvement</Badge>
        </div>

        {/* CSS Trend Chart Visualization */}
        <div className="h-48 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-800">
          {[
            { week: 'Week 1', score: 68 },
            { week: 'Week 2', score: 72 },
            { week: 'Week 3', score: 76 },
            { week: 'Week 4', score: 82 },
          ].map((item) => (
            <div key={item.week} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-xs font-bold text-emerald-400">{item.score}</span>
              <div
                className="w-full bg-gradient-to-t from-emerald-600/40 to-teal-400 rounded-t-xl transition-all duration-500 hover:brightness-125"
                style={{ height: `${item.score}%` }}
              ></div>
              <span className="text-[11px] text-slate-400 font-medium">{item.week}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Before / After Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="space-y-3 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-white text-base">Baseline Scan (Day 1)</h3>
          <p className="text-xs text-slate-400">Hyperpigmentation Index: 64 • Sensitivity: Mild Redness</p>
        </GlassCard>

        <GlassCard className="space-y-3 text-center p-8 border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-white text-base">Current Scan (Day 30)</h3>
          <p className="text-xs text-slate-400">Hyperpigmentation Index: 42 (-34%) • Barrier Health: Restored</p>
        </GlassCard>
      </div>
    </div>
  );
}
