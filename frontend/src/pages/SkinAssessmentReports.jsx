import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Camera, Check, AlertCircle, Droplet } from 'lucide-react';
import toast from 'react-hot-toast';
import * as consultantService from '../services/consultantService';

export default function SkinAssessmentReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const crumbs = [
    { label: 'Dashboard', path: '/consultant' },
    { label: 'Skin Assessment Reports', path: '/consultant/reports' }
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await consultantService.getAllAssessments();
      setReports(data);
    } catch (err) {
      toast.error('Failed to load skin assessment reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Skin Assessment Reports
        </h1>
        <p className="text-sm text-brand-850">
          Review recent client photo scan reports, hydration indices, skin concerns, and risk factors.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading assessment reports...</span>
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map(report => (
            <div 
              key={report.id}
              className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start pb-3 border-b border-brand-100/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center font-display font-black text-brand-800">
                      {report.client_name ? report.client_name[0] : 'C'}
                    </div>
                    <div>
                      <h4 className="font-display text-base font-bold text-slate-900">{report.client_name}</h4>
                      <span className="text-[10px] text-brand-800 font-sans block">
                        Submitted: {new Date(report.assessment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="bg-brand-600 text-white text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Score: {report.skin_health_score}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs font-sans text-brand-900">
                  
                  {/* Overall Condition */}
                  <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-display font-semibold text-brand-700 text-[10px] uppercase tracking-wider">
                      <Check className="w-4 h-4 text-brand-500" />
                      <span>Overall Condition</span>
                    </div>
                    <div className="text-slate-900 font-bold text-sm">{report.overall_condition}</div>
                    <p className="text-[10px] text-brand-800 leading-normal">
                      Scan records state skin barrier is classified under: {report.overall_condition.toLowerCase()} condition.
                    </p>
                  </div>

                  {/* Skin Concerns List */}
                  <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-display font-semibold text-brand-700 text-[10px] uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-brand-500" />
                      <span>Skin Concerns Identified</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      {report.concerns && report.concerns.length > 0 ? (
                        report.concerns.map(con => (
                          <div key={con.id} className="flex justify-between text-[11px] font-medium text-slate-900">
                            <span>{con.concern_name}</span>
                            <span className="text-brand-650">({con.severity.toFixed(1)}/5)</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10.5px] text-slate-450 italic">No concerns detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Risk Factors List */}
                  <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1 md:col-span-2">
                    <div className="flex items-center gap-1.5 font-display font-semibold text-brand-700 text-[10px] uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span>Triggered Risk Factors</span>
                    </div>
                    <div className="space-y-2 pt-1">
                      {report.risks && report.risks.length > 0 ? (
                        report.risks.map(r => (
                          <div key={r.id} className="p-2 border border-red-100 bg-red-50/10 rounded-xl">
                            <div className="flex justify-between text-[11.5px] font-bold text-red-950">
                              <span>{r.risk_name}</span>
                              <span className="text-[9px] bg-red-100 px-2 py-0.5 rounded">{r.risk_level}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-0.5 leading-normal">{r.description}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10.5px] text-slate-450 italic">No risk factors triggered.</p>
                      )}
                    </div>
                  </div>

                  {/* Scan Notes */}
                  {report.notes && (
                    <div className="p-3.5 bg-amber-50/10 border border-amber-100 rounded-xl space-y-1 md:col-span-2 text-xs">
                      <span className="font-display font-bold text-[9px] uppercase tracking-wider text-amber-700 block">User Upload Notes:</span>
                      <p className="italic text-slate-700">{report.notes}</p>
                    </div>
                  )}

                </div>
              </div>

              <div className="border-t border-brand-100/60 pt-3 mt-4 flex justify-end">
                <button 
                  onClick={() => toast.success(`Skin Assessment Approved for ${report.client_name}`)}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-display flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Approve Assessment
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border-2 border-dashed border-brand-200 bg-white rounded-3xl p-8 max-w-md mx-auto flex flex-col items-center justify-center gap-4">
          <Camera className="w-12 h-12 text-brand-400 animate-pulse" />
          <h3 className="font-display text-lg font-bold text-brand-950">No Assessment Reports</h3>
          <p className="text-xs text-brand-800 leading-relaxed">
            No diagnostic assessment reports have been submitted by clients in the system database yet.
          </p>
        </div>
      )}
    </div>
  );
}
