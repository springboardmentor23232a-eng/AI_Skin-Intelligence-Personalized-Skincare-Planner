import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, Clipboard, X, User, HeartPulse, ShieldCheck, Sun, Moon, Calendar, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import * as consultantService from '../services/consultantService';

export default function ClientProfiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [skinTypeFilter, setSkinTypeFilter] = useState('All');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected client detailed view
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const crumbs = [
    { label: 'Dashboard', path: '/consultant' },
    { label: 'Client Profiles', path: '/consultant/profiles' }
  ];

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await consultantService.getClients();
      setClients(data);
    } catch (err) {
      toast.error('Failed to load client roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    setLoadingDetails(true);
    try {
      const details = await consultantService.getClientDetails(client.id);
      setClientDetails(details);
    } catch (err) {
      toast.error('Failed to load client profile details.');
      setSelectedClient(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filtered = clients.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkin = skinTypeFilter === 'All' || c.skin_type === skinTypeFilter;
    return matchesSearch && matchesSkin;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Client Profiles
        </h1>
        <p className="text-sm text-brand-850">
          Search, filter, and audit detailed profiles of skincare clients assigned to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Client List & Controls */}
        <div className={`glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4 ${selectedClient ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-100">
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 text-brand-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Search client profile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-1.5 border border-brand-200 px-3 py-1.5 rounded-xl bg-brand-50/20 text-xs text-brand-900 font-display">
              <Filter className="w-3.5 h-3.5 text-brand-500" />
              <span className="font-semibold mr-1">Filter Skin Type:</span>
              <select 
                value={skinTypeFilter}
                onChange={(e) => setSkinTypeFilter(e.target.value)}
                className="bg-transparent focus:outline-none font-bold cursor-pointer"
              >
                <option value="All">All Skin Types</option>
                <option value="Combination">Combination</option>
                <option value="Dry">Dry</option>
                <option value="Sensitive">Sensitive</option>
                <option value="Oily">Oily</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-brand-850 font-semibold">Loading client profiles...</span>
            </div>
          ) : filtered.length > 0 ? (
            <div className={`grid gap-4 ${selectedClient ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {filtered.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => handleSelectClient(c)}
                  className={`border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-md ${
                    selectedClient?.id === c.id 
                      ? 'border-brand-600 bg-brand-50/20 shadow-sm' 
                      : 'border-brand-100 bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display text-base font-bold text-slate-900">{c.name}</h4>
                        <p className="text-[11px] text-brand-800">{c.email}</p>
                      </div>
                      {c.skin_type ? (
                        <span className="bg-brand-100 text-brand-850 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {c.skin_type} Skin
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          No Profile
                        </span>
                      )}
                    </div>

                    {c.concerns && c.concerns.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.concerns.slice(0, 3).map((con, idx) => (
                          <span key={idx} className="bg-slate-50 border border-slate-100 text-[9px] font-display text-slate-600 px-1.5 py-0.5 rounded-full">
                            {con}
                          </span>
                        ))}
                        {c.concerns.length > 3 && (
                          <span className="text-[8px] text-slate-400 font-bold mt-1">+{c.concerns.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-brand-100/60 pt-3 mt-4 text-xs font-display">
                    <span className="text-[10px] text-brand-600 font-bold">Click to view details &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Right Side: Detailed Client Profiles & Current Routines */}
        {selectedClient && (
          <div className="lg:col-span-7 space-y-6">
            {loadingDetails ? (
              <div className="glass-effect border border-brand-100 p-8 rounded-3xl bg-white shadow-sm flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-brand-850 font-semibold">Loading profile details...</span>
              </div>
            ) : clientDetails ? (
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-6 relative animate-fade-in">
                
                {/* Header title */}
                <div className="flex justify-between items-start pb-4 border-b border-brand-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-900 rounded-full flex items-center justify-center font-display font-black text-lg text-white">
                      {clientDetails.name ? clientDetails.name[0] : 'U'}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">{clientDetails.name}</h3>
                      <p className="text-xs text-slate-500">{clientDetails.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="p-1.5 hover:bg-brand-50 border border-brand-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section A-H Client Questionnaire Auditing */}
                {!clientDetails.routine_profile ? (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 font-semibold">
                    This client has not submitted their Skin Profile Questionnaire yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* A. Basic Info */}
                      <div className="border border-brand-50 p-4 rounded-2xl bg-brand-50/10 space-y-2 text-xs">
                        <h4 className="font-display font-bold text-xs text-brand-950 flex items-center gap-1.5 border-b border-brand-100/50 pb-1">
                          <User className="w-3.5 h-3.5 text-brand-600" />
                          A. Basic Information
                        </h4>
                        <div className="space-y-1 text-slate-700 leading-normal">
                          <div>• Provider Type: <strong className="capitalize">{clientDetails.provider}</strong></div>
                          <div>• Role Privilege: <strong>{clientDetails.role}</strong></div>
                          <div>• Created At: <strong>{new Date(clientDetails.created_at).toLocaleDateString()}</strong></div>
                        </div>
                      </div>

                      {/* B. Skin Profile */}
                      <div className="border border-brand-50 p-4 rounded-2xl bg-brand-50/10 space-y-2 text-xs">
                        <h4 className="font-display font-bold text-xs text-brand-950 flex items-center gap-1.5 border-b border-brand-100/50 pb-1">
                          <HeartPulse className="w-3.5 h-3.5 text-brand-600" />
                          B. Skin Profile
                        </h4>
                        <div className="space-y-1 text-slate-700 leading-normal">
                          <div>• Age bracket: <strong>{clientDetails.routine_profile.age_group}</strong></div>
                          <div>• Skin Class: <strong>{clientDetails.routine_profile.skin_type}</strong></div>
                          <div>• Sensitivity Level: <strong>{clientDetails.routine_profile.sensitivity}</strong></div>
                        </div>
                      </div>

                      {/* C. Skin Concerns */}
                      <div className="border border-brand-50 p-4 rounded-2xl bg-brand-50/10 space-y-2 text-xs">
                        <h4 className="font-display font-bold text-xs text-brand-950 flex items-center gap-1.5 border-b border-brand-100/50 pb-1">
                          <Clipboard className="w-3.5 h-3.5 text-brand-600" />
                          C. Skin Concerns & Severity
                        </h4>
                        <div className="space-y-1 text-slate-700 leading-normal">
                          <div>• Acne Severity: <strong>{clientDetails.routine_profile.acne_severity}</strong></div>
                          <div>• Oiliness status: <strong>{clientDetails.routine_profile.oiliness}</strong></div>
                          <div>• Dryness profile: <strong>{clientDetails.routine_profile.dryness}</strong></div>
                          <div>• Redness level: <strong>{clientDetails.routine_profile.redness_frequency}</strong></div>
                          <div className="pt-1">
                            <span className="block font-semibold mb-0.5">Concerns Checklist:</span>
                            <div className="flex flex-wrap gap-1">
                              {clientDetails.routine_profile.concerns.map((con, idx) => (
                                <span key={idx} className="bg-brand-100/50 text-[9px] px-2 py-0.5 rounded-full font-bold text-brand-900">
                                  {con}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* D. Current Skincare */}
                      <div className="border border-brand-50 p-4 rounded-2xl bg-brand-50/10 space-y-2 text-xs">
                        <h4 className="font-display font-bold text-xs text-brand-950 flex items-center gap-1.5 border-b border-brand-100/50 pb-1">
                          <Clipboard className="w-3.5 h-3.5 text-brand-600" />
                          D. Current Skincare Habits
                        </h4>
                        <div className="space-y-1 text-slate-700 leading-normal">
                          <div>• Uses current routine: <strong>{clientDetails.routine_profile.has_routine}</strong></div>
                          <div>• Skincare Frequency: <strong>{clientDetails.routine_profile.routine_frequency}</strong></div>
                          <div>• Encountered Irritation: <strong>{clientDetails.routine_profile.skincare_irritation}</strong></div>
                          <div className="pt-1">
                            <span className="block font-semibold">Current Products:</span>
                            <span className="text-slate-600 italic block truncate">
                              {clientDetails.routine_profile.current_products.join(', ')}
                            </span>
                          </div>
                          <div className="pt-0.5">
                            <span className="block font-semibold">Active Ingredients:</span>
                            <span className="text-slate-600 italic block truncate">
                              {clientDetails.routine_profile.active_ingredients.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* E. Lifestyle */}
                      <div className="border border-brand-50 p-4 rounded-2xl bg-brand-50/10 space-y-2 text-xs">
                        <h4 className="font-display font-bold text-xs text-brand-950 flex items-center gap-1.5 border-b border-brand-100/50 pb-1">
                          <User className="w-3.5 h-3.5 text-brand-600" />
                          E. Lifestyle Metrics
                        </h4>
                        <div className="space-y-1 text-slate-700 leading-normal">
                          <div>• Sleep hours: <strong>{clientDetails.routine_profile.sleep_hours}</strong></div>
                          <div>• Water intake: <strong>{clientDetails.routine_profile.water_intake}</strong></div>
                          <div>• Stress level: <strong>{clientDetails.routine_profile.stress_level}</strong></div>
                          <div>• Exercise frequency: <strong>{clientDetails.routine_profile.exercise_frequency}</strong></div>
                          <div>• Outdoor hours: <strong>{clientDetails.routine_profile.outdoor_hours}</strong></div>
                        </div>
                      </div>

                      {/* F. Environment */}
                      <div className="border border-brand-50 p-4 rounded-2xl bg-brand-50/10 space-y-2 text-xs">
                        <h4 className="font-display font-bold text-xs text-brand-950 flex items-center gap-1.5 border-b border-brand-100/50 pb-1">
                          <Sun className="w-3.5 h-3.5 text-brand-600" />
                          F. Climate & Environment
                        </h4>
                        <div className="space-y-1 text-slate-700 leading-normal">
                          <div>• Target Climate: <strong>{clientDetails.routine_profile.climate}</strong></div>
                          <div>• Air Pollution: <strong>{clientDetails.routine_profile.pollution_exposure}</strong></div>
                          <div>• UV Sunlight: <strong>{clientDetails.routine_profile.sunlight_exposure}</strong></div>
                        </div>
                      </div>

                      {/* G. Allergies & Safety */}
                      <div className="border border-red-50 p-4 rounded-2xl bg-red-50/5 space-y-2 text-xs">
                        <h4 className="font-display font-bold text-xs text-red-950 flex items-center gap-1.5 border-b border-red-100/50 pb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-red-650" />
                          G. Safety & Allergens Exclusions
                        </h4>
                        <div className="space-y-1 text-slate-700 leading-normal">
                          <div>• Reported Allergies: <strong className="text-red-900">{clientDetails.routine_profile.has_allergies}</strong></div>
                          <div>• Irritation/Reaction history: <strong>{clientDetails.routine_profile.has_allergic_reaction}</strong></div>
                          <div className="pt-1">
                            <span className="block font-semibold text-red-900">Ingredients to Avoid:</span>
                            <span className="bg-red-50 border border-red-100 text-red-900 px-2.5 py-1 rounded-xl block font-medium mt-0.5">
                              {clientDetails.routine_profile.avoid_ingredients || 'None'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* H. Routine Preferences */}
                      <div className="border border-brand-50 p-4 rounded-2xl bg-brand-50/10 space-y-2 text-xs">
                        <h4 className="font-display font-bold text-xs text-brand-950 flex items-center gap-1.5 border-b border-brand-100/50 pb-1">
                          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                          H. Skincare Preferences
                        </h4>
                        <div className="space-y-1 text-slate-700 leading-normal">
                          <div>• Routine Goal: <strong className="text-brand-900">{clientDetails.routine_profile.skincare_goal}</strong></div>
                          <div>• Time budget: <strong>{clientDetails.routine_profile.skincare_time}</strong></div>
                          <div>• Complexity pref: <strong>{clientDetails.routine_profile.routine_preference}</strong></div>
                          <div>• Budget tier: <strong>{clientDetails.routine_profile.budget}</strong></div>
                        </div>
                      </div>

                    </div>

                    {/* Section 3: CLIENTS ROUTINE DISPLAY */}
                    <div className="border-t border-brand-100 pt-6 space-y-4">
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-brand-600" />
                          Active Skincare Routine (Module 4)
                        </h4>
                        <p className="text-[10px] font-sans text-brand-800">Review generated active guidance items mapped for daily AM/PM check-ins</p>
                      </div>

                      {!clientDetails.current_routine ? (
                        <p className="text-xs text-slate-500 py-3 italic">No skincare routine generated for this client yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* AM Column */}
                          <div className="border border-brand-50 p-4 rounded-2xl bg-slate-50 space-y-3">
                            <h5 className="font-display font-bold text-xs text-brand-900 flex items-center gap-1 border-b border-slate-200 pb-1.5">
                              <Sun className="w-4 h-4 text-amber-500" />
                              Morning Steps (AM)
                            </h5>
                            <div className="space-y-2 text-xs">
                              {clientDetails.current_routine.items.filter(i => i.routine_type === 'MORNING' && i.is_enabled).map(item => (
                                <div key={item.id} className="p-2 border border-slate-100 bg-white rounded-xl">
                                  <div className="font-semibold text-slate-900">Step {item.step_order} • {item.name}</div>
                                  <p className="text-[10px] text-slate-650 mt-0.5 leading-relaxed">{item.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* PM Column */}
                          <div className="border border-brand-50 p-4 rounded-2xl bg-slate-50 space-y-3">
                            <h5 className="font-display font-bold text-xs text-brand-900 flex items-center gap-1 border-b border-slate-200 pb-1.5">
                              <Moon className="w-4 h-4 text-indigo-500" />
                              Evening Steps (PM)
                            </h5>
                            <div className="space-y-2 text-xs">
                              {clientDetails.current_routine.items.filter(i => i.routine_type === 'EVENING' && i.is_enabled).map(item => (
                                <div key={item.id} className="p-2 border border-slate-100 bg-white rounded-xl">
                                  <div className="font-semibold text-slate-900">Step {item.step_order} • {item.name}</div>
                                  <p className="text-[10px] text-slate-650 mt-0.5 leading-relaxed">{item.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Weekly Treatments & Seasonal advice */}
                          <div className="md:col-span-2 border border-brand-50 p-4 rounded-2xl bg-slate-50 space-y-3">
                            <h5 className="font-display font-bold text-xs text-brand-900 border-b border-slate-200 pb-1.5">
                              Weekly Treatment & Seasonal Guidance
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                              <div>
                                <span className="font-display font-semibold block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Weekly Plan:</span>
                                <div className="space-y-1.5">
                                  {clientDetails.current_routine.items.filter(i => i.routine_type === 'WEEKLY' && i.is_enabled).map(item => (
                                    <div key={item.id} className="p-2 border border-slate-100 bg-white rounded-xl">
                                      <div className="font-semibold text-slate-800">{item.name}</div>
                                      <div className="text-[10px] text-slate-600">{item.description}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span className="font-display font-semibold block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Seasonal:</span>
                                <div className="space-y-1.5">
                                  {clientDetails.current_routine.items.filter(i => i.routine_type === 'SEASONAL' && i.is_enabled).map(item => (
                                    <div key={item.id} className="p-2 border border-slate-100 bg-white rounded-xl">
                                      <div className="font-semibold text-slate-800">{item.name}</div>
                                      <div className="text-[10px] text-slate-600">{item.description}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Section 4: Module 3 Skin Assessment Scan History */}
                    <div className="border-t border-brand-100 pt-6 space-y-4">
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-brand-650" />
                          Module 3 Skin Assessment History Logs
                        </h4>
                        <p className="text-[10px] font-sans text-brand-800">Audit quantitative scoring history and identified risks from uploaded images</p>
                      </div>

                      {clientDetails.assessments && clientDetails.assessments.length > 0 ? (
                        <div className="space-y-3 font-sans text-xs">
                          {clientDetails.assessments.map(scan => (
                            <div key={scan.id} className="p-4 border border-brand-100 rounded-2xl bg-slate-50/50 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-display font-bold text-slate-900">
                                  Date: {new Date(scan.assessment_date).toLocaleDateString()}
                                </span>
                                <span className="bg-brand-600 text-white text-[10px] font-display font-black px-2 py-0.5 rounded-full">
                                  Score: {scan.skin_health_score}/100
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-slate-700 leading-normal text-[11px]">
                                <div>• Condition: <strong>{scan.overall_condition}</strong></div>
                                {scan.notes && <div>• Scan Notes: <strong>{scan.notes}</strong></div>}
                              </div>
                              {scan.concerns && scan.concerns.length > 0 && (
                                <div className="pt-1 flex flex-wrap gap-1">
                                  {scan.concerns.map((con, idx) => (
                                    <span key={idx} className="bg-slate-105 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                      {con.concern_name} ({con.priority} - {con.severity.toFixed(1)}/5)
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 py-3 italic">No diagnostic scans logged yet.</p>
                      )}
                    </div>

                  </div>
                )}

              </div>
            ) : null}
          </div>
        )}

      </div>

    </div>
  );
}
