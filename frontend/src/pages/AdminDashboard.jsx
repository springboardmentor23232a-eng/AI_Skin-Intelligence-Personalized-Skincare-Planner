import React from 'react';
import { Link } from 'react-router-dom';
import adminData from '../data/adminData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  User, 
  ShieldCheck, 
  Sparkles, 
  Settings as SettingsIcon, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Database
} from 'lucide-react';

export default function AdminDashboard() {
  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Admin Dashboard', path: '/admin' }
  ];

  // User statistics counters
  const userStats = [
    { label: 'Total Patients', val: 142, icon: User, color: 'brand' },
    { label: 'Doctors Onboarded', val: 12, icon: ShieldCheck, color: 'indigo' },
    { label: 'Skincare Consultants', val: 8, icon: TrendingUp, color: 'accent' },
  ];

  const quickAccess = [
    { label: 'User Management', path: '/admin/users', desc: 'Add, edit, delete and suspend credentials', icon: ShieldCheck },
    { label: 'Platform Analytics', path: '/admin/analytics', desc: 'User growth DAU and statistics', icon: TrendingUp },
    { label: 'Recommendation Monitor', path: '/admin/monitoring', desc: 'Audit Pinecone vector logs', icon: Sparkles },
    { label: 'System Reports', path: '/admin/reports', desc: 'Gateway CPU latencies and logs', icon: SettingsIcon },
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
            Manage user directories, audit Pinecone database latencies, verify AI model accuracy, and compile system security logs.
          </p>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="glass-effect border border-brand-100 p-5 rounded-2xl flex items-center justify-between shadow-sm"
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
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">System Status</h3>
              <p className="text-[11px] text-brand-800">Connection state and core latencies</p>
            </div>
            <Link to="/admin/reports" className="text-[10px] font-display font-bold text-brand-600 hover:text-brand-800 flex items-center gap-0.5">
              Reports page
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 font-sans text-xs text-brand-900">
            <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
              <span className="font-semibold text-brand-900">API Status</span>
              <span className="text-emerald-700 font-bold">Online</span>
            </div>
            <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
              <span className="font-semibold text-brand-900">Database Connection</span>
              <span className="text-emerald-700 font-bold">Online</span>
            </div>
            <div className="flex justify-between items-center bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl">
              <span className="font-semibold text-brand-900">Database Latency</span>
              <span className="text-slate-900 font-bold">14ms</span>
            </div>
          </div>
        </div>

        {/* AI Recommendation Status */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">AI Recommendation Status</h3>
              <p className="text-[11px] text-brand-800 font-sans">Model accuracy benchmarks</p>
            </div>
            <Link to="/admin/monitoring" className="text-[10px] font-display font-bold text-brand-600 hover:text-brand-800 flex items-center gap-0.5">
              Monitor page
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 font-sans text-xs text-brand-900">
            <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
              <div className="font-semibold text-slate-950 flex justify-between">
                <span>Model Accuracy</span>
                <span className="text-[9px] text-brand-650 bg-brand-100/50 px-2 py-0.5 rounded">High</span>
              </div>
              <p className="text-[10px] text-brand-800 font-medium">96.4% success index rated by specialist validation overrides.</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Platform Overview Logs</h3>
            <p className="text-[11px] text-brand-800">Global audit trail timelines</p>
          </div>

          <div className="space-y-3.5 font-sans text-xs flex-1 pt-2">
            {adminData.recentActivity.slice(0, 2).map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
                <div>
                  <span className="text-[9px] text-brand-800 block">{log.timestamp}</span>
                  <span className="text-slate-900 font-medium"><strong>{log.user}:</strong> {log.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick Access Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-955">Platform Modules Quick Access</h3>
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
                  <h4 className="font-display text-xs font-bold text-slate-955 group-hover:text-brand-700 transition-colors">{qa.label}</h4>
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
