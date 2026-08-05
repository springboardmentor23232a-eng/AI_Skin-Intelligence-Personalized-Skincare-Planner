import React from 'react';
import { Link } from 'react-router-dom';
import consultantData from '../data/consultantData.json';
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

export default function ConsultantDashboard() {
  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Consultant Dashboard', path: '/consultant' }
  ];

  // Quick statistics counters
  const quickStats = [
    { label: 'Clients Assigned', val: consultantData.clients.length, icon: User, color: 'brand' },
    { label: 'Reviews Pending', val: consultantData.recentAssessments.length, icon: AlertCircle, color: 'accent' },
    { label: 'Consultations Completed', val: 18, icon: TrendingUp, color: 'indigo' },
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

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, idx) => {
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
        
        {/* Pending Reviews Queue */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
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
            {consultantData.recentAssessments.map(report => (
              <div key={report.id} className="flex items-center justify-between p-2 bg-white border border-brand-100 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <img src={report.photo} alt={report.clientName} className="w-8 h-8 rounded-lg object-cover border border-brand-200" />
                  <div>
                    <div className="font-semibold text-slate-900">{report.clientName}</div>
                    <div className="text-[10px] text-brand-800">{report.concern}</div>
                  </div>
                </div>
                <Link to="/consultant/reports" className="text-[10px] font-display font-bold text-brand-600 hover:underline">Review</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Consultations */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Upcoming Consultations</h3>
              <p className="text-[11px] text-brand-800 font-sans">Scheduled consultation channels</p>
            </div>
            <button className="text-[10px] font-display font-bold text-brand-600 hover:text-brand-850">Calendar</button>
          </div>

          <div className="space-y-3 font-sans text-xs text-brand-900">
            <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
              <div className="font-semibold text-slate-950 flex justify-between">
                <span>Sarah Connor</span>
                <span className="text-[9px] text-brand-650 bg-brand-100/50 px-2 py-0.5 rounded">03:30 PM</span>
              </div>
              <p className="text-[10px] text-brand-800">Routine follow-up discussion regarding retinol skin peeling.</p>
            </div>
            <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
              <div className="font-semibold text-slate-950 flex justify-between">
                <span>John Doe</span>
                <span className="text-[9px] text-brand-650 bg-brand-100/50 px-2 py-0.5 rounded">Tomorrow</span>
              </div>
              <p className="text-[10px] text-brand-800">Reviewing salicylic acid compliance reports and acne pustule updates.</p>
            </div>
          </div>
        </div>

        {/* Recent Client Activity */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Recent Client Activity</h3>
            <p className="text-[11px] text-brand-800">Client compliance audit logs</p>
          </div>

          <div className="space-y-3.5 font-sans text-xs flex-1 pt-2">
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-800 block">Today, 02:40 PM</span>
                <span className="text-slate-900 font-medium">Kate Austin logged a Week 4 check-in face scan</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-800 block">Today, 11:15 AM</span>
                <span className="text-slate-900 font-medium">Sarah Connor completed 12 consecutive AM steps</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
              <div>
                <span className="text-[9px] text-brand-800 block">Yesterday, 04:50 PM</span>
                <span className="text-slate-900 font-medium">John Doe requested routine override review</span>
              </div>
            </div>
          </div>
        </div>

      </div>

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
