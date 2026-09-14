import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import * as dermatologistService from '../services/dermatologistService';

export default function PatientInsights() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const crumbs = [
    { label: 'Dashboard', path: '/dermatologist' },
    { label: 'Patient Insights', path: '/dermatologist/insights' }
  ];

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await dermatologistService.getPatients(searchTerm, statusFilter);
      setPatients(data || []);
    } catch (err) {
      toast.error('Failed to load clinical patient insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm, statusFilter]);

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

      <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-100">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search patient name, email, or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-72"
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

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-brand-850 font-semibold">Loading patient records...</span>
          </div>
        ) : patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patients.map(p => (
              <div 
                key={p.id} 
                className="border border-brand-100 bg-white rounded-2xl p-5 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start pb-2 border-b border-brand-100/50">
                    <div>
                      <h4 className="font-display text-base font-bold text-slate-900">{p.name}</h4>
                      <p className="text-[11px] text-brand-800">{p.email} — Skin: {p.skin_type || 'N/A'}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      p.status === 'Critical' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Medical History */}
                  <div className="text-xs space-y-1 font-sans">
                    <span className="font-display font-bold text-[9px] uppercase tracking-wider text-brand-650 block">Primary Diagnosis & Detected Concerns</span>
                    <div className="bg-brand-50/50 p-2.5 border border-brand-100 rounded-xl text-brand-900 leading-relaxed font-semibold">
                      {p.diagnosis}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    {/* Allergies */}
                    <div className="p-3 bg-red-50/20 border border-red-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-[9px] font-display font-bold uppercase tracking-wider text-red-750">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Allergies & Sensitivities</span>
                      </div>
                      <div className="font-semibold text-red-950 text-[11px]">
                        {Array.isArray(p.allergies) && p.allergies.length > 0 
                          ? p.allergies.join(', ') 
                          : (p.allergies || 'None Logged')}
                      </div>
                    </div>

                    {/* Active Treatment */}
                    <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-[9px] font-display font-bold uppercase tracking-wider text-brand-700">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Treatment Plan</span>
                      </div>
                      <div className="font-semibold text-slate-950 text-[11px]">
                        {p.activeTreatment || 'Standard Care Planner'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-brand-100/60 pt-3 mt-4 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">Registered: {new Date(p.created_at || Date.now()).toLocaleDateString()}</span>
                  <button 
                    onClick={() => toast.success(`Viewing EMR records for ${p.name}`)}
                    className="text-brand-600 hover:text-brand-800 font-display font-bold text-xs"
                  >
                    Clinical Log →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No Patient Records Found" 
            message="No patient profiles match the given search keyword and status filter." 
          />
        )}
      </div>
    </div>
  );
}
