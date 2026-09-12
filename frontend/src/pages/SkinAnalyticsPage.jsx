import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import SkinHealthScoreBreakdown from "../components/SkinHealthScoreBreakdown";

function SkinAnalyticsPage() {
  const [trends, setTrends] = useState([]);
  const [progressEntries, setProgressEntries] = useState([]);
  const [adherence, setAdherence] = useState(null);
  const [improvement, setImprovement] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("overall_score");

  // Before/After Photo Pickers
  const [beforePhotoId, setBeforePhotoId] = useState(null);
  const [afterPhotoId, setAfterPhotoId] = useState(null);

  // New Progress Entry Form
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const fetchAnalyticsData = async () => {
    try {
      const [trendsData, progressData, adherenceData, improvementData] = await Promise.allSettled([
        apiService.getSkinHealthTrends(),
        apiService.getProgressEntries(),
        apiService.getAdherenceAnalytics(),
        apiService.getImprovementAnalysis()
      ]);

      if (trendsData.status === "fulfilled") {
        setTrends(trendsData.value.trends || []);
      }
      if (progressData.status === "fulfilled") {
        const entries = progressData.value || [];
        setProgressEntries(entries);

        // Auto-select oldest as Before and newest as After if available
        const photos = entries.filter((e) => e.photo_url);
        if (photos.length >= 2) {
          setBeforePhotoId(photos[photos.length - 1].id);
          setAfterPhotoId(photos[0].id);
        } else if (photos.length === 1) {
          setBeforePhotoId(photos[0].id);
          setAfterPhotoId(photos[0].id);
        }
      }
      if (adherenceData.status === "fulfilled") {
        setAdherence(adherenceData.value);
      }
      if (improvementData.status === "fulfilled") {
        setImprovement(improvementData.value);
      }
    } catch (err) {
      console.error("Failed to fetch analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl("");
    }
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setToast({ message: "Please enter your skin diary notes.", type: "danger" });
      return;
    }
    setSubmitting(true);
    try {
      let newEntry;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("notes", notes.trim());
        newEntry = await apiService.uploadProgressPhoto(formData);
      } else {
        const payload = {
          photo_url: null,
          notes: notes.trim()
        };
        newEntry = await apiService.createProgressEntry(payload);
      }

      setProgressEntries((prev) => [newEntry, ...prev]);
      if (newEntry.photo_url) {
        setAfterPhotoId(newEntry.id);
      }
      setSelectedFile(null);
      setPreviewUrl("");
      setNotes("");
      setToast({ message: "Progress entry saved to your skin timeline!", type: "success" });
    } catch (err) {
      console.error("Failed to add progress entry", err);
      setToast({ message: "Failed to save progress entry.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (photoId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this progress entry?")) return;

    setDeletingId(photoId);
    try {
      await apiService.deleteProgressPhoto(photoId);
      setProgressEntries((prev) => prev.filter((p) => p.id !== photoId));
      if (beforePhotoId === photoId) setBeforePhotoId(null);
      if (afterPhotoId === photoId) setAfterPhotoId(null);
      setToast({ message: "Progress entry deleted.", type: "success" });
    } catch (err) {
      console.error("Failed to delete progress photo", err);
      setToast({ message: "Failed to delete progress photo.", type: "danger" });
    } finally {
      setDeletingId(null);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    return `http://127.0.0.1:8000${url}`;
  };

  const renderLineChart = () => {
    if (trends.length === 0) {
      return (
        <div className="text-center py-5 rounded mb-4" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px dashed var(--border-strong)" }}>
          <span style={{ fontSize: "2.5rem" }}>📊</span>
          <h5 className="fw-bold mt-3 text-secondary">No Assessment History</h5>
          <p className="small text-muted mb-0">Take more skin diagnostic assessments to visualize your trends over time.</p>
        </div>
      );
    }

    const width = 600;
    const height = 300;
    const padding = 40;

    const metricLabels = {
      overall_score: "Overall Skin Health Score",
      acne: "Acne Severity Index",
      hyperpigmentation: "Hyperpigmentation Level",
      dryness: "Dryness Level",
      oiliness: "Oiliness Index",
      redness: "Redness & Inflammation",
      sensitivity: "Sensitivity Level"
    };

    const points = trends.map((t, index) => {
      const val = t[selectedMetric] ?? 0;
      return {
        x: padding + (index / Math.max(1, trends.length - 1)) * (width - padding * 2),
        y: height - padding - (val / 100) * (height - padding * 2),
        value: val,
        date: new Date(t.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      };
    });

    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
    }

    return (
      <div className="saas-card shadow-lg mb-4">
        <div className="saas-card-header border-bottom pb-3 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
          <div>
            <h5 className="saas-card-title mb-0">{metricLabels[selectedMetric]}</h5>
            <span className="saas-card-subtitle">Diagnostic trajectory tracked across assessments</span>
          </div>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="form-select-saas font-semibold"
            style={{ width: "230px", fontSize: "0.85rem" }}
          >
            <option value="overall_score">Overall Health Score</option>
            <option value="acne">Acne Index</option>
            <option value="hyperpigmentation">Hyperpigmentation</option>
            <option value="dryness">Dryness</option>
            <option value="oiliness">Oiliness</option>
            <option value="redness">Redness & Calming</option>
            <option value="sensitivity">Sensitivity</option>
          </select>
        </div>

        <div className="table-responsive">
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ minWidth: "500px" }}>
            {[0, 25, 50, 75, 100].map((gridVal) => {
              const y = height - padding - (gridVal / 100) * (height - padding * 2);
              return (
                <g key={gridVal}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding - 10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    fill="var(--text-secondary)"
                    fontSize="10"
                  >
                    {gridVal}%
                  </text>
                </g>
              );
            })}

            {points.map((p, idx) => (
              <g key={idx}>
                <line
                  x1={p.x}
                  y1={height - padding}
                  x2={p.x}
                  y2={height - padding + 5}
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
                <text
                  x={p.x}
                  y={height - padding + 18}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="9"
                >
                  {p.date}
                </text>
              </g>
            ))}

            {points.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                fill="rgba(56, 189, 248, 0.15)"
              />
            )}

            {points.map((p, idx) => (
              <g key={idx} className="chart-dot-group">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill="var(--accent-primary)"
                  stroke="var(--bg-surface)"
                  strokeWidth="2.5"
                  style={{ cursor: "pointer" }}
                />
                <rect
                  x={p.x - 20}
                  y={p.y - 28}
                  width="40"
                  height="18"
                  rx="4"
                  fill="var(--bg-surface-elevated)"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                  className="chart-tooltip-bg"
                  style={{ visibility: "hidden" }}
                />
                <text
                  x={p.x}
                  y={p.y - 19}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="9"
                  fontWeight="bold"
                  className="chart-tooltip-text"
                  style={{ visibility: "hidden" }}
                >
                  {p.value}%
                </text>
              </g>
            ))}
          </svg>
        </div>

        <style>{`
          .chart-dot-group:hover .chart-tooltip-bg,
          .chart-dot-group:hover .chart-tooltip-text {
            visibility: visible !important;
          }
          .chart-dot-group:hover circle {
            r: 8;
            fill: var(--accent-secondary);
          }
        `}</style>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <Skeleton height="40px" width="300px" className="mb-4" />
          <Skeleton height="300px" width="100%" className="mb-4" />
          <Skeleton height="200px" width="100%" />
        </div>
      </Layout>
    );
  }

  // Filter entries with photo
  const photoEntries = progressEntries.filter((e) => e.photo_url);
  const beforePhoto = photoEntries.find((e) => e.id === beforePhotoId) || photoEntries[photoEntries.length - 1];
  const afterPhoto = photoEntries.find((e) => e.id === afterPhotoId) || photoEntries[0];

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Skin Health Progress & Diary 📈
          </h2>
          <p className="text-secondary small mb-0">
            Monitor real-time health trends, routine adherence consistency, and visual before/after changes.
          </p>
        </div>
      </div>

      {/* Routine Adherence Analytics Card */}
      <div className="saas-card mb-4">
        <div className="saas-card-header border-bottom pb-3 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <div>
            <h5 className="saas-card-title mb-0">Routine Adherence & Consistency Tracking</h5>
            <span className="saas-card-subtitle">Real-time calculations from your logged skincare habits</span>
          </div>
          {adherence?.current_streak > 0 && (
            <span className="badge badge-saas badge-saas-warning">
              🔥 {adherence.current_streak} Day Streak
            </span>
          )}
        </div>

        {adherence?.has_data ? (
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                <span className="text-muted small d-block mb-1">Today's Adherence</span>
                <div className="d-flex align-items-baseline gap-2">
                  <h4 className="fw-bold mb-0">{adherence.daily.rate}%</h4>
                  <span className="small text-muted">({adherence.daily.completed_steps}/{adherence.daily.scheduled_steps} steps)</span>
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-info"
                    style={{ width: `${Math.min(100, adherence.daily.rate)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                <span className="text-muted small d-block mb-1">Weekly Adherence (7 Days)</span>
                <div className="d-flex align-items-baseline gap-2">
                  <h4 className="fw-bold mb-0">{adherence.weekly.rate}%</h4>
                  <span className="small text-muted">{adherence.weekly.completed_steps} completed</span>
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${Math.min(100, adherence.weekly.rate)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                <span className="text-muted small d-block mb-1">Monthly Consistency (30 Days)</span>
                <div className="d-flex align-items-baseline gap-2">
                  <h4 className="fw-bold mb-0">{adherence.monthly.rate}%</h4>
                  <span className="small text-muted">{adherence.monthly.missed_steps} missed</span>
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${Math.min(100, adherence.monthly.rate)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                <span className="text-muted small d-block mb-1">Day vs Night Balance</span>
                <div className="d-flex justify-content-between small text-secondary">
                  <span>☀️ Morning: <strong>{adherence.morning_rate}%</strong></span>
                  <span>🌙 Evening: <strong>{adherence.evening_rate}%</strong></span>
                </div>
                <div className="small text-muted mt-2">
                  Best Streak: <strong>{adherence.longest_streak} days</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted border rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", borderStyle: "dashed" }}>
            📅 No routine logs recorded yet. Start completing daily routine steps on your dashboard to calculate adherence.
          </div>
        )}
      </div>

      {/* Comparative Skin Improvement Analysis */}
      {improvement && (
        <div className="saas-card mb-4">
          <div className="saas-card-header border-bottom pb-3 mb-3">
            <div>
              <h5 className="saas-card-title mb-0">Comparative Improvement Analysis</h5>
              <span className="saas-card-subtitle">Evaluating biological progression across consecutive assessments</span>
            </div>
          </div>

          {improvement.has_sufficient_history ? (
            <div>
              <div className="alert alert-info d-flex align-items-center gap-3 mb-3">
                <span style={{ fontSize: "1.5rem" }}>💡</span>
                <div>
                  <strong>{improvement.interpretation}</strong>
                  <div className="small text-muted">
                    Comparing assessment from {new Date(improvement.previous_assessment_date).toLocaleDateString()} to {new Date(improvement.current_assessment_date).toLocaleDateString()}.
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-3">
                {improvement.parameter_comparison.map((param, idx) => {
                  const isBetter = param.delta > 0;
                  const isWorse = param.delta < 0;
                  return (
                    <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <div className="p-2 border rounded" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                        <span className="text-muted small d-block">{param.name}</span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                          <span className="small text-secondary">{param.previous} → <strong>{param.current}</strong></span>
                          <span
                            className={`badge badge-saas ${
                              isBetter ? "badge-saas-success" : isWorse ? "badge-saas-danger" : "badge-saas-secondary"
                            }`}
                            style={{ fontSize: "0.7rem" }}
                          >
                            {param.delta > 0 ? `+${param.delta}` : param.delta}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2 rounded bg-light-subtle text-muted small fst-italic">
                ⚕️ {improvement.disclaimer}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted border rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", borderStyle: "dashed" }}>
              📊 Complete another assessment to view improvement trends.
              <div className="small text-muted mt-1 fst-italic">{improvement.disclaimer}</div>
            </div>
          )}
        </div>
      )}

      {/* 5-Factor Score Breakdown */}
      <SkinHealthScoreBreakdown />

      <div className="row g-4">
        {/* Left Column: Line Chart & Before/After Comparison */}
        <div className="col-lg-8">
          {renderLineChart()}

          {/* Dynamic Before / After Photo Comparison */}
          <div className="saas-card shadow-lg mb-4">
            <div className="saas-card-header border-bottom pb-3 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
              <div>
                <h5 className="saas-card-title mb-0">Visual Before / After Comparison</h5>
                <span className="saas-card-subtitle">Select any two photos from your history to evaluate epidermal progression</span>
              </div>
            </div>

            {photoEntries.length >= 2 ? (
              <div>
                {/* Photo Selectors */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-muted">Select "Before" Photo</label>
                    <select
                      className="form-select-saas"
                      value={beforePhoto?.id || ""}
                      onChange={(e) => setBeforePhotoId(Number(e.target.value))}
                    >
                      {photoEntries.map((p) => (
                        <option key={p.id} value={p.id}>
                          {new Date(p.logged_at).toLocaleDateString()} - {p.notes ? p.notes.substring(0, 25) + "..." : `Photo #${p.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-muted">Select "After" Photo</label>
                    <select
                      className="form-select-saas"
                      value={afterPhoto?.id || ""}
                      onChange={(e) => setAfterPhotoId(Number(e.target.value))}
                    >
                      {photoEntries.map((p) => (
                        <option key={p.id} value={p.id}>
                          {new Date(p.logged_at).toLocaleDateString()} - {p.notes ? p.notes.substring(0, 25) + "..." : `Photo #${p.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Side by Side Display */}
                <div className="row g-3">
                  <div className="col-6 text-center">
                    <div className="fw-semibold text-secondary small mb-2">
                      BEFORE ({beforePhoto ? new Date(beforePhoto.logged_at).toLocaleDateString() : "N/A"})
                    </div>
                    <div className="ratio ratio-4x3 rounded overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
                      <img
                        src={getFullImageUrl(beforePhoto?.photo_url)}
                        alt="Skin state before"
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"; }}
                      />
                    </div>
                    <p className="text-muted small mt-2 fst-italic">"{beforePhoto?.notes || "Baseline image"}"</p>
                  </div>

                  <div className="col-6 text-center">
                    <div className="fw-semibold text-secondary small mb-2">
                      AFTER ({afterPhoto ? new Date(afterPhoto.logged_at).toLocaleDateString() : "N/A"})
                    </div>
                    <div className="ratio ratio-4x3 rounded overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
                      <img
                        src={getFullImageUrl(afterPhoto?.photo_url)}
                        alt="Skin state after"
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=300"; }}
                      />
                    </div>
                    <p className="text-muted small mt-2 fst-italic">"{afterPhoto?.notes || "Current condition"}"</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted border rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", borderStyle: "dashed" }}>
                📸 Add at least two progress entries with photos below to unlock interactive Before / After comparison.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Log Skin Entry & Timeline History */}
        <div className="col-lg-4">
          {/* Add Entry Form Card */}
          <div className="saas-card shadow-lg mb-4">
            <div className="saas-card-header border-bottom pb-3 mb-3">
              <div>
                <h5 className="saas-card-title mb-0">Log Skin Entry</h5>
                <span className="saas-card-subtitle">Document daily photo and notes</span>
              </div>
            </div>

            <form onSubmit={handleAddProgress}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                  Upload Progress Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="form-control-saas"
                />
                {previewUrl && (
                  <div className="mt-2 text-center border rounded p-1" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                    <img
                      src={previewUrl}
                      alt="Selected Preview"
                      style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "6px", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>
                  Diary Notes
                </label>
                <textarea
                  placeholder="How does your skin feel today? Any improvements, dryness, or irritation?"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-control-saas"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-saas w-100"
              >
                {submitting ? "Saving Entry..." : "📸 Save Entry / Upload"}
              </button>
            </form>
          </div>

          {/* Timeline History */}
          <div className="saas-card shadow-lg">
            <div className="saas-card-header border-bottom pb-3 mb-3">
              <div>
                <h5 className="saas-card-title mb-0">Skin History Timeline</h5>
                <span className="saas-card-subtitle">{progressEntries.length} logged progression entries</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-3" style={{ maxHeight: "450px", overflowY: "auto" }}>
              {progressEntries.length > 0 ? (
                progressEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded position-relative"
                    style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary small fw-bold">
                        {new Date(entry.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <button
                        className="btn btn-sm btn-link text-danger p-0"
                        style={{ fontSize: "0.75rem", textDecoration: "none" }}
                        onClick={(e) => handleDeletePhoto(entry.id, e)}
                        disabled={deletingId === entry.id}
                        title="Delete this progress entry"
                      >
                        {deletingId === entry.id ? "..." : "🗑️ Delete"}
                      </button>
                    </div>

                    {entry.photo_url && (
                      <div className="mb-2 rounded overflow-hidden border" style={{ maxHeight: "150px" }}>
                        <img
                          src={getFullImageUrl(entry.photo_url)}
                          alt="Progress entry"
                          style={{ objectFit: "cover", width: "100%", maxHeight: "150px" }}
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"; }}
                        />
                      </div>
                    )}
                    <p className="small text-muted mb-0">"{entry.notes}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">
                  No logs yet. Submit your first progress entry above!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SkinAnalyticsPage;
