import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";

const SKIN_CONCERNS_OPTIONS = [
  "Acne / Breakouts",
  "Hyperpigmentation",
  "Dryness & Dehydration",
  "Oiliness & Enlarged Pores",
  "Redness & Rosacea",
  "Sensitivity",
  "Fine Lines & Wrinkles",
  "Dark Spots",
  "Uneven Texture"
];

function SkinProfileWizard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [formData, setFormData] = useState({
    full_name: "",
    age: 25,
    gender: "Female",
    skin_type: "Combination",
    skin_tone: "Medium",
    concerns: ["Acne / Breakouts", "Hyperpigmentation"],
    allergies: "",
    sensitivities: "",
    lifestyle: "Moderate Activity",
    sleep_quality: "7-8 Hours",
    water_intake: 2.5,
    stress_level: "Moderate",
    environmental_exposure: "Urban",
    climate: "Temperate",
    uv_exposure: "Moderate"
  });

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const data = await apiService.getProfile();
        if (isMounted) {
          setProfile(data);
          setFormData({
            full_name: data.full_name,
            age: data.age,
            gender: data.gender,
            skin_type: data.skin_type,
            skin_tone: data.skin_tone,
            concerns: data.concerns || [],
            allergies: data.allergies || "",
            sensitivities: data.sensitivities || "",
            lifestyle: data.lifestyle || "Moderate Activity",
            sleep_quality: data.sleep_quality || "7-8 Hours",
            water_intake: data.water_intake || 2.5,
            stress_level: data.stress_level || "Moderate",
            environmental_exposure: data.environmental_exposure || "Urban",
            climate: data.climate || "Temperate",
            uv_exposure: data.uv_exposure || "Moderate"
          });
        }
      } catch {
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  const handleConcernToggle = (concern) => {
    setFormData((prev) => {
      const exists = prev.concerns.includes(concern);
      if (exists) {
        return { ...prev, concerns: prev.concerns.filter((c) => c !== concern) };
      } else {
        return { ...prev, concerns: [...prev.concerns, concern] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile && isEditing) {
        const updated = await apiService.updateProfile(formData);
        setProfile(updated);
        setIsEditing(false);
        setToast({ message: "Skin profile updated successfully!", type: "success" });
      } else {
        const created = await apiService.createProfile(formData);
        setProfile(created);
        setIsEditing(false);
        setToast({ message: "Skin profile created successfully!", type: "success" });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Failed to save skin profile", type: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your skin profile?")) return;
    try {
      await apiService.deleteProfile();
      setProfile(null);
      setIsEditing(false);
      setStep(1);
      setToast({ message: "Skin profile deleted", type: "info" });
    } catch {
      setToast({ message: "Failed to delete skin profile", type: "danger" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <Skeleton height="40px" width="300px" className="mb-3" />
          <Skeleton height="300px" width="100%" />
        </div>
      </Layout>
    );
  }

  // Profile View Mode (If profile exists and not editing)
  if (profile && !isEditing) {
    return (
      <Layout>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>Skin Profile Overview</h2>
            <p className="text-secondary small mb-0">Registered dermatological and lifestyle parameters in PostgreSQL</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-saas-secondary btn-sm" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
            <button className="btn btn-saas-danger btn-sm" onClick={handleDelete}>
              🗑️ Delete Profile
            </button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="saas-card h-100">
              <h5 className="saas-card-title mb-3">Demographics & Physiology</h5>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-secondary">Full Name:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{profile.full_name}</strong>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-secondary">Age & Gender:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{profile.age} yrs • {profile.gender}</strong>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-secondary">Skin Type:</span>
                  <span className="badge badge-saas badge-saas-primary">{profile.skin_type}</span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-secondary">Skin Tone:</span>
                  <span className="badge badge-saas badge-saas-info">{profile.skin_tone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="saas-card h-100">
              <h5 className="saas-card-title mb-3">Concerns & Sensitivities</h5>
              <div className="mb-3">
                <span className="text-secondary small d-block mb-2">Target Concerns:</span>
                <div className="d-flex flex-wrap gap-2">
                  {profile.concerns && profile.concerns.map((c, i) => (
                    <span key={i} className="badge badge-saas badge-saas-warning">{c}</span>
                  ))}
                </div>
              </div>
              <div className="py-2 border-top">
                <span className="text-secondary small">Allergies:</span>
                <p className="mb-0 fw-semibold" style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                  {profile.allergies || "None reported"}
                </p>
              </div>
              <div className="py-2 border-top">
                <span className="text-secondary small">Sensitivities:</span>
                <p className="mb-0 fw-semibold" style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                  {profile.sensitivities || "None reported"}
                </p>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="saas-card">
              <h5 className="saas-card-title mb-3">Lifestyle & Environment</h5>
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon-wrapper">💧</div>
                    <div className="stat-info">
                      <span className="stat-label">Daily Water</span>
                      <span className="stat-value">{profile.water_intake} L</span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon-wrapper">😴</div>
                    <div className="stat-info">
                      <span className="stat-label">Sleep Quality</span>
                      <span className="stat-value">{profile.sleep_quality}</span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon-wrapper">☀️</div>
                    <div className="stat-info">
                      <span className="stat-label">UV Exposure</span>
                      <span className="stat-value">{profile.uv_exposure}</span>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="stat-card">
                    <div className="stat-icon-wrapper">🌡️</div>
                    <div className="stat-info">
                      <span className="stat-label">Climate</span>
                      <span className="stat-value">{profile.climate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Wizard Stepper Form Mode (Creating / Editing)
  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="max-w-3xl mx-auto py-2">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {profile ? "Edit Skin Profile" : "Skin Profile Setup Wizard"}
          </h2>
          <p className="text-secondary small">Provide your dermatological and environmental factors to tailor your AI assessment</p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4 position-relative px-4">
          <div className="position-absolute top-50 start-0 end-0 translate-middle-y bg-secondary opacity-25" style={{ height: "2px", zIndex: 0 }} />
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              className={`rounded-circle d-flex align-items-center justify-content-center fw-bold border-0 position-relative z-1 ${
                step === s ? "btn-saas" : step > s ? "bg-success text-white" : "btn-saas-secondary"
              }`}
              style={{ width: "40px", height: "40px" }}
              onClick={() => setStep(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="saas-card shadow-lg p-4">
          {step === 1 && (
            <div>
              <h5 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>Step 1: Basic Demographics</h5>
              
              <div className="mb-3">
                <label className="form-label-saas">Full Name</label>
                <input
                  type="text"
                  className="form-control-saas"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label-saas">Age</label>
                  <input
                    type="number"
                    className="form-control-saas"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                    required
                    min="1"
                    max="120"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-saas">Gender</label>
                  <select
                    className="form-control-saas"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button type="button" className="btn btn-saas" onClick={() => setStep(2)}>
                  Next: Skin Type & Concerns →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h5 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>Step 2: Skin Physiology & Concerns</h5>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label-saas">Skin Type</label>
                  <select
                    className="form-control-saas"
                    value={formData.skin_type}
                    onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                  >
                    <option value="Oily">Oily</option>
                    <option value="Dry">Dry</option>
                    <option value="Combination">Combination</option>
                    <option value="Sensitive">Sensitive</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label-saas">Skin Tone</label>
                  <select
                    className="form-control-saas"
                    value={formData.skin_tone}
                    onChange={(e) => setFormData({ ...formData, skin_tone: e.target.value })}
                  >
                    <option value="Fair">Fair / Type I-II</option>
                    <option value="Medium">Medium / Type III-IV</option>
                    <option value="Deep">Deep / Type V-VI</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label-saas">Target Concerns (Multi-Select)</label>
                <div className="d-flex flex-wrap gap-2">
                  {SKIN_CONCERNS_OPTIONS.map((c) => {
                    const selected = formData.concerns.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`btn btn-sm ${selected ? 'btn-saas' : 'btn-saas-secondary'}`}
                        onClick={() => handleConcernToggle(c)}
                      >
                        {selected ? "✓ " : "+ "}{c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label-saas">Known Product Allergies</label>
                <input
                  type="text"
                  className="form-control-saas"
                  placeholder="e.g. Fragrance, Sulfates, Parabens"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button type="button" className="btn btn-saas-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="button" className="btn btn-saas" onClick={() => setStep(3)}>
                  Next: Lifestyle & Environment →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h5 className="fw-bold mb-3" style={{ color: "var(--text-primary)" }}>Step 3: Lifestyle & Environment</h5>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label-saas">Daily Water Intake (Liters)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control-saas"
                    value={formData.water_intake}
                    onChange={(e) => setFormData({ ...formData, water_intake: parseFloat(e.target.value) || 2.0 })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-saas">Sleep Quality</label>
                  <select
                    className="form-control-saas"
                    value={formData.sleep_quality}
                    onChange={(e) => setFormData({ ...formData, sleep_quality: e.target.value })}
                  >
                    <option value="8+ Hours">8+ Hours (Restful)</option>
                    <option value="7-8 Hours">7-8 Hours (Average)</option>
                    <option value="<6 Hours">&lt; 6 Hours (Deficit)</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label-saas">Climate</label>
                  <select
                    className="form-control-saas"
                    value={formData.climate}
                    onChange={(e) => setFormData({ ...formData, climate: e.target.value })}
                  >
                    <option value="Temperate">Temperate</option>
                    <option value="Humid / Tropical">Humid / Tropical</option>
                    <option value="Dry / Arid">Dry / Arid</option>
                    <option value="Cold / Alpine">Cold / Alpine</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label-saas">UV Exposure</label>
                  <select
                    className="form-control-saas"
                    value={formData.uv_exposure}
                    onChange={(e) => setFormData({ ...formData, uv_exposure: e.target.value })}
                  >
                    <option value="Low (Indoor)">Low (Indoor)</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High (Outdoor)">High (Outdoor)</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button type="button" className="btn btn-saas-secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-saas" disabled={saving}>
                  {saving ? "Saving to PostgreSQL..." : "Save Profile & Finish"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}

export default SkinProfileWizard;
