import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loading, Empty, StatusBadge } from '../../components/Shared';

export default function AppointmentsPage() {
  const [providerRole, setProviderRole] = useState('DOCTOR');
  const [providers, setProviders] = useState([]);
  const [appointments, setAppointments] = useState(null);
  const [form, setForm] = useState({ provider_id: '', appointment_date: '', appointment_time: '', notes: '' });
  const [msg, setMsg] = useState('');
  const [booking, setBooking] = useState(false);

  const loadProviders = async (role) => {
    const { data } = await api.get(`/appointments/providers?role=${role}`);
    setProviders(data.providers);
    setForm((f) => ({ ...f, provider_id: '' }));
  };

  const loadAppointments = async () => {
    const { data } = await api.get('/appointments/mine');
    setAppointments(data.appointments);
  };

  useEffect(() => {
    loadProviders(providerRole);
  }, [providerRole]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.provider_id) return;
    setBooking(true);
    setMsg('');
    try {
      await api.post('/appointments', { ...form, provider_role: providerRole });
      setMsg('Appointment requested!');
      setForm({ provider_id: '', appointment_date: '', appointment_time: '', notes: '' });
      loadAppointments();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    await api.put(`/appointments/${id}/cancel`);
    loadAppointments();
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 1.4fr', alignItems: 'start' }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Book an Appointment</h3>
        {msg && <div className={`alert ${msg.includes('requested') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        <div className="field">
          <label>Provider type</label>
          <select value={providerRole} onChange={(e) => setProviderRole(e.target.value)}>
            <option value="DOCTOR">Doctor</option>
            <option value="CONSULTANT">Consultant</option>
          </select>
        </div>

        <form onSubmit={handleBook}>
          <div className="field">
            <label>Choose {providerRole === 'DOCTOR' ? 'a doctor' : 'a consultant'}</label>
            <select
              value={form.provider_id}
              onChange={(e) => setForm({ ...form, provider_id: e.target.value })}
              required
            >
              <option value="">Select…</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" required value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
          </div>
          <div className="field">
            <label>Time</label>
            <input type="time" required value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} />
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What would you like to discuss?" />
          </div>
          <button className="btn btn-primary" disabled={booking}>
            {booking ? <span className="spinner" /> : 'Request Appointment'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Your Appointments</h3>
        {appointments === null && <Loading />}
        {appointments?.length === 0 && <Empty label="No appointments booked yet." />}
        {appointments?.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Provider</th><th>Type</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.provider_name}</td>
                    <td>{a.provider_role}</td>
                    <td>{new Date(a.appointment_date).toLocaleDateString()}</td>
                    <td>{a.appointment_time}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      {['PENDING', 'CONFIRMED'].includes(a.status) && (
                        <button className="btn btn-outline btn-sm" onClick={() => handleCancel(a.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
