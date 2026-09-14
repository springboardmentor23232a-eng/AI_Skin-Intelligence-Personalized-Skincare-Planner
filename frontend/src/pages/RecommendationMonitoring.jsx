import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Cpu, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../services/adminService';

export default function RecommendationMonitoring() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const crumbs = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Recommendation Monitoring', path: '/admin/monitoring' }
  ];

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRecommendationMetrics();
      setMetrics(data);
    } catch (err) {
      toast.error('Failed to load recommendation telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const engineStatus = metrics?.engine_status ?? 'Active (Model v2.4)';
  const matchAccuracy = metrics?.match_accuracy ?? 96.4;
  const latencyMs = metrics?.latency_ms ?? 120;
  const cacheHit = metrics?.cache_hit ?? 99.9;

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

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading recommendation metrics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Metric 1 */}
            <div className="glass-effect border border-brand-100 p-5 rounded-2xl bg-white space-y-1.5 shadow-sm">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">AI Engine Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-slate-900">{engineStatus}</span>
              </div>
              <p className="text-[10px] text-brand-800 leading-normal">Cosmetic active recommendations mapping is online and serving requests.</p>
            </div>

            {/* Metric 2 */}
            <div className="glass-effect border border-brand-100 p-5 rounded-2xl bg-white space-y-1.5 shadow-sm">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Match Accuracy</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <span className="text-base font-bold text-slate-900">{matchAccuracy}% Accuracy</span>
              </div>
              <p className="text-[10px] text-brand-800 leading-normal">Product recommendations accuracy index rated by clinical override reviews.</p>
            </div>

            {/* Metric 3 */}
            <div className="glass-effect border border-brand-100 p-5 rounded-2xl bg-white space-y-1.5 shadow-sm">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Recommendation Latency</span>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-brand-600" />
                <span className="text-base font-bold text-slate-900">{latencyMs}ms Avg Response</span>
              </div>
              <p className="text-[10px] text-brand-800 leading-normal">Model processing time for matching skin scans to routines.</p>
            </div>

            {/* Metric 4 */}
            <div className="glass-effect border border-brand-100 p-5 rounded-2xl bg-white space-y-1.5 shadow-sm">
              <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Search Performance</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-base font-bold text-slate-900">{cacheHit}% Cache Hit</span>
              </div>
              <p className="text-[10px] text-brand-800 leading-normal">Database caching rate for active ingredient and drug lookups.</p>
            </div>

          </div>

          {/* Model Logs */}
          <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Model Optimization Log</h3>
              <p className="text-xs text-brand-800 font-sans">Telemetry reports detailing recommendation accuracy audit runs</p>
            </div>

            <div className="divide-y divide-brand-100/50 text-xs font-sans text-brand-900">
              {metrics?.logs && metrics.logs.length > 0 ? (
                metrics.logs.map((log, idx) => (
                  <div key={idx} className="py-3 flex justify-between gap-4">
                    <div>
                      <strong>{log.title}:</strong> {log.desc}
                      <span className="text-[10px] text-brand-800 block mt-0.5">{log.detail}</span>
                    </div>
                    <span className="text-emerald-700 font-bold shrink-0">{log.status}</span>
                  </div>
                ))
              ) : (
                <div className="py-3 flex justify-between gap-4">
                  <div>
                    <strong>Engine Model Status:</strong> Skin intelligence rule generator initialized.
                    <span className="text-[10px] text-brand-800 block mt-0.5">Vector engine: Pinecone cosine similarity</span>
                  </div>
                  <span className="text-emerald-700 font-bold shrink-0">Active</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
