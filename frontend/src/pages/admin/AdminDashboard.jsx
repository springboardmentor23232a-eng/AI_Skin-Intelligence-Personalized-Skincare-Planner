import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { Loading, Empty, StatusBadge, StatCard } from '../../components/Shared';

const TABS = [
  { key: 'stats', label: 'Overview', icon: '📊' },
  { key: 'users', label: 'Users', icon: '🧑' },
  { key: 'doctors', label: 'Doctors', icon: '🩺' },
  { key: 'consultants', label: 'Consultants', icon: '💬' },
  { key: 'reports', label: 'All Reports', icon: '📋' },
  { key: 'appointments', label: 'Appointments', icon: '📅' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats');

  return (
    <div>
      <Navbar />
      <div className="dash-shell">
        <Sidebar items={TABS} active={tab} onSelect={setTab} />
        <main className="dash-main">
          <div className="dash-header">
            <h1>Admin Console</h1>
            <p>Manage users, providers, reports and appointments across the platform.</p>
          </div>
          {tab === 'stats' && <StatsTab />}
          {tab === 'users' && <UsersTab role="USER" title="Users" />}
          {tab === 'doctors' && <UsersTab role="DOCTOR" title="Doctors" />}
          {tab === 'consultants' && <UsersTab role="CONSULTANT" title="Consultants" />}
          {tab === 'reports' && <ReportsTab />}
          {tab === 'appointments' && <AppointmentsTab />}
        </main>
      </div>
    </div>
  );
}

function StatsTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then(({ data }) => setStats(data)); }, []);
  if (!stats) return <Loading />;

  return (
    <>
      <div className="stat-grid">
        <StatCard value={stats.totalUsers} label="Total Users" />
        <StatCard value={stats.totalDoctors} label="Doctors" />
        <StatCard value={stats.totalConsultants} label="Consultants" />
        <StatCard value={stats.totalReports} label="Skin Reports" />
        <StatCard value={stats.totalAppointments} label="Appointments" />
        <StatCard value={stats.averageSkinHealthScore || '—'} label="Avg. Skin Health Score" />
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Appointments by Status</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(stats.appointmentsByStatus).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusBadge status={status} /> <span className="text-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function UsersTab({ role, title }) {
  const [users, setUsers] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role, specialization: '' });
  const [msg, setMsg] = useState('');

  const load = () => api.get(`/admin/users?role=${role}`).then(({ data }) => setUsers(data.users));
  useEffect(() => { load(); setForm((f) => ({ ...f, role })); }, [role]);

  const toggleActive = async (u) => {
    await api.put(`/admin/users/${u.id}`, { is_active: !u.is_active });
    load();
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    await api.delete(`/admin/users/${u.id}`);
    load();
  };

  const create = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/admin/users', form);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role, specialization: '' });
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create user.');
    }
  };

  if (users === null) return <Loading />;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Add {role.toLowerCase()}</button>
      </div>

      {users.length === 0 ? (
        <Empty label={`No ${title.toLowerCase()} yet.`} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Provider</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.provider}</td>
                  <td><span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleActive(u)}>{u.is_active ? 'Disable' : 'Enable'}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Add {role.toLowerCase()}</h3>
            {msg && <div className="alert alert-error">{msg}</div>}
            <form onSubmit={create}>
              <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>Password</label><input type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              {role !== 'USER' && (
                <div className="field"><label>Specialization</label><input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState(null);
  useEffect(() => { api.get('/admin/reports').then(({ data }) => setReports(data.reports)); }, []);
  if (reports === null) return <Loading />;
  if (reports.length === 0) return <Empty label="No reports in the system yet." />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Date</th><th>Score</th><th>Condition</th><th>Status</th><th>Reviewer</th></tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.patient_name}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>{r.skin_health_score}</td>
                <td>{r.overall_condition}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{r.reviewer_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AppointmentsTab() {
  const [appts, setAppts] = useState(null);
  useEffect(() => { api.get('/admin/appointments').then(({ data }) => setAppts(data.appointments)); }, []);
  if (appts === null) return <Loading />;
  if (appts.length === 0) return <Empty label="No appointments in the system yet." />;

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Provider</th><th>Type</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>
            {appts.map((a) => (
              <tr key={a.id}>
                <td>{a.patient_name}</td>
                <td>{a.provider_name}</td>
                <td>{a.provider_role}</td>
                <td>{new Date(a.appointment_date).toLocaleDateString()}</td>
                <td>{a.appointment_time}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
