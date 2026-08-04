import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { apiService } from "../services/api";
import { Sparkles, Users, Send, ShieldCheck, CheckCircle, Bell, ShoppingBag, Clock } from "lucide-react";

const ConsultantDashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [recommendationText, setRecommendationText] = useState("");
  const [savingRec, setSavingRec] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fetchConsultantAssessments = async () => {
    try {
      const data = await apiService.getAssessments();
      if (Array.isArray(data)) {
        setAssessments(data);
        if (data.length > 0 && !selectedAssessment) {
          setSelectedAssessment(data[0]);
          setRecommendationText(data[0].notes || "");
        }
      }
    } catch (err) {
      console.warn("Failed to load assessments in consultant portal:", err);
    }
  };

  React.useEffect(() => {
    fetchConsultantAssessments();
  }, []);

  const handleSaveRecommendation = async (e) => {
    e.preventDefault();
    if (!selectedAssessment) return;
    setSavingRec(true);
    try {
      const updated = await apiService.updateAssessment(selectedAssessment.id, {
        notes: recommendationText
      });
      showToast(`✔ Recommendations saved for Assessment #${selectedAssessment.id}!`);
      setSelectedAssessment(updated);
      await fetchConsultantAssessments();
    } catch (err) {
      showToast(`❌ Error: ${err?.detail || err?.message || 'Failed to update recommendation'}`);
    } finally {
      setSavingRec(false);
    }
  };

  const activeAssessment = selectedAssessment || (assessments.length > 0 ? assessments[0] : null);

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMsg && (
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
          <CheckCircle size={18} /> <span>{toastMsg}</span>
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
                <Sparkles className="icon-title" style={{ color: 'var(--secondary)' }} /> Skincare Consultant Portal
              </h2>
              <p>Evaluate user skin profiles, review AI assessment results, track history, and add targeted recommendations.</p>
            </div>
            <span className="role-badge role-skincare_consultant" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <Sparkles size={14} /> SKINCARE_CONSULTANT Authorized
            </span>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid-layout grid-4-col" style={{ marginBottom: '1.75rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL ASSESSMENTS</span>
                <Users size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{assessments.length} Records</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Engine active</small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE CLIENT</span>
                <Sparkles size={18} style={{ color: 'var(--secondary)' }} />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>User #{activeAssessment?.user_id || 'N/A'}</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                Score: {activeAssessment?.skin_health_score || 0}/100
              </small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>CONCERNS</span>
                <ShoppingBag size={18} style={{ color: 'var(--warning)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeAssessment?.concerns?.length || 0} Flagged</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>Rule-based AI</small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>RISK FACTORS</span>
                <Bell size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{activeAssessment?.risks?.length || 0} Risks</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Lifestyle impact</small>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid-layout grid-3-col">
            
            {/* Left Column: Assigned User Assessments */}
            <div className="glass-card span-1">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Assigned Assessments</h3>
                <Users size={18} />
              </div>

              <div className="client-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {assessments.length > 0 ? (
                  assessments.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setSelectedAssessment(a);
                        setRecommendationText(a.notes || "");
                      }}
                      style={{
                        background: activeAssessment?.id === a.id ? 'var(--primary-light)' : 'var(--input-bg)',
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
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                          User ID: {a.user_id} • Condition: <strong>{a.overall_condition}</strong>
                        </p>
                        <small style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 600 }}>
                          <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> Date: {new Date(a.assessment_date).toLocaleDateString()}
                        </small>
                      </div>
                      <span className="jwt-status-chip" style={{ fontWeight: 800 }}>{a.skin_health_score} Score</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    No assessments available to review.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI Results Review & Recommendations */}
            <div className="glass-card span-2">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>Review AI Results & Add Recommendations</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Selected Assessment: <strong>#{activeAssessment?.id || 'N/A'}</strong> • User ID: <strong>{activeAssessment?.user_id || 'N/A'}</strong> • Score: <strong>{activeAssessment?.skin_health_score || 0}/100</strong> ({activeAssessment?.overall_condition})
                  </p>
                </div>
                <ShieldCheck size={20} style={{ color: 'var(--secondary)' }} />
              </div>

              {activeAssessment ? (
                <div>
                  {/* AI Results Summary */}
                  <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      Identified Concerns ({activeAssessment.concerns?.length || 0})
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {activeAssessment.concerns?.map((c, idx) => (
                        <span key={idx} style={{ padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                          {c.concern_name} ({c.severity} Severity / {c.priority} Priority)
                        </span>
                      ))}
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      Risk Factors ({activeAssessment.risks?.length || 0})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {activeAssessment.risks?.map((r, idx) => (
                        <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--card-bg)', padding: '0.4rem 0.65rem', borderRadius: '6px' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{r.risk_name} ({r.risk_level}):</strong> {r.description}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations Form */}
                  <form onSubmit={handleSaveRecommendation} className="form-container">
                    <div className="form-group">
                      <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Consultant Skincare Recommendations & Routine Notes</label>
                      <textarea
                        rows="4"
                        value={recommendationText}
                        onChange={(e) => setRecommendationText(e.target.value)}
                        placeholder="Add personalized skincare recommendations, ingredient advise, or product routine steps for this user..."
                        required
                      />
                    </div>

                    <button type="submit" disabled={savingRec} className="btn btn-primary btn-block" style={{ marginTop: '1rem', padding: '0.6rem' }}>
                      <Send size={16} /> <span>{savingRec ? "Saving..." : "Save Consultant Recommendations"}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Select an assessment from the left panel to review AI results and add recommendations.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsultantDashboard;