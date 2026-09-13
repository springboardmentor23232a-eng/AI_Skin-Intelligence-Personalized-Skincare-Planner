import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Sun, Moon, AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

export function RoutineReport({ data, loading, error, onRetry, onExportPDF, onExportExcel, exportingPDF, exportingExcel }) {
  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <p className="text-sm text-rose-300 mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-medium hover:bg-rose-500/30"
            >
              Retry
            </button>
          )}
        </div>
      </GlassCard>
    );
  }

  if (!data) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="font-bold text-white mb-2">No Routine Data</h3>
          <p className="text-sm text-slate-400">
            Create a skincare routine to view your routine report.
          </p>
        </div>
      </GlassCard>
    );
  }

  // Extract routine data - backend returns routine data with morning_routine and evening_routine
  const routineData = data.routine || {};
  const morning_routine = routineData.morning_routine || [];
  const evening_routine = routineData.evening_routine || [];
  const { adherence_summary, adherence_history } = data;

  // If no routine exists at all, show empty state
  if (!routineData || (morning_routine.length === 0 && evening_routine.length === 0)) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="font-bold text-white mb-2">No Routine Data</h3>
          <p className="text-sm text-slate-400">
            Create a skincare routine to view your routine report.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      {data && (morning_routine.length > 0 || evening_routine.length > 0) && (
        <div className="flex gap-3">
          <button
            onClick={onExportPDF}
            disabled={exportingPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-medium hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {exportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={onExportExcel}
            disabled={exportingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm font-medium hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {exportingExcel ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Excel...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                Download Excel
              </>
            )}
          </button>
        </div>
      )}

      {/* Morning Routine */}
      {morning_routine && morning_routine.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            Morning Routine
          </h3>
          <div className="space-y-2">
            {morning_routine.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{step.product_name || step.name}</p>
                  <Badge variant="amber">{step.category}</Badge>
                </div>
                {step.instructions && (
                  <p className="text-xs text-amber-300 mt-1">{step.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Evening Routine */}
      {evening_routine && evening_routine.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Moon className="w-4 h-4 text-violet-400" />
            Evening Routine
          </h3>
          <div className="space-y-2">
            {evening_routine.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{step.product_name || step.name}</p>
                  <Badge variant="violet">{step.category}</Badge>
                </div>
                {step.instructions && (
                  <p className="text-xs text-violet-300 mt-1">{step.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Adherence Summary */}
      {adherence_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Adherence Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Total Logs</p>
              <p className="text-lg font-bold text-white">{adherence_summary.total_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Morning</p>
              <p className="text-lg font-bold text-amber-400">{adherence_summary.morning_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Evening</p>
              <p className="text-lg font-bold text-violet-400">{adherence_summary.evening_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Avg Adherence</p>
              <p className="text-lg font-bold text-emerald-400">{adherence_summary.average_adherence || 0}%</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Adherence History */}
      {adherence_history && adherence_history.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Recent Adherence</h3>
          <div className="space-y-2">
            {adherence_history.slice(-5).map((log, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center"
              >
                <span className="text-sm text-slate-300">
                  {new Date(log.log_date).toLocaleDateString()}
                </span>
                <Badge variant={log.adherence_percentage >= 80 ? 'emerald' : 'amber'}>
                  {log.adherence_percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
