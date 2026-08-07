import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

export default function ProfilePage() {
  const { user, updateUserLocal } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', skin_type: user.skin_type || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const { data } = await api.put('/auth/me', form);
      updateUserLocal(data.user);
      setMsg('Profile updated successfully.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    try {
      await api.put('/auth/change-password', pwForm);
      setPwMsg('Password updated successfully.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Password update failed.');
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Edit Profile</h3>
        {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
        <form onSubmit={handleSave}>
          <div className="field">
            <label>Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={user.email} disabled />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
          </div>
          <div className="field">
            <label>Skin type</label>
            <select value={form.skin_type} onChange={(e) => setForm({ ...form, skin_type: e.target.value })}>
              <option value="">Not sure yet</option>
              {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      {user.provider === 'LOCAL' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Change Password</h3>
          {pwMsg && <div className={`alert ${pwMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>{pwMsg}</div>}
          <form onSubmit={handlePasswordChange}>
            <div className="field">
              <label>Current password</label>
              <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" minLength={6} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
            </div>
            <button className="btn btn-secondary">Update Password</button>
          </form>
        </div>
      )}
    </div>
  );
}
