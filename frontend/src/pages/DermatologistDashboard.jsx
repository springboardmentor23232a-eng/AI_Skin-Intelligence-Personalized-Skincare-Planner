import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import ClinicalPatientModal from "../components/ClinicalPatientModal";

function DermatologistDashboard() {
  const [stats, setStats] = useState(null);
  const [highRiskPatients, setHighRiskPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const fetchDermData = async () => {
    setLoading(true);
    try {
      const statsRes = await apiService.getClinicalStats();
      setStats(statsRes);

      // Fetch all patients and filter high risk
      const allPatients = await apiService.getPatients();
      const highRisk = allPatients.filter(
        (p) => p.latest_risk_level && p.latest_risk_level.toLowerCase() !== "low risk"
      );
      setHighRiskPatients(highRisk);
    } catch (err) {
      console.error("Failed to load dermatologist dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDermData();
  }, []);

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Dermatology Care Workspace
          </h2>
          <p className="text-secondary small mb-0">
            Clinical diagnostic triage, risk alerts, and specialist consultation reviews
          </p>
        </div>
        <button className="btn btn-saas btn-sm d-flex align-items-center gap-2" onClick={fetchDermData}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh Queue
        </button>
      </div>

      {/* Clinical Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card" style={{ borderColor: "var(--accent-primary)" }}>
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">High Priority Queue</span>
              <span className="stat-value" style={{ color: "var(--accent-primary)" }}>
                {highRiskPatients.length}
              </span>
              <span className="stat-trend negative">Requires Specialist Review</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Completed Reviews</span>
              <span className="stat-value">{stats ? stats.completed_reviews_count : 0}</span>
              <span className="stat-trend positive">Clinical Reviews Saved</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Pending Reviews</span>
              <span className="stat-value">{stats ? stats.pending_reviews : 0}</span>
              <span className="stat-trend positive">Awaiting Specialist Signoff</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Platform Patients</span>
              <span className="stat-value">{stats ? stats.total_clients : 0}</span>
              <span className="stat-trend positive">Active Records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Triage Risk Queue Table */}
      <div className="saas-card mb-4 shadow-lg">
        <div className="saas-card-header border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="saas-card-title mb-0">High-Priority Medical Triage Queue</h5>
            <span className="saas-card-subtitle">Patients flagged with moderate to severe skin barrier concerns</span>
          </div>
          <span className="badge badge-saas badge-saas-danger">Medical Priority</span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="mt-2 text-muted small">Loading clinical triage queue...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ color: "var(--text-primary)" }}>
              <thead style={{ backgroundColor: "var(--bg-surface-elevated)", borderColor: "var(--border-subtle)" }}>
                <tr className="small text-uppercase text-muted">
                  <th>Patient</th>
                  <th>Skin Profile</th>
                  <th>Primary Concerns</th>
                  <th>Reported Allergies</th>
                  <th>Diagnostic Health Score</th>
                  <th>Risk Rating</th>
                  <th>Medical Action</th>
                </tr>
              </thead>
              <tbody>
                {highRiskPatients.length > 0 ? (
                  highRiskPatients.map((p) => (
                    <tr key={p.id} style={{ borderColor: "var(--border-subtle)" }}>
                      <td>
                        <div className="fw-bold">{p.full_name}</div>
                        <div className="text-muted small">{p.email}</div>
                      </td>
                      <td>
                        <div>{p.skin_type || "N/A"}</div>
                        <div className="text-muted small">Tone: {p.skin_tone || "N/A"}</div>
                      </td>
                      <td>
                        <div className="small text-truncate" style={{ maxWidth: "200px" }}>
                          {p.concerns && p.concerns.length > 0 ? p.concerns.join(", ") : "None"}
                        </div>
                      </td>
                      <td>
                        <span className="text-danger small fw-semibold">
                          {p.allergies || "None reported"}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold fs-5" style={{ color: "var(--accent-primary)" }}>
                          {p.latest_overall_score}%
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-saas badge-saas-danger">
                          {p.latest_risk_level}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-saas"
                          onClick={() => setSelectedPatientId(p.id)}
                        >
                          🩺 Clinical Audit & Override
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted small">
                      🎉 No high-risk patient flags currently active in the triage queue!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Inspector Modal */}
      {selectedPatientId && (
        <ClinicalPatientModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onRefresh={fetchDermData}
        />
      )}
    </Layout>
  );
}

export default DermatologistDashboard;
