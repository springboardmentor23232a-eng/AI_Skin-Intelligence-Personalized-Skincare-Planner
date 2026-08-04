import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { apiService } from "../services/api";
import { Stethoscope, Users, Calendar, FileText, Activity, Pill, Send, Bell, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const DoctorDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [activeTab, setActiveTab] = useState("DIAGNOSIS"); // DIAGNOSIS | PRESCRIPTION | TREATMENT

  const [diagnosisNote, setDiagnosisNote] = useState("");
  const [prescriptionItem, setPrescriptionItem] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

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

  useEffect(() => {
    fetchDoctorAssessments();
  }, []);

  const parseNotes = (rawNotes) => {
    if (!rawNotes) {
      setDiagnosisNote("");
      setPrescriptionItem("");
      setTreatmentPlan("");
      return;
    }
    setDiagnosisNote(rawNotes);
  };

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

  const active = selectedAssessment || (assessments.length > 0 ? assessments[0] : null);

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
          <div className="section-header">
            <div>
              <h2>
                <Stethoscope className="icon-title" style={{ color: 'var(--accent)' }} /> Dermatologist Clinical Center
              </h2>
              <p>Review patient optical scans, formulate medical diagnoses, issue digital prescriptions, and schedule follow-ups.</p>
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
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>NOTIFICATIONS</span>
                <Bell size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ready</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Engine Operational</small>
            </div>
          </div>

          {/* Main 2-Column Clinical Workbench */}
          <div className="grid-layout grid-3-col">
            
            {/* Left Column: Patient List & Assessments */}
            <div className="glass-card span-1">
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

            {/* Right Column: Medical History, Risk Factor Evaluation & Clinical Report Form */}
            <div className="glass-card span-2">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Medical Record & Clinical Diagnosis</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Assessment: <strong>#{active?.id || 'N/A'}</strong> • User ID: <strong>{active?.user_id || 'N/A'}</strong> • Condition: <strong>{active?.overall_condition || 'N/A'}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setActiveTab("DIAGNOSIS")}
                    className={`btn ${activeTab === "DIAGNOSIS" ? "btn-primary" : "btn-outline"}`}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                  >
                    <FileText size={14} /> Diagnosis
                  </button>
                  <button
                    onClick={() => setActiveTab("PRESCRIPTION")}
                    className={`btn ${activeTab === "PRESCRIPTION" ? "btn-primary" : "btn-outline"}`}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                  >
                    <Pill size={14} /> Prescription
                  </button>
                  <button
                    onClick={() => setActiveTab("TREATMENT")}
                    className={`btn ${activeTab === "TREATMENT" ? "btn-primary" : "btn-outline"}`}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                  >
                    <Activity size={14} /> Treatment Plan
                  </button>
                </div>
              </div>

              {active ? (
                <div>
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

                  {/* Form Container */}
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
                        <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Prescribed Medical Products & Topical Treatments</label>
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
                        <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Long-Term Clinical Treatment Plan & Advice</label>
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
