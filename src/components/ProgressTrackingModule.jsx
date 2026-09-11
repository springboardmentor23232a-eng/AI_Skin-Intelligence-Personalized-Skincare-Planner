import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import {
  Flame,
  Calendar,
  CheckCircle,
  Clock,
  Sliders,
  Columns,
  Image as ImageIcon,
  Award,
  ShieldCheck,
  Zap
} from "lucide-react";

// Preset Demo Transformation Photos
const PRESET_BEFORE_PHOTOS = [
  {
    id: "preset-1",
    label: "Day 1 - Initial Assessment",
    date: "Day 1 (Baseline)",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    skinScore: 68,
    moistureLevel: 52,
    acneSeverity: "High",
    rednessLevel: "Medium",
    notes: "Active acne flare-ups around cheeks and chin. High redness and dryness."
  },
  {
    id: "preset-2",
    label: "Day 14 - Mid Progress",
    date: "Day 14 (Mid-Check)",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500",
    skinScore: 78,
    moistureLevel: 68,
    acneSeverity: "Medium",
    rednessLevel: "Low",
    notes: "Redness significantly reduced. Skin barrier feeling hydrated."
  }
];

const PRESET_AFTER_PHOTOS = [
  {
    id: "preset-3",
    label: "Day 30 - Current Transformation",
    date: "Day 30 (Current)",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500",
    skinScore: 88,
    moistureLevel: 82,
    acneSeverity: "Low",
    rednessLevel: "None",
    notes: "Skin texture noticeably smoother. Hydration stabilized at 82%."
  }
];

