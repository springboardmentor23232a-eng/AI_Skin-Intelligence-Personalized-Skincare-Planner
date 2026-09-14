import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  FileSpreadsheet, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ShoppingBag, 
  Clock, 
  ShieldCheck, 
  X,
  Loader2,
  User,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getReportPreview, exportReportPdf, exportReportExcel } from '../services/reportService';
import api from '../services/api';

export default function Reports() {
  const { user } = useAuth();
  const currentRole = user?.role || 'user';
  const isPractitioner = ['consultant', 'dermatologist', 'admin'].includes(currentRole);

  // Practitioners / Admins client selection
  const [clients, setClients] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);

  // Active Preview State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activeReportKey, setActiveReportKey] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Downloading indicators per button
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (isPractitioner) {
      fetchClients();
    }
  }, [currentRole]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      let endpoint = '/api/consultant/clients';
      if (currentRole === 'dermatologist') {
        endpoint = '/api/dermatologist/patients';
      } else if (currentRole === 'admin') {
        endpoint = '/api/admin/users';
      }
      const response = await api.get(endpoint);
      const data = response.data;
      if (Array.isArray(data)) {
        setClients(data);
      } else if (data && Array.isArray(data.items)) {
        setClients(data.items);
      }
    } catch (err) {
      console.warn('Could not load practitioner clients list:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const reportConfigs = [
    {
      key: 'skin-assessment',
      title: 'Skin Assessment Report',
      badge: 'Clinical Assessment',
      icon: Activity,
      color: 'indigo',
      description: 'Comprehensive diagnostic report covering detected skin concerns, clinical severity ratings, risk factors, and AI diagnostic metrics.',
      pdfSupported: true,
      excelSupported: false,
      disclaimer: 'Includes official AI-supported diagnostic skin analysis disclaimer.',
    },
    {
      key: 'routine',
      title: 'Personalized Routine Report',
      badge: 'Skincare Regimen',
      icon: Calendar,
      color: 'emerald',
      description: 'Detailed morning and evening skincare regimens, sequence order, active formulation guidelines, and 30-day adherence statistics.',
      pdfSupported: true,
      excelSupported: true,
      disclaimer: 'Structured export includes AM/PM step breakdowns and adherence logs.',
    },
    {
      key: 'products',
      title: 'Product Recommendations Report',
      badge: 'Formulations',
      icon: ShoppingBag,
      color: 'amber',
      description: 'Curated list of matched product formulations, suitability compatibility scores, key ingredients, and dermatological match reasons.',
      pdfSupported: true,
      excelSupported: true,
      disclaimer: 'Tabular analysis with ingredient safety and suitability breakdown.',
    },
    {
      key: 'progress',
      title: 'Progress & Trend Report',
      badge: 'Longitudinal Analytics',
      icon: Sparkles,
      color: 'blue',
      description: 'Longitudinal skin health tracking, score trajectories, concern severity progression, and checklist consistency milestones.',
      pdfSupported: true,
      excelSupported: true,
      disclaimer: 'Longitudinal trend indicators and multi-component progression curves.',
    },
    {
      key: 'skin-health',
      title: 'Skin Health Score Report',
      badge: 'Diagnostic Score',
      icon: ShieldCheck,
      color: 'purple',
      description: 'In-depth breakdown of the 5-factor Skin Health Score formula (Condition, Routine, Lifestyle, Sleep, Hydration) and history.',
      pdfSupported: true,
      excelSupported: true,
      disclaimer: 'Mathematical factor weightings and component logs.',
    }
  ];

  const handleOpenPreview = async (reportKey) => {
    setActiveReportKey(reportKey);
    setPreviewModalOpen(true);
    setLoadingPreview(true);
    setPreviewData(null);

    const targetId = isPractitioner && selectedUserId ? selectedUserId : null;
    try {
      const data = await getReportPreview(reportKey, targetId);
      setPreviewData(data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load report preview data.');
      setPreviewModalOpen(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExportPdf = async (reportKey) => {
    const btnKey = `${reportKey}_pdf`;
    setDownloading(prev => ({ ...prev, [btnKey]: true }));
    const targetId = isPractitioner && selectedUserId ? selectedUserId : null;

    try {
      await exportReportPdf(reportKey, targetId);
      toast.success('PDF report downloaded successfully.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate PDF report.');
    } finally {
      setDownloading(prev => ({ ...prev, [btnKey]: false }));
    }
  };

  const handleExportExcel = async (reportKey) => {
    const btnKey = `${reportKey}_excel`;
    setDownloading(prev => ({ ...prev, [btnKey]: true }));
    const targetId = isPractitioner && selectedUserId ? selectedUserId : null;

    try {
      await exportReportExcel(reportKey, targetId);
      toast.success('Excel workbook exported successfully.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate Excel export.');
    } finally {
      setDownloading(prev => ({ ...prev, [btnKey]: false }));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wide text-brand-200 border border-white/10 backdrop-blur-md">
              <FileText className="w-3.5 h-3.5 text-brand-300" />
              <span>Diagnostic & Analytics Reporting Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              Reports & Export Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Generate real-time, clinical-grade PDF reports and structured Excel datasets directly from persistent assessment, routine, and analytics records.
            </p>
          </div>

          {/* Role Client/Patient Selector for Practitioners */}
          {isPractitioner && (
            <div className="bg-white/10 p-4 rounded-xl border border-white/15 backdrop-blur-md min-w-[280px]">
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-300" />
                <span>Select Target Client / Patient</span>
              </label>
              <select
                className="w-full bg-slate-900/90 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Generate for My Account --</option>
                {clients.map((c) => (
                  <option key={c.id || c.user_id} value={c.id || c.user_id}>
                    {c.name || c.full_name || c.email} (ID: {c.id || c.user_id})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Authorized role: <span className="uppercase text-brand-300 font-bold">{currentRole}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportConfigs.map((cfg) => {
          const Icon = cfg.icon;
          const isPdfBusy = downloading[`${cfg.key}_pdf`];
          const isExcelBusy = downloading[`${cfg.key}_excel`];

          return (
            <div 
              key={cfg.key} 
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-100 group-hover:bg-slate-900 group-hover:text-white rounded-xl text-slate-700 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                    {cfg.badge}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  {cfg.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {cfg.description}
                </p>

                <p className="text-xs text-slate-400 italic mb-6">
                  {cfg.disclaimer}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenPreview(cfg.key)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Real Data</span>
                </button>

                <div className="flex gap-2">
                  {cfg.pdfSupported && (
                    <button
                      onClick={() => handleExportPdf(cfg.key)}
                      disabled={isPdfBusy}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50"
                    >
                      {isPdfBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-brand-400" />
                      )}
                      <span>Export PDF</span>
                    </button>
                  )}

                  {cfg.excelSupported && (
                    <button
                      onClick={() => handleExportExcel(cfg.key)}
                      disabled={isExcelBusy}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors disabled:opacity-50"
                    >
                      {isExcelBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                      )}
                      <span>Export Excel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 text-brand-800 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {reportConfigs.find(c => c.key === activeReportKey)?.title || 'Report Preview'}
                  </h3>
                  <p className="text-xs text-slate-500">Live data verification preview before export</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {loadingPreview ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                  <p className="text-sm font-medium">Aggregating real database records...</p>
                </div>
              ) : !previewData || previewData.has_data === false ? (
                <div className="py-12 px-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No Persisted Data Available</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {previewData?.message || 'No records have been logged in the system for this module yet. Perform a scan or setup routines to generate real reports.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Account Metadata Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Recipient Account</span>
                      <span className="font-semibold text-slate-800">{previewData.user_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Registered Email</span>
                      <span className="font-semibold text-slate-800">{previewData.user_email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Report Generated</span>
                      <span className="font-semibold text-slate-800">{previewData.generated_at || 'Just now'}</span>
                    </div>
                  </div>

                  {/* Render Specific Dynamic Report Sections */}
                  {activeReportKey === 'skin-assessment' && (
                    <div className="space-y-4 text-sm">
                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-indigo-700 font-semibold block">Overall Skin Condition</span>
                          <span className="text-lg font-bold text-indigo-950">{previewData.overall_condition}</span>
                        </div>
                        {previewData.skin_health_score && (
                          <div className="text-right">
                            <span className="text-xs text-indigo-700 font-semibold block">Assessment Score</span>
                            <span className="text-2xl font-bold text-indigo-950">{previewData.skin_health_score}/100</span>
                          </div>
                        )}
                      </div>

                      {/* Concerns */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Detected Concerns</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {previewData.concerns?.map((c, idx) => (
                            <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                              <span className="font-medium text-slate-800 text-xs">{c.name}</span>
                              <span className="text-[11px] px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded">
                                Severity: {c.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risks */}
                      {previewData.risks?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Identified Risk Factors</h4>
                          <div className="space-y-2">
                            {previewData.risks.map((r, idx) => (
                              <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-slate-800 text-xs">{r.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded uppercase">
                                    {r.level} Risk
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">{r.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeReportKey === 'routine' && (
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs">
                        <div>
                          <span className="text-emerald-700 font-medium block">Skin Type / Goal</span>
                          <span className="font-bold text-emerald-950">
                            {previewData.profile_summary?.skin_type || 'N/A'} • {previewData.profile_summary?.skincare_goal || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-emerald-700 font-medium block">30-Day Adherence</span>
                          <span className="font-bold text-emerald-950">
                            {previewData.adherence_summary?.rate_30d || 0}% ({previewData.adherence_summary?.completed_steps || 0} steps completed)
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Morning Routine (AM)</h4>
                        <div className="space-y-1.5">
                          {previewData.morning_routine?.map((s, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900 mr-2">Step {s.step_order}: {s.category}</span>
                                <span className="text-slate-600">— {s.name}</span>
                              </div>
                              <span className="text-slate-400">{s.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Evening Routine (PM)</h4>
                        <div className="space-y-1.5">
                          {previewData.evening_routine?.map((s, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900 mr-2">Step {s.step_order}: {s.category}</span>
                                <span className="text-slate-600">— {s.name}</span>
                              </div>
                              <span className="text-slate-400">{s.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeReportKey === 'products' && (
                    <div className="space-y-4 text-sm">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Matched Product Formulations</h4>
                      <div className="space-y-2">
                        {previewData.products?.map((p, idx) => (
                          <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900">{p.name}</span>
                              <span className="text-[11px] text-slate-500 block">{p.brand} • {p.category} • ₹{p.price}</span>
                              <span className="text-[11px] text-indigo-600 font-medium">Ingredients: {p.ingredients?.join(', ')}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                                {p.suitability_score}% Match
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeReportKey === 'progress' && (
                    <div className="space-y-4 text-sm">
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-blue-700 font-medium block">Current Overall Score</span>
                          <span className="text-2xl font-bold text-blue-950">{previewData.current_score || '--'} / 100</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-blue-700 font-medium block">Overall Delta</span>
                          <span className={`text-sm font-bold ${previewData.total_score_delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {previewData.total_score_delta > 0 ? `+${previewData.total_score_delta}` : previewData.total_score_delta} pts
                          </span>
                        </div>
                      </div>

                      {previewData.concern_trends?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Concern Trajectory</h4>
                          <div className="space-y-1.5">
                            {previewData.concern_trends.map((c, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800">{c.concern_name}</span>
                                <span className="font-bold text-slate-600">{c.first_severity} → {c.latest_severity} ({c.status})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeReportKey === 'skin-health' && (
                    <div className="space-y-4 text-sm">
                      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-purple-700 font-medium block">Overall Skin Health Score</span>
                          <span className="text-2xl font-bold text-purple-950">{previewData.overall_score || '--'} / 100</span>
                        </div>
                        <span className="text-xs text-purple-700 bg-purple-100 px-3 py-1 rounded-full font-semibold">
                          Mathematical 5-Factor Index
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Component Breakdown</h4>
                        <div className="space-y-2">
                          {previewData.components?.map((c, idx) => (
                            <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900 block">{c.name} (Weight: {c.weight})</span>
                                <span className="text-slate-500 text-[11px]">{c.description}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-800 block">{c.score} / 100</span>
                                <span className="text-indigo-600 font-semibold">{c.weighted_score} pts</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clinical Disclaimer */}
                  <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 italic border border-slate-200">
                    {previewData.disclaimer || 'This report is generated dynamically from persistent patient records for diagnostic and progress monitoring purposes.'}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close Preview
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportPdf(activeReportKey)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-brand-400" />
                  <span>Download PDF</span>
                </button>
                {reportConfigs.find(c => c.key === activeReportKey)?.excelSupported && (
                  <button
                    onClick={() => handleExportExcel(activeReportKey)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Download Excel</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
