import { useEffect, useState } from 'react';
import api from '../../api/axios';
import SkinProgressChart from '../../components/SkinProgressChart';
import CompleteSkinHealthForm from '../../components/CompleteSkinHealthForm';
import {
  clampScore,
  getHealthStatus,
  calculateSkinConditionScore,
  calculateLifestyleScore,
  calculateSleepScore,
  calculateRoutineConsistency,
  calculateHydrationScore,
  calculateImprovementScore,
  calculateOverallSkinHealthScore,
  getMissingHealthInputs,
  SCORE_WEIGHTS,
} from '../../utils/skinHealthScore';

function ComparisonCard({ latest, previous }) {
  if (!latest || !previous) {
    return (
      <div className="card plan-section">
        <h4 style={{ marginTop: 0 }}>Previous vs. Current Assessment</h4>
        <p className="text-muted" style={{ fontSize: 13.5 }}>
          Complete one more skin assessment to see a comparison against your previous result.
        </p>
      </div>
    );
  }

  const delta = (latest.skin_health_score ?? 0) - (previous.skin_health_score ?? 0);
  const verdict = delta > 2 ? 'improved' : delta < -2 ? 'declined' : 'similar';
  const verdictLabel = { improved: '▲ Improved', declined: '▼ Declined', similar: '● No Significant Change' }[verdict];

  return (
    <div className="card plan-section">
      <h4 style={{ marginTop: 0, marginBottom: 14 }}>Previous vs. Current Assessment</h4>
      <div className="comparison-strip">
        <div className="comparison-side">
          <div className="cs-label">Previous · {new Date(previous.created_at).toLocaleDateString()}</div>
          <div className="cs-score">{previous.skin_health_score}</div>
        </div>
        <span className="comparison-arrow">→</span>
        <div className="comparison-side">
          <div className="cs-label">Current · {new Date(latest.created_at).toLocaleDateString()}</div>
          <div className="cs-score">{latest.skin_health_score}</div>
        </div>
        <span className={`comparison-verdict ${verdict}`}>
          {verdictLabel} {delta !== 0 && `(${delta > 0 ? '+' : ''}${delta})`}
        </span>
      </div>
    </div>
  );
}

const FACTOR_LABELS = {
  skinCondition: 'Skin Condition',
  lifestyle: 'Lifestyle',
  sleep: 'Sleep Quality',
  routine: 'Routine Consistency',
  hydration: 'Hydration',
};

