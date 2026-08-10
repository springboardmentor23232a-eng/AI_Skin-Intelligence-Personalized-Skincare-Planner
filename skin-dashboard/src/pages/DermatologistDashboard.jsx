import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import ClinicalPatientModal from "../components/ClinicalPatientModal";
import { ShieldAlert, CheckSquare, Activity, Users, RefreshCw } from "lucide-react";

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
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-tech-blue text-white shadow-lg mb-6 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
            Dermatologist Medical Workspace 🩺
          </h1>
          <p className="text-xs text-slate-300 mt-1 mb-0">
            Clinical diagnostic triage, AI risk alerts & medical prescription overrides.
          </p>
        </div>
        <button className="btn-secondary-tech text-xs" onClick={fetchDermData}>
          <RefreshCw size={14} />
          <span>Refresh Clinical Queue</span>
        </button>
      </div>

      {/* Clinical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High Risk Triage Queue</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-sunset text-white flex items-center justify-center shadow-xs">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-500 tracking-tight">{stats ? stats.high_risk_patients : 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-rose-400">Critical Clinical Triage</span>
        </div>

        <div className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Overrides Handled</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-emerald text-white flex items-center justify-center shadow-xs">
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats ? stats.completed_reviews_count : 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-emerald-500">Clinical Reviews Saved</span>
        </div>

        <div className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending AI Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-aurora text-white flex items-center justify-center shadow-xs">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats ? stats.pending_reviews : 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-indigo-500">Awaiting Medical Signoff</span>
        </div>

        <div className="p-5 rounded-2xl saas-card-premium border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Platform Patients</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-cyber-neon text-white flex items-center justify-center shadow-xs">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats ? stats.total_clients : 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-cyan-500">Active Records</span>
        </div>
      </div>


      {/* Triage Risk Queue Table */}
      <div className="saas-card mb-4 shadow-sm">
        <div className="saas-card-header border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="saas-card-title mb-0">High-Priority Medical Triage Queue</h6>
            <span className="saas-card-subtitle">Patients flagged with moderate to severe skin barrier concerns</span>
          </div>
          <span className="badge-saas badge-saas-danger" style={{ fontSize: "0.7rem" }}>Medical Priority</span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
            <p className="mt-2 text-muted small">Loading clinical triage queue...</p>
          </div>
        ) : (
          <div className="table-container-saas mt-3">
            <table className="table-saas">
              <thead>
                <tr>
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
                    <tr key={p.id}>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{p.full_name}</div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{p.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{p.skin_type || "N/A"}</div>
                        <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Tone: {p.skin_tone || "N/A"}</div>
                      </td>
                      <td>
                        <div className="small text-truncate" style={{ maxWidth: "200px", fontSize: "0.8rem" }}>
                          {p.concerns && p.concerns.length > 0 ? p.concerns.join(", ") : "None"}
                        </div>
                      </td>
                      <td>
                        <span className="text-danger small fw-semibold" style={{ fontSize: "0.8rem" }}>
                          {p.allergies || "None reported"}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold" style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>
                          {p.latest_overall_score}%
                        </span>
                      </td>
                      <td>
                        <span className="badge-saas badge-saas-danger" style={{ fontSize: "0.75rem" }}>
                          {p.latest_risk_level}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-saas-outline"
                          onClick={() => setSelectedPatientId(p.id)}
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                        >
                          Clinical Audit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted small" style={{ fontSize: "0.8rem" }}>
                      No high-risk patient flags currently active in the triage queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
