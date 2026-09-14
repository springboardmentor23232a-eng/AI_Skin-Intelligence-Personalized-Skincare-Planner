import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import ClinicalPatientModal from "../components/ClinicalPatientModal";

function ConsultantDashboard() {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await apiService.getClinicalStats();
      setStats(statsRes);

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (riskFilter) params.risk_level = riskFilter;

      const patientData = await apiService.getPatients(params);
      setPatients(patientData);

      const consultationData = await apiService.getConsultations();
      setConsultations(consultationData);
    } catch (err) {
      console.error("Failed to load consultant dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, riskFilter]);

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Consultant Workspace
          </h2>
          <p className="text-secondary small mb-0">
            Client collaboration dashboard and personalized skincare consultation suite
          </p>
        </div>
        <button className="btn btn-saas btn-sm d-flex align-items-center gap-2" onClick={fetchDashboardData}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh Workspace
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Assigned Clients</span>
              <span className="stat-value">{stats ? stats.total_clients : 0}</span>
              <span className="stat-trend positive">Active Directory</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Priority Follow-Ups</span>
              <span className="stat-value">{stats ? stats.high_risk_patients : 0}</span>
              <span className="stat-trend positive">Nourishing Care Focus</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Today's Consultations</span>
              <span className="stat-value">{stats ? stats.today_consultations : 0}</span>
              <span className="stat-trend positive">Scheduled Sessions</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Routine Reviews</span>
              <span className="stat-value">{stats ? stats.pending_reviews : 0}</span>
              <span className="stat-trend positive">Pending Feedback</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Directory & Search */}
      <div className="saas-card mb-4 shadow-lg">
        <div className="saas-card-header border-bottom pb-3 mb-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h5 className="saas-card-title mb-0">Patient Clinical Directory</h5>
            <span className="saas-card-subtitle">Search & filter patient diagnostic histories</span>
          </div>

          <div className="d-flex flex-wrap gap-2" style={{ width: "100%", maxWidth: "500px" }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="form-control-saas flex-grow-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select-saas"
              style={{ width: "180px" }}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="">All Risk Levels</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="High Priority">High Priority</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Loading patient directory...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ color: "var(--text-primary)" }}>
              <thead style={{ backgroundColor: "var(--bg-surface-elevated)", borderColor: "var(--border-subtle)" }}>
                <tr className="small text-uppercase text-muted">
                  <th>Patient Name</th>
                  <th>Skin Type</th>
                  <th>Fitzpatrick Tone</th>
                  <th>Target Concerns</th>
                  <th>Latest Health Score</th>
                  <th>Risk Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((p) => (
                    <tr key={p.id} style={{ borderColor: "var(--border-subtle)" }}>
                      <td>
                        <div className="fw-bold">{p.full_name}</div>
                        <div className="text-muted small">{p.email}</div>
                      </td>
                      <td>
                        <span className="badge badge-saas badge-saas-primary">{p.skin_type || "Unset"}</span>
                      </td>
                      <td>{p.skin_tone || "Unset"}</td>
                      <td>
                        <div className="small text-truncate" style={{ maxWidth: "200px" }}>
                          {p.concerns && p.concerns.length > 0 ? p.concerns.join(", ") : "None reported"}
                        </div>
                      </td>
                      <td>
                        {p.latest_overall_score !== null ? (
                          <span className="fw-bold" style={{ color: "var(--accent-primary)" }}>{p.latest_overall_score}%</span>
                        ) : (
                          <span className="text-muted small">N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-saas ${p.latest_risk_level === "High Priority" ? "badge-saas-danger" : p.latest_risk_level === "Moderate Risk" ? "badge-saas-warning" : "badge-saas-success"}`}>
                          {p.latest_risk_level}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-saas"
                          onClick={() => setSelectedPatientId(p.id)}
                        >
                          🔍 Inspect Record
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted small">No patients match your search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Consultations List */}
      <div className="saas-card shadow-lg">
        <div className="saas-card-header border-bottom pb-3 mb-3">
          <div>
            <h5 className="saas-card-title mb-0">Scheduled Consultations Log</h5>
            <span className="saas-card-subtitle">Upcoming and historical sessions</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ color: "var(--text-primary)" }}>
            <thead style={{ backgroundColor: "var(--bg-surface-elevated)", borderColor: "var(--border-subtle)" }}>
              <tr className="small text-uppercase text-muted">
                <th>Consultation ID</th>
                <th>Patient</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Clinical Notes</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length > 0 ? (
                consultations.map((c) => (
                  <tr key={c.id} style={{ borderColor: "var(--border-subtle)" }}>
                    <td>#{c.id}</td>
                    <td>
                      <div className="fw-semibold">{c.patient_name}</div>
                      <div className="text-muted small">{c.patient_email}</div>
                    </td>
                    <td>{new Date(c.scheduled_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-saas ${c.status === "COMPLETED" ? "badge-saas-success" : c.status === "PENDING" ? "badge-saas-warning" : "badge-saas-danger"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="small text-muted">{c.notes || "No notes"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">No consultations currently scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail & Overrides Modal */}
      {selectedPatientId && (
        <ClinicalPatientModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onRefresh={fetchDashboardData}
        />
      )}
    </Layout>
  );
}

export default ConsultantDashboard;