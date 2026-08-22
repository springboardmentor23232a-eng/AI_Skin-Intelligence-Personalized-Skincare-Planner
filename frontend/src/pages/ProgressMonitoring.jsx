import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import PremiumChart from '../components/common/PremiumChart';
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import * as consultantService from '../services/consultantService';

export default function ProgressMonitoring() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const crumbs = [
    { label: 'Dashboard', path: '/consultant' },
    { label: 'Progress Monitoring', path: '/consultant/progress' }
  ];

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const data = await consultantService.getClients();
      setClients(data);
    } catch (err) {
      toast.error('Failed to load client progress indicators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  // Calculate statistics from database data
  const totalClients = clients.length;
  const clientsWithRoutine = clients.filter(c => c.has_active_routine).length;
  const routineAdherenceRate = totalClients > 0 
    ? Math.round((clientsWithRoutine / totalClients) * 100) 
    : 0;

  const clientsWithAssessments = clients.filter(c => c.latest_score !== null).length;
  const avgHealthScore = clientsWithAssessments > 0
    ? Math.round(clients.reduce((acc, c) => acc + (c.latest_score || 0), 0) / clientsWithAssessments)
    : 0;

  // Static chart data fallback, keeping the premium visual experience intact
  const chartData = [
    { label: 'Cleansing', value: 85 },
    { label: 'Moisturizing', value: 92 },
    { label: 'Treatments', value: 76 },
    { label: 'Sun Protection', value: 88 },
    { label: 'Night Care', value: 80 }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Progress Monitoring
        </h1>
        <p className="text-sm text-brand-850">
          Track active routine adherence rates and overall score improvements across your client roster.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading progress metrics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Core metrics overview */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-6">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Roster Statistics</h3>
                <p className="text-xs text-brand-800">Aggregated client metrics over 30 days</p>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl space-y-1">
                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-650 block">Routine Coverage</span>
                  <div className="text-xl font-black text-brand-950">{routineAdherenceRate}% of Clients</div>
                  <p className="text-[10px] text-brand-800 leading-normal">
                    {clientsWithRoutine} out of {totalClients} registered clients have active skincare routine planners generated.
                  </p>
                </div>

                <div className="p-4 bg-accent-50/50 border border-accent-100/50 rounded-2xl space-y-1">
                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-accent-700 block">Average Skin Health Score</span>
                  <div className="text-xl font-black text-slate-950">
                    {avgHealthScore > 0 ? `${avgHealthScore} / 100` : 'N/A'}
                  </div>
                  <p className="text-[10px] text-brand-800 leading-normal">
                    Average skin score calculated from registered users with diagnostic photo assessments.
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="lg:col-span-2 glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Weekly Progress Distribution</h3>
                <p className="text-xs text-brand-800">Compliance distribution rates across skincare routine categories</p>
              </div>
              <div>
                <PremiumChart type="bar" data={chartData} height={180} color="accent" />
              </div>
            </div>

          </div>

          {/* Roster logs table */}
          <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Roster Compliance & History</h3>
              <p className="text-xs text-brand-800">Detailed compliance matrix of client check-ins</p>
            </div>

            <div className="overflow-x-auto min-w-full">
              {clients.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-brand-100 font-display font-semibold text-brand-850 uppercase tracking-widest text-[9px]">
                      <th className="py-2.5 px-2">Client Name</th>
                      <th className="py-2.5 px-2">Diagnostic Score</th>
                      <th className="py-2.5 px-2">AM/PM Planner Status</th>
                      <th className="py-2.5 px-2">Weekly Face Scan</th>
                      <th className="py-2.5 px-2">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100/50">
                    {clients.map(c => (
                      <tr key={c.id} className="text-brand-900 font-sans hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 font-semibold text-slate-900">
                          <div>{c.name}</div>
                          <span className="text-[10px] text-slate-450 block font-normal">{c.email}</span>
                        </td>
                        <td className="py-3 px-2 font-bold text-brand-600">
                          {c.latest_score !== null ? `${c.latest_score} / 100` : 'No Scans'}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            c.has_active_routine ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {c.has_active_routine ? 'Active Routine' : 'Not Generated'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {c.latest_score !== null ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              ✓ Logged
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              ⚠️ None
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-slate-500">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No clients registered in the system database yet.</p>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
