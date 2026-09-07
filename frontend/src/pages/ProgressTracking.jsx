import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import {
  getProgressSummary,
  getProgressTrends,
  getAdherenceAnalytics,
  getComparisonData,
  getAvailableSnapshots,
} from '../services/progressService';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Layers,
  BarChart3,
  Sun,
  Moon,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

export default function ProgressTracking() {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeChartTab, setActiveChartTab] = useState('overall'); // 'overall', 'condition', 'adherence', 'breakdown'

  // Progress Data States
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  
  // Comparison States
  const [comparisonType, setComparisonType] = useState('assessment'); // 'assessment' or 'health_score'
  const [selectedEarlierId, setSelectedEarlierId] = useState('');
  const [selectedLaterId, setSelectedLaterId] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Progress Tracking', path: '/dashboard/progress' }
  ];

  const loadComparison = async (earlierId, laterId, type) => {
    if (!earlierId || !laterId) return;
    setLoadingComparison(false);
    setLoadingComparison(true);
    try {
      const data = await getComparisonData(earlierId, laterId, type);
      setComparisonData(data);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setComparisonData(null);
    } finally {
      setLoadingComparison(false);
    }
  };

  const fetchCoreData = useCallback(async (range = timeRange) => {
    try {
      const [sumRes, trendRes, adhRes, snapRes] = await Promise.all([
        getProgressSummary(),
        getProgressTrends(range),
        getAdherenceAnalytics(),
        getAvailableSnapshots(),
      ]);

      setSummary(sumRes);
      setTrends(trendRes);
      setAdherence(adhRes);
      setSnapshots(snapRes || []);

      // Initialize comparison defaults if snapshots available
      const filteredSnaps = (snapRes || []).filter(s => s.type === comparisonType);
      if (filteredSnaps.length >= 2) {
        const earlier = filteredSnaps[filteredSnaps.length - 1].id;
        const later = filteredSnaps[0].id;
        setSelectedEarlierId(earlier);
        setSelectedLaterId(later);
        loadComparison(earlier, later, comparisonType);
      } else {
        setComparisonData(null);
      }
    } catch (err) {
      console.error('Error fetching progress tracking data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange, comparisonType]);

  useEffect(() => {
    fetchCoreData(timeRange);
  }, [timeRange]);

  const handleComparisonTypeChange = (newType) => {
    setComparisonType(newType);
    const filtered = snapshots.filter(s => s.type === newType);
    if (filtered.length >= 2) {
      const earlier = filtered[filtered.length - 1].id;
      const later = filtered[0].id;
      setSelectedEarlierId(earlier);
      setSelectedLaterId(later);
      loadComparison(earlier, later, newType);
    } else {
      setSelectedEarlierId('');
      setSelectedLaterId('');
      setComparisonData(null);
    }
  };

  const handleEarlierChange = (e) => {
    const id = Number(e.target.value);
    setSelectedEarlierId(id);
    loadComparison(id, selectedLaterId, comparisonType);
  };

  const handleLaterChange = (e) => {
    const id = Number(e.target.value);
    setSelectedLaterId(id);
    loadComparison(selectedEarlierId, id, comparisonType);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCoreData(timeRange);
  };

  // Format Chart Data based on active tab
  const getFormattedChartData = () => {
    if (!trends || !trends.trend_points || trends.trend_points.length === 0) {
      return [];
    }

    if (activeChartTab === 'overall') {
      return trends.trend_points
        .filter(p => p.overall_score !== null)
        .map(p => ({
          label: p.date_label,
          value: p.overall_score,
        }));
    } else if (activeChartTab === 'condition') {
      return trends.trend_points
        .filter(p => p.condition_score !== null)
        .map(p => ({
          label: p.date_label,
          value: Math.round(p.condition_score),
        }));
    } else if (activeChartTab === 'adherence') {
      return trends.trend_points
        .filter(p => p.adherence_rate !== null)
        .map(p => ({
          label: p.date_label,
          value: Math.round(p.adherence_rate),
        }));
    }
    return [];
  };

  // Breakdown donut data from latest health score
  const getBreakdownDonutData = () => {
    if (!trends || !trends.trend_points) return [];
    const latestScorePoint = [...trends.trend_points].reverse().find(p => p.lifestyle_score !== null);
    if (!latestScorePoint) return [];

    return [
      { label: 'Condition (35%)', value: Math.round((latestScorePoint.condition_score || 0) * 0.35) },
      { label: 'Lifestyle (20%)', value: Math.round((latestScorePoint.lifestyle_score || 0) * 0.20) },
      { label: 'Sleep (15%)', value: Math.round((latestScorePoint.sleep_score || 0) * 0.15) },
      { label: 'Routine (20%)', value: Math.round((latestScorePoint.routine_score || 0) * 0.20) },
      { label: 'Hydration (10%)', value: Math.round((latestScorePoint.hydration_score || 0) * 0.10) },
    ];
  };

  const chartData = getFormattedChartData();
  const breakdownData = getBreakdownDonutData();

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse font-sans">
        <div className="h-4 bg-brand-100/50 rounded w-48 mb-2"></div>
        <div className="h-8 bg-brand-100/70 rounded w-72"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-brand-50/50 rounded-2xl border border-brand-100"></div>
          <div className="h-32 bg-brand-50/50 rounded-2xl border border-brand-100"></div>
          <div className="h-32 bg-brand-50/50 rounded-2xl border border-brand-100"></div>
        </div>
        <div className="h-80 bg-brand-50/50 rounded-2xl border border-brand-100"></div>
      </div>
    );
  }

  const currentOverall = summary?.current_overall_score;
  const overallDelta = summary?.overall_delta || 0;
  const currentCondition = summary?.current_condition_score;
  const conditionDelta = summary?.condition_delta || 0;
  const adherence30d = adherence?.adherence_rate_30d ?? summary?.adherence_30d ?? 0;

  const filteredSnapshots = snapshots.filter(s => s.type === comparisonType);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans text-brand-950">
      {/* Breadcrumb Navigation */}
      <Breadcrumb crumbs={crumbs} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-100 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            Progress Tracking
          </h1>
          <p className="text-sm text-brand-800 mt-1">
            Real-time longitudinal analytics tracking your skin barrier restoration, score progression, and checklist consistency.
          </p>
        </div>

        {/* Action Buttons & Quick Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 text-brand-800 hover:text-brand-950 hover:bg-brand-100/50 transition-colors"
            title="Refresh Progress Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/dashboard/checklist')}
            className="btn-secondary py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-brand-900 border border-brand-200 hover:border-brand-400"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
            Checklist Log
          </button>
          <button
            onClick={() => navigate('/dashboard/assessment')}
            className="btn-primary py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            New Assessment
          </button>
        </div>
      </div>

      {/* 1. Executive Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall Health Score Card */}
        <div className="glass-effect p-5 rounded-2xl border border-brand-100/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-700">
                Skin Health Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand-950 font-display">
                  {currentOverall !== null && currentOverall !== undefined ? currentOverall : '--'}
                </span>
                <span className="text-xs text-brand-600 font-medium">/ 100</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-100/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold">
              {overallDelta > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-display">
                  <TrendingUp className="w-3 h-3" /> +{overallDelta} pts
                </span>
              ) : overallDelta < 0 ? (
                <span className="inline-flex items-center gap-0.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-display">
                  <TrendingDown className="w-3 h-3" /> {overallDelta} pts
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 font-display">
                  <Minus className="w-3 h-3" /> Stable (0)
                </span>
              )}
              <span className="text-brand-800 text-[11px] font-normal truncate max-w-[160px]">
                {summary?.overall_status || 'Baseline'}
              </span>
            </div>
            <span
              onClick={() => navigate('/dashboard/score')}
              className="text-brand-600 hover:text-brand-800 cursor-pointer flex items-center gap-0.5 text-[11px] font-medium"
            >
              Breakdown <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Skin Condition Assessment Card */}
        <div className="glass-effect p-5 rounded-2xl border border-brand-100/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-700">
                Skin Condition Index
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand-950 font-display">
                  {currentCondition !== null && currentCondition !== undefined ? currentCondition : '--'}
                </span>
                <span className="text-xs text-brand-600 font-medium">/ 100</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-accent-50 border border-accent-200 text-accent-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-100/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold">
              {conditionDelta > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-display">
                  <TrendingUp className="w-3 h-3" /> +{conditionDelta} pts
                </span>
              ) : conditionDelta < 0 ? (
                <span className="inline-flex items-center gap-0.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-display">
                  <TrendingDown className="w-3 h-3" /> {conditionDelta} pts
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 font-display">
                  <Minus className="w-3 h-3" /> No Change
                </span>
              )}
              <span className="text-brand-800 text-[11px] font-normal">
                {summary?.total_scans_count ? `${summary.total_scans_count} scans recorded` : 'No scans yet'}
              </span>
            </div>
            <span
              onClick={() => navigate('/dashboard/assessment')}
              className="text-brand-600 hover:text-brand-800 cursor-pointer flex items-center gap-0.5 text-[11px] font-medium"
            >
              Scan Log <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 30-Day Routine Adherence Card */}
        <div className="glass-effect p-5 rounded-2xl border border-brand-100/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-700">
                Routine Adherence
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand-950 font-display">
                  {adherence?.total_steps > 0 ? `${adherence30d}%` : '--%'}
                </span>
                <span className="text-xs text-brand-600 font-medium">30-day compliance</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-100/60 flex items-center justify-between text-xs">
            <span className="text-brand-800 text-[11px]">
              {adherence?.completed_steps ? `${adherence.completed_steps} of ${adherence.total_steps} steps completed` : 'Log checklist to track'}
            </span>
            <span
              onClick={() => navigate('/dashboard/checklist')}
              className="text-brand-600 hover:text-brand-800 cursor-pointer flex items-center gap-0.5 text-[11px] font-medium"
            >
              View Log <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Multi-Metric Trend Analysis */}
      <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm space-y-6">
        {/* Chart Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-950 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              Longitudinal Trend Curve
            </h2>
            <p className="text-xs text-brand-800 mt-0.5">
              Chronological curve of your skin metrics plotted from real diagnostic assessments and score records.
            </p>
          </div>

          {/* Time Range Filter Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-brand-100/60 rounded-xl border border-brand-200/60 self-start md:self-auto">
            {['7d', '30d', '3m', '6m', 'all'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  timeRange === r
                    ? 'bg-white text-brand-950 shadow-xs'
                    : 'text-brand-700 hover:text-brand-950'
                }`}
              >
                {r === 'all' ? 'All' : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-brand-100 pb-3">
          <button
            onClick={() => setActiveChartTab('overall')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeChartTab === 'overall'
                ? 'bg-brand-950 text-white shadow-xs'
                : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Overall Health Score
          </button>

          <button
            onClick={() => setActiveChartTab('condition')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeChartTab === 'condition'
                ? 'bg-brand-950 text-white shadow-xs'
                : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Skin Condition Score
          </button>

          <button
            onClick={() => setActiveChartTab('adherence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeChartTab === 'adherence'
                ? 'bg-brand-950 text-white shadow-xs'
                : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Routine Adherence (%)
          </button>

          <button
            onClick={() => setActiveChartTab('breakdown')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeChartTab === 'breakdown'
                ? 'bg-brand-950 text-white shadow-xs'
                : 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            5-Component Distribution
          </button>
        </div>

        {/* Chart View Port */}
        <div className="pt-2">
          {activeChartTab === 'breakdown' ? (
            breakdownData.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-brand-800 text-center">
                  Weighted component contribution to your current Overall Skin Health Score:
                </p>
                <PremiumChart type="donut" data={breakdownData} height={200} />
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center bg-brand-50/50 rounded-2xl border border-dashed border-brand-200 p-6 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-brand-600" />
                <p className="text-xs font-semibold text-brand-900">No Component Breakdown Records Found</p>
                <p className="text-[11px] text-brand-700 max-w-sm">
                  Calculate your Skin Health Score to view the 5-factor weighted distribution.
                </p>
              </div>
            )
          ) : chartData.length > 0 ? (
            <div className="space-y-2">
              <PremiumChart
                type="line"
                data={chartData}
                height={220}
                color={activeChartTab === 'condition' ? 'accent' : 'brand'}
              />
              <div className="flex items-center justify-between text-[11px] text-brand-700 px-2 pt-1 border-t border-brand-100/50">
                <span>Range: {timeRange.toUpperCase()}</span>
                <span>{chartData.length} data point(s) plotted from PostgreSQL</span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center bg-brand-50/40 rounded-2xl border border-dashed border-brand-200 p-6 text-center space-y-3">
              <Clock className="w-7 h-7 text-brand-500 stroke-1" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-950 font-display">
                  No Historical Points in {timeRange.toUpperCase()} Window
                </p>
                <p className="text-[11px] text-brand-800 max-w-md">
                  Progress tracking updates automatically when you perform diagnostic face scans or check off your daily skincare routine.
                </p>
              </div>
              <button
                onClick={() => setTimeRange('all')}
                className="btn-secondary py-1.5 px-3 rounded-lg text-xs font-medium"
              >
                View All-Time Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Concern Severity Trend */}
      {trends?.concern_trends && trends.concern_trends.length > 0 && (
        <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-brand-950">
                Detected Concern Severity Progression
              </h2>
              <p className="text-xs text-brand-800 mt-0.5">
                Severity evolution across historical diagnostic face scans (Lower severity indicates improvement).
              </p>
            </div>
            <span className="text-[11px] font-medium text-brand-700 bg-brand-100/60 px-2.5 py-1 rounded-lg border border-brand-200/50">
              {trends.concern_trends.length} Active Concern Trackers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.concern_trends.map((ct, idx) => {
              const latestPt = ct.data[ct.data.length - 1];
              const firstPt = ct.data[0];
              const sevDelta = latestPt && firstPt ? Math.round((latestPt.severity - firstPt.severity) * 100) / 100 : 0;
              const isImproved = sevDelta < 0;

              return (
                <div key={idx} className="bg-white/80 p-4 rounded-2xl border border-brand-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-brand-950">
                      {ct.concern_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        latestPt?.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : latestPt?.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {latestPt?.priority || 'Normal'} Priority
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-brand-600 uppercase tracking-widest block font-display">
                        Current Severity
                      </span>
                      <span className="text-lg font-extrabold text-brand-950 font-display">
                        {latestPt ? `${latestPt.severity}/5.0` : '--'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-brand-600 uppercase tracking-widest block font-display">
                        Baseline Delta
                      </span>
                      <span
                        className={`font-display font-bold text-xs inline-flex items-center gap-0.5 ${
                          isImproved ? 'text-emerald-600' : sevDelta > 0 ? 'text-rose-600' : 'text-brand-700'
                        }`}
                      >
                        {isImproved ? (
                          <>
                            <TrendingDown className="w-3 h-3" /> {sevDelta} (Improved)
                          </>
                        ) : sevDelta > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3" /> +{sevDelta} (Elevated)
                          </>
                        ) : (
                          'Stable'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar visual for severity */}
                  <div className="w-full bg-brand-100/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        latestPt?.severity > 3.5
                          ? 'bg-rose-500'
                          : latestPt?.severity > 2.0
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, ((latestPt?.severity || 0) / 5.0) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Routine Compliance & Checklist Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Breakdown Card */}
        <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm space-y-5">
          <div>
            <h2 className="font-display text-base font-bold text-brand-950">
              Routine Adherence Breakdown
            </h2>
            <p className="text-xs text-brand-800 mt-0.5">
              Checklist completion statistics recorded in PostgreSQL
            </p>
          </div>

          <div className="space-y-4">
            {/* 7-Day vs 30-Day vs All-Time Rates */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-white/70 rounded-xl border border-brand-100">
                <span className="text-[10px] uppercase tracking-wider text-brand-600 font-bold block font-display">
                  7-Day
                </span>
                <span className="text-base font-extrabold text-brand-950 font-display">
                  {adherence?.adherence_rate_7d ?? 0}%
                </span>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-brand-100">
                <span className="text-[10px] uppercase tracking-wider text-brand-600 font-bold block font-display">
                  30-Day
                </span>
                <span className="text-base font-extrabold text-brand-950 font-display">
                  {adherence?.adherence_rate_30d ?? 0}%
                </span>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-brand-100">
                <span className="text-[10px] uppercase tracking-wider text-brand-600 font-bold block font-display">
                  All-Time
                </span>
                <span className="text-base font-extrabold text-brand-950 font-display">
                  {adherence?.adherence_rate_all ?? 0}%
                </span>
              </div>
            </div>

            {/* Total Step Counts */}
            <div className="space-y-2 pt-2 border-t border-brand-100">
              <div className="flex justify-between text-xs">
                <span className="text-brand-800">Total Steps Scheduled</span>
                <span className="font-bold text-brand-950 font-display">{adherence?.total_steps || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-800">Steps Completed</span>
                <span className="font-bold text-emerald-700 font-display">{adherence?.completed_steps || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-800">Missed / Skipped Steps</span>
                <span className="font-bold text-rose-700 font-display">{adherence?.missed_steps || 0}</span>
              </div>
            </div>

            {/* AM vs PM estimated rates */}
            <div className="space-y-2.5 pt-2 border-t border-brand-100">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-brand-850 font-medium">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning Routine
                  </span>
                  <span className="font-bold text-brand-950 font-display">{adherence?.am_adherence_rate ?? 0}%</span>
                </div>
                <div className="w-full bg-brand-100/60 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, adherence?.am_adherence_rate || 0)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-brand-850 font-medium">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> Evening Routine
                  </span>
                  <span className="font-bold text-brand-950 font-display">{adherence?.pm_adherence_rate ?? 0}%</span>
                </div>
                <div className="w-full bg-brand-100/60 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, adherence?.pm_adherence_rate || 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Daily Checklist Logs Table */}
        <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-brand-950">
                Recent Daily Check-In History
              </h2>
              <p className="text-xs text-brand-800 mt-0.5">
                Audit trail of completed skincare steps by logged calendar date.
              </p>
            </div>
            <span className="text-xs text-brand-700">
              {adherence?.daily_history?.length || 0} recent entries
            </span>
          </div>

          {adherence?.daily_history && adherence.daily_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-100 font-display font-semibold text-brand-700 uppercase tracking-widest text-[9px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Steps Completed</th>
                    <th className="py-2.5 px-3">Total Required</th>
                    <th className="py-2.5 px-3">Daily Adherence</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/50">
                  {adherence.daily_history.map((log) => (
                    <tr key={log.id} className="hover:bg-brand-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-brand-950 font-display">{log.date}</td>
                      <td className="py-2.5 px-3 text-brand-900">{log.completed} steps</td>
                      <td className="py-2.5 px-3 text-brand-800">{log.total} steps</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-950 font-display">{log.rate}%</span>
                          <div className="w-16 bg-brand-100/80 rounded-full h-1.5 hidden sm:block">
                            <div
                              className={`h-1.5 rounded-full ${
                                log.rate >= 80 ? 'bg-emerald-500' : log.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, log.rate)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            log.rate >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.rate >= 50
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {log.rate >= 80 ? 'Optimal' : log.rate >= 50 ? 'Partial' : 'Missed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center bg-brand-50/50 rounded-2xl border border-dashed border-brand-200 p-6 text-center space-y-2">
              <Check className="w-6 h-6 text-brand-600" />
              <p className="text-xs font-semibold text-brand-900">No Checklist Logs Recorded Yet</p>
              <p className="text-[11px] text-brand-700 max-w-sm">
                Open your Daily Skincare Checklist and save completions to establish an adherence record.
              </p>
              <button
                onClick={() => navigate('/dashboard/checklist')}
                className="btn-primary py-1.5 px-3 rounded-lg text-xs font-semibold mt-1"
              >
                Go to Checklist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Before & After Historical Comparison Audit */}
      <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-950 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-brand-600" />
              Before & After Snapshot Comparison
            </h2>
            <p className="text-xs text-brand-800 mt-0.5">
              Select any two historical diagnostic records to evaluate skin barrier changes, concern delta, and score shifts.
            </p>
          </div>

          {/* Comparison Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-brand-100/60 rounded-xl border border-brand-200/60 self-start md:self-auto">
            <button
              onClick={() => handleComparisonTypeChange('assessment')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                comparisonType === 'assessment'
                  ? 'bg-white text-brand-950 shadow-xs'
                  : 'text-brand-700 hover:text-brand-950'
              }`}
            >
              Skin Scans
            </button>
            <button
              onClick={() => handleComparisonTypeChange('health_score')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                comparisonType === 'health_score'
                  ? 'bg-white text-brand-950 shadow-xs'
                  : 'text-brand-700 hover:text-brand-950'
              }`}
            >
              Health Scores
            </button>
          </div>
        </div>

        {/* Snapshot Selectors */}
        {filteredSnapshots.length >= 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-50/50 p-4 rounded-2xl border border-brand-100">
            <div>
              <label className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-700 block mb-1.5">
                Baseline (Earlier Record)
              </label>
              <select
                value={selectedEarlierId}
                onChange={handleEarlierChange}
                className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 text-xs font-medium text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {filteredSnapshots.map((snap) => (
                  <option key={snap.id} value={snap.id}>
                    {snap.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-700 block mb-1.5">
                Follow-Up (Later Record)
              </label>
              <select
                value={selectedLaterId}
                onChange={handleLaterChange}
                className="w-full bg-white border border-brand-200 rounded-xl px-3 py-2 text-xs font-medium text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {filteredSnapshots.map((snap) => (
                  <option key={snap.id} value={snap.id}>
                    {snap.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {/* Comparison Details View */}
        {loadingComparison ? (
          <div className="h-36 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : comparisonData ? (
          <div className="space-y-6">
            {/* Score Delta Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/90 p-4 rounded-2xl border border-brand-100 shadow-xs">
                <span className="text-[10px] text-brand-600 uppercase tracking-widest block font-display">
                  Time Elapsed
                </span>
                <span className="text-xl font-extrabold text-brand-950 font-display">
                  {comparisonData.days_between} Days
                </span>
                <span className="text-[11px] text-brand-700 block mt-0.5">
                  Between selected snapshots
                </span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-brand-100 shadow-xs">
                <span className="text-[10px] text-brand-600 uppercase tracking-widest block font-display">
                  {comparisonType === 'assessment' ? 'Condition Score Delta' : 'Health Score Delta'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-brand-950 font-display">
                    {comparisonType === 'assessment'
                      ? `${comparisonData.earlier_condition_score} → ${comparisonData.later_condition_score}`
                      : `${comparisonData.earlier_overall_score} → ${comparisonData.later_overall_score}`}
                  </span>
                  <span
                    className={`text-xs font-bold font-display ${
                      (comparisonData.condition_delta || comparisonData.overall_delta) > 0
                        ? 'text-emerald-600'
                        : (comparisonData.condition_delta || comparisonData.overall_delta) < 0
                        ? 'text-rose-600'
                        : 'text-brand-700'
                    }`}
                  >
                    {comparisonType === 'assessment'
                      ? comparisonData.condition_delta > 0
                        ? `+${comparisonData.condition_delta} pts`
                        : `${comparisonData.condition_delta} pts`
                      : comparisonData.overall_delta > 0
                      ? `+${comparisonData.overall_delta} pts`
                      : `${comparisonData.overall_delta} pts`}
                  </span>
                </div>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-brand-100 shadow-xs">
                <span className="text-[10px] text-brand-600 uppercase tracking-widest block font-display">
                  Barrier Status Verdict
                </span>
                <p className="text-xs text-brand-900 font-medium mt-1 leading-snug">
                  {comparisonData.summary_verdict}
                </p>
              </div>
            </div>

            {/* Concern Severity Delta Table */}
            {comparisonData.concerns_comparison && comparisonData.concerns_comparison.length > 0 && (
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-100 font-display font-semibold text-brand-700 uppercase tracking-widest text-[9px]">
                      <th className="py-2.5 px-3">Concern Name</th>
                      <th className="py-2.5 px-3">Earlier Severity</th>
                      <th className="py-2.5 px-3">Later Severity</th>
                      <th className="py-2.5 px-3">Numerical Shift</th>
                      <th className="py-2.5 px-3 text-right">Assessment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100/50">
                    {comparisonData.concerns_comparison.map((c, idx) => (
                      <tr key={idx} className="hover:bg-brand-50/50">
                        <td className="py-2.5 px-3 font-semibold text-brand-950 font-display">{c.concern_name}</td>
                        <td className="py-2.5 px-3 text-brand-900">{c.earlier_severity !== null ? `${c.earlier_severity} / 5.0` : '--'}</td>
                        <td className="py-2.5 px-3 text-brand-900">{c.later_severity !== null ? `${c.later_severity} / 5.0` : '--'}</td>
                        <td className="py-2.5 px-3 font-display font-bold">
                          <span
                            className={
                              c.delta < 0
                                ? 'text-emerald-600'
                                : c.delta > 0
                                ? 'text-rose-600'
                                : 'text-brand-700'
                            }
                          >
                            {c.delta > 0 ? `+${c.delta}` : c.delta}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              c.status === 'Improved' || c.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.status === 'Increased' || c.status === 'New'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-brand-50 text-brand-700 border border-brand-200'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center bg-brand-50/50 rounded-2xl border border-dashed border-brand-200 p-6 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-brand-600" />
            <p className="text-xs font-semibold text-brand-900">Need At Least 2 Historical Records</p>
            <p className="text-[11px] text-brand-700 max-w-sm">
              Perform multiple skin assessments or recalculate your score over time to unlock comparative analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
