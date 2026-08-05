import React, { useState } from 'react';
import consultantData from '../data/consultantData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { Sparkles, Edit2, Send, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecommendationManagement() {
  const [recommendations, setRecommendations] = useState([
    { id: 'REC-001', clientName: 'Sarah Connor', skinType: 'Combination', routineType: 'AM Routine', actives: 'Vitamin C + SPF 50', status: 'Draft' },
    { id: 'REC-002', clientName: 'John Doe', skinType: 'Oily', routineType: 'PM Routine', actives: 'Salicylic Acid + Niacinamide', status: 'Sent' },
    { id: 'REC-003', clientName: 'Kate Austin', skinType: 'Dry', routineType: 'Weekly Treatment', actives: 'HA sheet mask + Marula Oil', status: 'Sent' },
  ]);

  // Form states
  const [clientName, setClientName] = useState('');
  const [skinType, setSkinType] = useState('Combination');
  const [routineType, setRoutineType] = useState('AM Routine');
  const [actives, setActives] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !actives) {
      toast.error('Please enter client name and active ingredient details.');
      return;
    }

    if (editingId) {
      // Edit
      const updated = recommendations.map(rec => {
        if (rec.id === editingId) {
          return { ...rec, clientName, skinType, routineType, actives };
        }
        return rec;
      });
      setRecommendations(updated);
      toast.success('Recommendation edited successfully! ✏️');
      setEditingId(null);
    } else {
      // Create
      const newRec = {
        id: `REC-00${recommendations.length + 1}`,
        clientName,
        skinType,
        routineType,
        actives,
        status: 'Draft'
      };
      setRecommendations([...recommendations, newRec]);
      toast.success('Recommendation created as draft! 📝');
    }

    // Reset
    setClientName('');
    setActives('');
  };

  const handleEdit = (rec) => {
    setEditingId(rec.id);
    setClientName(rec.clientName);
    setSkinType(rec.skinType);
    setRoutineType(rec.routineType);
    setActives(rec.actives);
    toast.success(`Editing recommendation for ${rec.clientName}`);
  };

  const handleSend = (id) => {
    const updated = recommendations.map(rec => {
      if (rec.id === id) {
        return { ...rec, status: 'Sent' };
      }
      return rec;
    });
    setRecommendations(updated);
    toast.success('Recommendation sent to client portal! ✉️');
  };

  const handleDelete = (id) => {
    setRecommendations(recommendations.filter(r => r.id !== id));
    toast.error('Recommendation deleted.');
  };

  const crumbs = [
    { label: 'Dashboard', path: '/consultant' },
    { label: 'Recommendation Management', path: '/consultant/recommendations' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Recommendation Management
        </h1>
        <p className="text-sm text-brand-850">
          Create, edit, and send custom skincare override files directly to your clients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Modern Form */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
            <div className="p-2 bg-brand-100 rounded-xl text-brand-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                {editingId ? 'Edit Recommendation' : 'Create Recommendation'}
              </h3>
              <p className="text-[10px] text-brand-800">Draft routine updates for clients</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-800 mb-1">
                Client Name
              </label>
              <input 
                type="text"
                placeholder="Sarah Connor"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-800 mb-1">
                  Skin Type
                </label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="Combination">Combination</option>
                  <option value="Dry">Dry</option>
                  <option value="Sensitive">Sensitive</option>
                  <option value="Oily">Oily</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-800 mb-1">
                  Routine Phase
                </label>
                <select
                  value={routineType}
                  onChange={(e) => setRoutineType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="AM Routine">AM Routine</option>
                  <option value="PM Routine">PM Routine</option>
                  <option value="Weekly Treatment">Weekly</option>
                  <option value="Seasonal Shift">Seasonal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-brand-800 mb-1">
                Prescribed Actives & Guidelines
              </label>
              <textarea
                value={actives}
                onChange={(e) => setActives(e.target.value)}
                placeholder="e.g. Squalane cleanser, Vitamin C serum, and sunscreen shield daily."
                rows="4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              />
            </div>

            <div className="flex gap-2 font-display pt-2">
              {editingId && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setClientName('');
                    setActives('');
                  }}
                  className="w-1/2 py-2 border border-brand-250 hover:bg-brand-50 text-brand-850 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit"
                className={`btn-primary py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 ${editingId ? 'w-1/2' : 'w-full'}`}
              >
                <Plus className="w-4 h-4" />
                {editingId ? 'Save Changes' : 'Create Draft'}
              </button>
            </div>
          </form>
        </div>

        {/* Tables */}
        <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Skincare Recommendations Queue</h3>
            <p className="text-xs text-brand-800 font-sans">Active guidelines sent or drafted for assigned clients</p>
          </div>

          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                  <th className="py-2.5 px-2">Recommendation ID</th>
                  <th className="py-2.5 px-2">Client Profile</th>
                  <th className="py-2.5 px-2">Target Sequence</th>
                  <th className="py-2.5 px-2">Active Formulas</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/50">
                {recommendations.map(rec => (
                  <tr key={rec.id} className="hover:bg-brand-50/20 transition-colors">
                    <td className="py-3.5 px-2 font-semibold text-slate-900">{rec.id}</td>
                    <td className="py-3.5 px-2">
                      <div className="font-medium text-slate-900">{rec.clientName}</div>
                      <div className="text-[10px] text-brand-800">{rec.skinType} Skin</div>
                    </td>
                    <td className="py-3.5 px-2 text-brand-900">{rec.routineType}</td>
                    <td className="py-3.5 px-2 text-slate-900 max-w-[140px] truncate" title={rec.actives}>
                      {rec.actives}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold ${
                        rec.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleEdit(rec)}
                          className="p-1 border border-brand-200 hover:bg-brand-50 rounded-lg text-brand-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {rec.status === 'Draft' && (
                          <button 
                            onClick={() => handleSend(rec.id)}
                            className="p-1 bg-brand-100 text-brand-750 hover:bg-brand-250 rounded-lg transition-colors"
                            title="Send to client"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(rec.id)}
                          className="p-1 border border-red-200 hover:bg-red-50 text-red-650 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
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
