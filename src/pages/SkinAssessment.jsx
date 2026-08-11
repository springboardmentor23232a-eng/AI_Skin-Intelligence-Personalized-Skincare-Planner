import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import RadarChart from "../components/RadarChart";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";

function SkinAssessment() {
  const [history, setHistory] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [metrics, setMetrics] = useState({
    acne: 25,
    hyperpigmentation: 15,
    dryness: 30,
    oiliness: 20,
    redness: 10,
    sensitivity: 15,
    wrinkles: 10,
    fine_lines: 15,
    dark_spots: 20,
    uneven_tone: 20
  });

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      try {
        const data = await apiService.getAssessmentHistory();
        if (isMounted) {
          setHistory(data);
          if (data && data.length > 0) {
            setCurrentAssessment(data[0]);
          }
        }
      } catch {
        // Fallback gracefully if no assessment history exists yet
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadHistory();
    return () => { isMounted = false; };
  }, []);

  const handleSliderChange = (field, value) => {
    setMetrics((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const handleRunAssessment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiService.createAssessment(metrics);
      setCurrentAssessment(result);
      setHistory((prev) => [result, ...prev]);
      setToast({ message: `AI Assessment complete! Health Score: ${result.overall_score}%`, type: "success" });
    } catch {
      setToast({ message: "Failed to process assessment", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const radarData = currentAssessment
    ? [
        { label: "Acne", value: currentAssessment.acne },
        { label: "Pigmentation", value: currentAssessment.hyperpigmentation },
        { label: "Dryness", value: currentAssessment.dryness },
        { label: "Oiliness", value: currentAssessment.oiliness },
        { label: "Redness", value: currentAssessment.redness },
        { label: "Sensitivity", value: currentAssessment.sensitivity },
        { label: "Wrinkles", value: currentAssessment.wrinkles }
      ]
    : [
        { label: "Acne", value: metrics.acne },
        { label: "Pigmentation", value: metrics.hyperpigmentation },
        { label: "Dryness", value: metrics.dryness },
        { label: "Oiliness", value: metrics.oiliness },
        { label: "Redness", value: metrics.redness },
        { label: "Sensitivity", value: metrics.sensitivity },
        { label: "Wrinkles", value: metrics.wrinkles }
      ];

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <Skeleton height="40px" width="300px" className="mb-3" />
          <Skeleton height="350px" width="100%" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            AI Skin Assessment Engine
          </h2>
          <p className="text-secondary small mb-0">
            Evaluate dermatological parameters, generate risk scores, and track health trends
          </p>
        </div>
        {currentAssessment && (
          <div className="d-flex align-items-center gap-2">
            <span className={`badge badge-saas ${currentAssessment.overall_score >= 80 ? 'badge-saas-success' : 'badge-saas-warning'}`}>
              Health Score: {currentAssessment.overall_score}%
            </span>
            <span className="badge badge-saas badge-saas-primary">{currentAssessment.risk_level}</span>
          </div>
        )}
      </div>

      <div className="row g-4 mb-4">
        {/* Assessment Evaluation Form */}
        <div className="col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <h5 className="saas-card-title mb-0">Evaluate Parameters</h5>
              <span className="saas-card-subtitle">Adjust severity scales (0-100)</span>
            </div>

            <form onSubmit={handleRunAssessment} className="mt-3">
              <div className="row g-3">
                {[
                  { key: "acne", label: "Acne & Blemishes" },
                  { key: "hyperpigmentation", label: "Hyperpigmentation" },
                  { key: "dryness", label: "Dryness Level" },
                  { key: "oiliness", label: "Secretion & Oiliness" },
                  { key: "redness", label: "Redness / Erythema" },
                  { key: "sensitivity", label: "Skin Sensitivity" },
                  { key: "wrinkles", label: "Wrinkles & Lines" },
                  { key: "dark_spots", label: "Dark Spots" }
                ].map((item) => (
                  <div key={item.key} className="col-6">
                    <div className="d-flex justify-content-between small fw-semibold mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      <span style={{ color: "var(--accent-primary)" }}>{metrics[item.key]}%</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      value={metrics[item.key]}
                      onChange={(e) => handleSliderChange(item.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-saas w-100 mt-4"
                disabled={submitting}
              >
                {submitting ? "Analyzing Assessment..." : "⚡ Execute AI Assessment Engine"}
              </button>
            </form>
          </div>
        </div>

        {/* Assessment Visualization & Radar Chart */}
        <div className="col-lg-6">
          <div className="saas-card h-100 text-center">
            <div className="saas-card-header text-start">
              <h5 className="saas-card-title mb-0">Radar Diagnostic Visualizer</h5>
              <span className="saas-card-subtitle">Multidimensional concern distribution</span>
            </div>

            <RadarChart data={radarData} />

            {currentAssessment && (
              <div className="p-3 rounded text-start mt-2" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold small" style={{ color: "var(--text-primary)" }}>Primary Concern:</span>
                  <span className="badge badge-saas badge-saas-warning">{currentAssessment.concern_priority}</span>
                </div>
                <p className="small text-secondary mb-0">
                  {currentAssessment.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment History Table */}
      <div className="saas-card">
        <div className="saas-card-header">
          <div>
            <h5 className="saas-card-title mb-0">Previous Assessment Records</h5>
            <span className="saas-card-subtitle">Stored in PostgreSQL database</span>
          </div>
          <span className="badge badge-saas badge-saas-info">{history.length} Saved</span>
        </div>

        <div className="table-container-saas">
          <table className="table-saas">
            <thead>
              <tr>
                <th>Assessment ID</th>
                <th>Date & Time</th>
                <th>Overall Score</th>
                <th>Risk Level</th>
                <th>Top Concern</th>
                <th>Summary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((a) => (
                <tr key={a.id}>
                  <td className="fw-semibold"># {a.id}</td>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-saas ${a.overall_score >= 80 ? 'badge-saas-success' : 'badge-saas-warning'}`}>
                      {a.overall_score}%
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-saas badge-saas-primary">{a.risk_level}</span>
                  </td>
                  <td>{a.concern_priority}</td>
                  <td className="text-truncate" style={{ maxWidth: "240px" }}>{a.summary}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-saas-outline"
                      onClick={() => setCurrentAssessment(a)}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default SkinAssessment;
