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

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editableSteps, setEditableSteps] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dismissedAdaptation, setDismissedAdaptation] = useState(false);

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
    setDismissedAdaptation(false);
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

  const handleStartEdit = () => {
    if (activeRoutine && activeRoutine.steps) {
      setEditableSteps(JSON.parse(JSON.stringify(activeRoutine.steps)));
      setIsEditing(true);
    }
  };

  const handleStepChange = (index, field, value) => {
    setEditableSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddStep = () => {
    setEditableSteps((prev) => [
      ...prev,
      {
        step_number: prev.length + 1,
        category: "Custom Active Care",
        ingredient: "Target Active Ingredient",
        instructions: "Apply to clean dry skin as directed.",
        frequency: "Daily",
        duration: "1 Minute",
        precautions: "Perform patch test before application.",
        expected_benefits: "Supports localized skin health and targeted concerns."
      }
    ]);
  };

  const handleRemoveStep = (index) => {
    setEditableSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveStep = (index, direction) => {
    setEditableSteps((prev) => {
      const updated = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleSaveChanges = async () => {
    if (!activeRoutine) return;
    setSaving(true);
    try {
      const reindexedSteps = editableSteps.map((step, idx) => ({
        ...step,
        step_number: idx + 1
      }));
      const updatedRoutine = await apiService.updateRoutine(activeRoutine.id, {
        steps: reindexedSteps
      });
      setRoutines((prev) =>
        prev.map((r) => (r.id === updatedRoutine.id ? { ...r, ...updatedRoutine } : r))
      );
      setIsEditing(false);
      setToast({ message: "💾 Routine changes saved successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Failed to update routine.", type: "danger" });
    } finally {
      setSaving(false);
    }
  };

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
        <div className="d-flex gap-2">
          {activeRoutine && !isEditing && (
            <button
              type="button"
              className="btn btn-saas-secondary d-flex align-items-center gap-2"
              onClick={handleStartEdit}
            >
              <span>✏️</span>
              <span>Edit Routine</span>
            </button>
          )}
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
            onClick={() => {
              setActiveTab(tab.key);
              setIsEditing(false);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Adaptive Routine Banner */}
      {activeRoutine?.adapted_from_previous_assessment && activeRoutine?.adaptation_summary && !dismissedAdaptation && (
        <div className="p-3 mb-4 rounded border shadow-sm" style={{ backgroundColor: "rgba(13, 202, 240, 0.1)", borderColor: "var(--accent-primary)" }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5">⚡</span>
              <h6 className="fw-bold mb-0" style={{ color: "var(--text-primary)" }}>
                Adaptive Routine Update
              </h6>
            </div>
            <span className="badge bg-info text-dark">Assessment Delta Detected</span>
          </div>
          <p className="small text-secondary mb-3">
            Your latest assessment changed compared with your previous assessment:
          </p>
          <div className="p-2 rounded bg-white bg-opacity-75 small text-dark mb-3 border">
            {activeRoutine.adaptation_summary}
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-saas"
              onClick={handleGenerateRoutines}
              disabled={generating}
            >
              🔄 Regenerate Routine
            </button>
            <button
              type="button"
              className="btn btn-sm btn-saas-secondary"
              onClick={() => setDismissedAdaptation(true)}
            >
              ✓ Keep Current Routine
            </button>
          </div>
        </div>
      )}

      {/* Routine Step Editor View */}
      {isEditing ? (
        <div className="saas-card mb-4 shadow-lg border border-primary">
          <div className="saas-card-header border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
                ✏️ Edit Protocol Steps — {activeRoutine?.routine_type}
              </h4>
              <span className="saas-card-subtitle">Customize categories, ingredients, and instructions</span>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-saas-secondary"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-saas"
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>

          <div className="d-flex flex-column gap-3">
            {editableSteps.map((step, index) => (
              <div
                key={index}
                className="p-3 rounded border"
                style={{ backgroundColor: "var(--bg-surface-elevated)", borderColor: "var(--border-subtle)" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge badge-saas badge-saas-primary">Step {index + 1}</span>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      onClick={() => handleMoveStep(index, -1)}
                      disabled={index === 0}
                    >
                      ▲ Up
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      onClick={() => handleMoveStep(index, 1)}
                      disabled={index === editableSteps.length - 1}
                    >
                      ▼ Down
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      onClick={() => handleRemoveStep(index)}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>

                <div className="row g-3 mb-2">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Step Category</label>
                    <input
                      type="text"
                      className="form-control-saas"
                      value={step.category}
                      onChange={(e) => handleStepChange(index, "category", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Active Ingredient</label>
                    <input
                      type="text"
                      className="form-control-saas"
                      value={step.ingredient}
                      onChange={(e) => handleStepChange(index, "ingredient", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold">Instructions</label>
                  <textarea
                    rows="2"
                    className="form-control-saas"
                    value={step.instructions}
                    onChange={(e) => handleStepChange(index, "instructions", e.target.value)}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Frequency</label>
                    <input
                      type="text"
                      className="form-control-saas"
                      value={step.frequency}
                      onChange={(e) => handleStepChange(index, "frequency", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Precautions</label>
                    <input
                      type="text"
                      className="form-control-saas"
                      value={step.precautions}
                      onChange={(e) => handleStepChange(index, "precautions", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-saas-secondary w-100 py-2 border-dashed mt-2"
              onClick={handleAddStep}
            >
              ➕ Add Step
            </button>
          </div>
        </div>
      ) : activeRoutine ? (
        /* Active Routine View */
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
