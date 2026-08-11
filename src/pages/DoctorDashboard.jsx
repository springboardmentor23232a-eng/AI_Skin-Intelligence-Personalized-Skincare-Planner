import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { apiService } from "../services/api";
import { Stethoscope, Users, Calendar, FileText, Activity, Pill, Send, CheckCircle, Clock, AlertTriangle, Sparkles, Edit3 } from "lucide-react";

const DoctorDashboard = () => {
  const location = useLocation();
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [activeTab, setActiveTab] = useState("DIAGNOSIS"); // DIAGNOSIS | PRESCRIPTION | TREATMENT | ROUTINE

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const el = document.getElementById(targetId) || document.getElementById(targetId === "patient-consultations" ? "patients" : targetId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);

  const [diagnosisNote, setDiagnosisNote] = useState("");
  const [prescriptionItem, setPrescriptionItem] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Patient Routine State for Doctors
  const [patientRoutine, setPatientRoutine] = useState(null);
  const [loadingRoutine, setLoadingRoutine] = useState(false);
  const [editingStepId, setEditingStepId] = useState(null);
  const [docStepNotes, setDocStepNotes] = useState("");
  const [docStepIng, setDocStepIng] = useState("");

  const parseNotes = (rawNotes) => {
    if (!rawNotes) {
      setDiagnosisNote("");
      setPrescriptionItem("");
      setTreatmentPlan("");
      return;
    }
    setDiagnosisNote(rawNotes);
  };

  const fetchDoctorAssessments = async () => {
    try {
      const data = await apiService.getAssessments();
      if (Array.isArray(data)) {
        setAssessments(data);
        if (data.length > 0 && !selectedAssessment) {
          setSelectedAssessment(data[0]);
          parseNotes(data[0].notes);
        }
      }
    } catch (err) {
      console.warn("Failed to load assessments in doctor portal:", err);
    }
  };

  const fetchPatientRoutineData = async (userId) => {
    if (!userId) return;
    setLoadingRoutine(true);
    try {
      const routineRes = await apiService.getPatientRoutine(userId);
      setPatientRoutine(routineRes);
    } catch (err) {
      console.warn("Failed to fetch patient routine:", err);
    } finally {
      setLoadingRoutine(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDoctorAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = selectedAssessment || (assessments.length > 0 ? assessments[0] : null);

  useEffect(() => {
    if (active?.user_id && activeTab === "ROUTINE") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPatientRoutineData(active.user_id);
    }
  }, [active?.user_id, activeTab]);

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg("");
    }, 3500);
  };

  const handleSaveMedicalReport = async (e) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    setSubmitting(true);
    try {
      const combinedNotes = `[DIAGNOSIS]: ${diagnosisNote}\n[PRESCRIPTION]: ${prescriptionItem}\n[TREATMENT NOTES]: ${treatmentPlan}`;
      const updated = await apiService.updateAssessment(selectedAssessment.id, {
        notes: combinedNotes
      });
      showNotification(`✔ Clinical diagnosis & medical prescription saved for Assessment #${selectedAssessment.id}!`);
      setSelectedAssessment(updated);
      await fetchDoctorAssessments();
    } catch (err) {
      showNotification(`❌ Error: ${err?.detail || err?.message || 'Failed to save clinical report'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveStepOverride = async (stepId) => {
    try {
      await apiService.updateRoutineStep(stepId, {
        doctor_notes: docStepNotes,
        recommended_ingredient: docStepIng
      });
      showNotification(`✔ Clinical notes & ingredient recommendation saved for routine step #${stepId}!`);
      setEditingStepId(null);
      if (active?.user_id) fetchPatientRoutineData(active.user_id);
    } catch (err) {
      showNotification(`❌ Error updating step: ${err?.detail || err?.message}`);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Floating Toast Notification */}
      {notificationMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--primary)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.88rem',
          fontWeight: 700,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle size={18} /> <span>{notificationMsg}</span>
        </div>
      )}

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          {/* Section Header */}
          <div id="overview" className="section-header">
            <div>
              <h2>
                <Stethoscope className="icon-title" style={{ color: 'var(--accent)' }} /> Dermatologist Clinical Center
              </h2>
              <p>Review patient optical scans, formulate medical diagnoses, issue digital prescriptions, and customize routines.</p>
            </div>
            <span className="role-badge role-dermatologist" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <Stethoscope size={14} /> DERMATOLOGIST Authorized
            </span>
          </div>

          {/* Top Quick Stats */}
          <div className="grid-layout grid-4-col" style={{ marginBottom: '1.75rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PATIENT QUEUE</span>
                <Users size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{assessments.length} Patients</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clinical Assessment Queue</small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE PATIENT</span>
                <Calendar size={18} style={{ color: 'var(--warning)' }} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>User #{active?.user_id || 'N/A'}</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>Score: {active?.skin_health_score || 0}/100</small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>FLAGGED RISKS</span>
                <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{active?.risks?.length || 0} Factors</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>High Priority</small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>ROUTINE PLANS</span>
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Active</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Routine Engine</small>
            </div>
          </div>

          {/* Main 2-Column Clinical Workbench */}
          <div className="grid-layout grid-3-col">
            
            {/* Left Column: Patient List & Assessments */}
            <div id="patients" className="glass-card span-1">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Patient Assessments</h3>
                <Users size={18} />
              </div>

              <div className="client-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {assessments.length > 0 ? (
                  assessments.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setSelectedAssessment(a);
                        parseNotes(a.notes);
                        if (activeTab === "ROUTINE") fetchPatientRoutineData(a.user_id);
                      }}
                      style={{
                        background: active?.id === a.id ? 'var(--primary-light)' : 'var(--input-bg)',
                        border: '1px solid var(--border-color)',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem', fontWeight: 700 }}>Assessment #{a.id}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>User ID: {a.user_id}</p>
                        <small style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                          <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> {new Date(a.assessment_date).toLocaleDateString()}
                        </small>
                      </div>
                      <span className="jwt-status-chip" style={{ fontWeight: 800 }}>{a.skin_health_score} AI Score</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    No patient assessments found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Medical History, Diagnosis & Routine Management */}
            <div className="glass-card span-2">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Medical Record &amp; Clinical Management</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Assessment: <strong>#{active?.id || 'N/A'}</strong> • User ID: <strong>{active?.user_id || 'N/A'}</strong> • Condition: <strong>{active?.overall_condition || 'N/A'}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab("DIAGNOSIS")}
                    className={`btn ${activeTab === "DIAGNOSIS" ? "btn-primary" : "btn-outline"}`}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    <FileText size={14} /> Diagnosis
                  </button>
                  <button
                    onClick={() => setActiveTab("PRESCRIPTION")}
                    className={`btn ${activeTab === "PRESCRIPTION" ? "btn-primary" : "btn-outline"}`}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    <Pill size={14} /> Prescription
                  </button>
                  <button
                    onClick={() => setActiveTab("TREATMENT")}
                    className={`btn ${activeTab === "TREATMENT" ? "btn-primary" : "btn-outline"}`}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    <Activity size={14} /> Treatment
                  </button>
                  <button
                    onClick={() => setActiveTab("ROUTINE")}
                    className={`btn ${activeTab === "ROUTINE" ? "btn-primary" : "btn-outline"}`}
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    <Sparkles size={14} /> Patient Routine
                  </button>
                </div>
              </div>

              {active ? (
                <div>
                  {activeTab !== "ROUTINE" && (
                    <>
                      {/* Risk Factor Analysis Box */}
                      <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            Risk Analysis ({active.risks?.length || 0} Factors)
                          </h4>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          {active.risks?.map((r, idx) => (
                            <div key={idx} style={{ padding: '0.45rem 0.65rem', background: 'var(--card-bg)', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{r.risk_name} [{r.risk_level}]:</strong> {r.description}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Medical Report Form */}
                      <form onSubmit={handleSaveMedicalReport} className="form-container">
                        {activeTab === "DIAGNOSIS" && (
                          <div className="form-group">
                            <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Clinical Diagnosis Notes</label>
                            <textarea
                              rows="5"
                              value={diagnosisNote}
                              onChange={(e) => setDiagnosisNote(e.target.value)}
                              placeholder="Enter detailed clinical observations and dermatological diagnostic findings..."
                              required
                            />
                          </div>
                        )}

                        {activeTab === "PRESCRIPTION" && (
                          <div className="form-group">
                            <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Prescribed Medical Products &amp; Topical Treatments</label>
                            <textarea
                              rows="5"
                              value={prescriptionItem}
                              onChange={(e) => setPrescriptionItem(e.target.value)}
                              placeholder="Specify prescription medications (e.g., Tretinoin 0.025%, Clindamycin 1% gel)..."
                              required
                            />
                          </div>
                        )}

                        {activeTab === "TREATMENT" && (
                          <div className="form-group">
                            <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Long-Term Clinical Treatment Plan &amp; Advice</label>
                            <textarea
                              rows="5"
                              value={treatmentPlan}
                              onChange={(e) => setTreatmentPlan(e.target.value)}
                              placeholder="Enter lifestyle instructions, skincare routines, and scheduled clinical procedures..."
                              required
                            />
                          </div>
                        )}

                        <button type="submit" disabled={submitting} className="btn btn-primary btn-block" style={{ marginTop: '1rem', padding: '0.6rem' }}>
                          <Send size={16} /> <span>{submitting ? "Saving..." : "Save Medical Report & Transmit"}</span>
                        </button>
                      </form>
                    </>
                  )}

                  {/* TAB: ROUTINE MANAGEMENT FOR DOCTORS */}
                  {activeTab === "ROUTINE" && (
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={16} className="text-primary" /> Patient Skincare Routine Customization
                      </h4>

                      {loadingRoutine ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          Loading patient routines...
                        </div>
                      ) : patientRoutine ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
                          {['morning_routine', 'evening_routine', 'weekly_treatment', 'seasonal_recommendations'].map((grpKey) => {
                            const stepsList = patientRoutine[grpKey] || [];
                            const title = grpKey.replace('_', ' ').toUpperCase();

                            return (
                              <div key={grpKey} style={{ background: 'var(--input-bg)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>{title} ({stepsList.length} Steps)</h5>
                                
                                {stepsList.map((step) => (
                                  <div key={step.id || step.step_number} style={{ padding: '0.65rem', background: 'var(--card-bg)', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <strong style={{ fontSize: '0.85rem' }}>Step {step.step_number}: {step.step_name}</strong>
                                      <button
                                        onClick={() => {
                                          setEditingStepId(step.id);
                                          setDocStepNotes(step.doctor_notes || "");
                                          setDocStepIng(step.recommended_ingredient || "");
                                        }}
                                        className="btn btn-outline btn-sm"
                                        style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}
                                      >
                                        <Edit3 size={12} /> Edit Notes
                                      </button>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>{step.instructions}</p>
                                    {step.recommended_ingredient && (
                                      <small style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 700 }}>Ingredient: {step.recommended_ingredient}</small>
                                    )}

                                    {/* Inline Doctor Editing */}
                                    {editingStepId === step.id && (
                                      <div style={{ marginTop: '0.65rem', padding: '0.65rem', background: 'var(--input-bg)', borderRadius: '6px', border: '1px dashed var(--primary)' }}>
                                        <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                                          <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Recommended Active Ingredient</label>
                                          <input
                                            type="text"
                                            value={docStepIng}
                                            onChange={(e) => setDocStepIng(e.target.value)}
                                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                                          />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '0.4rem' }}>
                                          <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Clinical Doctor Notes / Advice</label>
                                          <textarea
                                            rows="2"
                                            value={docStepNotes}
                                            onChange={(e) => setDocStepNotes(e.target.value)}
                                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                                          />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                          <button onClick={() => handleSaveStepOverride(step.id)} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>Save Step Override</button>
                                          <button onClick={() => setEditingStepId(null)} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>Cancel</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No routine found for User #{active?.user_id}.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Select a patient assessment to view risk analysis and formulate diagnosis.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
