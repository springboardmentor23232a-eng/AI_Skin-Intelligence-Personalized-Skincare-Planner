import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Sparkles, AlertTriangle, ShieldCheck, Activity, Clock, PlusCircle, RefreshCw, X } from "lucide-react";

const DEFAULT_FORM_STATE = {
  skin_type: "Combination",
  oiliness: "Medium",
  dryness: "Low",
  acne: "Mild",
  pigmentation: "Mild",
  redness: "None",
  wrinkles: "None",
  dark_spots: "Mild",
  sun_exposure: "Moderate",
  water_intake: 2.0,
  sleep_hours: 7.0,
  stress_level: "Medium",
  smoking: false,
  alcohol: "Occasional",
  age: 26,
  notes: ""
};

const SkinAssessmentModule = ({ onToast }) => {
  const [history, setHistory] = useState([]);
  const [, setLatestScoreData] = useState(null);
  const [, setLatestRiskData] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  const fetchAssessmentData = async () => {
    setLoading(true);
    try {
      const [histRes, scoreRes, riskRes] = await Promise.allSettled([
        apiService.getAssessmentHistory(),
        apiService.getLatestScore(),
        apiService.getLatestRisks()
      ]);

      if (histRes.status === "fulfilled" && Array.isArray(histRes.value)) {
        setHistory(histRes.value);
        if (histRes.value.length > 0 && !selectedAssessment) {
          setSelectedAssessment(histRes.value[0]);
        }
      }

      if (scoreRes.status === "fulfilled") {
        setLatestScoreData(scoreRes.value);
      }

      if (riskRes.status === "fulfilled") {
        setLatestRiskData(riskRes.value);
      }
    } catch (err) {
      console.warn("Failed to load assessment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssessmentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newAssessment = await apiService.createAssessment(formData);
      if (onToast) onToast("✨ Skin Assessment complete! Score updated successfully.");
      setShowFormModal(false);
      setSelectedAssessment(newAssessment);
      await fetchAssessmentData();
    } catch (err) {
      const errMsg = err?.detail || err?.message || "Failed to submit assessment";
      if (onToast) onToast(`❌ Error: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#10B981"; // Success Green
    if (score >= 70) return "#3B82F6"; // Blue
    if (score >= 50) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.3)" };
      case "High":
        return { bg: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" };
      case "Medium":
        return { bg: "rgba(59, 130, 246, 0.15)", color: "#3B82F6", border: "1px solid rgba(59, 130, 246, 0.3)" };
      default:
        return { bg: "rgba(16, 185, 129, 0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)" };
    }
  };

  const activeAssessment = selectedAssessment || (history.length > 0 ? history[0] : null);

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                AI ENGINE
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Skin Assessment Engine
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              AI Rule-Based Analysis, Skin Health Scoring (0-100), Concern Prioritization & Risk Factor Evaluation
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchAssessmentData}
              className="btn btn-outline"
              style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowFormModal(true)}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '30px' }}
            >
              <PlusCircle size={18} />
              <span>Start Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Card 1: Skin Health Score & Condition */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Latest Skin Health Score
              </h4>
              <Sparkles size={20} style={{ color: 'var(--primary)' }} />
            </div>

            {activeAssessment ? (
              <div style={{ textAlign: 'center', margin: '1.2rem 0' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: `8px solid ${getScoreColor(activeAssessment.skin_health_score)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  background: 'rgba(255, 255, 255, 0.03)',
                  boxShadow: `0 0 20px ${getScoreColor(activeAssessment.skin_health_score)}33`
                }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {activeAssessment.skin_health_score}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
                </div>

                <div style={{ display: 'inline-block', padding: '0.35rem 0.9rem', borderRadius: '20px', background: `${getScoreColor(activeAssessment.skin_health_score)}18`, border: `1px solid ${getScoreColor(activeAssessment.skin_health_score)}40`, color: getScoreColor(activeAssessment.skin_health_score), fontWeight: 800, fontSize: '0.85rem' }}>
                  Overall Condition: {activeAssessment.overall_condition}
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  Assessed on: {new Date(activeAssessment.assessment_date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Activity size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.9rem', margin: 0 }}>No assessments performed yet.</p>
                <button onClick={() => setShowFormModal(true)} className="btn btn-outline btn-sm" style={{ marginTop: '0.85rem' }}>
                  Take First Assessment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Identified Skin Concerns & Prioritization */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Identified Concerns ({activeAssessment?.concerns?.length || 0})
            </h4>
            <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
          </div>

          {activeAssessment?.concerns && activeAssessment.concerns.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {activeAssessment.concerns.map((concern, idx) => {
                const badge = getPriorityBadgeStyle(concern.priority);
                return (
                  <div key={idx} style={{ padding: '0.65rem 0.85rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>
                        {concern.concern_name}
                      </strong>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                        Severity: {concern.severity}
                      </span>
                    </div>
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, background: badge.bg, color: badge.color, border: badge.border }}>
                      {concern.priority} Priority
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={36} style={{ opacity: 0.5, color: 'var(--success)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.88rem' }}>No critical concerns detected.</p>
            </div>
          )}
        </div>

        {/* Card 3: Risk Factor Analysis */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Risk Factor Analysis ({activeAssessment?.risks?.length || 0})
            </h4>
            <ShieldCheck size={20} style={{ color: 'var(--accent)' }} />
          </div>

          {activeAssessment?.risks && activeAssessment.risks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {activeAssessment.risks.map((risk, idx) => {
                const badge = getPriorityBadgeStyle(risk.risk_level);
                return (
                  <div key={idx} style={{ padding: '0.75rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {risk.risk_name}
                      </strong>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 800, background: badge.bg, color: badge.color }}>
                        {risk.risk_level} Risk
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                      {risk.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.88rem' }}>No major risk factors flagged.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment History Table */}
      <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Assessment History
            </h4>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Assessments: {history.length}
          </span>
        </div>

        {history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>ID</th>
                  <th style={{ padding: '0.75rem' }}>Date & Time</th>
                  <th style={{ padding: '0.75rem' }}>Score</th>
                  <th style={{ padding: '0.75rem' }}>Condition</th>
                  <th style={{ padding: '0.75rem' }}>Concerns Count</th>
                  <th style={{ padding: '0.75rem' }}>Risks Count</th>
                  <th style={{ padding: '0.75rem' }}>Notes</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const isSelected = activeAssessment?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedAssessment(item)}
                    >
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>#{item.id}</td>
                      <td style={{ padding: '0.75rem' }}>{new Date(item.assessment_date).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontWeight: 800, color: getScoreColor(item.skin_health_score) }}>
                          {item.skin_health_score} / 100
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                          {item.overall_condition}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{item.concerns?.length || 0}</td>
                      <td style={{ padding: '0.75rem' }}>{item.risks?.length || 0}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{item.notes || "-"}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedAssessment(item); }}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            No history recorded. Complete your first skin assessment to build your health log!
          </div>
        )}
      </div>

      {/* Assessment Form Modal */}
      {showFormModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            background: 'var(--card-bg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  New Skin Assessment Form
                </h3>
                <small style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Input skin & lifestyle parameters for AI Rule Engine calculation</small>
              </div>
              <button onClick={() => setShowFormModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitAssessment}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                
                {/* Skin Type */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Skin Type</label>
                  <select className="form-control" value={formData.skin_type} onChange={(e) => handleInputChange("skin_type", e.target.value)}>
                    <option value="Normal">Normal</option>
                    <option value="Dry">Dry</option>
                    <option value="Oily">Oily</option>
                    <option value="Combination">Combination</option>
                    <option value="Sensitive">Sensitive</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Age</label>
                  <input type="number" min="1" max="120" className="form-control" value={formData.age} onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 25)} />
                </div>

                {/* Oiliness */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Oiliness Level</label>
                  <select className="form-control" value={formData.oiliness} onChange={(e) => handleInputChange("oiliness", e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Dryness */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Dryness Level</label>
                  <select className="form-control" value={formData.dryness} onChange={(e) => handleInputChange("dryness", e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Acne */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Acne Severity</label>
                  <select className="form-control" value={formData.acne} onChange={(e) => handleInputChange("acne", e.target.value)}>
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                {/* Pigmentation */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Pigmentation</label>
                  <select className="form-control" value={formData.pigmentation} onChange={(e) => handleInputChange("pigmentation", e.target.value)}>
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                {/* Redness */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Redness Level</label>
                  <select className="form-control" value={formData.redness} onChange={(e) => handleInputChange("redness", e.target.value)}>
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                {/* Wrinkles */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Fine Lines &amp; Wrinkles</label>
                  <select className="form-control" value={formData.wrinkles} onChange={(e) => handleInputChange("wrinkles", e.target.value)}>
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                {/* Dark Spots */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Dark Spots</label>
                  <select className="form-control" value={formData.dark_spots} onChange={(e) => handleInputChange("dark_spots", e.target.value)}>
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                {/* Sun Exposure */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Sun Exposure</label>
                  <select className="form-control" value={formData.sun_exposure} onChange={(e) => handleInputChange("sun_exposure", e.target.value)}>
                    <option value="Low">Low (&lt; 1 hr)</option>
                    <option value="Moderate">Moderate (1 - 3 hrs)</option>
                    <option value="High">High (&gt; 3 hrs)</option>
                  </select>
                </div>

                {/* Water Intake */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Water Intake (Liters/Day)</label>
                  <input type="number" step="0.1" min="0" max="10" className="form-control" value={formData.water_intake} onChange={(e) => handleInputChange("water_intake", parseFloat(e.target.value) || 2.0)} />
                </div>

                {/* Sleep Hours */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Sleep (Hours/Night)</label>
                  <input type="number" step="0.5" min="0" max="24" className="form-control" value={formData.sleep_hours} onChange={(e) => handleInputChange("sleep_hours", parseFloat(e.target.value) || 7.0)} />
                </div>

                {/* Stress Level */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Stress Level</label>
                  <select className="form-control" value={formData.stress_level} onChange={(e) => handleInputChange("stress_level", e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Alcohol */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Alcohol Intake</label>
                  <select className="form-control" value={formData.alcohol} onChange={(e) => handleInputChange("alcohol", e.target.value)}>
                    <option value="None">None</option>
                    <option value="Occasional">Occasional</option>
                    <option value="Regular">Regular</option>
                  </select>
                </div>

                {/* Smoking */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#ffffff' }}>
                    <input type="checkbox" checked={formData.smoking} onChange={(e) => handleInputChange("smoking", e.target.checked)} />
                    <span style={{ color: '#ffffff' }}>Regular Smoking Habit</span>
                  </label>
                </div>

                {/* Notes */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#ffffff' }}>Additional Notes / Observations</label>
                  <textarea className="form-control" rows="2" placeholder="e.g. Skin flares up during season change..." value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)}></textarea>
                </div>

              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
                  {submitting ? "Analyzing..." : "Generate AI Skin Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinAssessmentModule;
