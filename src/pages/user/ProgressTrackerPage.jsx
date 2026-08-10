import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  FileText,
  Download,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProgressTrackerPage() {
  const { fetchWithAuth } = useAuth();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ============================================================
  // FETCH REAL ASSESSMENT HISTORY
  // ============================================================
  useEffect(() => {
    const loadAssessmentHistory = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetchWithAuth(
          'http://127.0.0.1:8000/assessment/history',
          {
            method: 'GET',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail || 'Unable to load assessment history.'
          );
        }

        // Backend returns an array of assessments
        setAssessments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Assessment history error:', err);
        setError(
          err.message || 'Unable to load assessment history.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssessmentHistory();
  }, [fetchWithAuth]);

  // ============================================================
  // PREPARE REAL HEALTH SCORE DATA
  // ============================================================
  const trendData = [...assessments]
    .sort(
      (a, b) =>
        new Date(a.assessment_time) -
        new Date(b.assessment_time)
    )
    .slice(-4)
    .map((assessment, index) => ({
      week: `Scan ${index + 1}`,
      score: assessment.health_score,
    }));

  // ============================================================
  // CALCULATE IMPROVEMENT
  // ============================================================
  let improvement = 0;

  if (trendData.length >= 2) {
    const firstScore = trendData[0].score;
    const latestScore =
      trendData[trendData.length - 1].score;

    if (firstScore > 0) {
      improvement = Math.round(
        ((latestScore - firstScore) / firstScore) * 100
      );
    }
  }

  // ============================================================
  // FIRST AND LATEST ASSESSMENT
  // ============================================================
  const sortedAssessments = [...assessments].sort(
    (a, b) =>
      new Date(a.assessment_time) -
      new Date(b.assessment_time)
  );

  const firstAssessment = sortedAssessments[0];
  const latestAssessment =
    sortedAssessments[sortedAssessments.length - 1];

  return (
    <div className="space-y-6">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-white">
            Progress Tracking & Reports
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Document Section 8 & 11: Trend analysis, routine
            adherence, before/after analysis, and PDF/Excel export.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export PDF Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            Export Excel Log
          </Button>
        </div>
      </div>

      {/* ======================================================
          LOADING
      ======================================================= */}
      {loading && (
        <GlassCard>
          <p className="text-sm text-slate-400">
            Loading your assessment history...
          </p>
        </GlassCard>
      )}

      {/* ======================================================
          ERROR
      ======================================================= */}
      {error && (
        <GlassCard>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        </GlassCard>
      )}

      {/* ======================================================
          NO ASSESSMENTS
      ======================================================= */}
      {!loading &&
        !error &&
        assessments.length === 0 && (
          <GlassCard>
            <div className="text-center py-8">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-3" />

              <h3 className="font-bold text-white">
                No Assessments Yet
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                Complete your first skin assessment to start
                tracking your progress.
              </p>
            </div>
          </GlassCard>
        )}

      {/* ======================================================
          REAL ASSESSMENT SUMMARY
      ======================================================= */}
      {!loading && assessments.length > 0 && (
        <GlassCard className="space-y-4">

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Assessment History
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {assessments.length} assessment
                {assessments.length !== 1 ? 's' : ''} recorded
              </p>
            </div>

            {latestAssessment?.health_score !== undefined && (
              <Badge variant="emerald">
                Latest Score: {latestAssessment.health_score}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">
                Latest Skin Type
              </p>

              <p className="text-lg font-bold text-emerald-400 mt-1">
                {latestAssessment?.predicted_skin_type || '—'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">
                Latest Health Score
              </p>

              <p className="text-lg font-bold text-cyan-400 mt-1">
                {latestAssessment?.health_score ?? '—'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">
                Latest Concern
              </p>

              <p className="text-lg font-bold text-amber-400 mt-1">
                {latestAssessment?.vision_predicted_concern ||
                  '—'}
              </p>
            </div>

          </div>
        </GlassCard>
      )}

      {/* ======================================================
          SKIN HEALTH PROGRESS TREND
      ======================================================= */}
      {!loading && assessments.length > 0 && (
        <GlassCard className="space-y-4">

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">

            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />

              <h2 className="text-lg font-bold text-white">
                Skin Health Progress Trend
              </h2>
            </div>

            {trendData.length >= 2 && (
              <Badge
                variant={
                  improvement >= 0
                    ? 'emerald'
                    : 'default'
                }
              >
                {improvement >= 0 ? '+' : ''}
                {improvement}% Change
              </Badge>
            )}

          </div>

          {/* REAL DATABASE HEALTH SCORES */}
          <div className="h-48 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-800">

            {trendData.map((item) => (
              <div
                key={item.week}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >

                <span className="text-xs font-bold text-emerald-400">
                  {item.score}
                </span>

                <div
                  className="w-full bg-gradient-to-t from-emerald-600/40 to-teal-400 rounded-t-xl transition-all duration-500 hover:brightness-125"
                  style={{
                    height: `${Math.max(
                      5,
                      Math.min(item.score, 100)
                    )}%`,
                  }}
                />

                <span className="text-[11px] text-slate-400 font-medium">
                  {item.week}
                </span>

              </div>
            ))}

          </div>
        </GlassCard>
      )}

      {/* ======================================================
          BEFORE / AFTER COMPARISON
      ======================================================= */}
      {!loading && assessments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* FIRST ASSESSMENT */}
          <GlassCard className="space-y-3 text-center p-8">

            <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
              <ImageIcon className="w-8 h-8" />
            </div>

            <h3 className="font-bold text-white text-base">
              Baseline Scan
            </h3>

            {firstAssessment ? (
              <>
                <p className="text-xs text-slate-400">
                  Skin Type:{' '}
                  {firstAssessment.predicted_skin_type || '—'}
                </p>

                <p className="text-xs text-slate-400">
                  Health Score:{' '}
                  {firstAssessment.health_score ?? '—'}
                </p>

                <p className="text-xs text-slate-400">
                  Concern:{' '}
                  {firstAssessment.vision_predicted_concern ||
                    '—'}
                </p>

                <p className="text-[11px] text-slate-500">
                  {firstAssessment.assessment_time
                    ? new Date(
                        firstAssessment.assessment_time
                      ).toLocaleString()
                    : ''}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                No baseline assessment available.
              </p>
            )}

          </GlassCard>

          {/* LATEST ASSESSMENT */}
          <GlassCard className="space-y-3 text-center p-8 border-emerald-500/30">

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-bold text-white text-base">
              Current Scan
            </h3>

            {latestAssessment ? (
              <>
                <p className="text-xs text-slate-400">
                  Skin Type:{' '}
                  {latestAssessment.predicted_skin_type ||
                    '—'}
                </p>

                <p className="text-xs text-slate-400">
                  Health Score:{' '}
                  {latestAssessment.health_score ?? '—'}
                </p>

                <p className="text-xs text-slate-400">
                  Concern:{' '}
                  {latestAssessment.vision_predicted_concern ||
                    '—'}
                </p>

                <p className="text-[11px] text-slate-500">
                  {latestAssessment.assessment_time
                    ? new Date(
                        latestAssessment.assessment_time
                      ).toLocaleString()
                    : ''}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                No current assessment available.
              </p>
            )}

          </GlassCard>
        </div>
      )}

      {/* ======================================================
          ALL ASSESSMENTS
      ======================================================= */}
      {!loading && assessments.length > 0 && (
        <GlassCard className="space-y-4">

          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white">
              Previous Assessments
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Your assessment records retrieved from the database.
            </p>
          </div>

          <div className="space-y-3">

            {sortedAssessments
              .slice()
              .reverse()
              .map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div>
                      <p className="font-semibold text-white">
                        Assessment #{assessment.id}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {assessment.assessment_time
                          ? new Date(
                              assessment.assessment_time
                            ).toLocaleString()
                          : 'Date unavailable'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      <Badge variant="emerald">
                        Score: {assessment.health_score}
                      </Badge>

                      <Badge>
                        {assessment.predicted_skin_type}
                      </Badge>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

                    <div>
                      <p className="text-[11px] text-slate-500">
                        Condition
                      </p>

                      <p className="text-sm text-slate-300">
                        {assessment.overall_condition || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500">
                        Vision Concern
                      </p>

                      <p className="text-sm text-amber-300">
                        {assessment.vision_predicted_concern ||
                          '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500">
                        Confidence
                      </p>

                      <p className="text-sm text-cyan-300">
                        {assessment.vision_confidence || '—'}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

          </div>
        </GlassCard>
      )}

    </div>
  );
}