import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  User, 
  Camera, 
  Sparkles, 
  LineChart, 
  ArrowRight,
  TrendingUp, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import * as consultantService from '../services/consultantService';
import toast from 'react-hot-toast';

export default function ConsultantDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Consultant Dashboard', path: '/consultant' }
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await consultantService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalClients = dashboardData?.stats?.total_clients ?? 0;
  const pendingReviewsCount = dashboardData?.stats?.pending_reviews ?? 0;

  const quickStats = [
    { label: 'Clients Assigned', val: totalClients, icon: User, color: 'brand' },
    { label: 'Reviews Pending', val: pendingReviewsCount, icon: AlertCircle, color: 'accent' },
    { label: 'Consultations Completed', val: 0, icon: TrendingUp, color: 'indigo' },
  ];

  const quickAccess = [
    { label: 'Client Profiles', path: '/consultant/profiles', desc: 'Audit client skin types & habits', icon: User },
    { label: 'Assessment Reports', path: '/consultant/reports', desc: 'Audit diagnostic skin scans', icon: Camera },
    { label: 'Recommendation Mgmt', path: '/consultant/recommendations', desc: 'Create & edit active overrides', icon: Sparkles },
    { label: 'Progress Monitoring', path: '/consultant/progress', desc: 'Monitor adherence and improvements', icon: LineChart },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Welcome Section */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-900/40 to-transparent pointer-events-none" />
        <div className="space-y-2 z-10">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-405 bg-brand-900 px-3 py-1 rounded-full">
            Workspace Hub
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Consultant Portal
          </h1>
          <p className="text-sm text-brand-200 leading-normal max-w-md">
            Review active client diagnostic reports, adjust daily skincare sequence recommendations, and monitor adherence levels.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading dashboard indicators...</span>
        </div>
      ) : (
        <>
          {/* Quick Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx}
                  className="glass-effect border border-brand-100 p-5 rounded-2xl flex items-center justify-between bg-white shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-650">{stat.label}</span>
                    <div className="text-2xl font-black text-slate-900 font-display">{stat.val}</div>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    stat.color === 'brand' ? 'bg-brand-100 text-brand-605' :
                    stat.color === 'accent' ? 'bg-accent-105 text-accent-700' :
                    'bg-indigo-100 text-indigo-650'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Pending Reviews Queue */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Pending Reviews</h3>
                  <p className="text-[11px] text-brand-800">Scans awaiting recommendations</p>
                </div>
                <Link to="/consultant/reports" className="text-[10px] font-display font-bold text-brand-600 hover:text-brand-800 flex items-center gap-0.5">
                  Reports page
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {dashboardData?.pending_queue && dashboardData.pending_queue.length > 0 ? (
                  dashboardData.pending_queue.map(report => (
                    <div key={report.id} className="flex items-center justify-between p-2 bg-slate-50 border border-brand-55/60 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-200 border border-brand-300 flex items-center justify-center font-display font-bold text-xs text-brand-800">
                          {report.clientName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{report.clientName}</div>
                          <div className="text-[10px] text-brand-800">{report.concern}</div>
                        </div>
                      </div>
                      <Link to="/consultant/reports" className="text-[10px] font-display font-bold text-brand-600 hover:underline">Review</Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No pending reviews</p>
                )}
              </div>
            </div>

            {/* Upcoming Consultations */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Upcoming Consultations</h3>
                  <p className="text-[11px] text-brand-800 font-sans">Scheduled consultation channels</p>
                </div>
                <button className="text-[10px] font-display font-bold text-brand-600 hover:text-brand-850">Calendar</button>
              </div>

              <div className="space-y-3 font-sans text-xs text-brand-900">
                <p className="text-xs text-slate-500 text-center py-6">No upcoming consultations</p>
              </div>
            </div>

            {/* Recent Client Activity */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Recent Client Activity</h3>
                <p className="text-[11px] text-brand-800">Client compliance audit logs</p>
              </div>

              <div className="space-y-3.5 font-sans text-xs flex-1 pt-4 text-center">
                <p className="text-xs text-slate-500 py-6">No client activity yet</p>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Quick Access Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-950">Skincare Modules Quick Access</h3>
          <p className="text-xs text-brand-800 font-sans">Navigate directly to detailed layouts</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccess.map((qa, idx) => {
            const Icon = qa.icon;
            return (
              <Link 
                key={idx}
                to={qa.path}
                className="border border-brand-100 bg-white p-4.5 rounded-2xl hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="p-2.5 bg-brand-50 border border-brand-100 text-brand-655 rounded-xl w-fit group-hover:scale-105 transition-transform shrink-0">
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
