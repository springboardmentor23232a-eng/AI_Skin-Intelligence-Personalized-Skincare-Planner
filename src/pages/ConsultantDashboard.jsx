import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import ReportsExportModule from "../components/ReportsExportModule";
import { apiService } from "../services/api";
import {
  Sparkles,
  Users,
  CheckCircle,
  ShoppingBag,
  UserCheck,
  FileText,
  TrendingUp,
  Sliders,
  Search,
  Plus,
  Download
} from "lucide-react";

// Mock Client Profiles Data
const MOCK_CLIENT_PROFILES = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    age: 26,
    gender: "Female",
    skinType: "Combination / Sensitive",
    concerns: ["Acne Marks", "Uneven Texture", "Sun Pigmentation"],
    allergies: "Fragrance, Essential Oils",
    lifestyle: "High Screen Time, Moderate Stress, 2L Water/day",
    assignedDate: "2026-07-15",
    currentScore: 82,
    adherenceRate: 88,
    status: "Active"
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    age: 31,
    gender: "Male",
    skinType: "Oily & Acne-Prone",
    concerns: ["Active Inflammatory Acne", "Enlarged Pores"],
    allergies: "None Reported",
    lifestyle: "Outdoor Sports, High UV Exposure",
    assignedDate: "2026-07-20",
    currentScore: 68,
    adherenceRate: 94,
    status: "Active"
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    age: 38,
    gender: "Female",
    skinType: "Dry / Barrier Compromised",
    concerns: ["Dehydration Lines", "Redness / Flaking"],
    allergies: "Alcohol Denat, Harsh Sulfates",
    lifestyle: "Air-Conditioned Environment, Low Sleep (6h)",
    assignedDate: "2026-08-01",
    currentScore: 74,
    adherenceRate: 81,
    status: "Pending Review"
  }
];

// Mock Products Catalog for Recommendation Management
const MOCK_CATALOG = [
  { id: "cat-1", name: "La Roche-Posay Effaclar Gel Cleanser", category: "Cleanser", target: "Oily & Acne Prone" },
  { id: "cat-2", name: "Minimalist Niacinamide 10% + Zinc 1%", category: "Serum", target: "Acne Marks & Pores" },
  { id: "cat-3", name: "CeraVe Moisturizing Cream", category: "Moisturizer", target: "Barrier Repair" },
  { id: "cat-4", name: "Dot & Key Watermelon Sunscreen SPF 50", category: "Sunscreen", target: "All Skin Types" },
  { id: "cat-5", name: "Paula's Choice 2% BHA Liquid Exfoliant", category: "Exfoliant", target: "Blackheads & Pores" }
];

