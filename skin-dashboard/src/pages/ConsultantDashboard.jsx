import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import ClinicalPatientModal from "../components/ClinicalPatientModal";
import { Users, AlertCircle, Calendar, Sparkles, RefreshCw, Search } from "lucide-react";

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
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-tech-blue text-white shadow-lg mb-6 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
            Skincare Consultant Workspace 🩺
          </h1>
          <p className="text-xs text-slate-300 mt-1 mb-0">
            Enterprise clinical collaboration dashboard & patient management suite.
          </p>
        </div>
        <button className="btn-secondary-tech text-xs" onClick={fetchDashboardData}>
          <RefreshCw size={14} />
          <span>Refresh Workspace</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned Clients</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-cyber-neon text-white flex items-center justify-center shadow-xs">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats ? stats.total_clients : 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-cyan-500">Active Directory</span>
        </div>

        <div className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High Priority Cases</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-sunset text-white flex items-center justify-center shadow-xs">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-500 tracking-tight">{stats ? stats.high_risk_patients : 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-rose-400">Requires Barrier Audit</span>
        </div>

        <div className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Consultations</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-aurora text-white flex items-center justify-center shadow-xs">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats ? stats.today_consultations : 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-indigo-500">Scheduled Sessions</span>
        </div>

        <div className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending AI Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-royal-purple text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats ? stats.pending_reviews : 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-purple-500">Awaiting Override</span>
        </div>
      </div>


      {/* Patient Directory & Search */}
      <div className="saas-card mb-4 shadow-sm">
        <div className="saas-card-header border-bottom pb-3 mb-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h6 className="saas-card-title mb-0">Patient Clinical Directory</h6>
            <span className="saas-card-subtitle">Search & filter patient diagnostic histories</span>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center" style={{ width: "100%", maxWidth: "500px" }}>
            <div className="position-relative flex-grow-1">
              <Search size={14} className="position-absolute text-muted" style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search name or email..."
                className="form-control-saas"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "30px", fontSize: "0.8rem" }}
              />
            </div>
            <select
              className="form-control-saas"
              style={{ width: "160px", fontSize: "0.8rem" }}
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
            <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
            <p className="mt-2 text-muted small">Loading patient directory...</p>
          </div>
        ) : (
          <div className="table-container-saas mt-3">
            <table className="table-saas">
              <thead>
                <tr>
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
                    <tr key={p.id}>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{p.full_name}</div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{p.email}</div>
                      </td>
                      <td>
                        <span className="badge-saas badge-saas-primary" style={{ fontSize: "0.7rem" }}>{p.skin_type || "Unset"}</span>
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>{p.skin_tone || "Unset"}</td>
                      <td>
                        <div className="small text-truncate" style={{ maxWidth: "200px", fontSize: "0.8rem" }}>
                          {p.concerns && p.concerns.length > 0 ? p.concerns.join(", ") : "None reported"}
                        </div>
                      </td>
                      <td>
                        {p.latest_overall_score !== null ? (
                          <span className="fw-semibold" style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>{p.latest_overall_score}%</span>
                        ) : (
                          <span className="text-muted small" style={{ fontSize: "0.75rem" }}>N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-saas ${p.latest_risk_level === "High Priority" ? "badge-saas-danger" : p.latest_risk_level === "Moderate Risk" ? "badge-saas-warning" : "badge-saas-success"}`} style={{ fontSize: "0.75rem" }}>
                          {p.latest_risk_level}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-saas-outline"
                          onClick={() => setSelectedPatientId(p.id)}
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                        >
                          Inspect Record
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted small" style={{ fontSize: "0.8rem" }}>No patients match search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Consultations Log */}
      <div className="saas-card shadow-sm">
        <div className="saas-card-header border-bottom pb-3 mb-3">
          <div>
            <h6 className="saas-card-title mb-0">Scheduled Consultations Log</h6>
            <span className="saas-card-subtitle">Upcoming and historical sessions</span>
          </div>
        </div>

        <div className="table-container-saas mt-3">
          <table className="table-saas">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Clinical Notes</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length > 0 ? (
                consultations.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold"># {c.id}</td>
                    <td>
                      <div className="fw-semibold" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{c.patient_name}</div>
                      <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{c.patient_email}</div>
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>{new Date(c.scheduled_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge-saas ${c.status === "COMPLETED" ? "badge-saas-success" : c.status === "PENDING" ? "badge-saas-warning" : "badge-saas-danger"}`} style={{ fontSize: "0.75rem" }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: "240px", fontSize: "0.8rem" }}>{c.notes || "No notes"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small" style={{ fontSize: "0.8rem" }}>No consultations currently scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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