import React from 'react';
import { Link } from 'react-router-dom';
import userData from '../data/userData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  Sparkles, 
  Calendar, 
  ShoppingBag, 
  LineChart, 
  CheckCircle2, 
  ArrowRight,
  Smile,
  AlertCircle
} from 'lucide-react';

export default function UserDashboard() {
  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'User Dashboard', path: '/dashboard' }
  ];

  const score = userData.userProfile.scores.overall;

  // Calculate routine completion percentage
  const total = userData.routineChecklist.morning.length + userData.routineChecklist.evening.length;
  const completed = userData.routineChecklist.morning.filter(i => i.done).length + 
                    userData.routineChecklist.evening.filter(i => i.done).length;
  const routinePct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const quickAccess = [
    { label: 'Skin Health Score', path: '/dashboard/score', desc: 'Detailed diagnostic parameters', icon: Sparkles },
    { label: 'Personalized Routine', path: '/dashboard/routine', desc: 'Daily AM/PM schedules', icon: Calendar },
    { label: 'Product Recommendations', path: '/dashboard/recommendations', desc: 'Top active drug matches', icon: ShoppingBag },
    { label: 'Progress Tracking', path: '/dashboard/progress', desc: 'Before & after timeline logs', icon: LineChart },
    { label: 'Daily Skincare Checklist', path: '/dashboard/checklist', desc: 'Log routine compliance', icon: CheckCircle2 },
  ];

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
            Hi, {userData.userProfile.name}
          </h1>
          <p className="text-sm text-brand-200 leading-normal max-w-md">
            Your personalized skincare planner is optimized for your skin type: <strong>{userData.userProfile.skinType} Skin</strong>.
          </p>
        </div>

        {/* User Profile Summary */}
        <div className="bg-brand-900/60 border border-brand-800 p-4 rounded-2xl shrink-0 z-10 text-xs space-y-1 min-w-[200px]">
          <div className="font-display font-bold uppercase text-[9px] tracking-wider text-brand-300">Skin Profile Summary</div>
          <div>Primary Concern: <strong>{userData.userProfile.concerns.join(', ')}</strong></div>
          <div>Age Group: <strong>{userData.userProfile.age} yrs</strong></div>
          <div>Location: <strong>San Francisco, CA</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Skin Health Score & Routine Progress */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Skin Health Index</h3>
            <p className="text-[11px] text-brand-800">Aggregated diagnostic parameters rating</p>
          </div>

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
                  strokeDasharray={`${score}, 100`} 
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-2xl font-black font-display text-brand-950">{score}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[9px] font-display font-bold uppercase text-brand-600 block">Daily Routine Progress</span>
                <span className="font-bold text-slate-900">{routinePct}% Completed</span>
              </div>
              <div className="w-24 bg-brand-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-650 h-full" style={{ width: `${routinePct}%` }} />
              </div>
            </div>
          </div>

          <Link 
            to="/dashboard/score"
            className="w-full bg-brand-50 hover:bg-brand-100 text-brand-850 py-2 rounded-xl text-center text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors border border-brand-100"
          >
            Audit Health Breakdown
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Today's Reminder & Quick Stats */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Today's Reminder</h3>
              <p className="text-[11px] text-brand-800">Skincare planner active alerts</p>
            </div>

            {/* Reminder Alert */}
            <div className="bg-accent-50/50 border border-accent-100/50 p-4 rounded-2xl flex gap-3 text-xs font-sans text-brand-900">
              <AlertCircle className="w-5 h-5 text-accent-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-950 font-bold mb-0.5">PM Active Retinol Check-in</strong>
                Apply retinol (0.5%) tonight. Remember to use broad spectrum SPF shield tomorrow morning.
              </div>
            </div>
          </div>

          {/* Quick Statistics */}
          <div className="grid grid-cols-2 gap-3 text-center border-t border-brand-100 pt-4 text-xs font-sans">
            <div>
              <span className="block text-[16px] font-black text-brand-950">{userData.userProfile.scores.hydration}%</span>
              <span className="text-[9.5px] text-brand-800">Hydration Index</span>
            </div>
            <div>
              <span className="block text-[16px] font-black text-brand-950">{userData.userProfile.scores.adherence}%</span>
              <span className="text-[9.5px] text-brand-800">Plan Adherence</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Recent Activity</h3>
            <p className="text-[11px] text-brand-800 font-sans">History timeline logs</p>
          </div>

          <div className="space-y-3 font-sans text-xs flex-1 pt-2">
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-800 block">Today, 08:15 AM</span>
                <span className="text-slate-900 font-medium">Completed Morning AM sequence</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-800 block">Yesterday, 09:52 PM</span>
                <span className="text-slate-900 font-medium">Completed Evening PM sequence</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-800 block">July 29, 2026</span>
                <span className="text-slate-900 font-medium">Completed weekly exfoliating peel</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Access Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-950">Skincare Modules Quick Access</h3>
          <p className="text-xs text-brand-800">Navigate directly to detailed layouts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickAccess.map((qa, idx) => {
            const Icon = qa.icon;
            return (
              <Link 
                key={idx}
                to={qa.path}
                className="border border-brand-100 bg-white p-4.5 rounded-2xl hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="p-2.5 bg-brand-50 border border-brand-100 text-brand-600 rounded-xl w-fit group-hover:scale-105 transition-transform shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="pt-3.5 space-y-0.5">
                  <h4 className="font-display text-xs font-bold text-slate-950 group-hover:text-brand-700 transition-colors">{qa.label}</h4>
                  <p className="text-[10px] text-brand-800 font-sans leading-normal">{qa.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
