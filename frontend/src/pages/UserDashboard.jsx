import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  Sparkles, 
  Calendar, 
  ShoppingBag, 
  LineChart, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Droplet,
  ShieldCheck,
  Smile,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import * as scoreService from '../services/scoreService';
import * as routineService from '../services/routineService';
import * as progressService from '../services/progressService';
import * as productService from '../services/productService';

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [routineData, setRoutineData] = useState(null);
  const [progressSummary, setProgressSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0, pct: 0 });

  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'User Dashboard', path: '/dashboard' }
  ];

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user profile
      const profile = await authService.getProfile().catch(() => null);
      setUserProfile(profile);

      // 2. Fetch score, routine, progress, recommendations in parallel
      const [scoreRes, routineRes, progressRes, recsRes] = await Promise.allSettled([
        scoreService.getCurrentScore(),
        routineService.getCurrentRoutine(),
        progressService.getProgressSummary(),
        productService.getPersonalizedRecommendations()
      ]);

      if (scoreRes.status === 'fulfilled') setScoreData(scoreRes.value);
      if (routineRes.status === 'fulfilled') setRoutineData(routineRes.value);
      if (progressRes.status === 'fulfilled') setProgressSummary(progressRes.value);
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value?.recommendations || []);

      // Calculate today's checklist status if routine exists
      if (routineRes.status === 'fulfilled' && routineRes.value?.items) {
        const enabledItems = routineRes.value.items.filter(i => i.is_enabled);
        const total = enabledItems.length;
        
        let completed = 0;
        const saved = localStorage.getItem('skincare_checklist_progress');
        if (saved) {
          try {
            const checkedMap = JSON.parse(saved);
            completed = enabledItems.filter(i => checkedMap[i.id]).length;
          } catch (e) {
            console.error(e);
          }
        }
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        setChecklistProgress({ completed, total, pct });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load some dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const hasScore = scoreData && scoreData.has_score && scoreData.overall_score !== null && scoreData.overall_score !== undefined;
  const overallScore = hasScore ? scoreData.overall_score : null;
  const routinePct = checklistProgress.pct;
  const hasRoutine = routineData && routineData.items && routineData.items.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Welcome Card & Profile Summary */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-900/40 to-transparent pointer-events-none" />
        <div className="space-y-2 z-10">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-405 bg-brand-900 px-3 py-1 rounded-full">
            Welcome back
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Hi, {userProfile?.name || 'Skincare Enthusiast'}
          </h1>
          <p className="text-sm text-brand-200 leading-normal max-w-md">
            {hasRoutine && routineData?.skin_type 
              ? `Your personalized skincare planner is optimized for ${routineData.skin_type.toLowerCase()} skin.`
              : 'Complete your profile questionnaire and skin assessment to unlock personalized recommendations and AI routines.'}
          </p>
        </div>

        {/* User Profile Summary */}
        <div className="bg-brand-900/60 border border-brand-800 p-4 rounded-2xl shrink-0 z-10 text-xs space-y-1 min-w-[220px]">
          <div className="font-display font-bold uppercase text-[9px] tracking-wider text-brand-300">Skin Profile Summary</div>
          <div>Skin Type: <strong>{routineData?.skin_type || (scoreData?.has_profile ? 'Profile Completed' : 'Profile Required')}</strong></div>
          <div>Primary Goal: <strong>{routineData?.primary_goal || 'Healthy Glow'}</strong></div>
          <div>Account Role: <strong>{userProfile?.role || 'USER'}</strong></div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading live dashboard telemetry...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Skin Health Score & Routine Progress */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Skin Health Index</h3>
                <p className="text-[11px] text-brand-800">Aggregated 5-component weighted diagnostic rating</p>
              </div>

              {hasScore ? (
                <div className="flex items-center gap-6 justify-center py-2">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#f4fbf7" strokeWidth="3" />
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="16" 
                        fill="none" 
                        stroke="#2d8f66" 
                        strokeWidth="3" 
                        strokeDasharray={`${overallScore}, 100`} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-2xl font-black font-display text-brand-950">{overallScore}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] font-display font-bold uppercase text-brand-600 block">Today's Checklist</span>
                      <span className="font-bold text-slate-900">{routinePct}% Completed ({checklistProgress.completed}/{checklistProgress.total})</span>
                    </div>
                    <div className="w-28 bg-brand-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-650 h-full transition-all duration-500" style={{ width: `${routinePct}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Skin Health Score</h4>
                  <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Not yet available
                  </span>
                  <p className="text-[11px] text-brand-800 max-w-xs mx-auto pt-1">
                    Complete your 28-question skin profile questionnaire to generate your clinical score.
                  </p>
                </div>
              )}

              <Link 
                to={hasScore ? "/dashboard/score" : "/dashboard/routine"}
                className="w-full bg-brand-50 hover:bg-brand-100 text-brand-850 py-2.5 rounded-xl text-center text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors border border-brand-100"
              >
                {hasScore ? 'View Health Score Breakdown' : 'Complete Profile Questionnaire'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Today's Routine & Active Alerts */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Today's Routine Focus</h3>
                  <p className="text-[11px] text-brand-800">Skincare planner active parameters</p>
                </div>

                {hasRoutine ? (
                  <div className="bg-brand-50/70 border border-brand-100 p-4 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-[9px] uppercase tracking-wider text-brand-700">Active Regimen</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {routineData.items.filter(i => i.is_enabled).length} Active Steps
                      </span>
                    </div>
                    <div className="text-slate-900 font-semibold truncate">
                      {routineData.items[0]?.title || routineData.items[0]?.name || 'Morning Cleanser'}
                    </div>
                    <p className="text-[10.5px] text-brand-800 leading-normal">
                      {routineData.items[0]?.notes || routineData.items[0]?.description || 'Follow AM routine consistency to protect skin barrier health.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl flex gap-3 text-xs text-amber-950">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold mb-0.5">Personalized Routine: Not yet generated</strong>
                      Complete the skin profile questionnaire to generate your tailored morning and evening routine steps.
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Component Scores */}
              <div className="grid grid-cols-2 gap-3 text-center border-t border-brand-100 pt-4 text-xs font-sans">
                <div>
                  <span className="block text-[16px] font-black text-brand-950">
                    {hasScore && scoreData?.hydration_score !== undefined ? `${Math.round(scoreData.hydration_score)}%` : '—'}
                  </span>
                  <span className="text-[9.5px] text-brand-800">Hydration Index</span>
                </div>
                <div>
                  <span className="block text-[16px] font-black text-brand-950">
                    {hasScore && scoreData?.routine_score !== undefined ? `${Math.round(scoreData.routine_score)}%` : '—'}
                  </span>
                  <span className="text-[9.5px] text-brand-800">Plan Consistency</span>
                </div>
              </div>
            </div>

            {/* Recent Progress / Timeline */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Progress Telemetry</h3>
                <p className="text-[11px] text-brand-800 font-sans">Real-time improvement tracking</p>
              </div>

              <div className="space-y-3 font-sans text-xs flex-1 pt-1">
                <div className="p-3 bg-slate-50 border border-brand-100/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Overall Progress</div>
                      <div className="text-[10px] text-brand-700">
                        {progressSummary?.progress_status || (hasScore ? 'Tracking Active' : 'Not yet started')}
                      </div>
                    </div>
                  </div>
                  <span className="font-display font-black text-sm text-brand-950">
                    {progressSummary?.score_delta !== undefined ? (
                      progressSummary.score_delta >= 0 ? `+${progressSummary.score_delta}` : `${progressSummary.score_delta}`
                    ) : '0'} pts
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-brand-100/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="font-semibold text-slate-900">Checklist Adherence</div>
                      <div className="text-[10px] text-brand-700">7-Day Completion Rate</div>
                    </div>
                  </div>
                  <span className="font-display font-black text-sm text-brand-950">
                    {progressSummary?.adherence_7d !== undefined ? `${Math.round(progressSummary.adherence_7d * 100)}%` : `${routinePct}%`}
                  </span>
                </div>
              </div>

              <Link 
                to="/dashboard/progress"
                className="w-full bg-brand-50 hover:bg-brand-100 text-brand-850 py-2.5 rounded-xl text-center text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors border border-brand-100"
              >
                View Detailed Analytics
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Real Diagnostic Summary Overview (No Duplicate Sidebar Navigation) */}
          <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-brand-100/60 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-slate-950">Diagnostic Summary & Care Protocols</h3>
                <p className="text-xs text-brand-800 font-sans">Active recommendations and compliance monitoring</p>
              </div>
              <span className="text-[10px] font-display font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                System Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div className="p-4 bg-brand-50/40 border border-brand-100/60 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-700 block">Active Skin Type</span>
                <p className="font-bold text-slate-900 text-sm">{routineData?.skin_type || 'Assessment Pending'}</p>
                <p className="text-[11px] text-brand-800">Calibrated for barrier hydration, sebum control, and photoprotection.</p>
              </div>

              <div className="p-4 bg-brand-50/40 border border-brand-100/60 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-700 block">Target Clinical Concerns</span>
                <p className="font-bold text-slate-900 text-sm">
                  {routineData?.concerns?.slice(0, 2).join(', ') || 'Healthy Maintenance'}
                </p>
                <p className="text-[11px] text-brand-800">Filtered for active ingredient safety and non-comedogenic compatibility.</p>
              </div>

              <div className="p-4 bg-brand-50/40 border border-brand-100/60 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-700 block">Recommended Products</span>
                <p className="font-bold text-slate-900 text-sm">
                  {recommendations.length > 0 ? `${recommendations.length} Matched Products` : 'Catalog Available'}
                </p>
                <p className="text-[11px] text-brand-800">Matched to your skin profile, budget tier, and allergy restrictions.</p>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
