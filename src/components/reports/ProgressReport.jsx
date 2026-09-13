import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, Calendar, Droplets, Moon, AlertCircle, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

export function ProgressReport({ data, loading, error, onRetry, onExportPDF, onExportExcel, exportingPDF, exportingExcel }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  if (!data || !data.assessment_trend) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="font-bold text-white mb-2">No Progress Data</h3>
          <p className="text-sm text-slate-400">
            Complete assessments and log activities to see your progress.
          </p>
        </div>
      </GlassCard>
    );
  }

  const { assessment_summary, assessment_trend, adherence_summary, adherence_history, hydration_summary, hydration_history, sleep_summary, sleep_history } = data;

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      {data && (
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

      {/* Date Filters */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Date Range Filter
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm"
            />
          </div>
        </div>
      </GlassCard>

      {/* Assessment Summary */}
      {assessment_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Assessment Progress
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Assessments</p>
              <p className="text-lg font-bold text-white">{assessment_summary.total_assessments || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">First Score</p>
              <p className="text-lg font-bold text-slate-300">{assessment_summary.first_score || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Latest Score</p>
              <p className="text-lg font-bold text-emerald-400">{assessment_summary.latest_score || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Change</p>
              <p className={`text-lg font-bold ${(assessment_summary.score_change || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(assessment_summary.score_change || 0) >= 0 ? '+' : ''}{assessment_summary.score_change || 0}
              </p>
            </div>
          </div>

          {/* Assessment Trend Chart */}
          {assessment_trend && assessment_trend.length > 0 && (
            <div className="h-40 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800 mt-4">
              {assessment_trend.slice(-6).map((item, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <span className="text-xs font-bold text-emerald-400">{item.health_score}</span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600/40 to-emerald-400 rounded-t-xl"
                    style={{ height: `${Math.max(5, item.health_score)}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(item.assessment_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Adherence Summary */}
      {adherence_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Routine Adherence</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Logs</p>
              <p className="text-lg font-bold text-white">{adherence_summary.total_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Average</p>
              <p className="text-lg font-bold text-cyan-400">{adherence_summary.average_adherence || 0}%</p>
            </div>
          </div>

          {adherence_history && adherence_history.length > 0 && (
            <div className="h-32 flex items-end gap-2 pt-4 pb-2 px-2 border-b border-slate-800 mt-4">
              {adherence_history.slice(-7).map((item, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                >
                  <span className="text-[10px] font-bold text-cyan-400">{item.adherence_percentage}%</span>
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t-xl"
                    style={{ height: `${Math.max(5, item.adherence_percentage)}%` }}
                  />
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Hydration Summary */}
      {hydration_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Hydration
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Logs</p>
              <p className="text-lg font-bold text-white">{hydration_summary.total_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Avg Glasses</p>
              <p className="text-lg font-bold text-cyan-400">{hydration_summary.average_glasses || 0}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Sleep Summary */}
      {sleep_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Moon className="w-4 h-4 text-violet-400" />
            Sleep
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Logs</p>
              <p className="text-lg font-bold text-white">{sleep_summary.total_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Avg Hours</p>
              <p className="text-lg font-bold text-violet-400">{sleep_summary.average_hours || 0}</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