// Every score card that has real data shows the same 5-part breakdown
// the spec calls for: value, explanation, data used, weight, and its
// contribution (score × weight) toward the Overall Score below.
function ScoreCard({ label, weightKey, result, onGoToPlan, children }) {
  const weightPct = Math.round(SCORE_WEIGHTS[weightKey] * 100);
  const unavailable = !result || !result.available || !Number.isFinite(result.score);

  return (
    <div className="score-card">
      <div className="score-card-head">
        <span className="score-card-label">{label}</span>
        <span className="badge badge-purple">{weightPct}%</span>
      </div>

      {unavailable ? (
        <>
          <p className="score-card-empty">Add your info below to calculate this score.</p>
          {children}
        </>
      ) : (
        <>
          <div className="score-card-value">{result.score}<span className="score-card-suffix">/100</span></div>
          <div className="score-card-track">
            <div className="score-card-fill" style={{ width: `${clampScore(result.score)}%` }} />
          </div>
          {result.dataUsed && <p className="score-card-meta">{result.dataUsed}</p>}
          {result.explanation && <p className="score-card-meta text-soft">{result.explanation}</p>}
          <p className="score-card-contribution">
            Weight {weightPct}% · Contributes {(result.score * SCORE_WEIGHTS[weightKey]).toFixed(1)} pts to Overall Score
          </p>
          {weightKey === 'routine' && !result.hasRoutine && (
            <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={onGoToPlan}>
              Create and start a skincare routine →
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ImprovementCard({ result }) {
  if (!result?.available) {
    return (
      <div className="score-card">
        <div className="score-card-head"><span className="score-card-label">Skin Improvement Score</span></div>
        <p className="score-card-empty">{result?.message}</p>
      </div>
    );
  }
  const statusClass = { Improved: 'improved', Stable: 'similar', 'Needs Attention': 'declined' }[result.status];
  return (
    <div className="score-card">
      <div className="score-card-head"><span className="score-card-label">Skin Improvement Score</span></div>
      <div className="score-card-value">
        {result.delta > 0 ? '+' : ''}{result.delta}
        <span className="score-card-suffix">pts</span>
      </div>
      <span className={`comparison-verdict ${statusClass}`}>{result.status}</span>
      <p className="score-card-meta" style={{ marginTop: 8, marginBottom: 0 }}>
        Previous {result.previous} → Current {result.latest}
      </p>
      <p className="text-soft" style={{ fontSize: 11.5, marginTop: 6, marginBottom: 0 }}>
        Informational only — not one of the 5 weighted factors below.
      </p>
    </div>
  );
}

function OverallScoreCard({ result }) {
  if (!result?.available) {
    return (
      <div className="score-card score-card-overall">
        <div className="score-card-head"><span className="score-card-label">Overall Skin Health Score</span></div>
        <p className="score-card-empty">
          Complete the information below to calculate your Overall Skin Health Score
          {result?.missingKeys?.length
            ? ` — still needed: ${result.missingKeys.map((k) => FACTOR_LABELS[k]).join(', ')}.`
            : '.'}
        </p>
      </div>
    );
  }

  const status = getHealthStatus(result.score);
  const statusBadgeClass = { Excellent: 'badge-green', Good: 'badge-blue', Fair: 'badge-amber', 'Needs Attention': 'badge-red' }[status] || 'badge-amber';

  return (
    <div className="score-card score-card-overall">
      <div className="score-card-head">
        <span className="score-card-label">Overall Skin Health Score</span>
        <span className={`badge ${statusBadgeClass}`}>{status}</span>
      </div>
      <div className="score-card-value score-card-value-lg">{result.score}<span className="score-card-suffix">/100</span></div>
      <div className="score-card-track">
        <div className="score-card-fill" style={{ width: `${result.score}%` }} />
      </div>

      <h5 style={{ margin: '18px 0 8px', fontSize: 13, fontWeight: 700 }}>How your Overall Skin Health Score is calculated</h5>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Factor</th><th>Score</th><th>Weight</th><th>Contribution</th></tr>
          </thead>
          <tbody>
            {result.breakdown.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{row.score}/100</td>
                <td>{Math.round(row.weight * 100)}%</td>
                <td>{row.contribution.toFixed(1)}</td>
              </tr>
            ))}
            <tr>
              <td><strong>Total Overall Skin Health Score</strong></td>
              <td colSpan={3}><strong>{result.score}/100 — {status}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeightedModelCard() {
  const rows = [
    ['Skin Condition Assessment', SCORE_WEIGHTS.skinCondition],
    ['Lifestyle Habits', SCORE_WEIGHTS.lifestyle],
    ['Sleep Quality', SCORE_WEIGHTS.sleep],
    ['Routine Consistency', SCORE_WEIGHTS.routine],
    ['Hydration Level', SCORE_WEIGHTS.hydration],
  ];
  const total = rows.reduce((sum, [, w]) => sum + w, 0);
  return (
    <div className="card plan-section weighted-model-card">
      <h4 style={{ marginTop: 0, marginBottom: 4 }}>Weighted Scoring Model</h4>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>Skin Health Score =</p>
      <ul className="weighted-model-list">
        {rows.map(([label, weight]) => (
          <li key={label}>
            <span>{label}</span>
            <span className="weighted-model-pct">{Math.round(weight * 100)}%</span>
          </li>
        ))}
      </ul>
      <p className="text-soft" style={{ fontSize: 11.5, marginTop: 10, marginBottom: 0 }}>
        Total weight: {Math.round(total * 100)}% — every factor is always included; none are ever excluded or renormalized.
      </p>
    </div>
  );
}

function ScoringEngineSection({ reports, preferences, plan, loadingExtras, onGoToPlan, onPreferencesSaved }) {
  const latest = reports[0];

  const skinCondition = calculateSkinConditionScore(latest, preferences);
  const lifestyle = calculateLifestyleScore(preferences);
  const sleep = calculateSleepScore(preferences);
  const routine = calculateRoutineConsistency(plan);
  const hydration = calculateHydrationScore(preferences);
  const improvement = calculateImprovementScore(reports);
  const overall = calculateOverallSkinHealthScore({ skinCondition, lifestyle, sleep, routine, hydration });
  const missing = getMissingHealthInputs({ skinCondition, lifestyle, sleep, hydration });

  return (
    <>
      <div className="card plan-section">
        <h4 style={{ marginTop: 0, marginBottom: 4 }}>Skin Health Scoring Engine</h4>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
          A combined view of your skin condition, lifestyle, sleep, routine consistency, and hydration —
          weighted into one overall score using the complete 100% formula.
        </p>

        {loadingExtras && (
          <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#2a8c82', borderColor: '#e2ebe9' }} />
            Loading your preferences and routine data…
          </p>
        )}

        <div className="score-engine-grid">
          <ScoreCard label="Skin Condition Score" weightKey="skinCondition" result={skinCondition} />
          <ScoreCard label="Lifestyle Impact Score" weightKey="lifestyle" result={lifestyle} />
          <ScoreCard label="Sleep Quality Score" weightKey="sleep" result={sleep} />
          <ScoreCard label="Routine Adherence Score" weightKey="routine" result={routine} onGoToPlan={onGoToPlan} />
          <ScoreCard label="Hydration Score" weightKey="hydration" result={hydration} />
          <ImprovementCard result={improvement} />
        </div>

        <div style={{ marginTop: 16 }}>
          <OverallScoreCard result={overall} />
        </div>
      </div>

      {missing.length > 0 && (
        <CompleteSkinHealthForm missing={missing} preferences={preferences} onSaved={onPreferencesSaved} />
      )}
    </>
  );
}

function ConcernSeverityHistory({ reports }) {
  // Every concern name seen across the last 5 assessments, oldest to
  // newest, so a repeated concern's severity trend is visible at a glance.
  const recent = [...reports]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-5);

  const concernNames = new Set();
  recent.forEach((r) => (r.concerns || []).forEach((c) => concernNames.add(c.name)));

  if (!concernNames.size) return null;

  return (
    <div className="card plan-section">
      <h4 style={{ marginTop: 0, marginBottom: 4 }}>Concern Severity Over Time</h4>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
        Severity recorded for each concern across your last {recent.length} assessment{recent.length !== 1 ? 's' : ''}.
      </p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Concern</th>
              {recent.map((r) => <th key={r.id}>{new Date(r.created_at).toLocaleDateString()}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...concernNames].map((name) => (
              <tr key={name}>
                <td>{name}</td>
                {recent.map((r) => {
                  const match = (r.concerns || []).find((c) => c.name === name);
                  return (
                    <td key={r.id}>
                      {match ? <span className="badge badge-amber">{match.severity}</span> : <span className="text-soft">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SkinProgress({ onGoToPlan }) {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');
  // Preferences (lifestyle/sleep/hydration/skin) and the latest routine
  // plan (routine consistency) power the Skin Health Scoring Engine
  // below. They're fetched independently of `reports` and of each other
  // via allSettled, so a user with no preferences saved yet or no
  // routine generated yet still sees their assessment history
  // immediately — the scoring engine just asks for whatever's missing.
  const [preferences, setPreferences] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/reports');
        if (!cancelled) setReports(data.reports);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load your assessment history.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [prefsResult, planResult] = await Promise.allSettled([
        api.get('/preferences'),
        api.get('/skincare-plan'),
      ]);
      if (cancelled) return;
      if (prefsResult.status === 'fulfilled') setPreferences(prefsResult.value.data?.preferences || null);
      if (planResult.status === 'fulfilled') setPlan(planResult.value.data?.plan || null);
      setLoadingExtras(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (reports === null) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <span className="spinner" />
      </div>
    );
  }

  const latest = reports[0];
  const previous = reports[1];

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Skin Progress</h3>
        <p className="text-muted" style={{ fontSize: 14, marginBottom: 18 }}>
          Your skin health score across every assessment you've completed.
        </p>
        <SkinProgressChart reports={reports} />
      </div>

      <ScoringEngineSection
        reports={reports}
        preferences={preferences}
        plan={plan}
        loadingExtras={loadingExtras}
        onGoToPlan={onGoToPlan}
        onPreferencesSaved={setPreferences}
      />
      <WeightedModelCard />

      <ComparisonCard latest={latest} previous={previous} />
      <ConcernSeverityHistory reports={reports} />

      {latest && (
        <div className="card plan-section">
          <h4 style={{ marginTop: 0, marginBottom: 10 }}>Latest Assessment</h4>
          <div className="plan-summary-strip">
            <span className="badge badge-blue">Skin Type: {latest.skin_type || '—'}</span>
            <span className="badge badge-amber">Score: {latest.skin_health_score}/100</span>
            <span className="text-muted" style={{ fontSize: 13 }}>
              {new Date(latest.created_at).toLocaleDateString()}
            </span>
          </div>
          {latest.concerns?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {latest.concerns.map((c, i) => (
                <div key={i} className="concern-item">
                  <span>{c.name}</span>
                  <span className="badge badge-amber">{c.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
