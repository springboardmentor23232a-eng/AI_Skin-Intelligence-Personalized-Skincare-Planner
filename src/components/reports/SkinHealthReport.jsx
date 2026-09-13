import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, AlertCircle, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

export function SkinHealthReport({ data, loading, error, onRetry, onExportPDF, onExportExcel, exportingPDF, exportingExcel }) {
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
          <h3 className="font-bold text-white mb-2">No Skin Health Data</h3>
          <p className="text-sm text-slate-400">
            Complete a skin assessment to view your health report.
          </p>
        </div>
      </GlassCard>
    );
  }

  // Safely extract data with proper fallbacks to prevent runtime errors
  const overall_score = data.overall_score || 0;
  const category = data.category || 'Unknown';
  const factor_scores = data.factor_scores || {};
  const factor_weights = data.weights || {};
  const assessment_summary = data.assessment_summary || null;
  const adherence_summary = data.routine_adherence || null;
  const hydration_summary = data.hydration || null;
  const sleep_summary = data.sleep || null;
  const recommendations = data.recommendations || [];
  const trend = data.trend || [];

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

      {/* Overall Score */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-white mb-3">Overall Skin Health Score</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={351.86}
                strokeDashoffset={351.86 - (351.86 * (overall_score || 0)) / 100}
                className="text-emerald-400 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{Math.round(overall_score)}</span>
              <span className="text-xs text-slate-400">out of 100</span>
            </div>
          </div>
          <div className="flex-1">
            <Badge variant="emerald" className="mb-2 text-sm">{category}</Badge>
            {trend && trend.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">
                  {trend.length} assessments tracked
                </span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Factor Scores */}
      {factor_scores && Object.keys(factor_scores).length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Factor Scores</h3>
          <div className="space-y-4">
            {Object.entries(factor_scores).map(([factor, score]) => {
              const weight = factor_weights && factor_weights[factor] ? factor_weights[factor] : 1;
              const scoreValue = typeof score === 'number' ? score : 0;
              return (
                <div key={factor}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 capitalize">{factor.replace(/_/g, ' ')}</span>
                    <span className="text-white font-medium">{Math.round(scoreValue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        scoreValue >= 80 ? 'bg-emerald-400' : scoreValue >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, scoreValue))}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Weight: {weight}x</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Assessment Summary */}
      {assessment_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Assessment Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Skin Type</p>
              <p className="text-lg font-bold text-white">{assessment_summary.predicted_skin_type || 'Unknown'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Assessment Date</p>
              <p className="text-lg font-bold text-emerald-400">
                {assessment_summary.assessment_time ? new Date(assessment_summary.assessment_time).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Adherence Summary */}
      {adherence_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Routine Adherence</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Total Logs</p>
              <p className="text-lg font-bold text-white">{adherence_summary.total_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Average Adherence</p>
              <p className="text-lg font-bold text-cyan-400">{adherence_summary.average_percentage || 0}%</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Hydration Summary */}
      {hydration_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Hydration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Total Logs</p>
              <p className="text-lg font-bold text-white">{hydration_summary.total_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Avg Glasses/Day</p>
              <p className="text-lg font-bold text-cyan-400">{hydration_summary.average_glasses || 0}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Sleep Summary */}
      {sleep_summary && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Sleep</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Total Logs</p>
              <p className="text-lg font-bold text-white">{sleep_summary.total_logs || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Avg Hours/Night</p>
              <p className="text-lg font-bold text-violet-400">{sleep_summary.average_hours || 0}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Recommendations */}
      {recommendations && Array.isArray(recommendations) && recommendations.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Recommendations</h3>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <p className="text-sm text-slate-300">{String(rec)}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
