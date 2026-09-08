import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

/**
 * Shared profile page for all four roles (User, Doctor, Consultant,
 * Admin) — one component, one source of truth (GET/PUT /api/auth/me),
 * so shared fields (name, email, phone) are never duplicated per
 * dashboard. Role-specific sections only render for the role they
 * apply to: Skin type is USER-only; Specialization/Qualification/
 * Experience/Bio are DOCTOR/CONSULTANT-only (backend only persists
 * these to *that* role's own doctor_profiles/consultant_profiles row —
 * see authController.js). Admin sees just the shared identity fields.
 */
export default function ProfilePage() {
  const { user, updateUserLocal } = useAuth();
  const isDoctor = user.role === 'DOCTOR';
  const isConsultant = user.role === 'CONSULTANT';
  const isProfessional = isDoctor || isConsultant;

  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    skin_type: user.skin_type || '',
    specialization: '',
    qualification: '',
    experience_years: '',
    bio: '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingProfessional, setLoadingProfessional] = useState(isProfessional);

  useEffect(() => {
    if (!isProfessional) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (cancelled || !data.professional) return;
        setForm((f) => ({
          ...f,
          specialization: data.professional.specialization || '',
          qualification: data.professional.qualification || '',
          experience_years: data.professional.experience_years != null ? String(data.professional.experience_years) : '',
          bio: data.professional.bio || '',
        }));
      } catch {
        // Professional profile just stays blank if this fails — the rest of the page still works.
      } finally {
        if (!cancelled) setLoadingProfessional(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload = { name: form.name, phone: form.phone };
      if (!isProfessional) payload.skin_type = form.skin_type;
      if (isProfessional) {
        if (isDoctor) payload.qualification = form.qualification;
        payload.specialization = form.specialization;
        payload.experience_years = form.experience_years === '' ? null : Number(form.experience_years);
        payload.bio = form.bio;
      }
      const { data } = await api.put('/auth/me', payload);
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

        {loadingProfessional ? (
          <div style={{ textAlign: 'center', padding: 20 }}><span className="spinner" style={{ borderTopColor: '#2a8c82', borderColor: '#e2ebe9' }} /></div>
        ) : (
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

            {!isProfessional && (
              <div className="field">
                <label>Skin type</label>
                <select value={form.skin_type} onChange={(e) => setForm({ ...form, skin_type: e.target.value })}>
                  <option value="">Not sure yet</option>
                  {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            {isProfessional && (
              <>
                <hr className="divider" />
                <h4 style={{ marginBottom: 10 }}>Professional Information</h4>
                <div className="field">
                  <label>Specialization</label>
                  <input
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder={isDoctor ? 'e.g. Clinical Dermatology' : 'e.g. Skincare & Product Consulting'}
                  />
                </div>
                {isDoctor && (
                  <div className="field">
                    <label>Qualification</label>
                    <input
                      value={form.qualification}
                      onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                      placeholder="e.g. MBBS, MD (Dermatology)"
                    />
                  </div>
                )}
                <div className="field">
                  <label>Years of experience</label>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={form.experience_years}
                    onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Shown to users when they book an appointment with you."
                  />
                </div>
              </>
            )}

            <button className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </form>
        )}
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
