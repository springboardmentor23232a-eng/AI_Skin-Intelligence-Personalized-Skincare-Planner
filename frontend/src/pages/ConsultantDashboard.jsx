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
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Consultant Dashboard', path: '/consultant' }
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await consultantService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError('Unable to load consultant dashboard telemetry.');
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
  const completedConsultations = dashboardData?.stats?.completed_consultations ?? 0;

  const quickStats = [
    { label: 'Clients Registered', val: totalClients, icon: User, color: 'brand' },
    { label: 'Reviews Pending', val: pendingReviewsCount, icon: AlertCircle, color: 'accent' },
    { label: 'Consultations Completed', val: completedConsultations, icon: TrendingUp, color: 'indigo' },
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
      ) : error ? (
        <div className="border border-red-200 bg-red-50/70 p-6 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="font-display text-sm font-bold text-red-900">{error}</h3>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-semibold hover:bg-brand-950 cursor-pointer"
          >
            Retry Telemetry
          </button>
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
                    <div key={report.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-brand-100/60 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-200 border border-brand-300 flex items-center justify-center font-display font-bold text-xs text-brand-800">
                          {report.clientName ? report.clientName[0] : 'C'}
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
                  <h3 className="font-display text-base font-bold text-slate-900">Consultation Schedule</h3>
                  <p className="text-[11px] text-brand-800 font-sans">Active client session channels</p>
                </div>
                <span className="text-[10px] font-display font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">Active</span>
              </div>

              <div className="space-y-3 font-sans text-xs text-brand-900 pt-2">
                <div className="p-3 bg-brand-50/40 border border-brand-100/60 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block">Adherence Audits</span>
                  <p className="text-[10.5px] text-brand-800 leading-normal">
                    Review completed routines and checklist adherence rates in the Client Profiles module.
                  </p>
                </div>
              </div>
            </div>

            {/* Consultant Directives */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Advisory Directives</h3>
                <p className="text-[11px] text-brand-800">Skincare recommendation workflow</p>
              </div>

              <div className="space-y-3 font-sans text-xs flex-1 pt-2">
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl space-y-1">
                  <span className="text-[9px] font-display font-bold uppercase tracking-wider text-brand-700 block">Consultant Protocol</span>
                  <p className="text-[10.5px] text-brand-900 leading-normal">
                    You can inspect client diagnostic reports, adjust product recommendations, and save clinical notes.
                  </p>
                </div>
              </div>

              <Link 
                to="/consultant/profiles"
                className="w-full bg-brand-50 hover:bg-brand-100 text-brand-850 py-2.5 rounded-xl text-center text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors border border-brand-100"
              >
                Inspect Clients Directory
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
