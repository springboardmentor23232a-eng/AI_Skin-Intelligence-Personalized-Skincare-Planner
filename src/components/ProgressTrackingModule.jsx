import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Flame, Calendar, CheckCircle, Clock } from "lucide-react";

const ProgressTrackingModule = ({ onToast }) => {
  const [stats, setStats] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for new progress log
  const [skinScore, setSkinScore] = useState(85);
  const [moistureLevel, setMoistureLevel] = useState(78);
  const [acneSeverity, setAcneSeverity] = useState("Low");
  const [rednessLevel, setRednessLevel] = useState("Low");
  const [routineCompleted, setRoutineCompleted] = useState(true);
  const [notes, setNotes] = useState("");
  const [photoUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        apiService.getProgressStats(),
        apiService.getProgressHistory(14)
      ]);
      setStats(statsRes);
      setHistoryLogs(logsRes || []);
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
    } catch (err) {
      console.warn("Failed to create progress log:", err);
      if (onToast) onToast("Failed to save progress log.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="progress" className="glass-card" style={{ marginBottom: "2rem", padding: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.6rem", margin: 0 }}>
            <span style={{ padding: "0.45rem", background: "rgba(239, 68, 68, 0.12)", borderRadius: "50%", color: "var(--danger)", display: "flex" }}>
              <Flame size={22} />
            </span>
            Progress Tracking & Daily Logger
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
            Track daily skin parameters, hydration curves, streak milestones, and visual transformation photo entries.
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

      {/* Progress Metric Summary Row */}
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

      {/* Main Grid: Left Logger Form | Right History Timeline */}
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
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No previous logs logged yet. Submit your first log!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "380px", overflowY: "auto", paddingRight: "0.25rem" }}>
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
                      {log.notes && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", italic: "true" }}>"{log.notes}"</div>}
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
    </div>
  );
};

export default ProgressTrackingModule;
