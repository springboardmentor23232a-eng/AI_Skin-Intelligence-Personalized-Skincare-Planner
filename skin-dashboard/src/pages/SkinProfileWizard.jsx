import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { Edit3, Trash2, Droplets, Moon, Sun, Thermometer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="p-4 space-y-4">
          <Skeleton height="40px" width="300px" />
          <Skeleton height="300px" width="100%" />
        </div>
      </Layout>
    );
  }

  // Profile View Mode
  if (profile && !isEditing) {
    return (
      <Layout>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">Skin Profile</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">Registered dermatological and lifestyle parameters</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-all"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 rounded-xl shadow-2xs transition-all"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Demographics & Physiology</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60 text-xs">
                <span className="text-slate-500">Full Name</span>
                <strong className="text-slate-900 dark:text-slate-100">{profile.full_name}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60 text-xs">
                <span className="text-slate-500">Age & Gender</span>
                <strong className="text-slate-900 dark:text-slate-100">{profile.age} yrs • {profile.gender}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60 text-xs">
                <span className="text-slate-500">Skin Type</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">{profile.skin_type}</span>
              </div>
              <div className="flex justify-between py-2 text-xs">
                <span className="text-slate-500">Skin Tone</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">{profile.skin_tone}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Concerns & Sensitivities</h3>
            <div className="mb-4">
              <span className="text-xs text-slate-500 block mb-2">Target Concerns:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.concerns && profile.concerns.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">{c}</span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500 block">Allergies:</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-2">{profile.allergies || "None reported"}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500 block">Sensitivities:</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-0">{profile.sensitivities || "None reported"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Lifestyle & Environment</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                <Droplets size={16} />
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">Daily Water</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{profile.water_intake} L</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                <Moon size={16} />
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">Sleep Quality</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{profile.sleep_quality}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                <Sun size={16} />
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">UV Exposure</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{profile.uv_exposure}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Thermometer size={16} />
              </div>
              <span className="text-[11px] text-slate-400 font-semibold block">Climate</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{profile.climate}</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Wizard Setup Form Mode
  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="max-w-xl mx-auto py-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            {profile ? "Edit Skin Profile" : "Skin Profile Setup Wizard"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Provide your dermatological and environmental factors to tailor your AI assessment</p>
        </div>

        {/* Stepper Steps */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                step === s
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : step > s
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xl"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Step 1: Basic Demographics</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Age</label>
                    <input
                      type="number"
                      className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                    <select
                      className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
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

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
                    onClick={() => setStep(2)}
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Step 2: Skin Physiology & Concerns</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Skin Type</label>
                    <select
                      className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Skin Tone</label>
                    <select
                      className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
                      value={formData.skin_tone}
                      onChange={(e) => setFormData({ ...formData, skin_tone: e.target.value })}
                    >
                      <option value="Fair">Fair / Type I-II</option>
                      <option value="Medium">Medium / Type III-IV</option>
                      <option value="Deep">Deep / Type V-VI</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Concerns (Multi-Select)</label>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_CONCERNS_OPTIONS.map((c) => {
                      const selected = formData.concerns.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                            selected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                          onClick={() => handleConcernToggle(c)}
                        >
                          {selected ? "✓ " : "+ "}{c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Known Product Allergies</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Fragrance, Sulfates, Parabens"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
                    onClick={() => setStep(3)}
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Step 3: Lifestyle & Environment</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Daily Water Intake (Liters)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
                      value={formData.water_intake}
                      onChange={(e) => setFormData({ ...formData, water_intake: parseFloat(e.target.value) || 2.0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sleep Quality</label>
                    <select
                      className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
                      value={formData.sleep_quality}
                      onChange={(e) => setFormData({ ...formData, sleep_quality: e.target.value })}
                    >
                      <option value="8+ Hours">8+ Hours (Restful)</option>
                      <option value="7-8 Hours">7-8 Hours (Average)</option>
                      <option value="<6 Hours">&lt; 6 Hours (Deficit)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Climate</label>
                    <select
                      className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
                      value={formData.climate}
                      onChange={(e) => setFormData({ ...formData, climate: e.target.value })}
                    >
                      <option value="Temperate">Temperate</option>
                      <option value="Humid / Tropical">Humid / Tropical</option>
                      <option value="Dry / Arid">Dry / Arid</option>
                      <option value="Cold / Alpine">Cold / Alpine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">UV Exposure</label>
                    <select
                      className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all"
                      value={formData.uv_exposure}
                      onChange={(e) => setFormData({ ...formData, uv_exposure: e.target.value })}
                    >
                      <option value="Low (Indoor)">Low (Indoor)</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High (Outdoor)">High (Outdoor)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </Layout>
  );
}

export default SkinProfileWizard;
