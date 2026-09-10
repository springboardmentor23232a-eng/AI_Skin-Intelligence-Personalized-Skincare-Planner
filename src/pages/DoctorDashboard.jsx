import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import ReportsExportModule from "../components/ReportsExportModule";
import { apiService } from "../services/api";
import {
  Stethoscope,
  Users,
  FileText,
  Pill,
  Send,
  CheckCircle,
  TrendingUp,
  Search,
  Download
} from "lucide-react";

// Mock Clinical Patient Insights Data
const MOCK_PATIENTS = [
  {
    id: 101,
    name: "Akash Prajapati",
    age: 27,
    gender: "Male",
    diagnosis: "Moderate Acne Vulgaris & Post-Inflammatory Hyperpigmentation",
    severity: "Moderate (Grade 2)",
    skinBarrierScore: 68,
    sensitivityTriggers: "High Humidity, Benzoyl Peroxide 5%, Harsh Cleanser",
    medicalHistory: "No systemic diseases. Family history of acne.",
    currentRx: "Clindamycin 1% Gel (Morning), Adaptalene 0.1% Cream (Night)",
    scoreHistory: [58, 64, 72, 82],
    recoveryTrend: "+24% Improvement over 6 weeks"
  },
  {
    id: 102,
    name: "Sarah Connor",
    age: 34,
    gender: "Female",
    diagnosis: "Erythematotelangiectatic Rosacea & Sensitive Barrier",
    severity: "Severe Flare-up",
    skinBarrierScore: 52,
    sensitivityTriggers: "Spicy Foods, Direct Sunlight, Ethanol, Heat",
    medicalHistory: "Vasomotor flushing, mild ocular discomfort.",
    currentRx: "Ivermectin 1% Cream, Metronidazole 0.75%",
    scoreHistory: [45, 52, 60, 74],
    recoveryTrend: "+29% Recovery over 8 weeks"
  },
  {
    id: 103,
    name: "David Miller",
    age: 42,
    gender: "Male",
    diagnosis: "Seborrheic Dermatitis & Epidermal Dehydration",
    severity: "Mild to Moderate",
    skinBarrierScore: 75,
    sensitivityTriggers: "Cold Winter Climate, Stress, Fragrance",
    medicalHistory: "Seasonal flares on nasolabial folds and scalp.",
    currentRx: "Ketoconazole 2% Wash, Hydrocortisone 1% (Short course)",
    scoreHistory: [62, 68, 75, 80],
    recoveryTrend: "+18% Stabilization"
  }
];

