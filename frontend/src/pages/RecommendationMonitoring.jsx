import React from 'react';
import adminData from '../data/adminData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { Cpu, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export default function RecommendationMonitoring() {
  const crumbs = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Recommendation Monitoring', path: '/admin/monitoring' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Recommendation Monitoring
        </h1>
        <p className="text-sm text-brand-850">
          Audit recommendation models, database search latencies, and match accuracy parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="glass-effect border border-brand-100 p-5 rounded-2xl space-y-1.5 shadow-sm">
          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">AI Engine Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-slate-900">Active (Model v2.4)</span>
          </div>
          <p className="text-[10px] text-brand-800 leading-normal">Cosmetic active recommendations mapping is online and serving requests.</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-effect border border-brand-100 p-5 rounded-2xl space-y-1.5 shadow-sm">
          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Match Accuracy</span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <span className="text-base font-bold text-slate-900">96.4% Accuracy</span>
          </div>
          <p className="text-[10px] text-brand-800 leading-normal">Product recommendations accuracy index rated by doctor override reviews.</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-effect border border-brand-100 p-5 rounded-2xl space-y-1.5 shadow-sm">
          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Recommendation Latency</span>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-600" />
            <span className="text-base font-bold text-slate-900">120ms Avg Response</span>
          </div>
          <p className="text-[10px] text-brand-800 leading-normal">Model processing time for matching skin scans to routines.</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-effect border border-brand-100 p-5 rounded-2xl space-y-1.5 shadow-sm">
          <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Search Performance</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-base font-bold text-slate-900">99.9% Cache Hit</span>
          </div>
          <p className="text-[10px] text-brand-800 leading-normal">Redis cluster caching rate for static ingredient lookups.</p>
        </div>

      </div>

      {/* Model Logs */}
      <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">Model Optimization Log</h3>
          <p className="text-xs text-brand-800 font-sans">Telemetry reports detailing recommendation accuracy audit runs</p>
        </div>

        <div className="divide-y divide-brand-100/50 text-xs font-sans text-brand-900">
          <div className="py-3 flex justify-between gap-4">
            <div>
              <strong>Model Training Checkpoint:</strong> Verified validation loss decreased to 0.082.
              <span className="text-[10px] text-brand-800 block mt-0.5">Engine model: SkincareClassifier-CNN-v2</span>
            </div>
            <span className="text-emerald-700 font-bold shrink-0">Success</span>
          </div>

          <div className="py-3 flex justify-between gap-4">
            <div>
              <strong>Ingredient Mapping Refresh:</strong> Pre-loaded 42 new brand products into the vector search memory database.
              <span className="text-[10px] text-brand-800 block mt-0.5">Database: Pinecone Vector Index</span>
            </div>
            <span className="text-emerald-700 font-bold shrink-0">Success</span>
          </div>

          <div className="py-3 flex justify-between gap-4">
            <div>
              <strong>Accuracy Verification:</strong> Random sample audit of 100 automatic recommendations checked by doctor reviews.
              <span className="text-[10px] text-brand-800 block mt-0.5">Result: 97 matches approved without overrides</span>
            </div>
            <span className="text-emerald-700 font-bold shrink-0">97% Match</span>
          </div>
        </div>
      </div>

    </div>
  );
}
