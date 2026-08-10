import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import { BarChart3, Camera } from "lucide-react";

function SkinAnalyticsPage() {
  const [trends, setTrends] = useState([]);
  const [progressEntries, setProgressEntries] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("overall_score");
  const [photoUrl, setPhotoUrl] = useState("");
  const [notes, setNotes] = useState("");
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

  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setToast({ message: "Please enter some progress notes.", type: "danger" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        photo_url: photoUrl.trim() || null,
        notes: notes.trim()
      };
      const newEntry = await apiService.createProgressEntry(payload);
      setProgressEntries((prev) => [newEntry, ...prev]);
      setPhotoUrl("");
      setNotes("");
      setToast({ message: "Progress entry saved to your skin timeline!", type: "success" });
    } catch (err) {
      console.error("Failed to add progress entry", err);
      setToast({ message: "Failed to add progress entry.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderLineChart = () => {
    if (trends.length === 0) {
      return (
        <div className="text-center py-5 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px dashed var(--border-strong)" }}>
          <BarChart3 size={32} className="text-muted mx-auto mb-2" />
          <h6 className="fw-semibold mt-3 text-secondary">No Assessment History</h6>
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
      redness: "Redness / Inflammation",
      sensitivity: "Sensitivity Level"
    };

    const points = trends.map((t, index) => {
      const val = t[selectedMetric];
      return {
        x: padding + (index / Math.max(1, trends.length - 1)) * (width - padding * 2),
        y: height - padding - (val / 100) * (height - padding * 2),
        value: val,
        date: new Date(t.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      };
    });

    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    }

    return (
      <div className="saas-card mb-4 shadow-sm">
        <div className="saas-card-header border-bottom pb-3 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
          <div>
            <h6 className="saas-card-title mb-0">{metricLabels[selectedMetric]}</h6>
            <span className="saas-card-subtitle">Tracking improvements and regressions</span>
          </div>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="form-control-saas"
            style={{ width: "220px", fontSize: "0.8rem" }}
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
                stroke="var(--text-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                fill="var(--accent-subtle)"
                style={{ opacity: 0.5 }}
              />
            )}

            {points.map((p, idx) => (
              <g key={idx} className="chart-dot-group">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="var(--accent-primary)"
                  stroke="var(--bg-surface)"
                  strokeWidth="2"
                  style={{ cursor: "pointer" }}
                />
                <rect
                  x={p.x - 20}
                  y={p.y - 28}
                  width="40"
                  height="18"
                  rx="3"
                  fill="var(--bg-surface-elevated)"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                  className="chart-tooltip-bg"
                  style={{ visibility: "hidden" }}
                />
                <text
                  x={p.x}
                  y={p.y - 17}
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
            r: 7;
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
          <h4 className="fw-bold mb-1 text-gradient-aurora" style={{ letterSpacing: "-0.02em" }}>
            Skin Health Analytics & Progress Diary 📊
          </h4>
          <p className="text-secondary small mb-0">
            Monitor diagnostics trends and log before/after photos on your skin wellness journey
          </p>
        </div>
      </div>


      <div className="row g-4">
        {/* Left Side: Trends and Before/After comparison */}
        <div className="col-lg-8">
          {renderLineChart()}

          {/* Before/After Photo Side-by-Side Comparison */}
          <div className="saas-card mb-4 shadow-sm">
            <div className="saas-card-header border-bottom pb-3 mb-3">
              <div>
                <h6 className="saas-card-title mb-0">Before & After Comparison</h6>
                <span className="saas-card-subtitle">Visual improvement tracking</span>
              </div>
            </div>

            {oldestPhoto && newestPhoto && oldestPhoto.id !== newestPhoto.id ? (
              <div className="row g-3">
                <div className="col-6 text-center">
                  <div className="fw-semibold text-muted small mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>BEFORE ({new Date(oldestPhoto.logged_at).toLocaleDateString()})</div>
                  <div className="ratio ratio-4x3 rounded overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
                    <img
                      src={oldestPhoto.photo_url}
                      alt="Skin state before"
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"; }}
                    />
                  </div>
                  <p className="text-muted small mt-2 italic" style={{ fontSize: "0.75rem" }}>"{oldestPhoto.notes}"</p>
                </div>
                <div className="col-6 text-center">
                  <div className="fw-semibold text-muted small mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>AFTER ({new Date(newestPhoto.logged_at).toLocaleDateString()})</div>
                  <div className="ratio ratio-4x3 rounded overflow-hidden border" style={{ borderColor: "var(--border-subtle)" }}>
                    <img
                      src={newestPhoto.photo_url}
                      alt="Skin state after"
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=300"; }}
                    />
                  </div>
                  <p className="text-muted small mt-2 italic" style={{ fontSize: "0.75rem" }}>"{newestPhoto.notes}"</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted border rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", borderStyle: "dashed", fontSize: "0.8rem" }}>
                Add at least two progress entries with photo URLs to unlock Before/After visual comparison.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Log progress & Timeline */}
        <div className="col-lg-4">
          {/* Add Entry Card */}
          <div className="saas-card mb-4 shadow-sm">
            <div className="saas-card-header border-bottom pb-3 mb-3">
              <div>
                <h6 className="saas-card-title mb-0">Log Skin Entry</h6>
                <span className="saas-card-subtitle">Document daily photo & notes</span>
              </div>
            </div>

            <form onSubmit={handleAddProgress}>
              <div className="mb-3">
                <label className="form-label-saas">Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="form-control-saas"
                />
              </div>

              <div className="mb-3">
                <label className="form-label-saas">Diary Notes</label>
                <textarea
                  placeholder="How does your skin feel today?"
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-control-saas"
                  style={{ fontSize: "0.85rem" }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-saas w-100"
                style={{ fontSize: "0.8rem", height: "38px" }}
              >
                <Camera size={14} className="me-1" />
                {submitting ? "Saving..." : "Save Entry"}
              </button>
            </form>
          </div>

          {/* Timeline History */}
          <div className="saas-card shadow-sm">
            <div className="saas-card-header border-bottom pb-3 mb-3">
              <div>
                <h6 className="saas-card-title mb-0">Skin History Timeline</h6>
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
                      <span className="text-secondary small fw-semibold" style={{ fontSize: "0.75rem" }}>
                        {new Date(entry.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    {entry.photo_url && (
                      <div className="mb-2 rounded overflow-hidden border" style={{ maxHeight: "150px" }}>
                        <img
                          src={entry.photo_url}
                          alt="Progress entry state"
                          style={{ objectFit: "cover", width: "100%", maxHeight: "150px" }}
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300"; }}
                        />
                      </div>
                    )}
                    <p className="small text-muted mb-0" style={{ fontSize: "0.8rem" }}>"{entry.notes}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small" style={{ fontSize: "0.8rem" }}>No logs yet. Submit your first progress entry above!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SkinAnalyticsPage;
