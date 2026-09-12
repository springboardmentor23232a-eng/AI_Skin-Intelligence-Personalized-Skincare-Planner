import { useState, useEffect } from "react";
import apiService from "../services/apiService";
import RadarChart from "./RadarChart";

function ClinicalPatientModal({ patientId, onClose, onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, consultations, review
  
  // Consultation Form State
  const [schedNotes, setSchedNotes] = useState("");
  const [schedRecommendations, setSchedRecommendations] = useState("");
  const [submittingConsultation, setSubmittingConsultation] = useState(false);

  // Review Form State
  const [reviewStatus, setReviewStatus] = useState("APPROVED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    let isMounted = true;
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const res = await apiService.getPatientDetail(patientId);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        console.error("Failed to load patient detail", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPatientData();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const handleScheduleConsultation = async (e) => {
    e.preventDefault();
    setSubmittingConsultation(true);
    try {
      await apiService.scheduleConsultation({
        patient_id: patientId,
        notes: schedNotes,
        treatment_recommendations: schedRecommendations
      });
      setSchedNotes("");
      setSchedRecommendations("");
      const res = await apiService.getPatientDetail(patientId);
      setData(res);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to schedule consultation", err);
    } finally {
      setSubmittingConsultation(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const latestRec = data?.recommendations?.[0];
      await apiService.submitClinicalReview({
        patient_id: patientId,
        recommendation_id: latestRec ? latestRec.id : null,
        status: reviewStatus,
        clinical_notes: reviewNotes,
        custom_routine: latestRec ? latestRec.recommended_products : null
      });
      setReviewNotes("");
      const res = await apiService.getPatientDetail(patientId);
      setData(res);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!patientId) return null;

  const profile = data?.profile;
  const latestAssessment = data?.assessments?.[0];

  const radarData = latestAssessment ? [
    { label: "Acne", value: latestAssessment.acne },
    { label: "Pigmentation", value: latestAssessment.hyperpigmentation },
    { label: "Dryness", value: latestAssessment.dryness },
    { label: "Oiliness", value: latestAssessment.oiliness },
    { label: "Redness", value: latestAssessment.redness },
    { label: "Sensitivity", value: latestAssessment.sensitivity }
  ] : [];

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}>
          <div className="modal-header border-bottom" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: "42px", height: "42px", background: "var(--accent-gradient)" }}>
                👤
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">{data?.patient?.full_name || "Patient Record"}</h5>
                <span className="text-secondary small">{data?.patient?.email} • Patient ID: #{patientId}</span>
              </div>
            </div>
            <button type="button" className="btn-close" style={{ filter: "invert(0.5)" }} onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted small">Fetching clinical profile & records...</p>
              </div>
            ) : (
              <>
                {/* Navigation Sub-Tabs */}
                <div className="d-flex gap-2 mb-4 p-1 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <button
                    className={`btn btn-sm flex-fill ${activeTab === "overview" ? "btn-saas" : "btn-saas-secondary"}`}
                    onClick={() => setActiveTab("overview")}
                  >
                    📊 Diagnostics & Profile
                  </button>
                  <button
                    className={`btn btn-sm flex-fill ${activeTab === "consultations" ? "btn-saas" : "btn-saas-secondary"}`}
                    onClick={() => setActiveTab("consultations")}
                  >
                    🩺 Consultations ({data?.consultations?.length || 0})
                  </button>
                  <button
                    className={`btn btn-sm flex-fill ${activeTab === "review" ? "btn-saas" : "btn-saas-secondary"}`}
                    onClick={() => setActiveTab("review")}
                  >
                    🧬 AI Clinical Overrides ({data?.clinical_reviews?.length || 0})
                  </button>
                </div>

                {activeTab === "overview" && (
                  <div className="row g-4">
                    {/* Patient Parameters Card */}
                    <div className="col-md-5">
                      <div className="saas-card h-100">
                        <h6 className="fw-bold mb-3 border-bottom pb-2" style={{ color: "var(--accent-primary)" }}>
                          Dermatological Profile
                        </h6>
                        <div className="d-flex flex-column gap-2 small">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Age / Gender:</span>
                            <span className="fw-semibold">{profile?.age ? `${profile.age} yrs, ${profile.gender}` : "N/A"}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Skin Type:</span>
                            <span className="badge badge-saas badge-saas-primary">{profile?.skin_type || "N/A"}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Fitzpatrick Tone:</span>
                            <span className="fw-semibold">{profile?.skin_tone || "N/A"}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Target Concerns:</span>
                            <span className="fw-semibold">{profile?.concerns?.join(", ") || "None"}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Reported Allergies:</span>
                            <span className="text-danger fw-semibold">{profile?.allergies || "None reported"}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Water Intake:</span>
                            <span className="fw-semibold">{profile?.water_intake || 2.0} L/day</span>
                          </div>
                        </div>

                        {latestAssessment && (
                          <div className="mt-4 pt-3 border-top">
                            <h6 className="fw-bold mb-2">Latest AI Diagnostic Score</h6>
                            <div className="d-flex align-items-center gap-3">
                              <span className="display-6 fw-bold" style={{ color: "var(--accent-primary)" }}>{latestAssessment.overall_score}%</span>
                              <div>
                                <span className="badge badge-saas badge-saas-warning mb-1">{latestAssessment.risk_level}</span>
                                <div className="text-muted small">Priority: {latestAssessment.concern_priority}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Radar Chart Visualizer */}
                    <div className="col-md-7">
                      <div className="saas-card h-100 text-center">
                        <h6 className="fw-bold mb-2" style={{ color: "var(--accent-primary)" }}>
                          Multi-Parameter Diagnostic Spectrum
                        </h6>
                        {radarData.length > 0 ? (
                          <RadarChart data={radarData} />
                        ) : (
                          <div className="py-5 text-muted small">No assessment data logged yet for this patient.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "consultations" && (
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="saas-card">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">Schedule / Log Consultation</h6>
                        <form onSubmit={handleScheduleConsultation}>
                          <div className="mb-3">
                            <label className="form-label small fw-semibold">Clinical Observations & Notes</label>
                            <textarea
                              className="form-control-saas"
                              rows="3"
                              placeholder="Document patient complaints, barrier state, hydration..."
                              value={schedNotes}
                              onChange={(e) => setSchedNotes(e.target.value)}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label small fw-semibold">Specialist Treatment Advice</label>
                            <textarea
                              className="form-control-saas"
                              rows="3"
                              placeholder="Clinical recommendations, prescriptions, follow-up goals..."
                              value={schedRecommendations}
                              onChange={(e) => setSchedRecommendations(e.target.value)}
                            />
                          </div>
                          <button type="submit" className="btn btn-saas w-100" disabled={submittingConsultation}>
                            {submittingConsultation ? "Scheduling..." : "🩺 Save Consultation"}
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="saas-card">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">Consultation History</h6>
                        <div className="d-flex flex-column gap-3" style={{ maxHeight: "350px", overflowY: "auto" }}>
                          {data?.consultations?.length > 0 ? (
                            data.consultations.map((c) => (
                              <div key={c.id} className="p-3 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="fw-semibold small">{c.consultant_name}</span>
                                  <span className="badge badge-saas badge-saas-success">{c.status}</span>
                                </div>
                                <div className="text-muted small mb-2">{new Date(c.scheduled_at).toLocaleString()}</div>
                                <p className="small mb-1"><strong>Notes:</strong> {c.notes}</p>
                                {c.treatment_recommendations && <p className="small text-info mb-0"><strong>Treatment:</strong> {c.treatment_recommendations}</p>}
                              </div>
                            ))
                          ) : (
                            <div className="text-muted small py-4 text-center">No previous consultations recorded.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "review" && (
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="saas-card">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">Submit Clinical Review & Overrides</h6>
                        <form onSubmit={handleSubmitReview}>
                          <div className="mb-3">
                            <label className="form-label small fw-semibold">Review Status Decision</label>
                            <select
                              className="form-select-saas"
                              value={reviewStatus}
                              onChange={(e) => setReviewStatus(e.target.value)}
                            >
                              <option value="APPROVED">✅ Approved AI Recommendations</option>
                              <option value="MODIFIED">✏️ Modified / Custom Override</option>
                              <option value="REJECTED">❌ Rejected Formulation</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="form-label small fw-semibold">Clinical Specialist Notes</label>
                            <textarea
                              className="form-control-saas"
                              rows="4"
                              placeholder="Document why formulations were modified or approved..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              required
                            />
                          </div>

                          <button type="submit" className="btn btn-saas w-100" disabled={submittingReview}>
                            {submittingReview ? "Submitting..." : "🧬 Submit Clinical Review"}
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="saas-card">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">Past Clinical Overrides</h6>
                        <div className="d-flex flex-column gap-3" style={{ maxHeight: "350px", overflowY: "auto" }}>
                          {data?.clinical_reviews?.length > 0 ? (
                            data.clinical_reviews.map((rev) => (
                              <div key={rev.id} className="p-3 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="fw-semibold small">{rev.reviewer_name}</span>
                                  <span className={`badge badge-saas ${rev.status === "APPROVED" ? "badge-saas-success" : rev.status === "MODIFIED" ? "badge-saas-warning" : "badge-saas-danger"}`}>
                                    {rev.status}
                                  </span>
                                </div>
                                <div className="text-muted small mb-2">{new Date(rev.created_at).toLocaleString()}</div>
                                <p className="small mb-0">"{rev.clinical_notes}"</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-muted small py-4 text-center">No clinical reviews submitted yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicalPatientModal;
