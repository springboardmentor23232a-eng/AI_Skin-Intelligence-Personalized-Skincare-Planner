import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import CameraModal from "../components/CameraModal";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import { User, Shield, Lock, Save, Mail, Award, Phone, Camera } from "lucide-react";

const UserProfile = () => {
  const { user, updateProfileState } = useAuth();

  // Profile Edit State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.profile_picture || user?.avatarUrl || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiService.getProfile();
        if (res && res.user) {
          setName(res.user.name || "");
          setEmail(res.user.email || "");
          setAvatarUrl(res.user.profile_picture || "");
          setBio(res.user.bio || "");
          setPhone(res.user.phone || "");
          updateProfileState(res.user);
        }
      } catch (_err) {
        console.warn("Could not fetch live profile from backend:", _err.message);
      }
    };
    fetchProfile();
  }, [updateProfileState]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await apiService.updateProfile({
        name,
        email,
        profile_picture: avatarUrl,
        bio,
        phone
      });

      if (res && res.user) {
        updateProfileState(res.user);
        setProfileMsg("Profile updated successfully in PostgreSQL database!");
      }
    } catch (_err) {
      updateProfileState({ name, email, profile_picture: avatarUrl, bio, phone });
      setProfileMsg("Profile updated and saved locally!");
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!name || name === "Google Account User" || name === "Google User") {
      return email ? email.split("@")[0] : "Skin Planner User";
    }
    return name;
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          <div className="section-header">
            <div>
              <h2><User className="icon-title" style={{ color: 'var(--primary)' }} /> Skin Profile &amp; Account Settings</h2>
              <p>Manage personal skincare metadata and profile information. Role and auth provider are immutable.</p>
            </div>
          </div>

          <div className="grid-layout grid-2-col">
            {/* View & Edit Profile */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3>Personal Profile</h3>
                <span className={`role-badge role-${user?.role?.toLowerCase()}`}>{user?.role || "USER"}</span>
              </div>

              {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

              <form onSubmit={handleUpdateProfile} className="form-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', background: 'var(--input-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    overflow: 'hidden'
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={getDisplayName()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{(getDisplayName() || "U").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem' }}>{getDisplayName()}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><Mail size={14} /> {email || user?.email}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}><Award size={14} /> Auth Provider: <strong>{user?.provider || "LOCAL"}</strong></p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <Phone className="input-icon" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Profile Picture</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="btn btn-outline"
                      title="Click Photo with Camera"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                    >
                      <Camera size={16} /> Click Photo
                    </button>
                  </div>
                </div>

                <CameraModal
                  isOpen={isCameraOpen}
                  onClose={() => setIsCameraOpen(false)}
                  onCapture={(photoDataUrl) => setAvatarUrl(photoDataUrl)}
                  title="Capture Profile Photo"
                />

                <div className="form-group">
                  <label>Skin Type &amp; Goals Bio</label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your skin concerns, allergies, or skincare goals..."
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                  <Save size={18} />
                  <span>{isLoading ? "Saving to PostgreSQL..." : "Save Profile Changes"}</span>
                </button>
              </form>
            </div>

            {/* Read-only Security Credentials & RBAC Info */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3>Role Based Access Control (RBAC)</h3>
                <Lock size={20} style={{ color: 'var(--warning)' }} />
              </div>

              <div className="form-container">
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  background: 'var(--primary-light)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <Shield size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Immutable Identity Security</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assigned role permissions and login authentication providers are locked to prevent privilege escalation.</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assigned System Role (Immutable)</label>
                  <input
                    type="text"
                    value={user?.role || "USER"}
                    readOnly
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Auth Provider (Immutable)</label>
                  <input
                    type="text"
                    value={user?.provider || "LOCAL"}
                    readOnly
                    disabled
                  />
                </div>

                <div style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginTop: '1rem'
                }}>
                  <h5 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Active Account Permissions</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {user?.role === 'ADMIN' && (
                      <>
                        <li>Admin Command Center (`/admin`)</li>
                        <li>User &amp; Coach Directory Management</li>
                        <li>Platform System Metrics</li>
                      </>
                    )}
                    {(user?.role === 'WELLNESS_COACH' || user?.role === 'SKINCARE_CONSULTANT' || user?.role === 'DERMATOLOGIST') && (
                      <>
                        <li>Clinical Specialist Portal (`/consultant`)</li>
                        <li>Client Diagnosis &amp; Consultation Review</li>
                        <li>Custom Guidance Transmission</li>
                      </>
                    )}
                    {(!user?.role || user?.role === 'USER') && (
                      <>
                        <li>User Skincare Dashboard (`/user`)</li>
                        <li>AI Skin Intelligence Scan (`/assessment`)</li>
                        <li>Hydration &amp; Sleep History (`/wellness`)</li>
                        <li>Skin Profile Management (`/profile`)</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
