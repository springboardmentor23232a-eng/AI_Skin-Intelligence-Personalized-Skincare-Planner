import React from 'react';
import consultantData from '../data/consultantData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { Camera, Check, AlertCircle, Droplet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SkinAssessmentReports() {
  const crumbs = [
    { label: 'Dashboard', path: '/consultant' },
    { label: 'Skin Assessment Reports', path: '/consultant/reports' }
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {consultantData.recentAssessments.map(report => (
          <div 
            key={report.id}
            className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start pb-3 border-b border-brand-100/60">
                <div className="flex items-center gap-3">
                  <img 
                    src={report.photo} 
                    alt={report.clientName} 
                    className="w-12 h-12 rounded-xl object-cover border border-brand-200"
                  />
                  <div>
                    <h4 className="font-display text-base font-bold text-slate-900">{report.clientName}</h4>
                    <span className="text-[10px] text-brand-800 font-sans block">Submitted: Today</span>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Pending Consultant Review
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs font-sans text-brand-900">
                
                {/* Hydration */}
                <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-display font-semibold text-brand-700 text-[10px] uppercase tracking-wider">
                    <Droplet className="w-4 h-4 text-brand-500 fill-brand-100" />
                    <span>Hydration Metrics</span>
                  </div>
                  <div className="text-slate-900 font-bold text-sm">62% (Mildly Dry)</div>
                  <p className="text-[10px] text-brand-800 leading-normal">Stratum corneum shows moisture deficit in forehead zone.</p>
                </div>

                {/* Skin Concerns */}
                <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-display font-semibold text-brand-700 text-[10px] uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-brand-500" />
                    <span>Skin Concerns</span>
                  </div>
                  <div className="text-slate-900 font-bold text-sm">{report.concern}</div>
                  <p className="text-[10px] text-brand-800 leading-normal">Erythema present on bilateral cheeks. High sensitivity detected.</p>
                </div>

                {/* Risk Factors */}
                <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-display font-semibold text-brand-700 text-[10px] uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Risk Factors</span>
                  </div>
                  <div className="text-red-850 font-bold text-xs uppercase tracking-wide">High Sun Exposure</div>
                  <p className="text-[10px] text-brand-800 leading-normal">Works outdoors without consistent reapplication of broad SPF shield.</p>
                </div>

                {/* Overall Assessment */}
                <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-display font-semibold text-brand-700 text-[10px] uppercase tracking-wider">
                    <Check className="w-4 h-4 text-brand-500" />
                    <span>Overall Assessment</span>
                  </div>
                  <div className="text-slate-900 font-bold text-sm">Mild Skin Barrier Damage</div>
                  <p className="text-[10px] text-brand-800 leading-normal">Requires lipids and ceramides override to restore natural moisture factor.</p>
                </div>

              </div>
            </div>

            <div className="border-t border-brand-100/60 pt-3 mt-4 flex justify-end">
              <button 
                onClick={() => toast.success(`Skin Assessment Approved for ${report.clientName}`)}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-display flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Approve Assessment
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
