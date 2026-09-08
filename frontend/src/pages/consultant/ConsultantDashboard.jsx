import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Loading, Empty, StatusBadge, ScoreRing } from '../../components/Shared';
import SkinProgressChart from '../../components/SkinProgressChart';
import ProfilePage from '../user/ProfilePage';

const TABS = [
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'reports', label: 'User Reports', icon: '📋' },
  { key: 'appointments', label: 'Consultations', icon: '📅' },
  { key: 'profile', label: 'My Profile', icon: '👤' },
];

export default function ConsultantDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('users');
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <div>
      <Navbar />
      <div className="dash-shell">
        <Sidebar
          items={TABS}
          active={tab}
          onSelect={(k) => { setTab(k); setSelectedUserId(null); }}
        />
        <main className="dash-main">
          <div className="dash-header">
            <h1>AI Skincare Planner — Consultant</h1>
            <p>Monitor your users' skin progress and current routines.</p>
          </div>
          {tab === 'users' && !selectedUserId && <UsersTab onSelectUser={setSelectedUserId} />}
          {tab === 'users' && selectedUserId && (
            <UserProgressTab userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
          )}
          {tab === 'reports' && <ReportsTab />}
          {tab === 'appointments' && <ConsultationsTab />}
          {tab === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}

function UsersTab({ onSelectUser }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/consultant/users')
      .then(({ data }) => setUsers(data.users))
      .catch((err) => setError(err.response?.data?.message || 'Could not load users.'));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (users === null) return <Loading />;
  if (users.length === 0) return <Empty label="No users to monitor yet — users appear here once they've booked a consultation with you or you've reviewed one of their reports." />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>User</th><th>Skin Type</th><th>Latest Score</th><th>Last Assessment</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.skin_type || '—'}</td>
                <td>{u.latest_score ?? '—'}</td>
                <td>{u.latest_assessment_at ? new Date(u.latest_assessment_at).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => onSelectUser(u.id)}>
                    View Progress
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserProgressTab({ userId, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/consultant/users/${userId}/progress`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load this user\u2019s progress.'));
  }, [userId]);

  if (error) {
    return (
      <div>
        <button className="btn-link" onClick={onBack} style={{ marginBottom: 12 }}>← Back to Users</button>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }
  if (data === null) return <Loading />;

  const { user, latest_report, changes, assessment_history, current_plan } = data;

  return (
    <div>
      <button className="btn-link" onClick={onBack} style={{ marginBottom: 12 }}>← Back to Users</button>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: 4 }}>{user.name}'s Skin Overview</h3>
        <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 14 }}>{user.email}</p>
        {latest_report ? (
          <div className="score-ring-wrap">
            <ScoreRing score={latest_report.skin_health_score} size={64} />
            <div>
              <div style={{ fontWeight: 700 }}>{latest_report.overall_condition}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                {latest_report.skin_type} skin · assessed {new Date(latest_report.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted">No assessments yet for this user.</p>
        )}
      </div>

      <div className="card plan-section">
        <h4 style={{ marginTop: 0, marginBottom: 10 }}>Skin Progress</h4>
        <SkinProgressChart reports={assessment_history} />
      </div>

      {changes?.length > 0 && (
        <div className="card plan-section">
          <h4 style={{ marginTop: 0, marginBottom: 10 }}>Skin Changes</h4>
          <ul className="explanation-list">
            {changes.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      <div className="card plan-section">
        <h4 style={{ marginTop: 0, marginBottom: 10 }}>Assessment History</h4>
        {assessment_history.length === 0 ? (
          <p className="text-muted">No assessments recorded.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Score</th><th>Skin Type</th><th>Top Concerns</th></tr></thead>
              <tbody>
                {assessment_history.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>{r.skin_health_score}</td>
                    <td>{r.skin_type}</td>
                    <td>{(r.concerns || []).map((c) => c.name).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card plan-section">
        <h4 style={{ marginTop: 0, marginBottom: 10 }}>Current Routine</h4>
        {current_plan ? (
          <div className="routine-grid">
            <div className="routine-card">
              <div className="routine-card-head"><span className="routine-icon">🌤️</span><h3>Morning Routine</h3></div>
              <div className="routine-steps">
                {current_plan.morning_routine.map((s, i) => (
                  <div className="routine-step" key={i}>
                    <div className="routine-step-num">{s.step ?? i + 1}</div>
                    <div className="routine-step-body">
                      <div className="routine-step-top">
                        <span className="badge badge-purple">{s.category}</span>
                        <strong>{s.product}</strong>
                      </div>
                      <p>{s.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="routine-card">
              <div className="routine-card-head"><span className="routine-icon">🌙</span><h3>Evening Routine</h3></div>
              <div className="routine-steps">
                {current_plan.evening_routine.map((s, i) => (
                  <div className="routine-step" key={i}>
                    <div className="routine-step-num">{s.step ?? i + 1}</div>
                    <div className="routine-step-body">
                      <div className="routine-step-top">
                        <span className="badge badge-purple">{s.category}</span>
                        <strong>{s.product}</strong>
                      </div>
                      <p>{s.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted">This user hasn't generated a skincare routine yet.</p>
        )}
      </div>
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState(null);
  const [selected, setSelected] = useState(null);
  const [recos, setRecos] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  const load = () => api.get('/consultant/reports').then(({ data }) => setReports(data.reports));
  useEffect(() => { load(); }, []);

  const openReport = (r) => {
    setSelected(r);
    setRecos(r.recommendations?.length ? r.recommendations : [{ title: '', description: '', category: 'Routine' }]);
    setNotes(r.doctor_notes || '');
  };

  const updateReco = (i, field, value) => {
    setRecos((prev) => prev.map((rec, idx) => (idx === i ? { ...rec, [field]: value } : rec)));
  };

  const addReco = () => setRecos((prev) => [...prev, { title: '', description: '', category: 'Routine' }]);
  const removeReco = (i) => setRecos((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    setSaving(true);
    try {
      await api.put(`/consultant/reports/${selected.id}/recommend`, {
        recommendations: recos.filter((r) => r.title.trim()),
        doctor_notes: notes,
      });
      setSelected(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (reports === null) return <Loading />;
  if (reports.length === 0) return <Empty label="No user reports to review yet." />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>User</th><th>Date</th><th>Score</th><th>Condition</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.patient_name}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>{r.skin_health_score}</td>
                <td>{r.overall_condition}</td>
                <td><StatusBadge status={r.status} /></td>
                <td><button className="btn btn-outline btn-sm" onClick={() => openReport(r)}>Recommend</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{selected.patient_name}'s Report</h3>
            <img src={`${SERVER_URL}${selected.image_path}`} alt="skin" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
            <div className="score-ring-wrap">
              <ScoreRing score={selected.skin_health_score} size={64} />
              <div>
                <div style={{ fontWeight: 700 }}>{selected.overall_condition}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>{selected.skin_type} skin</div>
              </div>
            </div>

            <h4 style={{ marginTop: 16, marginBottom: 6 }}>Recommendations</h4>
            {recos.map((r, i) => (
              <div key={i} className="card" style={{ padding: 12, marginBottom: 10 }}>
                <div className="field" style={{ marginBottom: 8 }}>
                  <input placeholder="Product / routine title" value={r.title} onChange={(e) => updateReco(i, 'title', e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 8 }}>
                  <textarea placeholder="Description" value={r.description} onChange={(e) => updateReco(i, 'description', e.target.value)} />
                </div>
                <button className="btn btn-outline btn-sm" type="button" onClick={() => removeReco(i)}>Remove</button>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" type="button" onClick={addReco}>+ Add Recommendation</button>

            <div className="field" style={{ marginTop: 16 }}>
              <label>Consultation notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for the user..." />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" disabled={saving} onClick={submit}>
                {saving ? <span className="spinner" /> : 'Save Recommendations'}
              </button>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConsultationsTab() {
  const [appts, setAppts] = useState(null);
  const load = () => api.get('/consultant/appointments').then(({ data }) => setAppts(data.appointments));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.put(`/consultant/appointments/${id}/status`, { status });
    load();
  };

  if (appts === null) return <Loading />;
  if (appts.length === 0) return <Empty label="No consultations booked yet." />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>User</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {appts.map((a) => (
              <tr key={a.id}>
                <td>{a.patient_name}</td>
                <td>{new Date(a.appointment_date).toLocaleDateString()}</td>
                <td>{a.appointment_time}</td>
                <td><StatusBadge status={a.status} /></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {a.status === 'PENDING' && <button className="btn btn-secondary btn-sm" onClick={() => setStatus(a.id, 'CONFIRMED')}>Confirm</button>}
                  {a.status === 'CONFIRMED' && <button className="btn btn-secondary btn-sm" onClick={() => setStatus(a.id, 'COMPLETED')}>Complete</button>}
                  {['PENDING', 'CONFIRMED'].includes(a.status) && <button className="btn btn-danger btn-sm" onClick={() => setStatus(a.id, 'CANCELLED')}>Cancel</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
