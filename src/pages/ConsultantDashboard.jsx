import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { Award, Users, CheckCircle, Clock, HeartPulse, Send, MessageSquare, Sparkles, Stethoscope, ShieldCheck } from "lucide-react";

const ConsultantDashboard = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const roleMode = searchParams.get("role") || "dermatologist";

  // Dynamic Content according to clicked sidebar role
  let roleTitle = "Dermatologist Clinical Dashboard";
  let roleSubtitle = "Review high-resolution optical skin scans, diagnose pathologies, and prescribe clinical skincare regimens.";
  let roleIcon = <Stethoscope className="icon-title" style={{ color: 'var(--accent)' }} />;
  let roleBadge = "DERMATOLOGIST Authorized";
  let roleBadgeClass = "role-dermatologist";

  if (roleMode === "consultant") {
    roleTitle = "Skincare Consultant Portal";
    roleSubtitle = "Analyze client skin type profiles, review hydration scores, and build personalized product recommendations.";
    roleIcon = <Sparkles className="icon-title" style={{ color: 'var(--secondary)' }} />;
    roleBadge = "SKINCARE_CONSULTANT Authorized";
    roleBadgeClass = "role-skincare_consultant";
  } else if (roleMode === "coach") {
    roleTitle = "Wellness & Skin Coach Dashboard";
    roleSubtitle = "Track daily client wellness habits, sleep recovery turnover, and issue holistic lifestyle coaching guidance.";
    roleIcon = <Award className="icon-title" style={{ color: 'var(--warning)' }} />;
    roleBadge = "WELLNESS_COACH Authorized";
    roleBadgeClass = "role-wellness_coach";
  }

  const [clients, setClients] = useState([
    { id: 101, name: "John Doe", email: "john@gmail.com", skill: "Barrier Repair & Hydration", score: 88, status: "Active Plan" },
    { id: 102, name: "Emily Watson", email: "emily@dev.io", skill: "Retinol & Evening Skincare Routine", score: 74, status: "Review Pending" },
    { id: 103, name: "Michael Chen", email: "michael@tech.com", skill: "Mineral Sunscreen & UV Protection", score: 89, status: "Active Plan" }
  ]);

  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [adviceNote, setAdviceNote] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  const handleSendAdvice = (e) => {
    e.preventDefault();
    if (!adviceNote) return;
    setMsgSent(true);
    setTimeout(() => {
      setMsgSent(false);
      setAdviceNote("");
    }, 3000);
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
              <h2>{roleIcon} {roleTitle}</h2>
              <p>{roleSubtitle}</p>
            </div>
            <span className={`role-badge ${roleBadgeClass}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              {roleBadge}
            </span>
          </div>

          <div className="grid-layout grid-3-col">
            {/* Client List */}
            <div className="glass-card span-1">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Assigned Clients</h3>
                <Users size={18} />
              </div>

              <div className="client-list">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    className={`client-item-card ${selectedClient.id === c.id ? "active" : ""}`}
                    onClick={() => setSelectedClient(c)}
                    style={{
                      background: selectedClient.id === c.id ? 'var(--primary-light)' : 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div className="client-info">
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{c.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.email}</p>
                      <small style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Focus: {c.skill}</small>
                    </div>
                    <span className="jwt-status-chip">{c.score} Score</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Detail & Guidance Publisher */}
            <div className="glass-card span-2">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Client Profile &amp; AI Optical Scan Evaluation</h3>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
              </div>

              <div className="client-detail-view">
                <div className="client-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{selectedClient.name}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{selectedClient.email} • Focus: <strong>{selectedClient.skill}</strong></p>
                  </div>
                  <div className="score-badge-circle" style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '0.75rem 1rem',
                    borderRadius: '50%',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedClient.score}</span>
                    <small style={{ display: 'block', fontSize: '0.65rem' }}>Skin Index</small>
                  </div>
                </div>

                <div className="coach-advice-box">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <MessageSquare size={18} /> Issue Custom {roleMode === "dermatologist" ? "Clinical Prescription" : roleMode === "consultant" ? "Product Recommendations" : "Coach Guidance"}
                  </h4>
                  {msgSent && <div className="alert alert-success">Recommendations successfully transmitted to {selectedClient.name}'s client dashboard!</div>}

                  <form onSubmit={handleSendAdvice} className="form-container">
                    <div className="form-group">
                      <label>Professional Guidance Notes &amp; Action Plan</label>
                      <textarea
                        rows="4"
                        value={adviceNote}
                        onChange={(e) => setAdviceNote(e.target.value)}
                        placeholder={`Write professional advice for ${selectedClient.name} regarding their ${selectedClient.skill} routine...`}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <Send size={16} /> <span>Transmit Recommendation</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultantDashboard;