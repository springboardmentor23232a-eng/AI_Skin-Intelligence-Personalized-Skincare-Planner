import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { Camera, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as dermatologistService from '../services/dermatologistService';

export default function SkinConditionReports() {
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const crumbs = [
    { label: 'Dashboard', path: '/dermatologist' },
    { label: 'Skin Condition Reports', path: '/dermatologist/reports' }
  ];

  const fetchConditions = async () => {
    setLoading(true);
    try {
      const data = await dermatologistService.getConditions();
      setCategories(data?.categories || []);
    } catch (err) {
      toast.error('Failed to load condition reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const filteredCategories = selectedCondition === 'All' 
    ? categories 
    : categories.filter(r => (r.name || '').toLowerCase().includes(selectedCondition.toLowerCase()));

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
        {['All', 'Acne', 'Hyperpigmentation', 'Redness / Sensitivity', 'Dryness', 'Wrinkles / Aging'].map(tab => (
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

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading condition distributions...</span>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((c, idx) => (
            <div 
              key={idx}
              className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 flex flex-col justify-between"
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

                {/* Patient preview */}
                {c.recent_patients && c.recent_patients.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-600 block">Recent Escalated Reports</span>
                    {c.recent_patients.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-brand-100/70 rounded-xl text-xs">
                        <div className="w-8 h-8 rounded-lg bg-brand-200 border border-brand-300 flex items-center justify-center font-display font-bold text-xs text-brand-800">
                          {item.patientName ? item.patientName[0] : 'P'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{item.patientName}</div>
                          <div className="text-[10px] text-red-850 font-medium">Condition: {item.condition} ({item.severity})</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-brand-100/60 pt-3 mt-4 flex justify-end gap-2 text-xs font-display">
                <button 
                  onClick={() => toast.success(`Exporting condition summary report for ${c.name}`)}
                  className="p-1.5 hover:bg-brand-50 border border-brand-200 text-brand-800 rounded-xl transition-colors flex items-center gap-1 px-3 font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Clinical Summary
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No Condition Categories Found" 
          message="No skin assessment records currently match this condition filter." 
        />
      )}
    </div>
  );
}
