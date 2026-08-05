import React from 'react';
import { Link } from 'react-router-dom';
import dermatologistData from '../data/dermatologistData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  User, 
  Camera, 
  HeartPulse, 
  LineChart, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function DermatologistDashboard() {
  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Dermatologist Dashboard', path: '/dermatologist' }
  ];

  // Quick statistics counters
  const quickStats = [
    { label: 'Patients Waiting', val: dermatologistData.criticalCasesList.length, icon: AlertTriangle, color: 'accent' },
    { label: 'Patients Checked', val: dermatologistData.patients.length, icon: TrendingUp, color: 'brand' },
    { label: 'High-Risk Cases', val: 3, icon: HeartPulse, color: 'red' },
  ];

  const quickAccess = [
    { label: 'Patient Insights', path: '/dermatologist/insights', desc: 'EMR profiles, allergies and history', icon: User },
    { label: 'Condition Reports', path: '/dermatologist/reports', desc: 'Clinical reports categorized by disease', icon: Camera },
    { label: 'Treatment Recommendations', path: '/dermatologist/recommendations', desc: 'Prescribe active drug overrides', icon: HeartPulse },
    { label: 'Progress Analytics', path: '/dermatologist/analytics', desc: 'Condition trends and recovery recovery', icon: LineChart },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Welcome Section */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-900/40 to-transparent pointer-events-none" />
        <div className="space-y-2 z-10">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-405 bg-brand-900 px-3 py-1 rounded-full">
            Clinical Hub
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Dermatologist Portal
          </h1>
          <p className="text-sm text-brand-200 leading-normal max-w-md">
            Review high-risk skin reports, audit primary patient EMR insights, and authorize active medical overrides.
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
                'bg-red-50 text-red-650 border border-red-100'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Cases */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Critical Cases</h3>
              <p className="text-[11px] text-brand-800">Severe diagnoses requiring overrides</p>
            </div>
            <Link to="/dermatologist/reports" className="text-[10px] font-display font-bold text-brand-600 hover:text-brand-800 flex items-center gap-0.5">
              Condition reports
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {dermatologistData.criticalCasesList.map(report => (
              <div key={report.id} className="flex items-center justify-between p-2 bg-red-50/20 border border-red-100/60 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <img src={report.photo} alt={report.patientName} className="w-8 h-8 rounded-lg object-cover border border-red-200" />
                  <div>
                    <div className="font-semibold text-slate-900">{report.patientName}</div>
                    <div className="text-[10px] text-red-850 font-medium">{report.condition}</div>
                  </div>
                </div>
                <Link to="/dermatologist/recommendations" className="text-[10px] font-display font-bold text-red-650 hover:underline">Treat</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Reviews */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Today's Reviews</h3>
              <p className="text-[11px] text-brand-800 font-sans">Pending clinical signoffs</p>
            </div>
            <button className="text-[10px] font-display font-bold text-brand-600 hover:text-brand-850">History</button>
          </div>

          <div className="space-y-3 font-sans text-xs text-brand-900">
            <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
              <div className="font-semibold text-slate-950 flex justify-between">
                <span>Kate Austin</span>
                <span className="text-[9px] text-brand-650 bg-brand-100/50 px-2 py-0.5 rounded">Pending</span>
              </div>
              <p className="text-[10px] text-brand-800">Check skin barrier dryness rating after AHA/BHA weekly peel treatment.</p>
            </div>
            <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
              <div className="font-semibold text-slate-950 flex justify-between">
                <span>Sarah Connor</span>
                <span className="text-[9px] text-brand-650 bg-brand-100/50 px-2 py-0.5 rounded">Pending</span>
              </div>
              <p className="text-[10px] text-brand-800">Recheck erythema severity score and log custom topical treatment advice.</p>
            </div>
          </div>
        </div>

        {/* Patient Summary */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Patient Roster Summary</h3>
            <p className="text-[11px] text-brand-800 font-sans">Active diagnostic statistics</p>
          </div>

          <div className="space-y-3.5 font-sans text-xs flex-1 pt-2">
            <div className="flex justify-between py-1.5 border-b border-brand-100/40">
              <span className="text-brand-800">Acne Cases</span>
              <span className="font-bold text-slate-950">12 patients</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-brand-100/40">
              <span className="text-brand-800">Rosacea Cases</span>
              <span className="font-bold text-slate-950">5 patients</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-brand-100/40">
              <span className="text-brand-800">Sensitive Barrier</span>
              <span className="font-bold text-slate-950">6 patients</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Access Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-955">Clinical Modules Quick Access</h3>
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
