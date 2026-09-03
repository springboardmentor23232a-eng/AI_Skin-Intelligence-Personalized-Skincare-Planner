import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import SkinHealthScoreBreakdown from "../components/SkinHealthScoreBreakdown";

function SkinAnalyticsPage() {
  const [trends, setTrends] = useState([]);
  const [progressEntries, setProgressEntries] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("overall_score");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    let isMounted = true;
    const fetchAnalyticsData = async () => {
      try {
        const trendsData = await apiService.getSkinHealthTrends();
        const progressData = await apiService.getProgressEntries();
        if (isMounted) {
          setTrends(trendsData.trends || []);
          setProgressEntries(progressData || []);
        }
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnalyticsData();
    return () => {
      isMounted = false;
    };
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
      setToast({ message: "⚠️ Please enter some progress notes.", type: "danger" });
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
      setSelectedFile(null);
      setPreviewUrl("");
      setNotes("");
      setToast({ message: "📸 Progress entry saved to your skin timeline!", type: "success" });
    } catch (err) {
      console.error("Failed to add progress entry", err);
      setToast({ message: "Failed to add progress entry.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    return `http://localhost:8000${url}`;
  };

  const renderLineChart = () => {
    if (trends.length === 0) {
      return (
        <div className="text-center py-5 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px dashed var(--border-strong)" }}>
          <span style={{ fontSize: "2.5rem" }}>📊</span>
          <h5 className="fw-bold mt-3 text-secondary">No Assessment History</h5>
          <p className="small text-muted mb-0">Take more skin diagnostic assessments to visualize your trends over time.</p>
        </div>
      );
    }

    const width = 600;
    const height = 300;
    const padding = 40;

    // Map selected metric display name
    const metricLabels = {
      overall_score: "Overall Skin Health Score",
      acne: "Acne Severity Index",
      hyperpigmentation: "Hyperpigmentation Level",
      dryness: "Dryness Level",
      oiliness: "Oiliness Index",
      redness: "Redness / Inflammation",
      sensitivity: "Sensitivity Level"
    };

    // Extract values
    const points = trends.map((t, index) => {
      const val = t[selectedMetric];
      return {
        x: padding + (index / Math.max(1, trends.length - 1)) * (width - padding * 2),
        y: height - padding - (val / 100) * (height - padding * 2),
        value: val,
        date: new Date(t.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      };
    });

    // Create SVG Path line
    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    }

    return (
      <div className="saas-card shadow-lg mb-4">
        <div className="saas-card-header border-bottom pb-3 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
          <div>
            <h5 className="saas-card-title mb-0">{metricLabels[selectedMetric]}</h5>
            <span className="saas-card-subtitle">Tracking improvements and regressions</span>
          </div>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="form-select-saas font-semibold"
            style={{ width: "220px", fontSize: "0.85rem" }}
          >
            <option value="overall_score">Overall Health Score</option>
            <option value="acne">Acne Index</option>
            <option value="hyperpigmentation">Hyperpigmentation</option>
            <option value="dryness">Dryness</option>
            <option value="oiliness">Oiliness</option>
            <option value="redness">Redness & Inflammation</option>
            <option value="sensitivity">Sensitivity</option>
          </select>
        </div>

        <div className="table-responsive">
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ minWidth: "500px" }}>
            {/* Gridlines */}
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

            {/* X Axis Labels */}
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

            {/* Trend Path */}
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

            {/* Path Fill Gradient Area */}
            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                fill="rgba(56, 189, 248, 0.15)"
              />
            )}

            {/* Interactive Data Dots */}
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
                {/* Tooltip Background */}
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
                {/* Tooltip Text */}
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

  const oldestPhoto = [...progressEntries].reverse().find(e => e.photo_url);
  const newestPhoto = progressEntries.find(e => e.photo_url);

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Skin Health Progress & Diary
          </h2>
          <p className="text-secondary small mb-0">
            Monitor your health score trends and track visual progress on your skincare journey
          </p>
        </div>
      </div>

      {/* Skin Health Overview */}
      <SkinHealthScoreBreakdown />

      <div className="row g-4">
        {/* Left Side: Trends and Before/After comparison */}
        <div className="col-lg-8">
          {renderLineChart()}

          {/* Visual Progress Timeline */}
          <div className="saas-card shadow-lg mb-4">
            <div className="saas-card-header border-bottom pb-3 mb-3">
              <div>
                <h5 className="saas-card-title mb-0">Visual Progress Timeline</h5>
                <span className="saas-card-subtitle">Comparing earlier and recent skin photos</span>
              </div>
            </div>

            {oldestPhoto && newestPhoto && oldestPhoto.id !== newestPhoto.id ? (
              <div className="row g-3">
                <div className="col-6 text-center">
                  <div className="fw-semibold text-muted small mb-2">BEFORE ({new Date(oldestPhoto.logged_at).toLocaleDateString()})</div>
                  <div className="ratio ratio-4x3 rounded overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
                    <img
                      src={getFullImageUrl(oldestPhoto.photo_url)}
                      alt="Skin state before"
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"; }}
                    />
                  </div>
                  <p className="text-muted small mt-2 italic">"{oldestPhoto.notes}"</p>
                </div>
                <div className="col-6 text-center">
                  <div className="fw-semibold text-muted small mb-2">AFTER ({new Date(newestPhoto.logged_at).toLocaleDateString()})</div>
                  <div className="ratio ratio-4x3 rounded overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
                    <img
                      src={getFullImageUrl(newestPhoto.photo_url)}
                      alt="Skin state after"
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=300"; }}
                    />
                  </div>
                  <p className="text-muted small mt-2 italic">"{newestPhoto.notes}"</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted border rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", borderStyle: "dashed" }}>
                📸 Add at least two progress entries with photos to unlock Before/After visual comparison.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Log progress & Timeline */}
        <div className="col-lg-4">
          {/* Add Entry Card */}
          <div className="saas-card shadow-lg mb-4">
            <div className="saas-card-header border-bottom pb-3 mb-3">
              <div>
                <h5 className="saas-card-title mb-0">Log Skin Entry</h5>
                <span className="saas-card-subtitle">Document daily photo & notes</span>
              </div>
            </div>

             <form onSubmit={handleAddProgress}>
              <div className="mb-3">
                <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>Select Image</label>
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
                <label className="form-label small fw-semibold" style={{ color: "var(--text-primary)" }}>Diary Notes</label>
                <textarea
                  placeholder="How does your skin feel today? Any improvements, dryness, or irritation?"
                  rows="4"
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
                <span className="saas-card-subtitle">Visual progression logs</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
              {progressEntries.length > 0 ? (
                progressEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded"
                    style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary small fw-bold">
                        {new Date(entry.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    {entry.photo_url && (
                      <div className="mb-2 rounded overflow-hidden border" style={{ maxHeight: "150px" }}>
                        <img
                          src={getFullImageUrl(entry.photo_url)}
                          alt="Progress entry state"
                          style={{ objectFit: "cover", width: "100%", maxHeight: "150px" }}
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"; }}
                        />
                      </div>
                    )}
                    <p className="small text-muted mb-0">"{entry.notes}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">No logs yet. Submit your first progress entry above!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SkinAnalyticsPage;