const ProgressTrackingModule = ({ onToast }) => {
  const [stats, setStats] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tracker"); // "tracker" | "beforeAfter" | "adherence"

  // Logger Form State
  const [skinScore, setSkinScore] = useState(85);
  const [moistureLevel, setMoistureLevel] = useState(78);
  const [acneSeverity, setAcneSeverity] = useState("Low");
  const [rednessLevel, setRednessLevel] = useState("Low");
  const [routineCompleted, setRoutineCompleted] = useState(true);
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500");
  const [submitting, setSubmitting] = useState(false);

  // Before/After Comparison Tool State
  const [comparisonMode, setComparisonMode] = useState("split"); // "split" | "sideBySide"
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%
  const [beforeItem, setBeforeItem] = useState(PRESET_BEFORE_PHOTOS[0]);
  const [afterItem, setAfterItem] = useState(PRESET_AFTER_PHOTOS[0]);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        apiService.getProgressStats(),
        apiService.getProgressHistory(14)
      ]);
      setStats(statsRes);
      const logs = logsRes || [];
      setHistoryLogs(logs);

      // If user has actual logs with photo, update comparison before/after choices
      if (logs.length > 1) {
        const oldest = logs[logs.length - 1];
        const newest = logs[0];
        setBeforeItem({
          id: `log-${oldest.id}`,
          label: `Logged ${oldest.log_date}`,
          date: oldest.log_date,
          photoUrl: oldest.photo_url || PRESET_BEFORE_PHOTOS[0].photoUrl,
          skinScore: oldest.skin_score,
          moistureLevel: oldest.moisture_level,
          acneSeverity: oldest.acne_severity,
          rednessLevel: oldest.redness_level,
          notes: oldest.notes || "Baseline log"
        });
        setAfterItem({
          id: `log-${newest.id}`,
          label: `Logged ${newest.log_date}`,
          date: newest.log_date,
          photoUrl: newest.photo_url || PRESET_AFTER_PHOTOS[0].photoUrl,
          skinScore: newest.skin_score,
          moistureLevel: newest.moisture_level,
          acneSeverity: newest.acne_severity,
          rednessLevel: newest.redness_level,
          notes: newest.notes || "Recent log"
        });
      }
    } catch (err) {
      console.warn("Could not load progress tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) await fetchData();
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.createProgressLog({
        skin_score: skinScore,
        moisture_level: moistureLevel,
        acne_severity: acneSeverity,
        redness_level: rednessLevel,
        routine_completed: routineCompleted,
        photo_url: photoUrl,
        notes: notes
      });
      if (onToast) onToast("🔥 Daily skin progress log saved! Streak updated.");
      fetchData();
      setNotes("");
    } catch (err) {
      console.warn("Failed to create progress log:", err);
      if (onToast) onToast("Failed to save progress log.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mock 7-day adherence heat matrix
  const weekDays = [
    { day: "Mon", status: "completed", date: "Sep 1" },
    { day: "Tue", status: "completed", date: "Sep 2" },
    { day: "Wed", status: "completed", date: "Sep 3" },
    { day: "Thu", status: "completed", date: "Sep 4" },
    { day: "Fri", status: "completed", date: "Sep 5" },
    { day: "Sat", status: "completed", date: "Sep 6" },
    { day: "Sun", status: "today", date: "Sep 7" }
  ];

  return (
    <div id="progress" className="glass-card" style={{ marginBottom: "2rem", padding: "1.75rem" }}>
      {/* Top Header & Sub-Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.6rem", margin: 0 }}>
            <span style={{ padding: "0.45rem", background: "rgba(239, 68, 68, 0.12)", borderRadius: "50%", color: "var(--danger)", display: "flex" }}>
              <Flame size={22} />
            </span>
            Progress Tracking & Daily Logger
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
            Daily progress logger, routine adherence matrix, visual before/after comparison tool, and skin health metrics.
          </p>
        </div>

        {/* Quick Streak Badge */}
        {stats && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", padding: "0.4rem 1rem", borderRadius: "30px", color: "var(--danger)" }}>
            <Flame size={20} />
            <div>
              <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{stats.streak_days} Day Streak!</span>
              <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 600 }}>Compliance: {stats.compliance_rate_pct}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("tracker")}
          className="btn"
          style={{
            padding: "0.45rem 1rem",
            fontSize: "0.82rem",
            fontWeight: 700,
            borderRadius: "var(--radius-sm)",
            background: activeTab === "tracker" ? "var(--primary)" : "var(--input-bg)",
            color: activeTab === "tracker" ? "#fff" : "var(--text-secondary)",
            border: `1px solid ${activeTab === "tracker" ? "var(--primary)" : "var(--border-color)"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <Calendar size={16} /> Daily Progress Logger
        </button>

        <button
          onClick={() => setActiveTab("beforeAfter")}
          className="btn"
          style={{
            padding: "0.45rem 1rem",
            fontSize: "0.82rem",
            fontWeight: 700,
            borderRadius: "var(--radius-sm)",
            background: activeTab === "beforeAfter" ? "var(--primary)" : "var(--input-bg)",
            color: activeTab === "beforeAfter" ? "#fff" : "var(--text-secondary)",
            border: `1px solid ${activeTab === "beforeAfter" ? "var(--primary)" : "var(--border-color)"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <ImageIcon size={16} /> Before / After Comparison Tool
        </button>

        <button
          onClick={() => setActiveTab("adherence")}
          className="btn"
          style={{
            padding: "0.45rem 1rem",
            fontSize: "0.82rem",
            fontWeight: 700,
            borderRadius: "var(--radius-sm)",
            background: activeTab === "adherence" ? "var(--primary)" : "var(--input-bg)",
            color: activeTab === "adherence" ? "#fff" : "var(--text-secondary)",
            border: `1px solid ${activeTab === "adherence" ? "var(--primary)" : "var(--border-color)"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <Award size={16} /> Routine Adherence & Badges
        </button>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid-layout grid-4-col" style={{ marginBottom: "1.75rem" }}>
          <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Total Progress Logs</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.2rem" }}>{stats.total_logs} Entry</div>
          </div>
          <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Avg Skin Health Score</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--success)", marginTop: "0.2rem" }}>{stats.avg_skin_score} / 100</div>
          </div>
          <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>Avg Hydration Level</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#3B82F6", marginTop: "0.2rem" }}>{stats.avg_moisture_level}%</div>
          </div>
          <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>30-Day Score Change</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stats.score_change_last_30d >= 0 ? "var(--success)" : "var(--danger)", marginTop: "0.2rem" }}>
              {stats.score_change_last_30d >= 0 ? `+${stats.score_change_last_30d}` : stats.score_change_last_30d} pts
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: DAILY PROGRESS LOGGER & TIMELINE */}
      {activeTab === "tracker" && (
        <div className="grid-layout grid-2-col">
          {/* Left Logger Form */}
          <form onSubmit={handleLogSubmit} style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Calendar size={18} style={{ color: "var(--primary)" }} /> Log Today's Skin Health
            </h4>

            {/* Skin Score Slider */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                <span>Skin Health Score:</span>
                <span style={{ color: "var(--primary)" }}>{skinScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skinScore}
                onChange={(e) => setSkinScore(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--primary)" }}
              />
            </div>

            {/* Moisture Level Slider */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                <span>Moisture / Hydration Level:</span>
                <span style={{ color: "#3B82F6" }}>{moistureLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={moistureLevel}
                onChange={(e) => setMoistureLevel(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#3B82F6" }}
              />
            </div>

            {/* Acne Severity & Redness Selector Pills */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>Acne Severity:</label>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {["None", "Low", "Medium", "High"].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setAcneSeverity(sev)}
                      style={{
                        flex: 1,
                        padding: "0.25rem 0.2rem",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        background: acneSeverity === sev ? "var(--primary)" : "var(--bg-surface)",
                        color: acneSeverity === sev ? "#fff" : "var(--text-secondary)"
                      }}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>Redness Level:</label>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {["None", "Low", "Medium", "High"].map((red) => (
                    <button
                      key={red}
                      type="button"
                      onClick={() => setRednessLevel(red)}
                      style={{
                        flex: 1,
                        padding: "0.25rem 0.2rem",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        background: rednessLevel === red ? "var(--secondary)" : "var(--bg-surface)",
                        color: rednessLevel === red ? "#fff" : "var(--text-secondary)"
                      }}
                    >
                      {red}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Routine Completed Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <label className="ios-toggle">
                <input type="checkbox" checked={routineCompleted} onChange={(e) => setRoutineCompleted(e.target.checked)} />
                <span className="ios-slider"></span>
              </label>
              <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Mark Skincare Routine Completed Today</span>
            </div>

            {/* Photo Selection Presets */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>Progress Photo Entry:</label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                <img src={photoUrl} alt="Selected" style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }} />
                <input
                  type="text"
                  placeholder="Paste Image URL or select preset..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  style={{ flex: 1, padding: "0.45rem", fontSize: "0.78rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {PRESET_BEFORE_PHOTOS.concat(PRESET_AFTER_PHOTOS).map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPhotoUrl(p.photoUrl)}
                    style={{
                      padding: "0.2rem 0.4rem",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      background: photoUrl === p.photoUrl ? "var(--primary)" : "var(--bg-surface)",
                      color: photoUrl === p.photoUrl ? "#fff" : "var(--text-secondary)"
                    }}
                  >
                    Preset #{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Input */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>Daily Skin Notes:</label>
              <textarea
                rows={2}
                placeholder="e.g. Skin felt soft after applying Cica moisturizer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", fontSize: "0.82rem", borderRadius: "var(--radius-sm)" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.6rem", fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
            >
              <CheckCircle size={16} /> {submitting ? "Saving Log..." : "Save Today's Progress Log"}
            </button>
          </form>

          {/* Right History Timeline */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={18} style={{ color: "var(--accent)" }} /> Transformation Timeline & History
            </h4>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading history...</div>
            ) : historyLogs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No previous logs logged yet. Submit your first log above!</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "420px", overflowY: "auto", paddingRight: "0.25rem" }}>
                {historyLogs.map((log) => (
                  <div key={log.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--input-bg)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <img src={log.photo_url || photoUrl} alt="Log" style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-primary)" }}>
                          {new Date(log.log_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                          Moisture: {log.moisture_level}% | Acne: {log.acne_severity}
                        </div>
                        {log.notes && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>"{log.notes}"</div>}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>{log.skin_score} <small style={{ fontSize: "0.65rem" }}>pts</small></div>
                      {log.routine_completed && <span style={{ fontSize: "0.65rem", color: "var(--success)", fontWeight: 700 }}>✓ Routine Done</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BEFORE / AFTER COMPARISON TOOL */}
      {activeTab === "beforeAfter" && (
        <div style={{ background: "var(--input-bg)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ImageIcon size={20} style={{ color: "var(--primary)" }} /> Interactive Before & After Visual Comparison
              </h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                Compare baseline skin state against current progress using split-slider or side-by-side view modes.
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                onClick={() => setComparisonMode("split")}
                className="btn"
                style={{
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  background: comparisonMode === "split" ? "var(--primary)" : "var(--bg-surface)",
                  color: comparisonMode === "split" ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border-color)"
                }}
              >
                <Sliders size={14} style={{ display: "inline", marginRight: "4px" }} /> Interactive Split Slider
              </button>
              <button
                onClick={() => setComparisonMode("sideBySide")}
                className="btn"
                style={{
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  background: comparisonMode === "sideBySide" ? "var(--primary)" : "var(--bg-surface)",
                  color: comparisonMode === "sideBySide" ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border-color)"
                }}
              >
                <Columns size={14} style={{ display: "inline", marginRight: "4px" }} /> Side-by-Side View
              </button>
            </div>
          </div>

          {/* Photo Selector Controls */}
          {(() => {
            const allAvailablePhotos = [
              ...historyLogs.map((log) => ({
                id: `log-${log.id}`,
                label: `User Log (${log.log_date || 'Recent'}) - Score: ${log.skin_score}`,
                date: log.log_date || 'Recent',
                photoUrl: log.photo_url || PRESET_BEFORE_PHOTOS[0].photoUrl,
                skinScore: log.skin_score,
                moistureLevel: log.moisture_level,
                acneSeverity: log.acne_severity,
                rednessLevel: log.redness_level,
                notes: log.notes || "Logged user transformation photo"
              })),
              ...PRESET_BEFORE_PHOTOS,
              ...PRESET_AFTER_PHOTOS
            ];

            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Select BEFORE (Baseline):</label>
                  <select
                    value={beforeItem.id}
                    onChange={(e) => {
                      const sel = allAvailablePhotos.find(p => p.id === e.target.value);
                      if (sel) setBeforeItem(sel);
                    }}
                    style={{ width: "100%", padding: "0.5rem", fontSize: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
                  >
                    {allAvailablePhotos.map((p) => (
                      <option key={`before-${p.id}`} value={p.id}>{p.label} (Score: {p.skinScore})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Select AFTER (Current):</label>
                  <select
                    value={afterItem.id}
                    onChange={(e) => {
                      const sel = allAvailablePhotos.find(p => p.id === e.target.value);
                      if (sel) setAfterItem(sel);
                    }}
                    style={{ width: "100%", padding: "0.5rem", fontSize: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
                  >
                    {allAvailablePhotos.map((p) => (
                      <option key={`after-${p.id}`} value={p.id}>{p.label} (Score: {p.skinScore})</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })()}


          {/* Main Visual Comparison Display Area */}
          {comparisonMode === "split" ? (
            <div style={{ position: "relative", width: "100%", maxWidth: "600px", height: "360px", margin: "0 auto 1.5rem auto", borderRadius: "var(--radius-md)", overflow: "hidden", border: "2px solid var(--border-color)", userSelect: "none" }}>
              {/* After Image (Background) */}
              <img
                src={afterItem.photoUrl}
                alt="After"
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
              />
              <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(16, 185, 129, 0.85)", color: "#fff", padding: "0.3rem 0.75rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 800, zIndex: 2 }}>
                AFTER ({afterItem.date})
              </span>

              {/* Before Image (Clipped overlay) */}
              <div style={{ position: "absolute", top: 0, left: 0, width: `${sliderPosition}%`, height: "100%", overflow: "hidden" }}>
                <img
                  src={beforeItem.photoUrl}
                  alt="Before"
                  style={{ width: "600px", height: "360px", objectFit: "cover", position: "absolute", top: 0, left: 0, maxWidth: "none" }}
                />
                <span style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(239, 68, 68, 0.85)", color: "#fff", padding: "0.3rem 0.75rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 800, zIndex: 2 }}>
                  BEFORE ({beforeItem.date})
                </span>
              </div>

              {/* Slider Line Divider & Drag Handle */}
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sliderPosition}%`, width: "3px", background: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.5)", pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "34px", height: "34px", borderRadius: "50%", background: "#fff", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 900, fontSize: "0.8rem", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                  ↔
                </div>
              </div>

              {/* Interactive Range Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "ew-resize", zIndex: 10 }}
              />
            </div>
          ) : (
            /* Side-by-Side Comparison Mode */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--bg-surface)" }}>
                <div style={{ position: "relative", height: "240px" }}>
                  <img src={beforeItem.photoUrl} alt="Before" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(239, 68, 68, 0.85)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 800 }}>
                    BEFORE ({beforeItem.date})
                  </span>
                </div>
                <div style={{ padding: "0.85rem" }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)" }}>{beforeItem.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Score: {beforeItem.skinScore} | Moisture: {beforeItem.moistureLevel}%</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem", fontStyle: "italic" }}>"{beforeItem.notes}"</div>
                </div>
              </div>

              <div style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--bg-surface)" }}>
                <div style={{ position: "relative", height: "240px" }}>
                  <img src={afterItem.photoUrl} alt="After" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(16, 185, 129, 0.85)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 800 }}>
                    AFTER ({afterItem.date})
                  </span>
                </div>
                <div style={{ padding: "0.85rem" }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)" }}>{afterItem.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Score: {afterItem.skinScore} | Moisture: {afterItem.moistureLevel}%</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem", fontStyle: "italic" }}>"{afterItem.notes}"</div>
                </div>
              </div>
            </div>
          )}

          {/* Parameter Diff Metrics Card */}
          <div style={{ background: "var(--bg-surface)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
            <h5 style={{ fontSize: "0.9rem", fontWeight: 800, margin: "0 0 0.85rem 0", color: "var(--text-primary)" }}>Skin Transformation Parameter Comparison</h5>
            <div className="grid-layout grid-4-col">
              <div style={{ textAlign: "center", background: "var(--input-bg)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>Skin Health Score</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.2rem" }}>
                  {beforeItem.skinScore} → {afterItem.skinScore}
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--success)" }}>
                  ▲ +{afterItem.skinScore - beforeItem.skinScore} pts
                </span>
              </div>

              <div style={{ textAlign: "center", background: "var(--input-bg)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>Moisture Level</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#3B82F6", marginTop: "0.2rem" }}>
                  {beforeItem.moistureLevel}% → {afterItem.moistureLevel}%
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--success)" }}>
                  ▲ +{afterItem.moistureLevel - beforeItem.moistureLevel}%
                </span>
              </div>

              <div style={{ textAlign: "center", background: "var(--input-bg)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>Acne Severity</span>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.2rem" }}>
                  {beforeItem.acneSeverity} → {afterItem.acneSeverity}
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--success)" }}>
                  ✓ Reduced
                </span>
              </div>

              <div style={{ textAlign: "center", background: "var(--input-bg)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>Redness Level</span>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.2rem" }}>
                  {beforeItem.rednessLevel} → {afterItem.rednessLevel}
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--success)" }}>
                  ✓ Cleared
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROUTINE ADHERENCE & MILESTONE BADGES */}
      {activeTab === "adherence" && (
        <div style={{ background: "var(--input-bg)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Award size={20} style={{ color: "var(--accent)" }} /> Routine Adherence Matrix & Milestone Badges
          </h4>

          {/* 7-Day Weekly Compliance Heat Map */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.6rem" }}>
              7-Day Routine Compliance Heat Map (This Week)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
              {weekDays.map((d, i) => (
                <div
                  key={i}
                  style={{
                    background: d.status === "completed" ? "rgba(34, 197, 94, 0.15)" : "var(--bg-surface)",
                    border: `1px solid ${d.status === "completed" ? "rgba(34, 197, 94, 0.4)" : "var(--border-color)"}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "0.75rem 0.5rem",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>{d.day}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", margin: "0.1rem 0 0.3rem 0" }}>{d.date}</div>
                  <CheckCircle size={18} style={{ color: d.status === "completed" ? "var(--success)" : "var(--text-muted)" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Gamified Skincare Milestone Badges */}
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.6rem" }}>
              Unlocked Skincare Milestone Badges
            </label>
            <div className="grid-layout grid-3-col">
              <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", padding: "1rem", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.18)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Flame size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)" }}>7-Day Streak Master</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Logged 7 consecutive days of skin routines</div>
                </div>
              </div>

              <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.25)", padding: "1rem", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.18)", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)" }}>Hydration Hero</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Maintained &gt;75% moisture index for 2 weeks</div>
                </div>
              </div>

              <div style={{ background: "rgba(124, 58, 237, 0.08)", border: "1px solid rgba(124, 58, 237, 0.25)", padding: "1rem", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(124, 58, 237, 0.18)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)" }}>Consistent Glow</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Achieved &gt;85% overall routine compliance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTrackingModule;
