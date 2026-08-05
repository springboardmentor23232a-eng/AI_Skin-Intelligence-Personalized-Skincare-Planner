import React, { useState } from 'react';
import dermatologistData from '../data/dermatologistData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { Camera, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SkinConditionReports() {
  const [selectedCondition, setSelectedCondition] = useState('All');

  const reportCategories = [
    { name: 'Acne Vulgaris', count: 12, severity: 'Moderate-Severe', desc: 'Inflammatory papules and pustules mostly clustered in cheek and jaw areas.' },
    { name: 'Hyperpigmentation', count: 8, severity: 'Mild-Moderate', desc: 'Melasma patterns post UV exposure on nose bridge and forehead.' },
    { name: 'Rosacea', count: 5, severity: 'Moderate', desc: 'Persistent redness and flushing aggravated by spicy foods and weather extremes.' },
    { name: 'Sensitive Skin / Dermatitis', count: 6, severity: 'Mild', desc: 'Erythema and superficial peeling indicating barrier moisture depletion.' },
  ];

  const filteredCategories = selectedCondition === 'All' 
    ? reportCategories 
    : reportCategories.filter(r => r.name.toLowerCase().includes(selectedCondition.toLowerCase()));

  const crumbs = [
    { label: 'Dashboard', path: '/dermatologist' },
    { label: 'Skin Condition Reports', path: '/dermatologist/reports' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Skin Condition Reports
        </h1>
        <p className="text-sm text-brand-850">
          Monitor diagnoses, case distributions, and severities segmented by clinical category.
        </p>
      </div>

      {/* Selector tabs */}
      <div className="flex flex-wrap gap-2 border-b border-brand-100 pb-3">
        {['All', 'Acne', 'Hyperpigmentation', 'Rosacea', 'Sensitive'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedCondition(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
              selectedCondition === tab
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-brand-850 border border-brand-100 hover:bg-brand-50'
            }`}
          >
            {tab === 'All' ? 'All Conditions' : tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map((c, idx) => (
          <div 
            key={idx}
            className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">{c.name}</h3>
                  <span className="text-[10px] text-brand-800 block mt-0.5">Active Diagnosed Cases: <strong>{c.count} patients</strong></span>
                </div>
                <span className="bg-red-50 text-red-850 text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-red-100">
                  {c.severity}
                </span>
              </div>

              <p className="text-xs text-brand-900 leading-relaxed bg-brand-50/40 p-3 rounded-xl border border-brand-100/50">
                {c.desc}
              </p>

              {/* Patient List preview */}
              <div className="space-y-2">
                <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-600 block">Recent Escalated Reports</span>
                {dermatologistData.criticalCasesList.slice(0, 2).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-white border border-brand-100 rounded-xl text-xs">
                    <img 
                      src={item.photo} 
                      alt={item.patientName} 
                      className="w-9 h-9 rounded-lg object-cover border border-brand-200"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{item.patientName}</div>
                      <div className="text-[10px] text-red-850 font-medium">Condition: {item.condition}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-brand-100/60 pt-3 mt-4 flex justify-end gap-2 text-xs font-display">
              <button 
                onClick={() => toast.success(`Exporting condition summary report for ${c.name}`)}
                className="p-1.5 hover:bg-brand-50 border border-brand-200 text-brand-800 rounded-xl transition-colors flex items-center gap-1 px-3 font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                Export Summary
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
