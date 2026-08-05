import React, { useState } from 'react';
import dermatologistData from '../data/dermatologistData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientInsights() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [patients, setPatients] = useState(dermatologistData.patients);

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const crumbs = [
    { label: 'Dashboard', path: '/dermatologist' },
    { label: 'Patient Insights', path: '/dermatologist/insights' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Patient Insights
        </h1>
        <p className="text-sm text-brand-850">
          Access clinical user medical history, registered allergies, active ingredients sensitivities, and status alerts.
        </p>
      </div>

      <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-100">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search patient name or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-brand-200 px-3 py-1.5 rounded-xl bg-brand-50/20 text-xs text-brand-900 font-display">
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-semibold mr-1">Filter Clinical Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Critical">Critical Case</option>
              <option value="Stable">Stable Case</option>
            </select>
          </div>
        </div>

        {/* Patient Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(p => (
              <div 
                key={p.id} 
                className="border border-brand-100 bg-white rounded-2xl p-5 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start pb-2 border-b border-brand-100/50">
                    <div>
                      <h4 className="font-display text-base font-bold text-slate-900">{p.name}</h4>
                      <p className="text-[11px] text-brand-800">Age/Gender: {p.age}y / {p.gender} — ID: {p.id}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold ${
                      p.status === 'Critical' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Medical History */}
                  <div className="text-xs space-y-1 font-sans">
                    <span className="font-display font-bold text-[9px] uppercase tracking-wider text-brand-650 block">Medical History & Diagnosis</span>
                    <div className="bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl text-brand-900 leading-relaxed font-semibold">
                      {p.diagnosis}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    {/* Allergies */}
                    <div className="p-3 bg-red-50/20 border border-red-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-[9px] font-display font-bold uppercase tracking-wider text-red-750">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-650" />
                        <span>Allergies</span>
                      </div>
                      <p className="text-[10px] text-brand-850 font-medium">Benzoyl Peroxide, Nuts Extracts</p>
                    </div>

                    {/* Sensitivities */}
                    <div className="p-3 bg-amber-50/20 border border-amber-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-[9px] font-display font-bold uppercase tracking-wider text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sensitivities</span>
                      </div>
                      <p className="text-[10px] text-brand-850 font-medium">Fragrance, High concentration Retinol</p>
                    </div>
                  </div>

                  {/* Specialist Alerts */}
                  <div className="bg-rose-50 border border-rose-100/50 p-3 rounded-xl flex gap-2.5 items-start text-xs font-sans text-rose-850">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <span className="font-display font-bold text-[9px] uppercase tracking-wider text-rose-800 block">Clinical Alerts</span>
                      <p className="text-[10.5px] leading-normal font-medium">
                        Patient has noted moderate irritation. Check compatibility of tretinoin overrides prior to approving weekly routine shifts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-brand-100/60 pt-3 mt-4 text-xs font-display">
                  <button 
                    onClick={() => toast.success(`Viewing diagnostic record history of patient ${p.name}`)}
                    className="p-1.5 hover:bg-brand-50 border border-brand-200 text-brand-800 rounded-xl transition-colors px-3 font-semibold"
                  >
                    View EMR File
                  </button>
                  <button 
                    onClick={() => toast.success(`Flagging case updates for patient ${p.name}`)}
                    className="p-1.5 hover:bg-brand-50 border border-brand-200 text-red-650 rounded-xl transition-colors px-3 font-semibold"
                  >
                    Flag Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

    </div>
  );
}
