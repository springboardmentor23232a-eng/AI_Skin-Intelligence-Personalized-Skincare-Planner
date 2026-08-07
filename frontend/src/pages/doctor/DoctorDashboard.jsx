import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Loading, Empty, StatusBadge, ScoreRing } from '../../components/Shared';

const TABS = [
  { key: 'patients', label: 'My Patients', icon: '🧑‍🤝‍🧑' },
  { key: 'reports', label: 'Skin Reports', icon: '📋' },
  { key: 'appointments', label: 'Appointments', icon: '📅' },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('patients');

  return (
    <div>
      <Navbar />
      <div className="dash-shell">
        <Sidebar items={TABS} active={tab} onSelect={setTab} />
        <main className="dash-main">
          <div className="dash-header">
            <h1>Welcome, Dr. {user.name.split(' ').pop()}</h1>
            <p>Review patient skin reports and manage your appointments.</p>
          </div>
          {tab === 'patients' && <PatientsTab />}
          {tab === 'reports' && <ReportsTab />}
          {tab === 'appointments' && <AppointmentsTab />}
        </main>
      </div>
    </div>
  );
}

function PatientsTab() {
  const [patients, setPatients] = useState(null);
  useEffect(() => { api.get('/doctor/patients').then(({ data }) => setPatients(data.patients)); }, []);
  if (patients === null) return <Loading />;
  if (patients.length === 0) return <Empty label="No assigned patients yet — patients appear here once they book an appointment with you." />;
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Skin Type</th></tr></thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.email}</td><td>{p.phone || '—'}</td><td>{p.skin_type || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState(null);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  const load = () => api.get('/doctor/reports').then(({ data }) => setReports(data.reports));
  useEffect(() => { load(); }, []);

  const openReport = (r) => {
    setSelected(r);
    setNotes(r.doctor_notes || '');
  };

  const submitDiagnosis = async () => {
    setSaving(true);
    try {
      await api.put(`/doctor/reports/${selected.id}/diagnosis`, { doctor_notes: notes });
      setSelected(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (reports === null) return <Loading />;
  if (reports.length === 0) return <Empty label="No patient reports to review yet." />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Date</th><th>Score</th><th>Condition</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.patient_name}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>{r.skin_health_score}</td>
                <td>{r.overall_condition}</td>
                <td><StatusBadge status={r.status} /></td>
                <td><button className="btn btn-outline btn-sm" onClick={() => openReport(r)}>Review</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{selected.patient_name}'s Report</h3>
            <img src={`${SERVER_URL}${selected.image_path}`} alt="skin" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
            <div className="score-ring-wrap">
              <ScoreRing score={selected.skin_health_score} size={72} />
              <div>
                <div style={{ fontWeight: 700 }}>{selected.overall_condition}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>{selected.skin_type} skin</div>
              </div>
            </div>
            <h4 style={{ marginBottom: 6 }}>Concerns</h4>
            {(selected.concerns || []).map((c, i) => (
              <div key={i} className="concern-item"><span>{c.name}</span><span className="badge badge-amber">{c.severity}</span></div>
            ))}
            <div className="field" style={{ marginTop: 16 }}>
              <label>Diagnosis & treatment suggestions</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter your clinical notes..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" disabled={saving} onClick={submitDiagnosis}>
                {saving ? <span className="spinner" /> : 'Save Diagnosis'}
              </button>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentsTab() {
  const [appts, setAppts] = useState(null);
  const load = () => api.get('/doctor/appointments').then(({ data }) => setAppts(data.appointments));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.put(`/doctor/appointments/${id}/status`, { status });
    load();
  };

  if (appts === null) return <Loading />;
  if (appts.length === 0) return <Empty label="No appointments booked with you yet." />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
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
