import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { StatCard } from '@/components/dashboard/StatCard';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { TrendBarChart } from '@/components/dashboard/TrendBarChart';
import { API_BASE_URL } from '@/lib/constants';
import {
  UserCheck,
  FileText,
  Activity,
  Search,
  ChevronLeft,
  AlertCircle,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Image as ImageIcon,
  Sun,
  Moon,
  Save,
  RefreshCw,
  ClipboardList,
  User,
  Sparkles,
} from 'lucide-react';

const SKIN_TYPE_COLOURS = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b',
  '#f43f5e', '#14b8a6', '#a78bfa', '#34d399',
];

function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
      <span>{message}</span>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ icon: Icon = ImageIcon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
        <Icon className="w-6 h-6" />
      </div>
      <p className="font-bold text-white text-sm">{title}</p>
      {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
    </div>
  );
}

function getFullImageUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  return `${API_BASE_URL}${clean.startsWith('/') ? '' : '/'}${clean}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return iso; }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

// Sub-panel: Assessment Reports
function AssessmentReportsPanel({ clientId, fetchWithAuth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchWithAuth(`${API_BASE_URL}/consultant/clients/${clientId}/assessments`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.status === 'success') setData(d);
        else setError(d.detail || 'Failed to load assessments.');
      })
      .catch(e => { if (!cancelled) setError(e.message || 'Network error.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clientId, fetchWithAuth]);

  if (loading) return <LoadingSpinner message="Loading assessment history…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!data || data.total === 0) {
    return <EmptyState icon={FileText} title="No Assessments Yet" description="This client has not completed a skin assessment." />;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">{data.total} assessment{data.total !== 1 ? 's' : ''} on record</p>
      {data.assessments.map((a) => {
        const isOpen = expanded === a.id;
        const imgUrl = getFullImageUrl(a.image_url);
        return (
          <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : a.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Badge variant="emerald">Score: {a.health_score}</Badge>
                <span className="text-sm font-semibold text-white">
                  {a.predicted_skin_type} — {a.overall_condition}
                </span>
              </div>
              <span className="text-xs text-slate-400">{formatDateTime(a.assessment_time)}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                  {imgUrl && (
                    <div className="sm:col-span-2 lg:col-span-1 rounded-xl overflow-hidden border border-slate-700 h-40">
                      <img src={imgUrl} alt="Assessment scan" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-400">Vision Concern</p>
                    <p className="font-bold text-amber-400">{a.vision_predicted_concern || '—'}</p>
                    <p className="text-slate-400 mt-2">Confidence</p>
                    <p className="font-medium text-slate-200">{a.vision_confidence || '—'}</p>
                    <p className="text-slate-400 mt-2">Gender / Age</p>
                    <p className="font-medium text-slate-200">{a.gender || '—'} / {a.age || '—'}</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-400">Hydration / Oil Level</p>
                    <p className="font-medium text-slate-200">{a.hydration_level || '—'} / {a.oil_level || '—'}</p>
                    <p className="text-slate-400 mt-2">Sensitivity</p>
                    <p className="font-medium text-slate-200">{a.sensitivity || '—'}</p>
                    <p className="text-slate-400 mt-2">Sleep / Water</p>
                    <p className="font-medium text-slate-200">
                      {a.sleep_hours != null ? `${a.sleep_hours}h` : '—'} · {a.water_glasses != null ? `${a.water_glasses} glasses` : '—'}
                    </p>
                  </div>
                </div>
                {Array.isArray(a.concerns) && a.concerns.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5">Identified Concerns</p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.concerns.map((c, i) => <Badge key={i} variant="amber">{c}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Sub-panel: Progress Monitoring
function ProgressPanel({ clientId, fetchWithAuth }) {
  const [scoring, setScoring] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(true);
  const [adherenceLoading, setAdherenceLoading] = useState(true);
  const [scoringError, setScoringError] = useState('');
  const [adherenceError, setAdherenceError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setScoringLoading(true);
    setScoringError('');
    fetchWithAuth(`${API_BASE_URL}/consultant/clients/${clientId}/scoring`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.status === 'success') setScoring(d);
        else setScoringError(d.detail || 'Failed to load scoring data.');
      })
      .catch(e => { if (!cancelled) setScoringError(e.message || 'Network error.'); })
      .finally(() => { if (!cancelled) setScoringLoading(false); });
    return () => { cancelled = true; };
  }, [clientId, fetchWithAuth]);

  useEffect(() => {
    let cancelled = false;
    setAdherenceLoading(true);
    setAdherenceError('');
    fetchWithAuth(`${API_BASE_URL}/consultant/clients/${clientId}/adherence`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.status === 'success') setAdherence(d);
        else setAdherenceError(d.detail || 'Failed to load adherence data.');
      })
      .catch(e => { if (!cancelled) setAdherenceError(e.message || 'Network error.'); })
      .finally(() => { if (!cancelled) setAdherenceLoading(false); });
    return () => { cancelled = true; };
  }, [clientId, fetchWithAuth]);

  const trendData = scoring?.assessment_trend?.length > 0
    ? scoring.assessment_trend.map((item, idx) => ({
        label: item.assessment_time
          ? new Date(item.assessment_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `#${idx + 1}`,
        value: item.health_score,
      }))
    : [];

  const recentAdherence = adherence?.history ? [...adherence.history].slice(-7) : [];
  const adherenceChartData = recentAdherence.map(l => ({
    label: new Date(l.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: l.adherence_percentage,
  }));

  const avgAdherence = adherence?.history?.length > 0
    ? Math.round(adherence.history.reduce((sum, l) => sum + l.adherence_percentage, 0) / adherence.history.length)
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          {scoringLoading ? (
            <LoadingSpinner message="Loading score…" />
          ) : scoringError ? (
            <ErrorBanner message={scoringError} />
          ) : scoring ? (
            <>
              <ScoreGauge score={scoring.overall_score} size={160} strokeWidth={13} />
              <div>
                <p className="text-sm font-bold text-white">Health Score</p>
                <p className="text-xs text-slate-400 mt-1">{scoring.category?.label}</p>
              </div>
            </>
          ) : null}
        </GlassCard>

        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Health Metrics
            </h4>
            <span className="text-xs font-semibold text-emerald-400">5-Factor</span>
          </div>
          {scoringLoading ? (
            <LoadingSpinner message="Loading…" />
          ) : scoringError ? null : scoring ? (
            <div className="space-y-3">
              {[
                { label: 'Skin Condition (35%)', key: 'skin_condition', color: 'from-emerald-500 to-teal-400', textColor: 'text-emerald-400' },
                { label: 'Lifestyle (20%)', key: 'lifestyle_habits', color: 'from-cyan-500 to-blue-400', textColor: 'text-cyan-400' },
                { label: 'Routine (20%)', key: 'routine_consistency', color: 'from-teal-500 to-emerald-400', textColor: 'text-teal-400' },
                { label: 'Sleep (15%)', key: 'sleep_quality', color: 'from-violet-500 to-purple-400', textColor: 'text-violet-400' },
                { label: 'Hydration (10%)', key: 'hydration_level', color: 'from-sky-500 to-cyan-400', textColor: 'text-sky-400' },
              ].map(({ label, key, color, textColor }) => {
                const val = scoring.breakdown?.[key] ?? 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{label}</span>
                      <span className={`font-bold ${textColor}`}>{val} / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </GlassCard>
      </div>

      {!scoringLoading && !scoringError && (
        trendData.length > 0 ? (
          <TrendBarChart
            title="Assessment Health Score Trend"
            badge={`${trendData.length} Assessment${trendData.length !== 1 ? 's' : ''}`}
            data={trendData}
            height={180}
          />
        ) : (
          <GlassCard>
            <EmptyState icon={TrendingUp} title="No Trend Data" />
          </GlassCard>
        )
      )}

      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" /> Routine Adherence
          </h4>
          {avgAdherence !== null && <Badge variant="emerald">{avgAdherence}% Avg</Badge>}
        </div>
        {adherenceLoading ? (
          <LoadingSpinner message="Loading…" />
        ) : adherenceError ? (
          <ErrorBanner message={adherenceError} />
        ) : recentAdherence.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No Routine Logs" />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Latest</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {recentAdherence[recentAdherence.length - 1]?.adherence_percentage}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Average</p>
                <p className="text-xl font-bold text-cyan-400 mt-1">{avgAdherence}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Best</p>
                <p className="text-xl font-bold text-amber-400 mt-1">
                  {Math.max(...adherence.history.map(l => l.adherence_percentage))}%
                </p>
              </div>
            </div>
            <div className="h-36 flex items-end gap-2 pt-4 pb-2 px-1 border-b border-slate-800">
              {adherenceChartData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-cyan-400">{item.value}%</span>
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t-xl"
                    style={{ height: `${Math.max(5, item.value)}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// Sub-panel: Recommendations
function RecommendationsPanel({ clientId, fetchWithAuth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadRecs = useCallback(() => {
    setLoading(true);
    setError('');
    fetchWithAuth(`${API_BASE_URL}/consultant/clients/${clientId}/recommendations`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setNotes(d.consultant_notes || '');
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [clientId, fetchWithAuth]);

  useEffect(() => { loadRecs(); }, [loadRecs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetchWithAuth(
        `${API_BASE_URL}/consultant/clients/${clientId}/recommendations`,
        {
          method: 'PATCH',
          body: JSON.stringify({ consultant_notes: notes }),
        }
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || 'Failed to save notes.');
      setSaveSuccess(true);
      setData(prev => ({
        ...prev,
        consultant_notes: d.consultant_notes,
      }));
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setError(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading…" />;
  if (error) return <ErrorBanner message={error} />;
  if (data?.status === 'no_assessment') {
    return <EmptyState icon={ClipboardList} title="No Recommendations" />;
  }

  const recs = data?.recommendations;

  return (
    <div className="space-y-5">
      {recs && typeof recs === 'object' && Object.keys(recs).length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase">AI-Generated</p>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 space-y-2">
            {Object.entries(recs)
              .filter(([key]) => key !== 'consultant_notes')
              .map(([key, value]) => (
                <div key={key}>
                  <span className="font-semibold text-teal-400 capitalize">
                    {key.replace(/_/g, ' ')}:{' '}
                  </span>
                  <span className="text-slate-300">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase">Consultant Notes</p>
        {data?.consultant_notes && (
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200">
            <span className="font-bold text-teal-400">Current: </span>
            {data.consultant_notes}
          </div>
        )}
        <textarea
          value={notes}
          onChange={e => { setNotes(e.target.value); setSaveSuccess(false); }}
          placeholder="Enter consultant notes…"
          rows={5}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-teal-500/20 border border-teal-500/40 text-teal-300"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sub-panel: Routine
function RoutinePanel({ clientId, fetchWithAuth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchWithAuth(`${API_BASE_URL}/consultant/clients/${clientId}/routine`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message || 'Network error.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [clientId, fetchWithAuth]);

  if (loading) return <LoadingSpinner message="Loading…" />;
  if (error) return <ErrorBanner message={error} />;
  if (!data || data.status !== 'success') {
    return <EmptyState icon={Sun} title="No Routine Available" />;
  }

  const routine = data.routine || {};
  const sections = Object.entries(routine).filter(([, v]) => v && typeof v === 'object');

  if (sections.length === 0) return <div className="p-4 text-xs text-slate-400">No structured steps.</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(([sectionKey, sectionValue]) => {
          const steps = Array.isArray(sectionValue) ? sectionValue : Object.values(sectionValue);
          return (
            <div key={sectionKey} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <p className="text-xs font-bold text-teal-400 uppercase flex items-center gap-1.5">
                {sectionKey.toLowerCase().includes('morning') ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-violet-400" />
                )}
                {sectionKey.replace(/_/g, ' ')}
              </p>
              {steps.length === 0 ? (
                <p className="text-xs text-slate-500">No steps listed.</p>
              ) : (
                <ul className="space-y-1">
                  {steps.map((step, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-teal-500 mt-0.5">•</span>
                      {typeof step === 'string' ? step : step?.name || JSON.stringify(step)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Client Detail View
const TABS = [
  { id: 'assessments', label: 'Assessment Reports', icon: FileText },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'routine', label: 'Routine', icon: Sun },
  { id: 'recommendations', label: 'Recommendations', icon: ClipboardList },
];

function ClientDetailView({ client, onBack, fetchWithAuth }) {
  const [activeTab, setActiveTab] = useState('assessments');
  const latest = client.latest_assessment;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-300"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">{client.full_name}</h2>
              {latest && <Badge variant="emerald">Score: {latest.health_score}</Badge>}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{client.email}</p>
          </div>
        </div>
        {latest && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="teal">{latest.predicted_skin_type}</Badge>
            {latest.overall_condition && <Badge>{latest.overall_condition}</Badge>}
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-1.5 w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === id
                ? 'bg-teal-500/20 border border-teal-500/30 text-teal-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <GlassCard className="space-y-4">
        {activeTab === 'assessments' && (
          <AssessmentReportsPanel clientId={client.id} fetchWithAuth={fetchWithAuth} />
        )}
        {activeTab === 'progress' && (
          <ProgressPanel clientId={client.id} fetchWithAuth={fetchWithAuth} />
        )}
        {activeTab === 'routine' && (
          <RoutinePanel clientId={client.id} fetchWithAuth={fetchWithAuth} />
        )}
        {activeTab === 'recommendations' && (
          <RecommendationsPanel clientId={client.id} fetchWithAuth={fetchWithAuth} />
        )}
      </GlassCard>
    </div>
  );
}

// Main Page
export default function ConsultantDashboardPage() {
  const { fetchWithAuth } = useAuth();

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedClient, setSelectedClient] = useState(null);

  const loadClients = useCallback(() => {
    setClientsLoading(true);
    setClientsError('');
    fetchWithAuth(`${API_BASE_URL}/consultant/clients`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setClients(d.clients || []);
        else setClientsError(d.detail || 'Failed to load clients.');
      })
      .catch(e => setClientsError(e.message || 'Network error.'))
      .finally(() => setClientsLoading(false));
  }, [fetchWithAuth]);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    fetchWithAuth(`${API_BASE_URL}/consultant/stats`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setStats(d); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [fetchWithAuth]);

  useEffect(() => {
    loadClients();
    loadStats();
  }, [loadClients, loadStats]);

  const filteredClients = clients.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.latest_assessment?.predicted_skin_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const donutData = stats?.skin_type_distribution?.length > 0
    ? stats.skin_type_distribution.map((item, i) => ({
        label: item.label,
        value: item.value,
        color: SKIN_TYPE_COLOURS[i % SKIN_TYPE_COLOURS.length],
      }))
    : [];

  const getRiskVariant = (score) => {
    if (score == null) return 'default';
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'amber';
    return 'rose';
  };
  const getRiskLabel = (score) => {
    if (score == null) return 'No Data';
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Moderate';
    return 'High Risk';
  };

  if (selectedClient) {
    return (
      <ClientDetailView
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        fetchWithAuth={fetchWithAuth}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Consultant Workspace</h1>
            <Badge variant="teal">Skincare Advisor</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Client profiles, skin assessment review roster, routine adjustments & progress tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Client Roster"
          value={statsLoading ? '…' : stats ? `${stats.total_clients} Clients` : '—'}
          change="Registered users"
          trend="up"
          icon={UserCheck}
          badgeColor="teal"
          description="Users with completed profiles"
        />
        <StatCard
          title="Avg Client Adherence"
          value={
            statsLoading ? '…' : stats?.avg_adherence != null ? `${stats.avg_adherence}%` : 'No Data'
          }
          change="From routine logs"
          trend="up"
          icon={Activity}
          badgeColor="emerald"
          description="Across all clients"
        />
        <StatCard
          title="Skin Types Tracked"
          value={statsLoading ? '…' : donutData.length > 0 ? `${donutData.length} Types` : 'No Data'}
          change="From assessments"
          trend="up"
          icon={FileText}
          badgeColor="cyan"
          description="Distinct skin types"
        />
        <StatCard
          title="Pending Reviews"
          value="—"
          change="Not available"
          trend="up"
          icon={UserCheck}
          badgeColor="amber"
          description="No schema-backed definition"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {donutData.length > 0 ? (
          <DonutChart
            title="Client Skin Type Distribution"
            badge={`${stats?.total_clients ?? 0} Total`}
            data={donutData}
          />
        ) : (
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Skin Type Distribution</h3>
            </div>
            <EmptyState icon={Activity} title="No Data" />
          </GlassCard>
        )}

        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Roster Summary</h3>
            {!statsLoading && stats && <Badge variant="teal">{stats.total_clients} Clients</Badge>}
          </div>
          {statsLoading ? (
            <LoadingSpinner message="Loading…" />
          ) : stats ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400">Total Clients</p>
                  <p className="text-2xl font-bold text-teal-400 mt-1">{stats.total_clients}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-xs text-slate-400">Avg Adherence</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {stats.avg_adherence != null ? `${stats.avg_adherence}%` : '—'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Select a client to view their profile, assessments, progress, and recommendations.
              </p>
            </div>
          ) : (
            <EmptyState icon={User} title="Stats Unavailable" />
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-400" /> Client Management Roster
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by name, email or skin type…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {clientsLoading && <LoadingSpinner message="Loading clients…" />}
          {!clientsLoading && clientsError && <ErrorBanner message={clientsError} />}
          {!clientsLoading && !clientsError && clients.length === 0 && (
            <EmptyState icon={User} title="No Clients Found" />
          )}
          {!clientsLoading && !clientsError && clients.length > 0 && filteredClients.length === 0 && (
            <EmptyState icon={Search} title="No Matches" />
          )}

          {!clientsLoading && !clientsError && filteredClients.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Skin Profile</th>
                    <th className="py-3 px-4">Health Score</th>
                    <th className="py-3 px-4">Risk Flag</th>
                    <th className="py-3 px-4">Last Assessed</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredClients.map((c) => {
                    const la = c.latest_assessment;
                    const score = la?.health_score;
                    return (
                      <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{c.full_name}</p>
                          <p className="text-slate-500 text-[11px]">{c.email}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {la?.predicted_skin_type || <span className="text-slate-600 italic">Not assessed</span>}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          {score != null ? `${score} / 100` : <span className="text-slate-600 italic">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getRiskVariant(score)}>
                            {getRiskLabel(score)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {la?.assessment_time ? formatDate(la.assessment_time) : <span className="italic text-slate-600">Never</span>}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedClient(c)}
                          >
                            Review Profile
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">How to Use</h3>
          </div>
          <div className="space-y-3 text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <p className="font-semibold text-slate-200">Browse Clients</p>
              <p>All registered users appear in the table above. Use search to filter.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <p className="font-semibold text-slate-200">Review Profile</p>
              <p>Click "Review Profile" to open the client's detail view with full assessment history and health data.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <p className="font-semibold text-slate-200">Monitor Progress</p>
              <p>View health score trends, scoring factor breakdowns, and routine adherence charts.</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
