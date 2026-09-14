import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { Sparkles, CheckCircle2, AlertCircle, Plus, Calendar, FileText, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import * as dermatologistService from '../services/dermatologistService';

export default function TreatmentRecommendations() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetPatientName, setTargetPatientName] = useState('');
  const [prescription, setPrescription] = useState('');
  const [actives, setActives] = useState('Tretinoin (0.025%)');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpWeeks, setFollowUpWeeks] = useState('4');

  const [overrideHistory, setOverrideHistory] = useState([
    { id: 'TX-901', patient: 'Active Clinical Client', actives: 'Tretinoin (0.025%)', notes: 'Apply thin layer at night', followUp: '4 weeks', date: 'September 2026' }
  ]);

  const crumbs = [
    { label: 'Dashboard', path: '/dermatologist' },
    { label: 'Treatment Recommendations', path: '/dermatologist/recommendations' }
  ];

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await dermatologistService.getPatients();
      setPatients(data || []);
      if (data && data.length > 0) {
        setTargetPatientName(data[0].name || data[0].email);
      }
    } catch (err) {
      toast.error('Failed to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetPatientName || !prescription) {
      toast.error('Please enter prescription details and select a patient.');
      return;
    }

    const newTx = {
      id: `TX-${Math.floor(100 + Math.random() * 900)}`,
      patient: targetPatientName,
      actives: `${actives} (${prescription})`,
      notes: clinicalNotes || 'Standard medical application routine.',
      followUp: `${followUpWeeks} weeks`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    setOverrideHistory([newTx, ...overrideHistory]);
    toast.success(`Clinical treatment approved for ${targetPatientName}! 🩺`);
    
    // Reset
    setPrescription('');
    setClinicalNotes('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Treatment Recommendations
        </h1>
        <p className="text-sm text-brand-850">
          Prescribe medical actives, override cosmetic routines, and log clinical follow-up timelines.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading clinical patients...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form panel */}
          <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
              <div className="p-2 bg-brand-100 rounded-xl text-brand-600">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Prescribe Overrides</h3>
                <p className="text-[10px] text-brand-800">Submit clinical prescription parameters</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                  Select Patient Profile
                </label>
                {patients.length > 0 ? (
                  <select
                    value={targetPatientName}
                    onChange={(e) => setTargetPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.name || p.email}>
                        {p.name || p.email} ({p.diagnosis || 'Clinical Client'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-500">No registered patients in database</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                  Active Drug Ingredient
                </label>
                <select
                  value={actives}
                  onChange={(e) => setActives(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="Tretinoin (0.025%)">Tretinoin (0.025%)</option>
                  <option value="Tretinoin (0.05%)">Tretinoin (0.05%)</option>
                  <option value="Adapalene (0.1%)">Adapalene (0.1%)</option>
                  <option value="Clindamycin (1% Gel)">Clindamycin (1% Gel)</option>
                  <option value="Azelaic Acid (15% Gel)">Azelaic Acid (15% Gel)</option>
                  <option value="Hydroquinone (4%)">Hydroquinone (4%)</option>
                  <option value="Spironolactone (Topical 5%)">Spironolactone (Topical 5%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                  Dosage / Instructions
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Apply pea-sized amount every alternate PM"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                  Clinical Follow-Up Timeline
                </label>
                <select
                  value={followUpWeeks}
                  onChange={(e) => setFollowUpWeeks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="2">2 Weeks Check-in</option>
                  <option value="4">4 Weeks Standard</option>
                  <option value="6">6 Weeks Comprehensive</option>
                  <option value="8">8 Weeks Final Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                  Doctor Notes
                </label>
                <textarea 
                  rows={2}
                  placeholder="Clinical notes, sunscreen mandates..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-display font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Authorize Clinical Override
              </button>
            </form>
          </div>

          {/* Overrides Table */}
          <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Authorized Clinical Overrides</h3>
              <p className="text-xs text-brand-800">Historical prescription records logged by authorized dermatologists</p>
            </div>

            <div className="overflow-x-auto min-w-full">
              {overrideHistory.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                      <th className="py-2.5 px-2">TX ID</th>
                      <th className="py-2.5 px-2">Patient</th>
                      <th className="py-2.5 px-2">Prescribed Active</th>
                      <th className="py-2.5 px-2">Follow-up</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100/50">
                    {overrideHistory.map(tx => (
                      <tr key={tx.id} className="text-brand-900 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 font-mono text-[10px] text-brand-700 font-bold">{tx.id}</td>
                        <td className="py-3 px-2 font-semibold text-slate-900">{tx.patient}</td>
                        <td className="py-3 px-2">
                          <span className="bg-brand-50 border border-brand-200 text-brand-900 px-2 py-0.5 rounded font-medium text-[11px]">
                            {tx.actives}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-600">{tx.followUp}</td>
                        <td className="py-3 px-2 text-slate-400 text-[10px]">{tx.date}</td>
                        <td className="py-3 px-2">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[9px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No treatment overrides logged yet.</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
