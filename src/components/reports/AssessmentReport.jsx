import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Calendar, AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

export function AssessmentReport({ data, loading, error, onRetry, onExportPDF, onExportExcel, exportingPDF, exportingExcel }) {
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
          <h3 className="font-bold text-white mb-2">No Skin Assessment Available</h3>
          <p className="text-sm text-slate-400">
            Complete a skin assessment to view your detailed report.
          </p>
        </div>
      </GlassCard>
    );
  }

  // Backend returns assessment data directly in data object
  const assessment = data;
  const concerns = data.concerns || [];
  const predicted_concern = data.vision_predicted_concern;
  const recommendations = data.recommendations || [];

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

      {/* Assessment Summary */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-slate-400">
            Assessment Date: {new Date(assessment.assessment_time).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-slate-400">Skin Type</p>
            <p className="text-lg font-bold text-white">{assessment.predicted_skin_type || 'Not specified'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-slate-400">Health Score</p>
            <p className="text-lg font-bold text-emerald-400">{assessment.health_score || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-slate-400">Sensitivity</p>
            <p className="text-lg font-bold text-white">{assessment.skin_properties?.sensitivity || 'Normal'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-slate-400">Overall Condition</p>
            <p className="text-lg font-bold text-white">{assessment.overall_condition || 'Unknown'}</p>
          </div>
        </div>
      </GlassCard>

      {/* Concerns */}
      {concerns && concerns.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Identified Concerns
          </h3>
          <div className="flex flex-wrap gap-2">
            {concerns.map((concern, idx) => (
              <Badge key={idx} variant="amber">{concern}</Badge>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Predicted Concern */}
      {predicted_concern && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3">Predicted Concern</h3>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-300">{predicted_concern}</p>
          </div>
        </GlassCard>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <p className="text-sm text-slate-300">{rec}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