const ConsultantDashboard = () => {
  const location = useLocation();
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [_recommendationText, setRecommendationText] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Primary Consultant Dashboard Navigation Tabs
  // TABS: CLIENT_PROFILES | ASSESSMENT_REPORTS | PROGRESS_MONITORING | RECOMMENDATION_MGMT
  const [mainTab, setMainTab] = useState("CLIENT_PROFILES");

  // Client Profiles State
  const [clients] = useState(MOCK_CLIENT_PROFILES);
  const [selectedClient, setSelectedClient] = useState(MOCK_CLIENT_PROFILES[0]);
  const [clientSearch, setClientSearch] = useState("");

  // Recommendation Management State
  const [selectedProduct, setSelectedProduct] = useState(MOCK_CATALOG[0].id);
  const [recFrequency, setRecFrequency] = useState("Daily (Morning & Evening)");
  const [recDuration, setRecDuration] = useState("4 Weeks");
  const [recommendationsList, setRecommendationsList] = useState([
    {
      id: "rec-101",
      clientName: "Priya Sharma",
      productName: "Minimalist Niacinamide 10% Serum",
      frequency: "Daily (Morning)",
      status: "Approved",
      dateAdded: "2026-08-02"
    },
    {
      id: "rec-102",
      clientName: "John Doe",
      productName: "La Roche-Posay Effaclar Gel Cleanser",
      frequency: "Twice Daily",
      status: "Approved",
      dateAdded: "2026-08-04"
    }
  ]);

  // Hash-based tab navigation
  useEffect(() => {
    if (location.hash) {
      const h = location.hash.toLowerCase().replace("#", "");
      let nextTab = null;
      if (h === "clients" || h === "client-profiles" || h === "assigned-clients") nextTab = "CLIENT_PROFILES";
      else if (h === "reports" || h === "assessment-reports") nextTab = "ASSESSMENT_REPORTS";
      else if (h === "progress" || h === "progress-monitoring") nextTab = "PROGRESS_MONITORING";
      else if (h === "recommendations" || h === "recommendation-mgmt") nextTab = "RECOMMENDATION_MGMT";

      if (nextTab) {
        setTimeout(() => setMainTab(nextTab), 0);
      }

      const el = document.getElementById(h) || document.getElementById("consultant-overview");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  useEffect(() => {
    let isMounted = true;
    apiService.getAssessments().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setAssessments(data);
        setSelectedAssessment((prev) => prev || data[0]);
        setRecommendationText((prev) => prev || data[0].notes || "");
      }
    }).catch((err) => {
      console.warn("Offline or assessment load warning:", err);
    });
    return () => { isMounted = false; };
  }, []);

  const activeAssessment = selectedAssessment || (assessments.length > 0 ? assessments[0] : null);

  const handleCreateRecommendation = (e) => {
    e.preventDefault();
    const prodObj = MOCK_CATALOG.find((p) => p.id === selectedProduct) || MOCK_CATALOG[0];
    const newRec = {
      id: `rec-${Date.now()}`,
      clientName: selectedClient.name,
      productName: prodObj.name,
      frequency: recFrequency,
      status: "Approved",
      dateAdded: new Date().toISOString().split("T")[0]
    };

    setRecommendationsList((prev) => [newRec, ...prev]);
    showToast(`✨ Recommended "${prodObj.name}" to ${selectedClient.name}!`);
  };

  const filteredClients = clients.filter(
    (c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMsg && (
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
          <CheckCircle size={18} /> <span>{toastMsg}</span>
        </div>
      )}

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          {/* Header */}
          <div id="consultant-overview" className="section-header">
            <div>
              <h2>
                <Sparkles className="icon-title" style={{ color: "var(--secondary)" }} /> Skincare Consultant Portal
              </h2>
              <p>Manage client profiles, analyze AI skin assessment reports, monitor progress, and manage product recommendations.</p>
            </div>
            <span className="role-badge role-skincare_consultant" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
              <UserCheck size={14} /> SKINCARE_CONSULTANT Authorized
            </span>
          </div>

          {/* Metric Summary Cards (4 Role Metrics) */}
          <div className="grid-layout grid-4-col" style={{ marginBottom: "1.75rem" }}>
            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>ASSIGNED CLIENTS</span>
                <Users size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{clients.length} Active Profiles</div>
              <small style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600 }}>100% Retained</small>
            </div>

            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>ASSESSMENT REPORTS</span>
                <FileText size={18} style={{ color: "var(--secondary)" }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{assessments.length || 12} Reports</div>
              <small style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>AI Optical Scans</small>
            </div>

            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>ADHERENCE RATE</span>
                <TrendingUp size={18} style={{ color: "var(--warning)" }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>87.6% Mean</div>
              <small style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600 }}>High Adherence</small>
            </div>

            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>RECOMMENDATIONS</span>
                <ShoppingBag size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{recommendationsList.length} Active</div>
              <small style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>Approved &amp; Sent</small>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setMainTab("CLIENT_PROFILES")}
              className={`btn ${mainTab === "CLIENT_PROFILES" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <Users size={15} /> Client Profiles
            </button>

            <button
              onClick={() => setMainTab("ASSESSMENT_REPORTS")}
              className={`btn ${mainTab === "ASSESSMENT_REPORTS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <FileText size={15} /> Skin Assessment Reports
            </button>

            <button
              onClick={() => setMainTab("PROGRESS_MONITORING")}
              className={`btn ${mainTab === "PROGRESS_MONITORING" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <TrendingUp size={15} /> Progress Monitoring
            </button>

            <button
              onClick={() => setMainTab("RECOMMENDATION_MGMT")}
              className={`btn ${mainTab === "RECOMMENDATION_MGMT" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <Sliders size={15} /> Recommendation Management
            </button>
          </div>

          {/* TAB 1: CLIENT PROFILES */}
          {mainTab === "CLIENT_PROFILES" && (
            <div className="grid-layout grid-3-col">
              {/* Left Column: Client List */}
              <div className="glass-card span-1">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Client Roster</h3>
                  <Users size={18} />
                </div>

                <div className="input-with-icon" style={{ marginBottom: "1rem" }}>
                  <Search className="input-icon" size={15} />
                  <input
                    type="text"
                    placeholder="Search client by name..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    style={{ padding: "0.45rem 0.75rem 0.45rem 2.2rem", fontSize: "0.8rem" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "450px", overflowY: "auto" }}>
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClient(client)}
                      style={{
                        padding: "0.85rem",
                        background: selectedClient.id === client.id ? "var(--primary-light)" : "var(--input-bg)",
                        border: selectedClient.id === client.id ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.2rem" }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>{client.name}</h4>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "0.1rem 0.45rem", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", color: "var(--success)" }}>
                          {client.status}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.1rem 0" }}>{client.skinType}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                        <span>Skin Score: <strong style={{ color: "var(--primary)" }}>{client.currentScore}/100</strong></span>
                        <span>Adherence: <strong style={{ color: "var(--success)" }}>{client.adherenceRate}%</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed Client Profile Card */}
              <div className="glass-card span-2">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>{selectedClient.name}</h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.15rem 0 0 0" }}>
                      {selectedClient.email} • {selectedClient.age} yrs • {selectedClient.gender}
                    </p>
                  </div>
                  <button
                    onClick={() => showToast(`✉ Notification sent to ${selectedClient.name} for skincare follow-up.`)}
                    className="btn btn-primary"
                    style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
                  >
                    Send Follow-up Message
                  </button>
                </div>

                <div className="grid-layout grid-2-col" style={{ marginBottom: "1.25rem" }}>
                  <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.5rem" }}>Skin Classification</h4>
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, margin: "0 0 0.4rem 0" }}>Skin Type: {selectedClient.skinType}</p>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      <strong>Primary Concerns:</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.3rem" }}>
                        {selectedClient.concerns.map((c, idx) => (
                          <span key={idx} style={{ padding: "0.15rem 0.5rem", borderRadius: "10px", fontSize: "0.72rem", background: "rgba(245, 158, 11, 0.12)", color: "var(--warning)", fontWeight: 700 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--danger)", marginBottom: "0.5rem" }}>Allergies &amp; Sensitivity</h4>
                    <p style={{ fontSize: "0.82rem", margin: "0 0 0.4rem 0" }}><strong>Known Allergies:</strong> {selectedClient.allergies}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}><strong>Lifestyle Profile:</strong> {selectedClient.lifestyle}</p>
                  </div>
                </div>

                {/* Consultation History Timeline */}
                <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem" }}>Consultation &amp; Skin Milestones</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem" }}>
                      <span style={{ fontWeight: 700, color: "var(--text-muted)", width: "90px" }}>2026-08-01</span>
                      <div>
                        <strong>Consultation Review Completed:</strong> Routine updated with Niacinamide serum for acne marks.
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem" }}>
                      <span style={{ fontWeight: 700, color: "var(--text-muted)", width: "90px" }}>2026-07-15</span>
                      <div>
                        <strong>Initial Skin Assessment:</strong> Overall Score 74/100. Hydration deficit identified.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKIN ASSESSMENT REPORTS */}
          {mainTab === "ASSESSMENT_REPORTS" && (
            <div className="grid-layout grid-3-col">
              {/* Left Column: Reports List */}
              <div className="glass-card span-1">
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>Assessment Reports</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: "450px", overflowY: "auto" }}>
                  {assessments.length > 0 ? (
                    assessments.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setSelectedAssessment(a);
                          setRecommendationText(a.notes || "");
                        }}
                        style={{
                          padding: "0.85rem",
                          background: activeAssessment?.id === a.id ? "var(--primary-light)" : "var(--input-bg)",
                          border: activeAssessment?.id === a.id ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.88rem" }}>
                          <span>Report #{a.id}</span>
                          <span style={{ color: "var(--primary)" }}>Score: {a.skin_health_score}/100</span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                          User ID: {a.user_id} • Condition: <strong>{a.overall_condition}</strong>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No skin assessment reports available.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Full Interactive Report Display */}
              <div className="glass-card span-2">
                {activeAssessment ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.85rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>
                          Skin Optical Assessment Report #{activeAssessment.id}
                        </h3>
                        <small style={{ color: "var(--text-secondary)" }}>
                          Generated on {new Date(activeAssessment.assessment_date).toLocaleString()} • User ID #{activeAssessment.user_id}
                        </small>
                      </div>

                      <button
                        onClick={() => showToast(`📄 Assessment Report #${activeAssessment.id} exported as PDF.`)}
                        className="btn btn-outline"
                        style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
                      >
                        <Download size={14} /> Export Report PDF
                      </button>
                    </div>

                    {/* Report Key Stats */}
                    <div className="grid-layout grid-3-col" style={{ marginBottom: "1.25rem" }}>
                      <div style={{ background: "var(--input-bg)", padding: "0.85rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>SKIN HEALTH SCORE</span>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--success)" }}>{activeAssessment.skin_health_score}/100</div>
                      </div>

                      <div style={{ background: "var(--input-bg)", padding: "0.85rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>OVERALL CONDITION</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>{activeAssessment.overall_condition}</div>
                      </div>

                      <div style={{ background: "var(--input-bg)", padding: "0.85rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>CONCERNS FLAGGED</span>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--warning)" }}>{activeAssessment.concerns?.length || 0}</div>
                      </div>
                    </div>

                    {/* Report Concerns & Risk Breakdown */}
                    <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", marginBottom: "1.25rem" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem" }}>Identified Skin Concerns &amp; Severity</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {activeAssessment.concerns?.map((c, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "var(--card-bg)", padding: "0.45rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem" }}>
                            <span><strong>{c.concern_name}:</strong> {c.location || 'Facial zone'}</span>
                            <span style={{ color: "var(--warning)", fontWeight: 700 }}>Severity: {c.severity} / Priority: {c.priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Select a report from the left roster.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROGRESS MONITORING */}
          {mainTab === "PROGRESS_MONITORING" && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Client Progress Monitoring &amp; Adherence Analytics</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                    Track skin health score improvements and routine adherence over weekly intervals
                  </p>
                </div>
                <button
                  onClick={() => showToast("📈 Progress Monitoring report refreshed with latest client logs.")}
                  className="btn btn-outline"
                  style={{ fontSize: "0.78rem" }}
                >
                  Refresh Analytics
                </button>
              </div>

              <div className="grid-layout grid-3-col" style={{ marginBottom: "1.5rem" }}>
                {clients.map((c) => (
                  <div key={c.id} style={{ background: "var(--input-bg)", padding: "1.15rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>{c.name}</h4>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" }}>
                        {c.skinType}
                      </span>
                    </div>

                    <div style={{ margin: "0.75rem 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                        <span>Routine Adherence Rate</span>
                        <span style={{ color: "var(--success)" }}>{c.adherenceRate}%</span>
                      </div>
                      <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${c.adherenceRate}%`, height: "100%", background: "var(--success)" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      <span>Current Skin Score: <strong style={{ color: "var(--primary)" }}>{c.currentScore}/100</strong></span>
                      <span style={{ color: "var(--success)", fontWeight: 700 }}>+14 pts (30 days)</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Photo Progress Mock Container */}
              <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>Side-by-Side Optical Progress Scan Comparison (Day 1 vs Day 30)</h4>
                <div className="grid-layout grid-2-col">
                  <div style={{ textAlign: "center", background: "var(--card-bg)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--danger)", marginBottom: "0.5rem" }}>DAY 1 - INITIAL ASSESSMENT</div>
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300" alt="Day 1" style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "6px" }} />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>Active redness &amp; dehydration lines present.</p>
                  </div>

                  <div style={{ textAlign: "center", background: "var(--card-bg)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--success)", marginBottom: "0.5rem" }}>DAY 30 - CURRENT STATUS</div>
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300" alt="Day 30" style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "6px" }} />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>Improved texture, barrier restored, inflammation reduced.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RECOMMENDATION MANAGEMENT */}
          {mainTab === "RECOMMENDATION_MGMT" && (
            <div className="grid-layout grid-3-col">
              {/* Left Column: Create Recommendation Form */}
              <div className="glass-card span-1">
                <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Plus size={18} /> New Recommendation
                </h3>

                <form onSubmit={handleCreateRecommendation} className="form-container">
                  <div className="form-group">
                    <label>Select Target Client</label>
                    <select value={selectedClient.id} onChange={(e) => setSelectedClient(clients.find((c) => c.id === parseInt(e.target.value)) || clients[0])}>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.skinType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Skincare Product</label>
                    <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                      {MOCK_CATALOG.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.category}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Application Frequency</label>
                    <select value={recFrequency} onChange={(e) => setRecFrequency(e.target.value)}>
                      <option value="Daily (Morning & Evening)">Daily (Morning &amp; Evening)</option>
                      <option value="Daily (Morning Only)">Daily (Morning Only)</option>
                      <option value="Daily (Night Only)">Daily (Night Only)</option>
                      <option value="2-3 Times a Week">2-3 Times a Week</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Treatment Duration</label>
                    <select value={recDuration} onChange={(e) => setRecDuration(e.target.value)}>
                      <option value="2 Weeks">2 Weeks</option>
                      <option value="4 Weeks">4 Weeks</option>
                      <option value="8 Weeks">8 Weeks</option>
                      <option value="Ongoing Maintenance">Ongoing Maintenance</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: "1rem" }}>
                    Deliver Recommendation
                  </button>
                </form>
              </div>

              {/* Right Column: Recommendations Management Table */}
              <div className="glass-card span-2">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Active Recommendations Roster</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total: {recommendationsList.length} Items</span>
                </div>

                <div className="table-responsive">
                  <table className="custom-table" style={{ width: "100%", fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Recommended Product</th>
                        <th>Frequency</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendationsList.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 700 }}>{r.clientName}</td>
                          <td>{r.productName}</td>
                          <td>{r.frequency}</td>
                          <td>
                            <span style={{ padding: "0.15rem 0.5rem", borderRadius: "10px", fontSize: "0.72rem", fontWeight: 800, background: "rgba(16, 185, 129, 0.12)", color: "var(--success)" }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{r.dateAdded}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

export default ConsultantDashboard;