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

  const [adherenceHistory, setAdherenceHistory] = useState([]);
  const [adherenceLoading, setAdherenceLoading] = useState(true);
  const [adherenceError, setAdherenceError] = useState('');

  const [beforeImageError, setBeforeImageError] = useState(false);
  const [afterImageError, setAfterImageError] = useState(false);

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
  
  useEffect(() => {
  const loadAdherenceHistory = async () => {
    try {
      setAdherenceLoading(true);
      setAdherenceError('');

      const response = await fetchWithAuth(
        'http://127.0.0.1:8000/scoring/adherence/history',
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Unable to load routine adherence history.'
        );
      }

      setAdherenceHistory(
        Array.isArray(data?.history) ? data.history : []
      );
    } catch (err) {
      console.error('Routine adherence history error:', err);

      setAdherenceError(
        err.message || 'Unable to load routine adherence history.'
      );
    } finally {
      setAdherenceLoading(false);
    }
  };

  loadAdherenceHistory();
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
    .map((assessment) => ({
      week: assessment.assessment_time
        ? new Date(assessment.assessment_time).toLocaleDateString(
            'en-IN',
            {
              day: '2-digit',
              month: 'short',
            }
          )
        : 'Date N/A',
      score: assessment.health_score,
    }));

  // ============================================================
  // FIRST AND LATEST ASSESSMENT & IMPROVEMENT ANALYSIS
  // ============================================================
  const sortedAssessments = [...assessments].sort(
    (a, b) =>
      new Date(a.assessment_time) -
      new Date(b.assessment_time)
  );

  const baselineAssessment = sortedAssessments[0];
  const currentAssessment = sortedAssessments[sortedAssessments.length - 1];

  const firstAssessment = baselineAssessment;
  const latestAssessment = currentAssessment;

  const getFullImageUrl = (url) => {
    if (!url || typeof url !== 'string' || !url.trim()) return null;
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    return `http://127.0.0.1:8000${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  const assessmentsWithImages = sortedAssessments.filter(
    (a) => a?.image_url && typeof a.image_url === 'string' && a.image_url.trim() !== ''
  );

  let beforeImageAssessment = null;
  let afterImageAssessment = null;

  if (assessmentsWithImages.length === 1) {
    afterImageAssessment = assessmentsWithImages[0];
    beforeImageAssessment = null;
  } else if (assessmentsWithImages.length >= 2) {
    beforeImageAssessment = assessmentsWithImages[0];
    afterImageAssessment = assessmentsWithImages[assessmentsWithImages.length - 1];
  }

  const beforeImageUrl = beforeImageAssessment
    ? getFullImageUrl(beforeImageAssessment.image_url)
    : null;
  const afterImageUrl = afterImageAssessment
    ? getFullImageUrl(afterImageAssessment.image_url)
    : null;

  const baselineScore = baselineAssessment?.health_score ?? 0;
  const currentScore = currentAssessment?.health_score ?? 0;
  const scoreDifference = currentScore - baselineScore;

  let percentageChange = '0.0';
  if (baselineScore > 0 && sortedAssessments.length >= 2) {
    percentageChange = (
      ((currentScore - baselineScore) / baselineScore) * 100
    ).toFixed(1);
  }

  let improvementStatus = 'Initial Assessment';
  if (sortedAssessments.length === 0) {
    improvementStatus = 'No Assessments';
  } else if (sortedAssessments.length >= 2) {
    if (scoreDifference > 0) {
      improvementStatus = 'Improved';
    } else if (scoreDifference === 0) {
      improvementStatus = 'Maintained';
    } else {
      improvementStatus = 'Needs Attention';
    }
  }

  const improvement = parseFloat(percentageChange);
  
  const recentAdherenceHistory = [...adherenceHistory].slice(-7);

const averageAdherence =
  adherenceHistory.length > 0
    ? Math.round(
        adherenceHistory.reduce(
          (total, item) => total + item.adherence_percentage,
          0
        ) / adherenceHistory.length
      )
    : 0;

const latestAdherence =
  adherenceHistory.length > 0
    ? adherenceHistory[adherenceHistory.length - 1]
        .adherence_percentage
    : 0;

const bestAdherence =
  adherenceHistory.length > 0
    ? Math.max(
        ...adherenceHistory.map(
          (item) => item.adherence_percentage
        )
      )
    : 0;

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
          IMPROVEMENT ANALYSIS
      ======================================================= */}
      {!loading && (
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">
                Improvement Analysis
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Baseline Score</p>
              <p className="text-xl font-bold text-white mt-1">
                {baselineAssessment ? baselineScore : '—'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Current Score</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {currentAssessment ? currentScore : '—'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Score Difference</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  scoreDifference > 0
                    ? 'text-emerald-400'
                    : scoreDifference < 0
                    ? 'text-red-400'
                    : 'text-slate-300'
                }`}
              >
                {scoreDifference > 0 ? `+${scoreDifference}` : scoreDifference} pts
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Percentage Change</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  Number(percentageChange) > 0
                    ? 'text-emerald-400'
                    : Number(percentageChange) < 0
                    ? 'text-red-400'
                    : 'text-slate-300'
                }`}
              >
                {Number(percentageChange) > 0
                  ? `+${percentageChange}`
                  : percentageChange}
                %
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-400">Improvement Status</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  improvementStatus === 'Improved'
                    ? 'text-emerald-400'
                    : improvementStatus === 'Needs Attention'
                    ? 'text-rose-400'
                    : improvementStatus === 'Initial Assessment'
                    ? 'text-cyan-400'
                    : 'text-slate-300'
                }`}
              >
                {improvementStatus}
              </p>
            </div>
          </div>
        </GlassCard>
      )}
      
      {/* ======================================================
    ROUTINE ADHERENCE TRACKING
======================================================= */}
{!adherenceLoading && !adherenceError && (
  <GlassCard className="space-y-5">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <div>
        <h2 className="text-lg font-bold text-white">
          Routine Adherence Tracking
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          Your recent skincare routine completion history.
        </p>
      </div>

      <Badge variant="emerald">
        {averageAdherence}% Average
      </Badge>
    </div>

    {adherenceHistory.length === 0 ? (
      <div className="text-center py-8">
        <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600 mb-3" />

        <h3 className="font-bold text-white">
          No Routine Logs Yet
        </h3>

        <p className="text-sm text-slate-400 mt-2">
          Complete and save your daily routine to start tracking adherence.
        </p>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-slate-400">
              Latest Adherence
            </p>

            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {latestAdherence}%
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-slate-400">
              Average Adherence
            </p>

            <p className="text-2xl font-bold text-cyan-400 mt-1">
              {averageAdherence}%
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs text-slate-400">
              Best Adherence
            </p>

            <p className="text-2xl font-bold text-amber-400 mt-1">
              {bestAdherence}%
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-3">
            Recent Adherence Trend
          </h3>

          <div className="h-48 flex items-end gap-3 sm:gap-5 pt-6 pb-2 px-2 border-b border-slate-800">
            {recentAdherenceHistory.map((item) => (
              <div
                key={item.id}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <span className="text-xs font-bold text-cyan-400">
                  {item.adherence_percentage}%
                </span>

                <div
                  className="w-full bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t-xl transition-all duration-500 hover:brightness-125"
                  style={{
                    height: `${Math.max(
                      5,
                      Math.min(item.adherence_percentage, 100)
                    )}%`,
                  }}
                />

                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(item.log_date).toLocaleDateString(
                    undefined,
                    {
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
  </GlassCard>
)}

{adherenceError && (
  <GlassCard>
    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
      <p className="text-sm text-red-300">
        {adherenceError}
      </p>
    </div>
  </GlassCard>
)}
      {/* ======================================================
          BEFORE / AFTER COMPARISON
      ======================================================= */}
      {!loading && assessments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* FIRST ASSESSMENT */}
          <GlassCard className="space-y-4 text-center p-6 border-slate-800">

            {beforeImageUrl && !beforeImageError ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                <img
                  src={beforeImageUrl}
                  alt="Baseline Scan"
                  className="w-full h-full object-cover"
                  onError={() => setBeforeImageError(true)}
                />
              </div>
            ) : (
              <div className="w-full py-6 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-400 shadow-inner">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <span className="text-[11px] text-slate-400 font-medium bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/40">
                  Scan image unavailable
                </span>
              </div>
            )}

            <h3 className="font-bold text-white text-base">
              Baseline Scan
            </h3>

            {firstAssessment ? (
              <>
                <p className="text-xs text-slate-400">
                  Skin Type:{' '}
                  <span className="text-slate-200 font-medium">{firstAssessment.predicted_skin_type || '—'}</span>
                </p>

                <p className="text-xs text-slate-400">
                  Health Score:{' '}
                  <span className="text-emerald-400 font-bold">{firstAssessment.health_score ?? '—'}</span>
                </p>

                <p className="text-xs text-slate-400">
                  Concern:{' '}
                  <span className="text-amber-400 font-medium">{firstAssessment.vision_predicted_concern || '—'}</span>
                </p>

                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
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
          <GlassCard className="space-y-4 text-center p-6 border-emerald-500/30">

            {afterImageUrl && !afterImageError ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900">
                <img
                  src={afterImageUrl}
                  alt="Current Scan"
                  className="w-full h-full object-cover"
                  onError={() => setAfterImageError(true)}
                />
              </div>
            ) : (
              <div className="w-full py-6 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <span className="text-[11px] text-slate-400 font-medium bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/40">
                  Scan image unavailable
                </span>
              </div>
            )}

            <h3 className="font-bold text-white text-base">
              Current Scan
            </h3>

            {latestAssessment ? (
              <>
                <p className="text-xs text-slate-400">
                  Skin Type:{' '}
                  <span className="text-slate-200 font-medium">{latestAssessment.predicted_skin_type || '—'}</span>
                </p>

                <p className="text-xs text-slate-400">
                  Health Score:{' '}
                  <span className="text-emerald-400 font-bold">{latestAssessment.health_score ?? '—'}</span>
                </p>

                <p className="text-xs text-slate-400">
                  Concern:{' '}
                  <span className="text-amber-400 font-medium">{latestAssessment.vision_predicted_concern || '—'}</span>
                </p>

                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
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