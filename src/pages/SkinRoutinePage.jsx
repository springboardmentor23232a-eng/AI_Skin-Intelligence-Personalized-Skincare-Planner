import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";

function SkinRoutinePage() {
  const [routines, setRoutines] = useState([]);
  const [activeTab, setActiveTab] = useState("MORNING");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    let isMounted = true;
    const fetchRoutinesData = async () => {
      try {
        const data = await apiService.getRoutines();
        if (isMounted) {
          setRoutines(data);
        }
      } catch {
        if (isMounted) setRoutines([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRoutinesData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerateRoutines = async () => {
    setGenerating(true);
    try {
      const data = await apiService.generateRoutines();
      setRoutines(data);
      setToast({ message: "⚡ AI Personal Routines generated successfully!", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || "Failed to generate routines. Please ensure skin profile exists.",
        type: "danger"
      });
    } finally {
      setGenerating(false);
    }
  };

  const activeRoutine = routines.find((r) => r.routine_type === activeTab);

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
            AI Personalized Routine Engine
          </h2>
          <p className="text-secondary small mb-0">
            Tailored Morning, Evening, Weekly, Monthly, and Seasonal protocols based on your skin metrics
          </p>
        </div>
        <button
          type="button"
          className="btn btn-saas d-flex align-items-center gap-2"
          onClick={handleGenerateRoutines}
          disabled={generating}
        >
          <span>⚡</span>
          <span>{generating ? "Generating AI Routine..." : "Generate AI Routine"}</span>
        </button>
      </div>

      {/* Routine Type Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 p-1 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
        {[
          { key: "MORNING", label: "🌞 Morning Protocol" },
          { key: "EVENING", label: "🌙 Evening Repair" },
          { key: "WEEKLY", label: "✨ Weekly Reset" },
          { key: "MONTHLY", label: "🔬 Monthly Detox" },
          { key: "SEASONAL", label: "🌡️ Seasonal Adapt" }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`btn btn-sm flex-fill ${activeTab === tab.key ? "btn-saas" : "btn-saas-secondary"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Routine View */}
      {activeRoutine ? (
        <div className="saas-card mb-4 shadow-lg">
          <div className="saas-card-header border-bottom pb-3 mb-3">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
                {activeRoutine.title}
              </h4>
              <p className="text-secondary small mb-0">{activeRoutine.description}</p>
            </div>
            <span className="badge badge-saas badge-saas-primary">
              {activeRoutine.steps?.length || 0} Regimen Steps
            </span>
          </div>

          <div className="d-flex flex-column gap-4 mt-3">
            {activeRoutine.steps?.map((step) => (
              <div
                key={step.step_number}
                className="p-4 rounded shadow-sm"
                style={{
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ width: "32px", height: "32px", background: "var(--accent-gradient)", fontSize: "0.9rem" }}
                    >
                      {step.step_number}
                    </span>
                    <h5 className="fw-bold mb-0" style={{ color: "var(--text-primary)" }}>
                      {step.category}
                    </h5>
                  </div>
                  <div className="d-flex gap-2">
                    <span className="badge badge-saas badge-saas-info">{step.duration}</span>
                    <span className="badge badge-saas badge-saas-success">{step.frequency}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small fw-semibold text-muted text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>
                    Recommended Active Ingredient
                  </div>
                  <div className="fw-bold fs-6" style={{ color: "var(--accent-primary)" }}>
                    🧬 {step.ingredient}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small fw-semibold text-muted text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>
                    Application Instructions
                  </div>
                  <p className="small text-secondary mb-0">{step.instructions}</p>
                </div>

                <div className="row g-3 pt-2 border-top" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="col-md-6">
                    <div className="p-2 rounded bg-warning bg-opacity-10 text-warning-emphasis small border border-warning border-opacity-25">
                      <strong>⚠️ Precautions: </strong> {step.precautions}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-2 rounded bg-success bg-opacity-10 text-success-emphasis small border border-success border-opacity-25">
                      <strong>✨ Expected Benefits: </strong> {step.expected_benefits}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="saas-card text-center py-5">
          <div style={{ fontSize: "3rem" }}>✨</div>
          <h4 className="fw-bold mt-3 mb-2" style={{ color: "var(--text-primary)" }}>
            No Routine Generated Yet
          </h4>
          <p className="text-secondary max-w-md mx-auto small mb-4">
            Click below to run the AI Routine Engine and build your personalized morning, evening, weekly, monthly, and seasonal protocols.
          </p>
          <button
            type="button"
            className="btn btn-saas btn-lg px-4"
            onClick={handleGenerateRoutines}
            disabled={generating}
          >
            ⚡ Generate My AI Personalized Routine
          </button>
        </div>
      )}
    </Layout>
  );
}

export default SkinRoutinePage;
