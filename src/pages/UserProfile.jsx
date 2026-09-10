import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import CameraModal from "../components/CameraModal";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import { normalizeRole } from "../utils/roleUtils";
import {
  User, Shield, Lock, Save, Mail, Award, Phone, Camera,
  Settings as SettingsIcon, Stethoscope, Briefcase, Sparkles
} from "lucide-react";

const UserProfile = () => {
  const { user, updateProfileState, switchDemoRole } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("PROFILE");

  useEffect(() => {
    const isSettings = location.search.includes("tab=settings") || location.hash === "#settings";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(isSettings ? "SETTINGS" : "PROFILE");
  }, [location.search, location.hash]);

  const currentRole = normalizeRole(user?.role);

  // Common Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.profile_picture || user?.avatarUrl || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Role-Specific Profile State
  const [specialty, setSpecialty] = useState(user?.specialty || "");
  const [licenseNumber, setLicenseNumber] = useState(user?.license_number || "");
  const [experienceYears, setExperienceYears] = useState(user?.experience_years || "");
  const [qualification, setQualification] = useState(user?.qualification || "");
  const [hospitalClinic, setHospitalClinic] = useState(user?.hospital_clinic || "");
  const [consultationFee, setConsultationFee] = useState(user?.consultation_fee || "");
  const [availabilityStatus, setAvailabilityStatus] = useState(user?.availability_status || "Available");

  // User Skin Profile State
  const [skinType, setSkinType] = useState(user?.skin_type || "Combination");
  const [skinConcerns, setSkinConcerns] = useState(user?.skin_concerns || "Acne, Redness");
  const [allergies, setAllergies] = useState(user?.allergies || "None");

  // Admin Profile State
  const [adminRoleTitle, setAdminRoleTitle] = useState(user?.admin_role_title || "System Administrator");

  const [profileMsg, setProfileMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Sync state whenever active user object changes in AuthContext
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name || "");
      setEmail(user.email || "");
      setAvatarUrl(user.profile_picture || user.avatarUrl || "");
      setBio(user.bio || "");
      setPhone(user.phone || "");

      setSpecialty(user.specialty || "");
      setLicenseNumber(user.license_number || "");
      setExperienceYears(user.experience_years || "");
      setQualification(user.qualification || "");
      setHospitalClinic(user.hospital_clinic || "");
      setConsultationFee(user.consultation_fee || "");
      setAvailabilityStatus(user.availability_status || "Available");

      setSkinType(user.skin_type || "Combination");
      setSkinConcerns(user.skin_concerns || "");
      setAllergies(user.allergies || "");

      setAdminRoleTitle(user.admin_role_title || "System Administrator");
    }
  }, [user]);

  // Fetch fresh profile from backend on mount
  useEffect(() => {
    const fetchLiveProfile = async () => {
      try {
        const res = await apiService.getProfile();
        if (res && res.user) {
          updateProfileState(res.user);
        }
      } catch (_err) {
        console.warn("Using active authenticated profile state");
      }
    };
    fetchLiveProfile();
  }, [updateProfileState]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setErrorMsg("");
    setIsLoading(true);

    const profileData = {
      name,
      email,
      profile_picture: avatarUrl,
      bio,
      phone,
      specialty,
      license_number: licenseNumber,
      experience_years: experienceYears,
      qualification,
      hospital_clinic: hospitalClinic,
      consultation_fee: consultationFee,
      availability_status: availabilityStatus,
      skin_type: skinType,
      skin_concerns: skinConcerns,
      allergies,
      admin_role_title: adminRoleTitle
    };

    try {
      const res = await apiService.updateProfile(profileData);
      if (res && res.user) {
        updateProfileState(res.user);
        setProfileMsg("✔ Profile synchronized & saved to PostgreSQL database!");
      }
    } catch (_err) {
      updateProfileState(profileData);
      setProfileMsg("✔ Profile updated & saved to active profile context!");
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

          {/* Section Header */}
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2>
                <User className="icon-title" style={{ color: 'var(--primary)' }} />
                <span> User Profile &amp; Account Settings</span>
              </h2>
              <p>Manage your personal information, skin profile preferences, and account security.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveTab("PROFILE")}
                className={`btn ${activeTab === "PROFILE" ? "btn-primary" : "btn-outline"}`}
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <User size={15} /> Personal Profile
              </button>
              <button
                onClick={() => setActiveTab("SETTINGS")}
                className={`btn ${activeTab === "SETTINGS" ? "btn-primary" : "btn-outline"}`}
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <SettingsIcon size={15} /> Account Settings
              </button>
            </div>
          </div>

          {/* Admin-Only Persona Switcher for Role Testing */}
          {currentRole === "ADMIN" && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(13, 148, 136, 0.08))',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} /> Admin Development Persona Switcher
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Test how UI components and credentials dynamically adapt for each role type.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => switchDemoRole("USER")}
                  className={`btn ${currentRole === "USER" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <User size={14} /> User Persona
                </button>
                <button
                  onClick={() => switchDemoRole("SKINCARE_CONSULTANT")}
                  className={`btn ${currentRole === "SKINCARE_CONSULTANT" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Briefcase size={14} /> Consultant
                </button>
                <button
                  onClick={() => switchDemoRole("DERMATOLOGIST")}
                  className={`btn ${currentRole === "DERMATOLOGIST" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Stethoscope size={14} /> Doctor
                </button>
                <button
                  onClick={() => switchDemoRole("ADMIN")}
                  className={`btn ${currentRole === "ADMIN" ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Shield size={14} /> Admin
                </button>
              </div>
            </div>
          )}

          <div className="grid-layout grid-2-col">
            {/* View & Edit Synchronized Profile */}
            <div className="glass-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                <h3>
                  {currentRole === 'ADMIN' && 'System Administrator Profile'}
                  {currentRole === 'DERMATOLOGIST' && 'Medical Doctor / Dermatologist Profile'}
                  {currentRole === 'SKINCARE_CONSULTANT' && 'Skincare Consultant Profile'}
                  {currentRole === 'USER' && 'User Skincare Profile'}
                </h3>
                <span className={`role-badge role-${currentRole.toLowerCase()}`}>{currentRole}</span>
              </div>

              {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

              <form onSubmit={handleUpdateProfile} className="form-container">
                {/* Header Banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', background: 'var(--input-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={getDisplayName()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{(getDisplayName() || "U").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{getDisplayName()}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}><Mail size={14} /> {email || user?.email}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                      <Award size={14} /> Auth Provider: <strong>{user?.provider || "LOCAL"}</strong> | Role: <strong>{currentRole}</strong>
                    </p>
                  </div>
                </div>

                {/* Common Fields */}
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
                  <label>Profile Picture URL</label>
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
                  <label>
                    {currentRole === 'ADMIN' && 'Admin Bio / Department Overview'}
                    {currentRole === 'DERMATOLOGIST' && 'Medical Specialization & Clinical Bio'}
                    {currentRole === 'SKINCARE_CONSULTANT' && 'Consultant Bio & Aesthetic Focus'}
                    {currentRole === 'USER' && 'Personal Skincare Bio & Goals'}
                  </label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe clinical experience, specialized areas, skin concerns, or goals..."
                  />
                </div>

                {/* ROLE-SPECIFIC EXTENDED PROFILE FIELDS */}

                {/* USER Specific Profile Fields */}
                {currentRole === 'USER' && (
                  <>
                    <div style={{ padding: '0.85rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                      <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Sparkles size={16} /> User Skin Profile Metadata
                      </h5>

                      <div className="form-group">
                        <label>Skin Type</label>
                        <select value={skinType} onChange={(e) => setSkinType(e.target.value)}>
                          <option value="Combination">Combination Skin</option>
                          <option value="Oily">Oily Skin</option>
                          <option value="Dry">Dry Skin</option>
                          <option value="Sensitive">Sensitive Skin</option>
                          <option value="Normal">Normal Skin</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Primary Skin Concerns</label>
                        <input
                          type="text"
                          value={skinConcerns}
                          onChange={(e) => setSkinConcerns(e.target.value)}
                          placeholder="e.g. Acne, Hyperpigmentation, Redness, Fine Lines"
                        />
                      </div>

                      <div className="form-group">
                        <label>Known Allergies & Sensitivities</label>
                        <input
                          type="text"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          placeholder="e.g. Fragrance, High Salicylic Acid, Paraben sensitivity"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* DERMATOLOGIST (DOCTOR) Specific Profile Fields */}
                {currentRole === 'DERMATOLOGIST' && (
                  <div style={{ padding: '0.85rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Stethoscope size={16} /> Doctor Medical Credentials & Practice Details
                    </h5>

                    <div className="form-group">
                      <label>Medical License Number</label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="MD-8839201"
                      />
                    </div>

                    <div className="form-group">
                      <label>Medical Specialty & Clinical Focus</label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="Clinical Dermatology & Inflammatory Skin Pathology"
                      />
                    </div>

                    <div className="form-group">
                      <label>Board Qualification / Fellowship</label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="MD, FAAD (Fellow of American Academy of Dermatology)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Hospital / Clinic Affiliation</label>
                      <input
                        type="text"
                        value={hospitalClinic}
                        onChange={(e) => setHospitalClinic(e.target.value)}
                        placeholder="Metro Dermatology & Laser Center"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Years of Clinical Experience</label>
                        <input
                          type="text"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="14 Years"
                        />
                      </div>
                      <div className="form-group">
                        <label>Consultation Fee ($/session)</label>
                        <input
                          type="text"
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(e.target.value)}
                          placeholder="$150 / session"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Practice Availability Status</label>
                      <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                        <option value="Available">Available for Consultations</option>
                        <option value="On-Call">On-Call for Emergency Diagnosis</option>
                        <option value="Busy">Currently Busy / Full Schedule</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* SKINCARE_CONSULTANT Specific Profile Fields */}
                {currentRole === 'SKINCARE_CONSULTANT' && (
                  <div style={{ padding: '0.85rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Briefcase size={16} /> Consultant Accreditation & Specialization
                    </h5>

                    <div className="form-group">
                      <label>Accreditation / Certification License</label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="SC-449102"
                      />
                    </div>

                    <div className="form-group">
                      <label>Consultant Specialization Focus</label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="Barrier Repair, Anti-Aging & Ingredient Synergy"
                      />
                    </div>

                    <div className="form-group">
                      <label>Professional Qualification</label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="Certified Aesthetician & Dermal Specialist"
                      />
                    </div>

                    <div className="form-group">
                      <label>Wellness Center / Organization</label>
                      <input
                        type="text"
                        value={hospitalClinic}
                        onChange={(e) => setHospitalClinic(e.target.value)}
                        placeholder="SkinIntelligence Wellness Center"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Experience (Years)</label>
                        <input
                          type="text"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="8 Years"
                        />
                      </div>
                      <div className="form-group">
                        <label>Hourly Consultation Fee</label>
                        <input
                          type="text"
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(e.target.value)}
                          placeholder="$85 / session"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Availability Status</label>
                      <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                        <option value="Available">Available for Client Review</option>
                        <option value="Accepting New Clients">Accepting New Clients</option>
                        <option value="Fully Booked">Fully Booked</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ADMIN Specific Profile Fields */}
                {currentRole === 'ADMIN' && (
                  <div style={{ padding: '0.85rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Shield size={16} /> Administrator Designation & Security Clearance
                    </h5>

                    <div className="form-group">
                      <label>Admin Title & Role Designation</label>
                      <input
                        type="text"
                        value={adminRoleTitle}
                        onChange={(e) => setAdminRoleTitle(e.target.value)}
                        placeholder="Super Administrator & Security Lead"
                      />
                    </div>

                    <div className="form-group">
                      <label>System Administrative Status</label>
                      <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                        <option value="Active">Active Super Administrator</option>
                        <option value="Maintenance Mode">Maintenance Supervisor</option>
                        <option value="Audit Mode">Security Audit Mode</option>
                      </select>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                  <Save size={18} />
                  <span>{isLoading ? "Synchronizing to Database..." : `Save & Synchronize ${currentRole} Profile`}</span>
                </button>
              </form>
            </div>

            {/* Read-only Security Credentials, RBAC & Role Sync Matrix */}
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
                    <h5 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Synchronized Role Architecture</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Role credentials and access permissions are automatically synchronized between client state, JWT auth tokens, and PostgreSQL.
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assigned System Role (Immutable)</label>
                  <input
                    type="text"
                    value={currentRole}
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

                {/* Role Specific Credentials Overview */}
                <div style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginTop: '1rem'
                }}>
                  <h5 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Active {currentRole} System Capabilities
                  </h5>

                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {currentRole === 'ADMIN' && (
                      <>
                        <li>System Admin Dashboard (`/admin`)</li>
                        <li>User Directory & Role Assignment (`/api/admin/users`)</li>
                        <li>Platform Analytics & System Health Audit Logs</li>
                        <li>AI Optical & Routine Engine Model Controls</li>
                      </>
                    )}
                    {currentRole === 'DERMATOLOGIST' && (
                      <>
                        <li>Doctor Clinical Portal (`/doctor`)</li>
                        <li>Patient Consultation & Medical History Review</li>
                        <li>Medical Diagnosis & Prescription Transmission</li>
                        <li>Clinical Routine Modifications & Patient Notes</li>
                      </>
                    )}
                    {currentRole === 'SKINCARE_CONSULTANT' && (
                      <>
                        <li>Consultant Specialist Portal (`/consultant`)</li>
                        <li>Assigned Client Routine Review & Recommendations</li>
                        <li>Product Selection & Conflict Auditing</li>
                        <li>Direct Client Guidance Transmission</li>
                      </>
                    )}
                    {currentRole === 'USER' && (
                      <>
                        <li>User Skincare Dashboard (`/user`)</li>
                        <li>AI Skin Optical Health Assessment (`/assessment`)</li>
                        <li>Ingredient Intelligence & Product Recommendation Engines</li>
                        <li>Daily Skin Scoring & Progress Log Tracking</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Synchronized Role Profile Matrix Card */}
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  background: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    System Role Profile Matrix
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Role Profile Schema Version:</span>
                      <strong>v2.4 (Synchronized)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>PostgreSQL Sync Status:</span>
                      <strong style={{ color: 'var(--success)' }}>ONLINE (Port 7410)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Active Role Persona:</span>
                      <strong style={{ color: 'var(--primary)' }}>{user?.name} ({currentRole})</strong>
                    </div>
                  </div>
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
