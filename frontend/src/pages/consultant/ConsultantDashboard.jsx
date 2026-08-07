import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Loading, Empty, StatusBadge, ScoreRing } from '../../components/Shared';

const TABS = [
  { key: 'reports', label: 'User Reports', icon: '📋' },
  { key: 'appointments', label: 'Consultations', icon: '📅' },
];

export default function ConsultantDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('reports');

  return (
    <div>
      <Navbar />
      <div className="dash-shell">
        <Sidebar items={TABS} active={tab} onSelect={setTab} />
        <main className="dash-main">
          <div className="dash-header">
            <h1>Welcome, {user.name}</h1>
            <p>Review reports and recommend skincare routines for your clients.</p>
          </div>
          {tab === 'reports' && <ReportsTab />}
          {tab === 'appointments' && <ConsultationsTab />}
        </main>
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
