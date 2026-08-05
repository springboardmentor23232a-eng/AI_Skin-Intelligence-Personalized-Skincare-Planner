import React, { useState } from 'react';
import dermatologistData from '../data/dermatologistData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { Sparkles, CheckCircle2, AlertCircle, Plus, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TreatmentRecommendations() {
  const [patients, setPatients] = useState(dermatologistData.patients);
  const [targetPatientName, setTargetPatientName] = useState(patients[0]?.name || '');
  const [prescription, setPrescription] = useState('');
  const [actives, setActives] = useState('Tretinoin');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpWeeks, setFollowUpWeeks] = useState('4');

  const [overrideHistory, setOverrideHistory] = useState([
    { id: 'TX-901', patient: 'Sarah Connor', actives: 'Tretinoin 0.025%', notes: 'Apply thin layer at night', followUp: '4 weeks', date: 'August 1, 2026' },
    { id: 'TX-902', patient: 'John Doe', actives: 'Clindamycin 1% Gel', notes: 'Apply in AM under moisturizer', followUp: '6 weeks', date: 'July 28, 2026' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetPatientName || !prescription) {
      toast.error('Please enter prescription actives and select a patient.');
      return;
    }

    const newTx = {
      id: `TX-90${overrideHistory.length + 1}`,
      patient: targetPatientName,
      actives: `${actives} (${prescription})`,
      notes: clinicalNotes || 'Standard application routines.',
      followUp: `${followUpWeeks} weeks`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    setOverrideHistory([newTx, ...overrideHistory]);
    toast.success(`Clinical treatment approved for ${targetPatientName}! 🩺`);
    
    // Reset
    setPrescription('');
    setClinicalNotes('');
  };

  const crumbs = [
    { label: 'Dashboard', path: '/dermatologist' },
    { label: 'Treatment Recommendations', path: '/dermatologist/recommendations' }
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form panel */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
            <div className="p-2 bg-brand-100 rounded-xl text-brand-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 font-display">Prescribe Overrides</h3>
              <p className="text-[10px] text-brand-800">Submit clinical prescription parameters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                Select Patient Profile
              </label>
              <select
                value={targetPatientName}
                onChange={(e) => setTargetPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.name}>{p.name} ({p.diagnosis})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                  Active Drug Ingredient
                </label>
                <select
                  value={actives}
                  onChange={(e) => setActives(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="Tretinoin">Tretinoin</option>
                  <option value="Clindamycin">Clindamycin</option>
                  <option value="Azelaic Acid">Azelaic Acid</option>
                  <option value="Hydrocortisone">Hydrocortisone</option>
                  <option value="Ketoconazole">Ketoconazole</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                  Follow-up Plan
                </label>
                <select
                  value={followUpWeeks}
                  onChange={(e) => setFollowUpWeeks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="2">2 Weeks</option>
                  <option value="4">4 Weeks</option>
                  <option value="6">6 Weeks</option>
                  <option value="8">8 Weeks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                Concentration & Vehicle
              </label>
              <input
                type="text"
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="e.g. 0.025% Cream or 1% Gel"
                className="w-full px-3.5 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-850 mb-1">
                Specialist Clinical Guidance Notes
              </label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="e.g. Apply pea-sized amount at night. Buffering with moisturizer is permitted to alleviate initial peeling."
                rows="3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              />
            </div>

            <button 
              type="submit"
              className="btn-accent w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 font-display font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Prescription
            </button>
          </form>
        </div>

        {/* History / Tables */}
        <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Treatment Prescription History</h3>
            <p className="text-xs text-brand-800 font-sans">Recent active medical recommendations saved on EMR database</p>
          </div>

          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                  <th className="py-2.5 px-2">TX Code</th>
                  <th className="py-2.5 px-2">Patient</th>
                  <th className="py-2.5 px-2">Actives Overrides</th>
                  <th className="py-2.5 px-2">Clinical Instructions</th>
                  <th className="py-2.5 px-2">Follow Up</th>
                  <th className="py-2.5 px-2">Approved Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/50">
                {overrideHistory.map(tx => (
                  <tr key={tx.id} className="hover:bg-brand-50/20 transition-colors">
                    <td className="py-3.5 px-2 font-semibold text-slate-900">{tx.id}</td>
                    <td className="py-3.5 px-2 font-medium text-slate-950">{tx.patient}</td>
                    <td className="py-3.5 px-2 text-brand-900 font-semibold">{tx.actives}</td>
                    <td className="py-3.5 px-2 text-brand-850 max-w-[150px] truncate" title={tx.notes}>{tx.notes}</td>
                    <td className="py-3.5 px-2 font-medium text-slate-900">{tx.followUp}</td>
                    <td className="py-3.5 px-2 text-brand-800">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
