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
  Stethoscope,
  ShieldAlert,
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
  Calendar,
  FileText,
} from 'lucide-react';

const API_BASE = API_BASE_URL;

// ============================================================================
// Helper Components
// ============================================================================

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
      <p className="text-sm text-rose-300">{message}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center p-8">
      <Icon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <p className="font-semibold text-slate-300">{title}</p>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateString) {
  if (!dateString) return 'Unknown';
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// Sub-panel: Patient Insights (Tab 1)
// ============================================================================

function PatientInsightsPanel({ patientId, fetchWithAuth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchWithAuth(`${API_BASE}/dermatologist/patients/${patientId}/risk-factors`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setData(d);
        else if (d.status === 'no_assessment') setData(d);
        else setError(d.detail || 'Failed to load patient insights.');
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [patientId, fetchWithAuth]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data || data.status === 'no_assessment') return <EmptyState icon={User} title="No Patient Insights Yet" description="Patient has not completed a skin assessment." />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Overall Condition</p>
          <p className="text-xl font-bold text-white">{data.overall_condition || 'Not assessed'}</p>
          <p className="text-xs text-slate-500 mt-1">Current clinical status</p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Health Score</p>
          <p className="text-xl font-bold text-cyan-400">{data.health_score || 0} / 100</p>
          <p className="text-xs text-slate-500 mt-1">Current assessment score</p>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <h4 className="text-sm font-bold text-white mb-3">Predicted Skin Type</h4>
        <Badge variant="emerald">{data.predicted_skin_type || 'Unknown'}</Badge>
      </GlassCard>

      {data.concerns && data.concerns.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="text-sm font-bold text-white mb-3">Identified Concerns</h4>
          <div className="space-y-2">
            {data.concerns.map((concern, i) => (
              <Badge key={i} variant="amber">{concern}</Badge>
            ))}
          </div>
        </GlassCard>
      )}

      {data.risk_factors && data.risk_factors.length > 0 && (
        <GlassCard className="p-4 border-rose-500/20">
          <h4 className="text-sm font-bold text-rose-300 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Clinical Risk Factors
          </h4>
          <div className="space-y-2">
            {data.risk_factors.map((factor, i) => (
              <div key={i} className="text-xs text-rose-200 bg-rose-500/10 rounded-lg p-2">
                • {factor}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {data.vision_predicted_concern && (
        <GlassCard className="p-4 bg-gradient-to-r from-violet-900/20 to-purple-900/20">
          <h4 className="text-sm font-bold text-violet-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Vision AI Assessment
          </h4>
          <p className="text-xs text-violet-200 mb-2">{data.vision_predicted_concern}</p>
          {data.vision_confidence && (
            <p className="text-xs text-slate-400">Confidence: {data.vision_confidence}</p>
          )}
        </GlassCard>
      )}
    </div>
  );
}

// ============================================================================
// Sub-panel: Skin Condition Reports (Tab 2)
// ============================================================================

function SkinConditionReportsPanel({ patientId, fetchWithAuth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchWithAuth(`${API_BASE}/dermatologist/patients/${patientId}/assessments`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setData(d);
        else setError(d.detail || 'Failed to load assessments.');
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [patientId, fetchWithAuth]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data || data.total === 0) {
    return <EmptyState icon={FileText} title="No Assessments Yet" description="Patient has not completed a skin assessment." />;
  }

  const getFullImageUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `${API_BASE}${relativeUrl}`;
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">{data.total} assessment{data.total !== 1 ? 's' : ''} on record</p>
      {data.assessments.map((a) => {
        const isOpen = expanded === a.id;
        const imgUrl = getFullImageUrl(a.image_url);

        return (
          <GlassCard
            key={a.id}
            className="p-4 cursor-pointer hover:bg-slate-800/60 transition-colors"
            onClick={() => setExpanded(isOpen ? null : a.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-white">{formatDateTime(a.assessment_time)}</p>
                  <Badge variant="cyan">Score {a.health_score}</Badge>
                  <Badge variant={a.health_score >= 75 ? 'emerald' : a.health_score >= 55 ? 'amber' : 'rose'}>
                    {a.predicted_skin_type}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300">{a.overall_condition || 'Assessment data'}</p>
              </div>
              <ChevronLeft className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                {a.concerns && a.concerns.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Concerns</p>
                    <div className="flex flex-wrap gap-2">
                      {a.concerns.map((c, i) => (
                        <Badge key={i} variant="amber">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {a.risk_factors && a.risk_factors.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Risk Factors</p>
                    <div className="space-y-1">
                      {a.risk_factors.map((r, i) => (
                        <p key={i} className="text-xs text-slate-300">• {r}</p>
                      ))}
                    </div>
                  </div>
                )}

                {a.vision_predicted_concern && (
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3">
                    <p className="text-xs text-violet-300 font-semibold mb-1">Vision AI Finding</p>
                    <p className="text-xs text-violet-200">{a.vision_predicted_concern}</p>
                    {a.vision_confidence && (
                      <p className="text-xs text-slate-400 mt-1">Confidence: {a.vision_confidence}</p>
                    )}
                  </div>
                )}

                {imgUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Scan Image</p>
                    <img src={imgUrl} alt="Assessment scan" className="w-full rounded-lg max-h-64 object-cover" />
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}

// ============================================================================
// Sub-panel: Treatment Recommendations (Tab 3)
// ============================================================================

function TreatmentRecommendationsPanel({ patientId, fetchWithAuth }) {
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchWithAuth(`${API_BASE}/dermatologist/patients/${patientId}/assessments`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success' && d.assessments.length > 0) {
          setAssessmentData(d.assessments[0]);
          const existing = d.assessments[0].recommendations?.dermatologist_clinical_notes || '';
          setNotes(existing);
        } else if (d.status === 'success' && d.assessments.length === 0) {
          setAssessmentData(null);
        } else {
          setError(d.detail || 'Failed to load recommendations.');
        }
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [patientId, fetchWithAuth]);

  const handleSaveNotes = useCallback(async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const r = await fetchWithAuth(
        `${API_BASE}/dermatologist/patients/${patientId}/treatment-notes`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dermatologist_clinical_notes: notes }),
        }
      );
      const result = await r.json();
      if (result.status === 'success') {
        setSaveStatus({ type: 'success', message: 'Clinical notes saved successfully.' });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus({ type: 'error', message: result.detail || 'Failed to save notes.' });
      }
    } catch (e) {
      setSaveStatus({ type: 'error', message: e.message || 'Network error.' });
    } finally {
      setSaving(false);
    }
  }, [patientId, fetchWithAuth, notes]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!assessmentData) {
    return <EmptyState icon={ClipboardList} title="No Recommendations" />;
  }

  const recs = assessmentData.recommendations || {};

  return (
    <div className="space-y-4">
      {/* AI-Generated Recommendations */}
      <GlassCard className="p-4">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> AI-Generated Recommendations
        </h4>

        {recs.morning_routine && recs.morning_routine.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1">
              <Sun className="w-3 h-3" /> Morning Routine
            </p>
            <ul className="text-xs text-slate-300 space-y-1">
              {recs.morning_routine.map((step, i) => (
                <li key={i}>• {step}</li>
              ))}
            </ul>
          </div>
        )}

        {recs.night_routine && recs.night_routine.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1">
              <Moon className="w-3 h-3" /> Night Routine
            </p>
            <ul className="text-xs text-slate-300 space-y-1">
              {recs.night_routine.map((step, i) => (
                <li key={i}>• {step}</li>
              ))}
            </ul>
          </div>
        )}

        {recs.recommended_ingredients && recs.recommended_ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-400 font-semibold mb-2">Recommended Ingredients</p>
            <div className="flex flex-wrap gap-2">
              {recs.recommended_ingredients.map((ing, i) => (
                <Badge key={i} variant="emerald">{ing}</Badge>
              ))}
            </div>
          </div>
        )}

        {recs.ingredients_to_avoid && recs.ingredients_to_avoid.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-slate-400 font-semibold mb-2">Ingredients to Avoid</p>
            <div className="flex flex-wrap gap-2">
              {recs.ingredients_to_avoid.map((ing, i) => (
                <Badge key={i} variant="rose">{ing}</Badge>
              ))}
            </div>
          </div>
        )}

        {recs.general_advice && (
          <div className="bg-slate-900/50 rounded-lg p-3 mt-3">
            <p className="text-xs text-slate-300">{recs.general_advice}</p>
          </div>
        )}
      </GlassCard>

      {/* Dermatologist Clinical Notes */}
      <GlassCard className="p-4 border-cyan-500/20">
        <h4 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" /> Dermatologist Clinical Treatment Notes
        </h4>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter clinical treatment recommendations, observations, or follow-up instructions..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none h-32"
        />

        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleSaveNotes}
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>

        {saveStatus && (
          <div className={`mt-3 p-3 rounded-lg text-xs ${
            saveStatus.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300'
              : 'bg-rose-500/10 text-rose-300'
          }`}>
            {saveStatus.message}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ============================================================================
// Sub-panel: Progress Analytics (Tab 4)
// ============================================================================

function ProgressAnalyticsPanel({ patientId, fetchWithAuth }) {
  const [data, setData] = useState(null);
  const [healthScoreData, setHealthScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchWithAuth(`${API_BASE}/dermatologist/patients/${patientId}/progress`),
      fetchWithAuth(`${API_BASE}/dermatologist/patients/${patientId}/health-score`),
    ])
      .then(async ([r1, r2]) => {
        const d1 = await r1.json();
        const d2 = await r2.json();
        if (d1.status === 'success' || d1.status === 'no_assessment') setData(d1);
        else setError(d1.detail || 'Failed to load progress.');
        if (d2.status === 'success') setHealthScoreData(d2);
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [patientId, fetchWithAuth]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!data || data.status === 'no_assessment') {
    return <EmptyState icon={TrendingUp} title="No Progress Data Yet" description="Patient has not completed a skin assessment." />;
  }

  const scoreTrendData = data.score_trend?.map(item => ({
    label: item.date,
    value: item.score,
  })) || [];

  const adherenceTrendData = data.adherence_trend?.map(item => ({
    label: item.date,
    value: item.adherence_percent,
  })) || [];

  return (
    <div className="space-y-4">
      {/* Score Change Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Baseline Score</p>
          <p className="text-2xl font-bold text-white">{data.baseline_score || 0}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Current Score</p>
          <p className="text-2xl font-bold text-cyan-400">{data.current_score || 0}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Change</p>
          <p className={`text-2xl font-bold ${data.score_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data.score_change >= 0 ? '+' : ''}{data.score_change || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">{data.percentage_change || 0}%</p>
        </GlassCard>
      </div>

      {/* Health Score Factors */}
      {healthScoreData && healthScoreData.factors && (
        <GlassCard className="p-4">
          <h4 className="text-sm font-bold text-white mb-3">Scoring Factor Breakdown</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Object.entries(healthScoreData.factors).map(([key, factor]) => (
              <div key={key} className="bg-slate-900/60 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-lg font-bold text-cyan-400">{factor.score}</p>
                <p className="text-xs text-slate-500 mt-1">{Math.round(factor.weight * 100)}%</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Score Trend Chart */}
      {scoreTrendData.length > 1 && (
        <TrendBarChart title="Health Score Trend" badge="Over Time" data={scoreTrendData} height={180} />
      )}

      {/* Adherence Trend Chart */}
      {adherenceTrendData.length > 0 && (
        <>
          {adherenceTrendData.length > 1 ? (
            <TrendBarChart title="Routine Adherence Trend" badge={data.average_adherence ? `Avg ${data.average_adherence}%` : 'From Logs'} data={adherenceTrendData} height={180} />
          ) : (
            <GlassCard className="p-4">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Average Adherence</p>
              <p className="text-2xl font-bold text-emerald-400">{data.average_adherence || 0}%</p>
            </GlassCard>
          )}
        </>
      )}

      {/* Summary */}
      <GlassCard className="p-4 bg-slate-900/60">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Assessment Summary</p>
        <p className="text-xs text-slate-300">
          Patient has <strong>{data.total_assessments}</strong> assessment{data.total_assessments !== 1 ? 's' : ''} and{' '}
          <strong>{data.total_adherence_logs}</strong> adherence log{data.total_adherence_logs !== 1 ? 's' : ''}.
        </p>
      </GlassCard>
    </div>
  );
}

// ============================================================================
// Patient Detail View with Tabs
// ============================================================================

const TABS = [
  { id: 'insights', label: 'Patient Insights', icon: User },
  { id: 'conditions', label: 'Skin Condition Reports', icon: FileText },
  { id: 'treatment', label: 'Treatment Recommendations', icon: ClipboardList },
  { id: 'progress', label: 'Progress Analytics', icon: TrendingUp },
];

function PatientDetailView({ patient, onBack, fetchWithAuth }) {
  const [activeTab, setActiveTab] = useState('insights');

  const latest = patient.latest_assessment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <Button
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Roster
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{patient.full_name}</h2>
              <Badge variant="cyan">Patient</Badge>
            </div>
            <p className="text-sm text-slate-400">{patient.email}</p>
            {latest && (
              <div className="flex flex-wrap gap-4 mt-2">
                <div>
                  <p className="text-xs text-slate-500">Latest Assessment</p>
                  <p className="text-sm text-slate-300">{formatDate(latest.assessment_time)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Skin Type</p>
                  <p className="text-sm font-semibold text-emerald-400">{latest.predicted_skin_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Health Score</p>
                  <p className="text-sm font-semibold text-cyan-400">{latest.health_score} / 100</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <GlassCard className="p-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'insights' && (
          <PatientInsightsPanel patientId={patient.id} fetchWithAuth={fetchWithAuth} />
        )}
        {activeTab === 'conditions' && (
          <SkinConditionReportsPanel patientId={patient.id} fetchWithAuth={fetchWithAuth} />
        )}
        {activeTab === 'treatment' && (
          <TreatmentRecommendationsPanel patientId={patient.id} fetchWithAuth={fetchWithAuth} />
        )}
        {activeTab === 'progress' && (
          <ProgressAnalyticsPanel patientId={patient.id} fetchWithAuth={fetchWithAuth} />
        )}
      </GlassCard>
    </div>
  );
}

// ============================================================================
// Main Dashboard: Patient Roster View
// ============================================================================

export default function DermatologistDashboardPage() {
  const { user, fetchWithAuth } = useAuth();

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadPatients = useCallback(() => {
    setPatientsLoading(true);
    setPatientsError('');
    fetchWithAuth(`${API_BASE}/dermatologist/patients`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setPatients(d.patients || []);
        else setPatientsError(d.detail || 'Failed to load patients.');
      })
      .catch(e => setPatientsError(e.message || 'Network error.'))
      .finally(() => setPatientsLoading(false));
  }, [fetchWithAuth]);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    fetchWithAuth(`${API_BASE}/dermatologist/stats`)
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setStats(d); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [fetchWithAuth]);

  useEffect(() => {
    loadPatients();
    loadStats();
  }, [loadPatients, loadStats]);

  const filteredPatients = patients.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.latest_assessment?.predicted_skin_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const donutData = [];
  if (stats?.distinct_skin_conditions) {
    const conditions = new Set(patients.map(p => p.latest_assessment?.overall_condition).filter(Boolean));
    const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e', '#10b981', '#14b8a6'];
    Array.from(conditions).forEach((cond, i) => {
      const count = patients.filter(p => p.latest_assessment?.overall_condition === cond).length;
      donutData.push({
        label: cond,
        value: count,
        color: colors[i % colors.length],
      });
    });
  }

  if (selectedPatient) {
    return (
      <PatientDetailView
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        fetchWithAuth={fetchWithAuth}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Dermatologist Clinical Portal</h1>
            <Badge variant="cyan">Clinical Workspace</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Patient insights, clinical skin condition reports, treatment recommendations & progress analytics.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={patientsLoading ? '…' : `${patients.length}`}
          change="Active records"
          trend="up"
          icon={Stethoscope}
          badgeColor="cyan"
          description="Patient roster"
        />
        <StatCard
          title="Patients Assessed"
          value={statsLoading ? '…' : (stats?.patients_with_assessments || 0)}
          change="With assessments"
          trend="up"
          icon={CheckCircle2}
          badgeColor="emerald"
          description="Completed intake"
        />
        <StatCard
          title="Average Health Score"
          value={statsLoading ? '…' : (stats?.average_health_score != null ? `${stats.average_health_score}` : 'No Data')}
          change="Across cohort"
          trend="up"
          icon={TrendingUp}
          badgeColor="violet"
          description="Current average"
        />
        <StatCard
          title="Average Adherence"
          value={statsLoading ? '…' : (stats?.average_adherence != null ? `${stats.average_adherence}%` : 'No Data')}
          change="Routine compliance"
          trend="up"
          icon={CheckCircle2}
          badgeColor="amber"
          description="From adherence logs"
        />
      </div>

      {/* Skin Condition Distribution Chart */}
      {donutData.length > 0 && (
        <DonutChart title="Skin Condition Distribution" badge={`${patients.length} Patients`} data={donutData} />
      )}

      {/* Patient Roster */}
      <GlassCard className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-400" /> Patient Medical Roster
          </h3>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search patient or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {patientsError && <ErrorBanner message={patientsError} />}

        {patientsLoading ? (
          <LoadingSpinner />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No Patients Found"
            description={searchTerm ? 'Try adjusting your search filters' : 'Patient roster is empty'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Latest Skin Type</th>
                  <th className="py-3 px-4">Health Score</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Last Assessment</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.full_name}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{p.email}</td>
                    <td className="py-3 px-4">
                      {p.latest_assessment ? (
                        <Badge variant="emerald">{p.latest_assessment.predicted_skin_type}</Badge>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      {p.latest_assessment?.health_score || '—'}/100
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {p.latest_assessment?.overall_condition || 'Not assessed'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {p.latest_assessment?.assessment_time ? formatDate(p.latest_assessment.assessment_time) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPatient(p)}
                      >
                        Review Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
