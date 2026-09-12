import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiService from "../services/apiService";

export default function SkinHealthScoreBreakdown({ initialData = null, onRefresh = null }) {
  const [scoreData, setScoreData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getSkinHealthScore();
      setScoreData(data);
      if (onRefresh) onRefresh(data);
    } catch (err) {
      console.error("Failed to load skin health overview:", err);
      setError("Unable to compute skin health score right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchScore();
    } else {
      setScoreData(initialData);
    }
  }, [initialData]);

  if (loading) {
    return (
      <div className="saas-card p-4 text-center">
        <div className="spinner-border text-secondary mb-3" role="status" style={{ width: "2rem", height: "2rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-secondary small fw-medium">Refining your skin health overview...</div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="saas-card p-4 text-center">
        <h5 className="fw-semibold text-secondary mb-2">Skin Health Overview</h5>
        <p className="small text-muted mb-3 max-w-md mx-auto">
          Complete your skin profile and record your daily routines to see your personalized health overview.
        </p>
        <button
          type="button"
          className="btn btn-sm btn-saas"
          onClick={fetchScore}
        >
          Recalculate Overview
        </button>
      </div>
    );
  }

  const {
    overall_score,
    status_label,
    interpretation,
    summary,
    factors,
    disclaimer,
    profile_completeness = 100,
    missing_items = [],
    skin_type_context = "Normal"
  } = scoreData;

  const getStatusBadge = (score) => {
    if (score >= 80) return "badge-saas-success";
    if (score >= 65) return "badge-saas-warning";
    return "badge-saas-danger";
  };

  const getBarColor = (score) => {
    if (score >= 80) return "var(--accent-primary, #2d5a4c)";
    if (score >= 65) return "#b46d50";
    return "#b91c1c";
  };

  return (
    <div className="saas-card mb-4" id="skin-health-overview-card">
      {/* Header */}
      <div className="saas-card-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 pb-3 border-bottom">
        <div>
          <h5 className="saas-card-title mb-1">Your Skin Health Overview</h5>
          <span className="saas-card-subtitle">
            A holistic reflection of your barrier condition, daily hydration, sleep, and routine consistency.
          </span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-saas-outline"
          onClick={fetchScore}
          title="Refresh health score with latest logs"
        >
          Update Overview
        </button>
      </div>

      {/* Completeness Prompt if Profile is Incomplete */}
      {profile_completeness < 80 && (
        <div className="p-3 my-3 rounded-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2" style={{
          backgroundColor: "var(--accent-subtle)",
          border: "1px solid var(--border-subtle)"
        }}>
          <div>
            <div className="fw-semibold small" style={{ color: "var(--text-primary)" }}>
              Personalize Your Overview ({Math.round(profile_completeness)}% Complete)
            </div>
            <div className="text-secondary small" style={{ fontSize: "0.825rem" }}>
              {missing_items.length > 0 ? (
                <span>Add {missing_items.slice(0, 3).join(", ")} to refine your daily score.</span>
              ) : (
                <span>Complete your skin profile to unlock full personalization.</span>
              )}
            </div>
          </div>
          <Link to="/profile" className="btn btn-sm btn-saas flex-shrink-0">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="row g-4 align-items-center mt-1 mb-3">
        {/* Left Column: Overall Skin Health Gauge */}
        <div className="col-lg-4 text-center border-end-lg">
          <div
            className="position-relative d-inline-flex flex-column align-items-center justify-content-center p-4 rounded-circle mb-3"
            style={{
              background: "radial-gradient(circle, var(--bg-surface-elevated) 65%, var(--accent-subtle) 100%)",
              border: `2.5px solid ${getBarColor(overall_score)}`,
              width: "170px",
              height: "170px",
              margin: "0 auto"
            }}
          >
            <span className="small text-secondary fw-medium text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.725rem" }}>
              Overall Skin Health
            </span>
            <div className="fw-bold" style={{ fontSize: "2.5rem", lineHeight: "1.1", color: "var(--text-primary)" }}>
              {Math.round(overall_score)}
              <span className="fs-6 text-muted fw-normal">/100</span>
            </div>
            <span className={`badge badge-saas ${getStatusBadge(overall_score)} mt-1`} style={{ fontSize: "0.725rem" }}>
              {status_label}
            </span>
          </div>

          <div className="fw-semibold" style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
            {skin_type_context} Skin Profile
          </div>
          <p className="text-secondary small px-3 mt-1 mb-0" style={{ fontSize: "0.825rem", lineHeight: "1.4" }}>
            {interpretation}
          </p>
        </div>

        {/* Right Column: 5 Factors Breakdown */}
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3 px-1">
            <span className="small fw-semibold text-uppercase text-secondary" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
              Your Skin Health Factors
            </span>
            <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
              5 Personalized Pillars
            </span>
          </div>

          <div className="d-flex flex-column gap-2">
            {Object.entries(factors).map(([key, factor]) => (
              <div
                key={key}
                className="p-3 rounded-3"
                style={{
                  backgroundColor: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-semibold small" style={{ color: "var(--text-primary)" }}>
                      {factor.name}
                    </span>
                    <p className="text-secondary mb-0" style={{ fontSize: "0.75rem" }}>
                      {factor.description}
                    </p>
                  </div>

                  <div className="text-end ps-3 flex-shrink-0">
                    <span className="fw-bold" style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
                      {Math.round(factor.score)}
                      <span className="small text-muted fw-normal" style={{ fontSize: "0.75rem" }}>/100</span>
                    </span>
                    <div>
                      <span className={`badge badge-saas ${getStatusBadge(factor.score)} mt-1`} style={{ fontSize: "0.685rem" }}>
                        {factor.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress mt-2" style={{ height: "4px", backgroundColor: "rgba(128,128,128,0.12)" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, Math.max(0, factor.score))}%`,
                      backgroundColor: getBarColor(factor.score),
                      transition: "width 0.6s ease"
                    }}
                    aria-valuenow={factor.score}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wellness & Safety Notice */}
      <div
        className="p-3 rounded-3 mt-3 text-secondary"
        style={{
          backgroundColor: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.785rem",
          lineHeight: "1.4"
        }}
      >
        <span className="fw-semibold" style={{ color: "var(--text-primary)" }}>Skincare Note: </span>
        {disclaimer}
      </div>
    </div>
  );
}
