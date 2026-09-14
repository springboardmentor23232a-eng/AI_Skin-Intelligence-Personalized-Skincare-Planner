import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  User, 
  Camera, 
  HeartPulse, 
  LineChart, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Activity,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as dermatologistService from '../services/dermatologistService';

export default function DermatologistDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Dermatologist Dashboard', path: '/dermatologist' }
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dermatologistService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError('Unable to load dermatologist clinical telemetry.');
      toast.error('Failed to load dermatologist dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = dashboardData?.stats || {
    patients_waiting: dashboardData?.high_risk_count ?? 0,
    total_patients: dashboardData?.total_patients ?? 0,
    patients_checked: dashboardData?.reviewed_count ?? 0,
    high_risk_cases: dashboardData?.high_risk_count ?? 0,
    active_prescriptions: 0
  };

  const quickStats = [
    { label: 'Patients Waiting Review', val: stats.patients_waiting, icon: AlertTriangle, color: 'accent' },
    { label: 'Total Registered Patients', val: stats.total_patients, icon: TrendingUp, color: 'brand' },
    { label: 'Severe / Critical Cases', val: stats.high_risk_cases, icon: HeartPulse, color: 'red' },
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
            Review severe skin assessment reports, audit primary patient clinical insights, and authorize medical overrides.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading clinical telemetry...</span>
        </div>
      ) : error ? (
        <div className="border border-red-200 bg-red-50/70 p-6 rounded-3xl text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto" />
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
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
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
                {dashboardData?.critical_cases && dashboardData.critical_cases.length > 0 ? (
                  dashboardData.critical_cases.map(report => (
                    <div key={report.id} className="flex items-center justify-between p-2.5 bg-red-50/30 border border-red-100 rounded-xl text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center font-display font-bold text-xs text-red-800">
                          {report.patientName ? report.patientName[0] : 'P'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{report.patientName || report.patient_name}</div>
                          <div className="text-[10px] text-red-800 font-medium">Concern: {report.condition || report.concern}</div>
                        </div>
                      </div>
                      <span className="bg-red-100 text-red-800 text-[8px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {report.severity}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No critical escalated cases at this time.</p>
                )}
              </div>
            </div>

            {/* Recent Patients */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-brand-100/60">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Patient Insights</h3>
                  <p className="text-[11px] text-brand-800">Recent clinical user records</p>
                </div>
                <Link to="/dermatologist/insights" className="text-[10px] font-display font-bold text-brand-600 hover:text-brand-800 flex items-center gap-0.5">
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {dashboardData?.recent_patients && dashboardData.recent_patients.length > 0 ? (
                  dashboardData.recent_patients.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-brand-100/60 rounded-xl text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-brand-800">{p.diagnosis}</div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No patient records found.</p>
                )}
              </div>
            </div>

            {/* Clinical Overview Action */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Clinical Directives</h3>
                <p className="text-[11px] text-brand-800">Clinical staff medical protocols</p>
              </div>

              <div className="space-y-3 font-sans text-xs flex-1 pt-2">
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl space-y-1">
                  <span className="text-[9px] font-display font-bold uppercase tracking-wider text-brand-700 block">Medical Override Protocol</span>
                  <p className="text-[10.5px] text-brand-900 leading-normal">
                    Authorized dermatologists can prescribe custom medical active ingredients to replace cosmetic routines.
                  </p>
                </div>
              </div>

              <Link 
                to="/dermatologist/recommendations"
                className="w-full bg-brand-50 hover:bg-brand-100 text-brand-850 py-2.5 rounded-xl text-center text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors border border-brand-100"
              >
                Prescribe Treatments
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
