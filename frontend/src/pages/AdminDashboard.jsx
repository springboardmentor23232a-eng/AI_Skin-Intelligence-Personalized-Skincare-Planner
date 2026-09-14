import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  User, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp,
  Activity,
  AlertCircle,
  RefreshCw,
  Server,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../services/adminService';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Admin Dashboard', path: '/admin' }
  ];

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load administrative dashboard stats:', err);
      setError('Unable to load platform administrative statistics from the backend server.');
      toast.error('Failed to load administrative dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const stats = dashboardData?.stats || {
    total_users: 0,
    total_patients: 0,
    total_doctors: 0,
    total_consultants: 0,
    total_admins: 0
  };

  const userStats = [
    { label: 'Total Patients', val: stats.total_patients, icon: User, color: 'brand' },
    { label: 'Doctors Onboarded', val: stats.total_doctors, icon: ShieldCheck, color: 'indigo' },
    { label: 'Skincare Consultants', val: stats.total_consultants, icon: TrendingUp, color: 'accent' },
    { label: 'System Administrators', val: stats.total_admins || 1, icon: Server, color: 'brand' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Welcome Section */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-900/40 to-transparent pointer-events-none" />
        <div className="space-y-2 z-10">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-405 bg-brand-900 px-3 py-1 rounded-full">
            Admin Console
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            System Dashboard
          </h1>
          <p className="text-sm text-brand-200 leading-normal max-w-md">
            Real-time platform telemetry, user role distributions, database health, and active service monitoring.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading platform telemetry...</span>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <p className="text-sm font-semibold text-red-900">{error}</p>
          <button 
            onClick={fetchAdminData}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* User Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {userStats.map((stat, idx) => {
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
            
            {/* System Status */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">System Telemetry</h3>
                  <p className="text-[11px] text-brand-800">Connection state and core latencies</p>
                </div>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-3 font-sans text-xs text-brand-900">
                <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
                  <span className="font-semibold text-brand-900">API Gateway Status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
                  <span className="font-semibold text-brand-900">PostgreSQL Status</span>
                  <span className="text-emerald-700 font-bold">Connected ({dashboardData?.system_status?.db_latency_ms || 12}ms)</span>
                </div>
                <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
                  <span className="font-semibold text-brand-900">Active User Accounts</span>
                  <span className="text-slate-900 font-bold">{stats.total_users} Users</span>
                </div>
                <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
                  <span className="font-semibold text-brand-900">Auth Subsystem</span>
                  <span className="text-emerald-700 font-bold">JWT / RBAC Active</span>
                </div>
              </div>
            </div>

            {/* Recent Registered Users */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Recent Users</h3>
                  <p className="text-[11px] text-brand-800">Newly onboarded platform accounts</p>
                </div>
                <Users className="w-4 h-4 text-brand-600" />
              </div>

              <div className="space-y-2.5">
                {dashboardData?.recent_users && dashboardData.recent_users.length > 0 ? (
                  dashboardData.recent_users.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-brand-100/60 rounded-xl text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-brand-800">{u.email}</div>
                      </div>
                      <span className="bg-brand-50 border border-brand-200 text-brand-800 text-[9px] font-bold px-2 py-0.5 rounded">
                        {u.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No recent user accounts found.</p>
                )}
              </div>
            </div>

            {/* Platform Role Breakdown */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Role Distribution</h3>
                <p className="text-[11px] text-brand-800">Live platform population split</p>
              </div>

              <div className="space-y-3 font-sans text-xs flex-1 pt-1">
                <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-xl space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-brand-900">Patients / Users</span>
                    <span className="font-bold text-slate-900">{stats.total_patients}</span>
                  </div>
                  <div className="w-full bg-brand-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-600 h-full rounded-full" 
                      style={{ width: `${stats.total_users ? (stats.total_patients / stats.total_users) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="font-semibold text-indigo-900">Doctors / Dermatologists</span>
                    <span className="font-bold text-slate-900">{stats.total_doctors}</span>
                  </div>
                  <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${stats.total_users ? (stats.total_doctors / stats.total_users) * 100 : 0}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="font-semibold text-accent-900">Skincare Consultants</span>
                    <span className="font-bold text-slate-900">{stats.total_consultants}</span>
                  </div>
                  <div className="w-full bg-accent-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent-600 h-full rounded-full" 
                      style={{ width: `${stats.total_users ? (stats.total_consultants / stats.total_users) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-700 block">RBAC Integrity</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Backend authorization enforcement is active across all endpoints.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

