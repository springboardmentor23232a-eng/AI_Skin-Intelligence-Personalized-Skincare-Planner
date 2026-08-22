import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Sparkles, Calendar, Sun, Moon, Info, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import * as consultantService from '../services/consultantService';

export default function RecommendationManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected client for detailed routine audit
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const crumbs = [
    { label: 'Dashboard', path: '/consultant' },
    { label: 'Recommendation Management', path: '/consultant/recommendations' }
  ];

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const data = await consultantService.getClients();
      setClients(data);
    } catch (err) {
      toast.error('Failed to load active recommendations queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleAuditRoutine = async (clientId) => {
    setLoadingDetails(true);
    try {
      const details = await consultantService.getClientDetails(clientId);
      if (details.current_routine) {
        setSelectedClientDetails(details);
        toast.success(`Loaded active routine audit details for ${details.name || details.email}`);
      } else {
        toast.error('This client does not have a generated skincare routine yet.');
      }
    } catch (err) {
      toast.error('Failed to fetch routine details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Recommendation Management
        </h1>
        <p className="text-sm text-brand-850">
          Audit, inspect, and verify the active skincare routines generated for your database clients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Recommendations Queue */}
        <div className={`glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 ${selectedClientDetails ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Skincare Recommendations Queue</h3>
            <p className="text-xs text-brand-800 font-sans">Active rule-based routine status for all registered users</p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-brand-850 font-semibold">Loading recommendations queue...</span>
            </div>
          ) : clients.length > 0 ? (
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                    <th className="py-2.5 px-2">Client Profile</th>
                    <th className="py-2.5 px-2">Skin Type</th>
                    <th className="py-2.5 px-2">Concerns</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/50">
                  {clients.map(c => (
                    <tr key={c.id} className="hover:bg-brand-50/20 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-450">{c.email}</div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="bg-brand-100 text-brand-850 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {c.skin_type || 'Unspecified'} Skin
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-900 max-w-[180px] truncate" title={c.concerns.join(', ')}>
                        {c.concerns && c.concerns.length > 0 ? c.concerns.join(', ') : 'None'}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => handleAuditRoutine(c.id)}
                          className="px-3 py-1.5 bg-brand-900 text-white text-xs font-display font-semibold rounded-xl hover:bg-brand-850 transition-colors"
                        >
                          Audit Routine
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed border-brand-200 rounded-2xl p-6">
              <ClipboardList className="w-10 h-10 text-brand-350 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No clients registered in the system database yet.</p>
            </div>
          )}
        </div>

        {/* Right column: Selected Client Routine Detailed View */}
        {selectedClientDetails && (
          <div className="lg:col-span-6 space-y-6 animate-fade-in">
            {loadingDetails ? (
              <div className="glass-effect border border-brand-100 p-8 rounded-3xl bg-white shadow-sm flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-brand-850 font-semibold">Loading routine audit...</span>
              </div>
            ) : (
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-brand-100">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Audit: {selectedClientDetails.name}'s Routine
                    </h3>
                    <p className="text-[10.5px] text-brand-800">
                      Last Updated: {new Date(selectedClientDetails.current_routine.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedClientDetails(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold border border-slate-200 rounded-lg px-2.5 py-1"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  
                  {/* AM steps */}
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
                    <h4 className="font-display font-bold text-xs text-brand-900 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      Morning Steps (AM)
                    </h4>
                    <div className="space-y-2">
                      {selectedClientDetails.current_routine.items.filter(i => i.routine_type === 'MORNING' && i.is_enabled).map(item => (
                        <div key={item.id} className="p-2.5 border border-slate-200 bg-white rounded-xl">
                          <div className="font-semibold text-slate-950">Step {item.step_order} • {item.name}</div>
                          <p className="text-[10px] text-slate-600 mt-0.5 leading-normal">{item.description}</p>
                          <div className="text-[9.5px] text-slate-450 italic mt-1 font-sans">Frequency: {item.frequency}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PM steps */}
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
                    <h4 className="font-display font-bold text-xs text-brand-900 flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      Evening Steps (PM)
                    </h4>
                    <div className="space-y-2">
                      {selectedClientDetails.current_routine.items.filter(i => i.routine_type === 'EVENING' && i.is_enabled).map(item => (
                        <div key={item.id} className="p-2.5 border border-slate-200 bg-white rounded-xl">
                          <div className="font-semibold text-slate-950">Step {item.step_order} • {item.name}</div>
                          <p className="text-[10px] text-slate-600 mt-0.5 leading-normal">{item.description}</p>
                          <div className="text-[9.5px] text-slate-450 italic mt-1 font-sans">Frequency: {item.frequency}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly & Seasonal */}
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3">
                    <h4 className="font-display font-bold text-xs text-brand-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-500" />
                      Weekly & Seasonal Adjustments
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-display font-semibold block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Weekly Plan:</span>
                        <div className="space-y-2">
                          {selectedClientDetails.current_routine.items.filter(i => i.routine_type === 'WEEKLY' && i.is_enabled).map(item => (
                            <div key={item.id} className="p-2 border border-slate-200 bg-white rounded-xl">
                              <div className="font-semibold text-slate-800">{item.name}</div>
                              <div className="text-[9.5px] text-slate-600 mt-0.5">{item.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-display font-semibold block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Seasonal:</span>
                        <div className="space-y-2">
                          {selectedClientDetails.current_routine.items.filter(i => i.routine_type === 'SEASONAL' && i.is_enabled).map(item => (
                            <div key={item.id} className="p-2 border border-slate-200 bg-white rounded-xl">
                              <div className="font-semibold text-slate-800">{item.name}</div>
                              <div className="text-[9.5px] text-slate-600 mt-0.5">{item.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