const DoctorDashboard = () => {
  const location = useLocation();
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // Primary Dermatologist Navigation Tabs
  // TABS: PATIENT_INSIGHTS | CONDITION_REPORTS | TREATMENT_RECOMMENDATIONS | PROGRESS_ANALYTICS
  const [mainTab, setMainTab] = useState("PATIENT_INSIGHTS");

  // Patient Insights State
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);

  // Treatment / Prescription State
  const [rxMedication, setRxMedication] = useState("Tretinoin 0.025% Cream");
  const [rxDosage, setRxDosage] = useState("Pea-sized amount every alternate night");
  const [rxInstructions, setRxInstructions] = useState("Apply to clean, bone-dry skin. Follow with a barrier moisturizer after 20 minutes.");
  const [procedureAdvice, setProcedureAdvice] = useState("Recommend Salicylic Acid 20% In-Clinic Chemical Peel after 4 weeks.");
  const [submittingRx, setSubmittingRx] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState("");

  // Prescription List
  const [prescriptionsList, setPrescriptionsList] = useState([
    {
      id: "rx-801",
      patientName: "Akash Prajapati",
      medication: "Clindamycin 1% Gel",
      dosage: "Once Daily (Morning)",
      date: "2026-08-01",
      status: "Active"
    },
    {
      id: "rx-802",
      patientName: "Sarah Connor",
      medication: "Ivermectin 1% Cream",
      dosage: "Nightly before sleep",
      date: "2026-08-03",
      status: "Active"
    }
  ]);

  useEffect(() => {
    if (location.hash) {
      const h = location.hash.toLowerCase().replace("#", "");
      let nextTab = null;
      if (h === "patients" || h === "patient-insights") nextTab = "PATIENT_INSIGHTS";
      else if (h === "condition" || h === "condition-reports") nextTab = "CONDITION_REPORTS";
      else if (h === "treatment" || h === "treatment-recommendations" || h === "prescription") nextTab = "TREATMENT_RECOMMENDATIONS";
      else if (h === "analytics" || h === "progress-analytics") nextTab = "PROGRESS_ANALYTICS";

      if (nextTab) {
        setTimeout(() => setMainTab(nextTab), 0);
      }

      const el = document.getElementById(h) || document.getElementById("doctor-overview");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg("");
    }, 3500);
  };

  useEffect(() => {
    let isMounted = true;
    apiService.getAssessments().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setAssessments(data);
        setSelectedAssessment((prev) => prev || data[0]);
      }
    }).catch((err) => {
      console.warn("Doctor portal offline warning:", err);
    });
    return () => { isMounted = false; };
  }, []);

  const _activeAssessment = selectedAssessment || (assessments.length > 0 ? assessments[0] : null);

  const handleSaveRx = (e) => {
    e.preventDefault();
    setSubmittingRx(true);
    setTimeout(() => {
      const newRx = {
        id: `rx-${Date.now()}`,
        patientName: selectedPatient.name,
        medication: rxMedication,
        dosage: rxDosage,
        date: new Date().toISOString().split("T")[0],
        status: "Active"
      };
      setPrescriptionsList((prev) => [newRx, ...prev]);
      showNotification(`✔ Digital Medical Prescription for ${rxMedication} transmitted to Patient ${selectedPatient.name}!`);
      setSubmittingRx(false);
    }, 400);
  };

  const filteredPatients = MOCK_PATIENTS.filter(
    (p) => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.diagnosis.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Floating Toast Notification */}
      {notificationMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "var(--primary)",
            color: "#ffffff",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            fontSize: "0.88rem",
            fontWeight: 700,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            animation: "fadeIn 0.3s ease-out"
          }}
        >
          <CheckCircle size={18} /> <span>{notificationMsg}</span>
        </div>
      )}

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          {/* Section Header */}
          <div id="doctor-overview" className="section-header">
            <div>
              <h2>
                <Stethoscope className="icon-title" style={{ color: "var(--accent)" }} /> Dermatologist Clinical Center
              </h2>
              <p>Clinical patient insights, diagnostic skin condition reports, Rx treatment recommendations, and recovery progress analytics.</p>
            </div>
            <span className="role-badge role-dermatologist" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
              <Stethoscope size={14} /> DERMATOLOGIST Authorized
            </span>
          </div>          {/* Top Quick Stats Cards */}
          <div className="grid-layout grid-4-col" style={{ marginBottom: "1.75rem" }}>
            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>PATIENT QUEUE</span>
                <Users size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{MOCK_PATIENTS.length} Clinical Patients</div>
              <small style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Active Clinical Queue</small>
            </div>

            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>CONDITION REPORTS</span>
                <FileText size={18} style={{ color: "var(--warning)" }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{assessments.length || 15} Scans</div>
              <small style={{ fontSize: "0.75rem", color: "var(--warning)", fontWeight: 600 }}>Optical Diagnostic</small>
            </div>

            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>ACTIVE RX PRESCRIPTIONS</span>
                <Pill size={18} style={{ color: "var(--danger)" }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{prescriptionsList.length} Active Rx</div>
              <small style={{ fontSize: "0.75rem", color: "var(--danger)", fontWeight: 600 }}>Clinical Formulations</small>
            </div>

            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>AVG RECOVERY RATE</span>
                <TrendingUp size={18} style={{ color: "var(--success)" }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>+24.3%</div>
              <small style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600 }}>Treatment Efficacy</small>
            </div>
          </div>

          {/* Dermatologist Navigation Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setMainTab("PATIENT_INSIGHTS")}
              className={`btn ${mainTab === "PATIENT_INSIGHTS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <Users size={15} /> Patient Insights
            </button>

            <button
              onClick={() => setMainTab("CONDITION_REPORTS")}
              className={`btn ${mainTab === "CONDITION_REPORTS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <FileText size={15} /> Skin Condition Reports
            </button>

            <button
              onClick={() => setMainTab("TREATMENT_RECOMMENDATIONS")}
              className={`btn ${mainTab === "TREATMENT_RECOMMENDATIONS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <Pill size={15} /> Treatment Recommendations
            </button>

            <button
              onClick={() => setMainTab("PROGRESS_ANALYTICS")}
              className={`btn ${mainTab === "PROGRESS_ANALYTICS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <TrendingUp size={15} /> Progress Analytics
            </button>
          </div>

          {/* TAB 1: PATIENT INSIGHTS */}
          {mainTab === "PATIENT_INSIGHTS" && (
            <div className="grid-layout grid-3-col">
              {/* Left Column: Patient List */}
              <div className="glass-card span-1">
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>Patient Insights Roster</h3>

                <div className="input-with-icon" style={{ marginBottom: "1rem" }}>
                  <Search className="input-icon" size={15} />
                  <input
                    type="text"
                    placeholder="Search patient name..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    style={{ padding: "0.45rem 0.75rem 0.45rem 2.2rem", fontSize: "0.8rem" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "450px", overflowY: "auto" }}>
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      style={{
                        padding: "0.85rem",
                        background: selectedPatient.id === patient.id ? "var(--primary-light)" : "var(--input-bg)",
                        border: selectedPatient.id === patient.id ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.88rem" }}>
                        <span>{patient.name}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--danger)", fontWeight: 800 }}>{patient.severity}</span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>{patient.diagnosis}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: In-Depth Clinical Medical Record */}
              <div className="glass-card span-2">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
                      Clinical Patient File #{selectedPatient.id}: {selectedPatient.name}
                    </h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.15rem 0 0 0" }}>
                      {selectedPatient.age} yrs • {selectedPatient.gender} • Clinical Priority: High
                    </p>
                  </div>

                  <span style={{ fontSize: "0.75rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "12px", background: "rgba(239, 68, 68, 0.12)", color: "var(--danger)" }}>
                    {selectedPatient.severity}
                  </span>
                </div>

                <div className="grid-layout grid-2-col" style={{ marginBottom: "1.25rem" }}>
                  <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.4rem" }}>Medical Diagnosis</h4>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{selectedPatient.diagnosis}</p>
                    <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginTop: "0.4rem" }}>
                      Barrier Score: {selectedPatient.skinBarrierScore}/100
                    </small>
                  </div>

                  <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--warning)", marginBottom: "0.4rem" }}>Sensitivity &amp; Irritation Triggers</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>{selectedPatient.sensitivityTriggers}</p>
                  </div>
                </div>

                {/* Medical History & Current Rx */}
                <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", marginBottom: "1.25rem" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.4rem" }}>Dermatological History &amp; Current Rx</h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                    <strong>History:</strong> {selectedPatient.medicalHistory}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 700, margin: 0 }}>
                    <strong>Active Prescription:</strong> {selectedPatient.currentRx}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKIN CONDITION REPORTS */}
          {mainTab === "CONDITION_REPORTS" && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Clinical Optical Skin Condition Analysis Reports</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                    Optical vision classification breakdown, lesion density, and epidermal moisture metrics
                  </p>
                </div>

                <button
                  onClick={() => showNotification("📄 Clinical Condition Report exported as PDF summary.")}
                  className="btn btn-outline"
                  style={{ fontSize: "0.78rem" }}
                >
                  <Download size={14} /> Export Report
                </button>
              </div>

              <div className="grid-layout grid-3-col" style={{ marginBottom: "1.5rem" }}>
                <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>INFLAMMATORY LESION COUNT</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--danger)", marginTop: "0.2rem" }}>14 Lesions / cm²</div>
                  <small style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Pustular &amp; Papular lesions</small>
                </div>

                <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>POROUS OCCLUSION INDEX</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--warning)", marginTop: "0.2rem" }}>42% Occluded</div>
                  <small style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Sebaceous gland congestion</small>
                </div>

                <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>BARRIER MOISTURE LOSS (TEWL)</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.2rem" }}>18.4 g/m²/h</div>
                  <small style={{ fontSize: "0.72rem", color: "var(--success)" }}>Normal Range (&lt; 25 g/m²/h)</small>
                </div>
              </div>

              <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Differential Diagnosis Summary</h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  Patient presents with Grade 2 inflammatory acne vulgaris concentrated on the T-zone and jawline. Optical scan reveals post-inflammatory erythema (PIE) alongside localized epidermal dehydration. Recommend initiation of topical retinoic acid therapy combined with anti-bacterial clindamycin gel.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TREATMENT RECOMMENDATIONS */}
          {mainTab === "TREATMENT_RECOMMENDATIONS" && (
            <div className="grid-layout grid-3-col">
              {/* Left Column: Form */}
              <div className="glass-card span-1">
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Pill size={18} /> Digital Rx Builder
                </h3>

                <form onSubmit={handleSaveRx} className="form-container">
                  <div className="form-group">
                    <label>Target Clinical Patient</label>
                    <select value={selectedPatient.id} onChange={(e) => setSelectedPatient(MOCK_PATIENTS.find((p) => p.id === parseInt(e.target.value)) || MOCK_PATIENTS[0])}>
                      {MOCK_PATIENTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.severity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Prescribed Active Medication</label>
                    <input
                      type="text"
                      value={rxMedication}
                      onChange={(e) => setRxMedication(e.target.value)}
                      placeholder="e.g. Tretinoin 0.025% Cream"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Dosage &amp; Frequency</label>
                    <input
                      type="text"
                      value={rxDosage}
                      onChange={(e) => setRxDosage(e.target.value)}
                      placeholder="e.g. Pea-sized amount nightly"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Application Instructions</label>
                    <textarea
                      rows="3"
                      value={rxInstructions}
                      onChange={(e) => setRxInstructions(e.target.value)}
                      placeholder="Detailed patient usage instructions..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>In-Clinic Procedure Advice</label>
                    <input
                      type="text"
                      value={procedureAdvice}
                      onChange={(e) => setProcedureAdvice(e.target.value)}
                      placeholder="e.g. Salicylic Acid Chemical Peel"
                    />
                  </div>

                  <button type="submit" disabled={submittingRx} className="btn btn-primary btn-block" style={{ marginTop: "1rem" }}>
                    <Send size={16} /> <span>Transmit Digital Rx</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Prescriptions Table */}
              <div className="glass-card span-2">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Active Clinical Digital Prescriptions</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total: {prescriptionsList.length} Active</span>
                </div>

                <div className="table-responsive">
                  <table className="custom-table" style={{ width: "100%", fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Rx ID</th>
                        <th>Patient</th>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Status</th>
                        <th>Issued Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionsList.map((rx) => (
                        <tr key={rx.id}>
                          <td style={{ fontWeight: 700 }}>{rx.id}</td>
                          <td>{rx.patientName}</td>
                          <td style={{ fontWeight: 700, color: "var(--primary)" }}>{rx.medication}</td>
                          <td>{rx.dosage}</td>
                          <td>
                            <span style={{ padding: "0.15rem 0.5rem", borderRadius: "10px", fontSize: "0.72rem", fontWeight: 800, background: "rgba(16, 185, 129, 0.12)", color: "var(--success)" }}>
                              {rx.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{rx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROGRESS ANALYTICS */}
          {mainTab === "PROGRESS_ANALYTICS" && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Clinical Progress Analytics &amp; Efficacy Rates</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                    Patient skin recovery trends, condition severity reduction metrics, and clinical outcomes over time
                  </p>
                </div>

                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--success)", background: "rgba(16, 185, 129, 0.1)", padding: "0.3rem 0.75rem", borderRadius: "20px" }}>
                  Mean Efficacy: 94.2% Success Rate
                </span>
              </div>

              <div className="grid-layout grid-3-col" style={{ marginBottom: "1.5rem" }}>
                {MOCK_PATIENTS.map((p) => (
                  <div key={p.id} style={{ background: "var(--input-bg)", padding: "1.15rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.2rem 0" }}>{p.name}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 0.6rem 0" }}>{p.diagnosis}</p>

                    <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--success)", marginBottom: "0.5rem" }}>
                      {p.recoveryTrend}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "0.4rem" }}>
                      <span>Initial Score: {p.scoreHistory[0]}</span>
                      <span>Current Score: <strong style={{ color: "var(--primary)" }}>{p.scoreHistory[p.scoreHistory.length - 1]}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 11: Reports & Export System */}
          <ReportsExportModule onToast={showToast} />

        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
