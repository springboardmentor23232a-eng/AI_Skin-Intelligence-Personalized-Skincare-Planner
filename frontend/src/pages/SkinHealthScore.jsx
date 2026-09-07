import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import * as scoreService from '../services/scoreService';
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Smile, 
  Activity, 
  Moon, 
  Calendar, 
  Droplet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Info, 
  ShieldCheck, 
  Camera 
} from 'lucide-react';

export default function SkinHealthScore() {
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);

  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Skin Health Score', path: '/dashboard/score' }
  ];

  const loadScoreDetails = async () => {
    setLoading(true);
    try {
      const data = await scoreService.getCurrentScore();
      setScoreData(data);
      
      const history = await scoreService.getScoreHistory();
      setHistoryLogs(history || []);
    } catch (err) {
      toast.error('Failed to load skin health score.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScoreDetails();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const updated = await scoreService.recalculateScore();
      setScoreData(updated);
      
      const history = await scoreService.getScoreHistory();
      setHistoryLogs(history || []);
      
      toast.success('Skin health score recalculated!');
    } catch (err) {
      toast.error('Recalculation failed. Please try again.');
    } finally {
      setRecalculating(false);
    }
  };

  // Map icon for component keys
  const getComponentIcon = (key) => {
    switch (key) {
      case 'condition':
        return Activity;
      case 'lifestyle':
        return ShieldCheck;
      case 'sleep':
        return Moon;
      case 'routine':
        return CheckCircle2;
      case 'hydration':
        return Droplet;
      default:
        return Sparkles;
    }
  };

  // Format history logs for PremiumChart
  const chartData = historyLogs.length > 0
    ? historyLogs.map((item, idx) => {
        const dateObj = new Date(item.calculated_at);
        const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          label: `${dateLabel} (#${idx + 1})`,
          value: item.overall_score
        };
      })
    : scoreData
      ? [{ label: 'Initial', value: scoreData.overall_score }]
      : [];

  const overallScore = scoreData?.overall_score ?? 0;
  const componentsList = scoreData?.components || [];
  const deltaChange = scoreData?.delta_change ?? 0;
  const deltaDirection = scoreData?.delta_direction || 'initial';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            Skin Health Score
          </h1>
          <p className="text-sm text-brand-850">
            Comprehensive diagnostic index calculated from clinical assessment, lifestyle, sleep, consistency, and hydration metrics.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating || loading}
          className="btn-primary py-2.5 px-5 rounded-xl text-xs font-display flex items-center justify-center gap-2 shadow-sm shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalculating...' : 'Recalculate Score'}</span>
        </button>
      </div>

      {/* Profile & Assessment Advisory Callouts if missing */}
      {scoreData && (!scoreData.has_profile || !scoreData.has_assessment_scan) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Unlock Clinical Precision Scoring</span>
              <span className="text-amber-800">
                {!scoreData.has_assessment_scan && !scoreData.has_profile
                  ? 'Complete your 28-Question Profile and upload an AI Skin Assessment scan for accurate personalized metrics.'
                  : !scoreData.has_assessment_scan
                    ? 'Upload a facial scan in AI Skin Assessment to replace estimated condition metrics with clinical computer vision.'
                    : 'Fill out your 28-Question Skincare Profile to refine your lifestyle, sleep, and hydration components.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!scoreData.has_assessment_scan && (
              <Link 
                to="/dashboard/assessment" 
                className="bg-amber-600 text-white px-3.5 py-1.5 rounded-xl font-bold font-display hover:bg-amber-700 transition-colors inline-flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                Scan Face
              </Link>
            )}
            {!scoreData.has_profile && (
              <Link 
                to="/dashboard/routine" 
                className="bg-brand-900 text-white px-3.5 py-1.5 rounded-xl font-bold font-display hover:bg-brand-950 transition-colors inline-flex items-center gap-1"
              >
                Complete Profile
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Evaluating 5-component skin health score...</span>
        </div>
      ) : scoreData ? (
        <>
          {/* Main Scoring Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Overall Health Dial Card */}
            <div className="lg:col-span-4 glass-effect border border-brand-100 p-6 sm:p-8 rounded-3xl shadow-sm bg-white flex flex-col items-center justify-between text-center space-y-6">
              
              <div className="space-y-1">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                  Overall Skin Health Index
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Weighted Score
                </h3>
              </div>

              {/* Large Radial SVG Gauge */}
              <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="#f0fdf4" 
                    strokeWidth="2.8" 
                  />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke={scoreData.status_color || "#10b981"} 
                    strokeWidth="2.8" 
                    strokeDasharray={`${overallScore}, 100`} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-black font-display text-brand-950 tracking-tight">
                    {overallScore}
                  </span>
                  <span className="text-[11px] font-display font-bold uppercase text-brand-600 tracking-wider">
                    out of 100
                  </span>
                </div>
              </div>

              {/* Status and Delta Change Badges */}
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-center gap-2">
                  <span 
                    className="text-xs font-display font-bold uppercase px-3.5 py-1 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: scoreData.status_color || '#10b981' }}
                  >
                    {scoreData.status}
                  </span>

                  {deltaDirection === 'improved' && (
                    <span className="text-xs font-display font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{deltaChange} pts
                    </span>
                  )}
                  {deltaDirection === 'declined' && (
                    <span className="text-xs font-display font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {deltaChange} pts
                    </span>
                  )}
                  {deltaDirection === 'maintained' && (
                    <span className="text-xs font-display font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1">
                      <Minus className="w-3.5 h-3.5" />
                      Maintained
                    </span>
                  )}
                </div>

                <p className="text-xs text-brand-850 leading-relaxed max-w-xs mx-auto">
                  {overallScore >= 85
                    ? 'Outstanding skin health condition! Your protective barrier is resilient and well hydrated.'
                    : overallScore >= 70
                      ? 'Good overall skin condition. Following your daily routine consistently will elevate your metrics.'
                      : overallScore >= 50
                        ? 'Moderate skin health score. Focus on hydration, restful sleep, and checklist adherence.'
                        : 'Your skin health score requires attention. Focus on barrier hydration and low-stress habits.'}
                </p>
              </div>

            </div>

            {/* Right Column: 5 Weighted Components Breakdown */}
            <div className="lg:col-span-8 glass-effect border border-brand-100 p-6 sm:p-8 rounded-3xl shadow-sm bg-white space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-brand-100">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    5-Component Diagnostic Breakdown
                  </h3>
                  <p className="text-xs text-brand-800">
                    Calculated using strict clinical weighting model totaling 100%
                  </p>
                </div>
                <div className="text-[11px] font-display font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl border border-brand-100 shrink-0">
                  Exact Weighted Formula
                </div>
              </div>

              <div className="space-y-4">
                {componentsList.map((comp, idx) => {
                  const Icon = getComponentIcon(comp.key);
                  const pctWeight = Math.round(comp.weight * 100);
                  const scoreVal = Math.round(comp.score);
                  
                  return (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-brand-50/40 border border-brand-100 hover:border-brand-300 transition-all space-y-2.5"
                    >
                      {/* Top Bar: Title, Weight Pill, Score */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-white border border-brand-200 text-brand-700 shrink-0 shadow-2xs">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm text-slate-900">
                                {comp.name}
                              </span>
                              <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-md bg-brand-100 text-brand-800 border border-brand-200">
                                {pctWeight}% Weight
                              </span>
                            </div>
                            <span className="text-[11px] text-brand-800 block">
                              {comp.description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:text-right shrink-0">
                          <div>
                            <span className="text-base font-black font-display text-brand-950">
                              {scoreVal}
                            </span>
                            <span className="text-[10px] text-brand-600 font-bold"> / 100</span>
                          </div>
                          <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-white border border-brand-200 text-brand-700 shrink-0">
                            +{comp.weighted_score} pts
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-brand-200/60 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: `${Math.max(5, Math.min(100, scoreVal))}%`,
                            backgroundColor: scoreVal >= 85 ? '#10b981' : scoreVal >= 70 ? '#3b82f6' : scoreVal >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Actionable Insights & Formula Explanation Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Actionable Insights */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600 shrink-0" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Targeted Wellness Guidance
                </h3>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                {scoreData.insights && scoreData.insights.length > 0 ? (
                  scoreData.insights.map((insight, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-brand-50/50 border border-brand-100 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{insight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No warnings detected. Maintain your healthy habits!</p>
                )}
              </div>
            </div>

            {/* Right: Model Formulation Reference */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-600 shrink-0" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Weighting Model Architecture
                </h3>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <p className="text-brand-850 leading-relaxed">
                  Your Overall Skin Health Score is computed using a clinical multi-factor equation:
                </p>
                
                <div className="bg-brand-950 text-white p-3.5 rounded-xl font-mono text-[11px] leading-relaxed space-y-1">
                  <div>Overall = (0.35 × Condition) + (0.20 × Lifestyle)</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (0.15 × Sleep) + (0.20 × Routine)</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (0.10 × Hydration)</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-brand-850 pt-1">
                  <div>• Condition (35%): Face Scan / ML</div>
                  <div>• Lifestyle (20%): Stress & Sun</div>
                  <div>• Sleep (15%): Restorative Hours</div>
                  <div>• Consistency (20%): Checklist Logs</div>
                  <div>• Hydration (10%): Daily Water</div>
                  <div>• Improvement: Delta Tracking</div>
                </div>
              </div>
            </div>

          </div>

          {/* Historical Trend Chart Card */}
          <div className="glass-effect border border-brand-100 p-6 sm:p-8 rounded-3xl shadow-sm bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Historical Improvement Trend
                </h3>
                <p className="text-xs text-brand-800">
                  Chronological progression of your skin health score over recalculation snapshots
                </p>
              </div>
              <div className="text-xs font-display font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl border border-brand-100">
                {historyLogs.length} Recorded Snapshots
              </div>
            </div>

            <div className="pt-4">
              {chartData.length > 0 ? (
                <PremiumChart 
                  type="line" 
                  data={chartData} 
                  height={220} 
                  color="brand" 
                />
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                  Recalculate your score over time to build an improvement curve.
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
