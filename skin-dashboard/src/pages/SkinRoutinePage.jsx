import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { Sparkles, Sun, Moon, Calendar, Layers, Thermometer, AlertCircle, Check } from "lucide-react";

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
      setToast({ message: "AI Personal Routines generated successfully!", type: "success" });
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
          <h4 className="fw-semibold mb-1" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            AI Personalized Routine Engine
          </h4>
          <p className="text-secondary small mb-0">
            Tailored Morning, Evening, Weekly, Monthly, and Seasonal protocols based on your skin metrics
          </p>
        </div>
        <button
          type="button"
          className="btn btn-saas d-flex align-items-center gap-2"
          onClick={handleGenerateRoutines}
          disabled={generating}
          style={{ fontSize: "0.8rem", padding: "8px 16px" }}
        >
          <Sparkles size={14} />
          <span>{generating ? "Generating AI Routine..." : "Generate AI Routine"}</span>
        </button>
      </div>

      {/* Routine Type Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 p-1 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
        {[
          { key: "MORNING", label: "Morning Protocol", icon: <Sun size={14} /> },
          { key: "EVENING", label: "Evening Repair", icon: <Moon size={14} /> },
          { key: "WEEKLY", label: "Weekly Reset", icon: <Calendar size={14} /> },
          { key: "MONTHLY", label: "Monthly Detox", icon: <Layers size={14} /> },
          { key: "SEASONAL", label: "Seasonal Adapt", icon: <Thermometer size={14} /> }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`btn btn-sm d-flex align-items-center justify-content-center gap-2 flex-fill ${activeTab === tab.key ? "btn-saas" : "btn-saas-secondary"}`}
            onClick={() => setActiveTab(tab.key)}
            style={{ fontSize: "0.8rem", padding: "6px 12px", border: activeTab === tab.key ? "none" : "1px solid transparent" }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Routine View */}
      {activeRoutine ? (
        <div className="saas-card mb-4 shadow-sm">
          <div className="saas-card-header border-bottom pb-3 mb-3">
            <div>
              <h5 className="fw-semibold mb-1" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {activeRoutine.title}
              </h5>
              <p className="text-secondary small mb-0">{activeRoutine.description}</p>
            </div>
            <span className="badge-saas badge-saas-primary" style={{ fontSize: "0.75rem" }}>
              {activeRoutine.steps?.length || 0} Regimen Steps
            </span>
          </div>

          <div className="d-flex flex-column gap-3 mt-3">
            {activeRoutine.steps?.map((step) => (
              <div
                key={step.step_number}
                className="p-3 rounded"
                style={{
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded d-flex align-items-center justify-content-center text-dark fw-semibold"
                      style={{ width: "24px", height: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", fontSize: "0.8rem", color: "var(--text-primary)" }}
                    >
                      {step.step_number}
                    </span>
                    <h6 className="fw-semibold mb-0" style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                      {step.category}
                    </h6>
                  </div>
                  <div className="d-flex gap-2">
                    <span className="badge-saas badge-saas-info" style={{ fontSize: "0.7rem" }}>{step.duration}</span>
                    <span className="badge-saas badge-saas-success" style={{ fontSize: "0.7rem" }}>{step.frequency}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small fw-semibold text-muted text-uppercase mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                    Recommended Active Ingredient
                  </div>
                  <div className="fw-semibold" style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>
                    {step.ingredient}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="small fw-semibold text-muted text-uppercase mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                    Application Instructions
                  </div>
                  <p className="small text-secondary mb-0" style={{ fontSize: "0.8rem", lineHeight: "1.5" }}>{step.instructions}</p>
                </div>

                <div className="row g-2 pt-2 border-top" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="col-md-6">
                    <div className="p-2 rounded small d-flex gap-2" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", fontSize: "0.75rem" }}>
                      <AlertCircle size={14} className="text-warning flex-shrink-0" style={{ marginTop: "2px" }} />
                      <div>
                        <strong>Precautions: </strong> <span className="text-secondary">{step.precautions}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-2 rounded small d-flex gap-2" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", fontSize: "0.75rem" }}>
                      <Check size={14} className="text-success flex-shrink-0" style={{ marginTop: "2px" }} />
                      <div>
                        <strong>Expected Benefits: </strong> <span className="text-secondary">{step.expected_benefits}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="saas-card text-center py-5 shadow-sm">
          <Sparkles size={32} className="text-muted mx-auto mb-3" />
          <h5 className="fw-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No Routine Generated Yet
          </h5>
          <p className="text-secondary max-w-md mx-auto small mb-4" style={{ fontSize: "0.8rem" }}>
            Click below to run the AI Routine Engine and build your personalized morning, evening, weekly, monthly, and seasonal protocols.
          </p>
          <button
            type="button"
            className="btn btn-saas px-4 py-2"
            onClick={handleGenerateRoutines}
            disabled={generating}
            style={{ fontSize: "0.8rem" }}
          >
            Generate My AI Personalized Routine
          </button>
        </div>
      )}
    </Layout>
  );
}

export default SkinRoutinePage;
