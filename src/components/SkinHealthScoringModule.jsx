import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { Activity, ShieldCheck, Sparkles, TrendingUp, CheckCircle2, RefreshCw } from "lucide-react";

const SkinHealthScoringModule = ({ onToast }) => {
  // Input State for 5 Weighted Factors
  const [acneSeverity, setAcneSeverity] = useState("Mild");
  const [pigmentation, setPigmentation] = useState("None");
  const [darkSpots] = useState("Mild");
  const [rednessLevel, setRednessLevel] = useState("Low");
  const [wrinkles] = useState("None");
  const [oiliness, setOiliness] = useState("Medium");
  const [dryness] = useState("Low");

  const [stressLevel, setStressLevel] = useState("Low");
  const [sunExposure, setSunExposure] = useState("Moderate");
  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState("Occasional");

  const [sleepHours, setSleepHours] = useState(7.5);
  const [routineConsistency, setRoutineConsistency] = useState(85);
  const [waterIntake, setWaterIntake] = useState(2.5);
  const [previousScore, setPreviousScore] = useState(74);

  // Engine Calculation Result State
  const [scoreResult, setScoreResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("breakdown"); // breakdown | improvement | recommendations

  const handleCalculateScore = async () => {
    setLoading(true);
    try {
      const payload = {
        acne_severity: acneSeverity,
        pigmentation: pigmentation,
        dark_spots: darkSpots,
        redness_level: rednessLevel,
        wrinkles: wrinkles,
        oiliness: oiliness,
        dryness: dryness,
        stress_level: stressLevel,
        sun_exposure: sunExposure,
        smoking: smoking,
        alcohol: alcohol,
        sleep_hours: parseFloat(sleepHours),
        routine_consistency_pct: parseFloat(routineConsistency),
        water_intake_liters: parseFloat(waterIntake),
        previous_score: parseInt(previousScore)
      };

      const result = await apiService.calculateSkinHealthScore(payload);
      setScoreResult(result);
      if (onToast) onToast(`📊 Skin Health Score updated: ${result.overall_skin_health_score}/100`);
    } catch (err) {
      console.warn("Failed to calculate skin health score:", err);
      if (onToast) onToast("Failed to calculate skin score.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialScore() {
      try {
        const payload = {
          acne_severity: "Mild",
          pigmentation: "None",
          dark_spots: "Mild",
          redness_level: "Low",
          wrinkles: "None",
          oiliness: "Medium",
          dryness: "Low",
          stress_level: "Low",
          sun_exposure: "Moderate",
          smoking: false,
          alcohol: "Occasional",
          sleep_hours: 7.5,
          routine_consistency_pct: 85,
          water_intake_liters: 2.5,
          previous_score: 74
        };
        const result = await apiService.calculateSkinHealthScore(payload);
        if (!ignore) {
          setScoreResult(result);
        }
      } catch (err) {
        console.warn("Failed to calculate initial skin health score:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialScore();
    return () => {
      ignore = true;
    };
  }, []);

  const getScoreColor = (score) => {
    if (score >= 85) return "#10B981"; // Emerald green
    if (score >= 70) return "#3B82F6"; // Royal blue
    if (score >= 55) return "#F59E0B"; // Warm amber
    return "#EF4444"; // Red
  };

  return (
    <div id="scoring" className="glass-card" style={{ marginBottom: "2rem", padding: "1.75rem" }}>
      {/* Module Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.6rem", margin: 0 }}>
            <span style={{ padding: "0.45rem", background: "rgba(16, 185, 129, 0.12)", borderRadius: "50%", color: "var(--success)", display: "flex" }}>
              <Activity size={22} />
            </span>
            Skin Health Scoring Engine

          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
            Weighted 5-Factor Clinical Scoring Model: Skin Condition (35%), Lifestyle (20%), Sleep (15%), Routine Consistency (20%), Hydration (10%).
          </p>
        </div>

        <button
          onClick={handleCalculateScore}
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: "0.5rem 1rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem", borderRadius: "20px" }}
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          <span>{loading ? "Re-Evaluating..." : "Recalculate Score"}</span>
        </button>
      </div>

      {/* Main Grid: Left Interactive Parameter Controls | Right Score & Breakdown Panel */}
      <div className="grid-layout grid-2-col" style={{ gap: "1.5rem" }}>
        
        {/* Left Interactive Parameter Controls */}
        <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Sparkles size={18} style={{ color: "var(--primary)" }} /> Parameter Input Controls
          </h4>

          {/* 1. Skin Condition Parameters (35%) */}
          <div style={{ marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>1. Skin Condition Factors</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--primary)", background: "var(--primary-light)", padding: "0.15rem 0.5rem", borderRadius: "10px" }}>Weight: 35%</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>Acne Severity:</label>
                <select value={acneSeverity} onChange={(e) => setAcneSeverity(e.target.value)} style={{ width: "100%", padding: "0.35rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                  <option value="None">None (0 Penalty)</option>
                  <option value="Mild">Mild (-10 Pts)</option>
                  <option value="Moderate">Moderate (-20 Pts)</option>
                  <option value="Severe">Severe (-35 Pts)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>Pigmentation:</label>
                <select value={pigmentation} onChange={(e) => setPigmentation(e.target.value)} style={{ width: "100%", padding: "0.35rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                  <option value="None">None</option>
                  <option value="Mild">Mild (-8 Pts)</option>
                  <option value="Moderate">Moderate (-16 Pts)</option>
                  <option value="Severe">Severe (-25 Pts)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>Redness / Erythema:</label>
                <select value={rednessLevel} onChange={(e) => setRednessLevel(e.target.value)} style={{ width: "100%", padding: "0.35rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                  <option value="None">None / Low</option>
                  <option value="Mild">Mild (-8 Pts)</option>
                  <option value="Moderate">Moderate (-15 Pts)</option>
                  <option value="Severe">Severe (-24 Pts)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>Oiliness / Dryness Balance:</label>
                <select value={oiliness} onChange={(e) => setOiliness(e.target.value)} style={{ width: "100%", padding: "0.35rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                  <option value="Low">Balanced / Low</option>
                  <option value="Medium">Medium (-4 Pts)</option>
                  <option value="High">High (-10 Pts)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Lifestyle Habits (20%) */}
          <div style={{ marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>2. Lifestyle Habits</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent)", background: "rgba(139, 92, 246, 0.12)", padding: "0.15rem 0.5rem", borderRadius: "10px" }}>Weight: 20%</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>Stress Level:</label>
                <select value={stressLevel} onChange={(e) => setStressLevel(e.target.value)} style={{ width: "100%", padding: "0.35rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                  <option value="Low">Low (100 Pts)</option>
                  <option value="Medium">Medium (75 Pts)</option>
                  <option value="High">High (40 Pts)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>Sun Exposure:</label>
                <select value={sunExposure} onChange={(e) => setSunExposure(e.target.value)} style={{ width: "100%", padding: "0.35rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                  <option value="Low">Low (100 Pts)</option>
                  <option value="Moderate">Moderate (80 Pts)</option>
                  <option value="High">High (50 Pts)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>Smoking Habit:</label>
                <select value={smoking ? "Yes" : "No"} onChange={(e) => setSmoking(e.target.value === "Yes")} style={{ width: "100%", padding: "0.35rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                  <option value="No">Non-Smoker (100 Pts)</option>
                  <option value="Yes">Smoker (35 Pts)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>Alcohol Intake:</label>
                <select value={alcohol} onChange={(e) => setAlcohol(e.target.value)} style={{ width: "100%", padding: "0.35rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                  <option value="None">None (100 Pts)</option>
                  <option value="Occasional">Occasional (80 Pts)</option>
                  <option value="Regular">Regular (45 Pts)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3, 4, 5: Sleep (15%), Routine Consistency (20%), Hydration (10%) Sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Sleep Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                <span>3. Sleep Quality (Weight: 15%):</span>
                <span style={{ color: "var(--warning)" }}>{sleepHours} Hours / night</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="10.0"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                style={{ width: "100%", accentColor: "var(--warning)" }}
              />
            </div>

            {/* Routine Consistency Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                <span>4. Routine Consistency (Weight: 20%):</span>
                <span style={{ color: "var(--danger)" }}>{routineConsistency}% Adherence</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={routineConsistency}
                onChange={(e) => setRoutineConsistency(e.target.value)}
                style={{ width: "100%", accentColor: "var(--danger)" }}
              />
            </div>

            {/* Hydration Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                <span>5. Hydration Level (Weight: 10%):</span>
                <span style={{ color: "#3B82F6" }}>{waterIntake} Liters / day</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.5"
                step="0.1"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
                style={{ width: "100%", accentColor: "#3B82F6" }}
              />
            </div>

            {/* Previous Score Baseline for Improvement Delta */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                <span>Baseline Score (For Improvement Delta):</span>
                <span style={{ color: "var(--text-muted)" }}>{previousScore} pts</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={previousScore}
                onChange={(e) => setPreviousScore(e.target.value)}
                style={{ width: "100%", accentColor: "var(--text-muted)" }}
              />
            </div>
          </div>
        </div>

        {/* Right Output Panel: Overall Score, Breakdown, Improvement, Recommendations */}
        {scoreResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Big Circular Score Header Banner */}
            <div style={{
              background: `linear-gradient(135deg, ${getScoreColor(scoreResult.overall_skin_health_score)}15, rgba(255, 255, 255, 0.05))`,
              border: `1.5px solid ${getScoreColor(scoreResult.overall_skin_health_score)}40`,
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              justify: "space-between",
              flexWrap: "wrap",
              gap: "1rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                {/* Radial Badge */}
                <div style={{
                  width: "82px",
                  height: "82px",
                  borderRadius: "50%",
                  background: getScoreColor(scoreResult.overall_skin_health_score),
                  color: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 20px ${getScoreColor(scoreResult.overall_skin_health_score)}50`,
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}>{scoreResult.overall_skin_health_score}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.9 }}>/ 100</span>
                </div>

                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800, color: "var(--text-muted)" }}>
                    Overall Skin Health Score
                  </div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.2rem 0" }}>
                    {scoreResult.score_rating}
                  </h4>
                  <div style={{ fontSize: "0.78rem", color: "var(--success)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <TrendingUp size={14} /> Score Delta: {scoreResult.improvement.delta >= 0 ? `+${scoreResult.improvement.delta}` : scoreResult.improvement.delta} pts ({scoreResult.improvement.percentage_change}%)
                  </div>
                </div>
              </div>

              {/* Quick Status Tag */}
              <div style={{
                background: `${getScoreColor(scoreResult.overall_skin_health_score)}20`,
                color: getScoreColor(scoreResult.overall_skin_health_score),
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 800
              }}>
                {scoreResult.improvement.improvement_status}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <button
                onClick={() => setActiveTab("breakdown")}
                style={{
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "breakdown" ? "var(--primary)" : "transparent",
                  color: activeTab === "breakdown" ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer"
                }}
              >
                Weighted Breakdown
              </button>

              <button
                onClick={() => setActiveTab("improvement")}
                style={{
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "improvement" ? "var(--primary)" : "transparent",
                  color: activeTab === "improvement" ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer"
                }}
              >
                Skin Improvement Scoring
              </button>

              <button
                onClick={() => setActiveTab("recommendations")}
                style={{
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "recommendations" ? "var(--primary)" : "transparent",
                  color: activeTab === "recommendations" ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer"
                }}
              >
                Clinical Action Plan
              </button>
            </div>

            {/* TAB 1: WEIGHTED BREAKDOWN */}
            {activeTab === "breakdown" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {Object.entries(scoreResult.sub_scores).map(([key, sub]) => (
                  <div key={key} style={{ background: "var(--input-bg)", padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {sub.name} <small style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>({sub.weight_pct}% weight)</small>
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 800, color: getScoreColor(sub.raw_score) }}>{sub.raw_score} / 100</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "0.4rem" }}>(+{sub.weighted_contribution} pts)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: "7px", borderRadius: "4px", background: "var(--border-color)", overflow: "hidden", marginBottom: "0.35rem" }}>
                      <div style={{ width: `${sub.raw_score}%`, height: "100%", background: getScoreColor(sub.raw_score), borderRadius: "4px" }}></div>
                    </div>

                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", italic: "true" }}>
                      💡 {sub.feedback}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: SKIN IMPROVEMENT SCORING */}
            {activeTab === "improvement" && (
              <div style={{ background: "var(--input-bg)", padding: "1.1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <TrendingUp size={18} style={{ color: "var(--success)" }} /> Trajectory & Score Progression
                </h4>

                <div className="grid-layout grid-3-col">
                  <div style={{ background: "var(--bg-surface)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>BASELINE SCORE</small>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.2rem" }}>{scoreResult.improvement.previous_score} pts</div>
                  </div>

                  <div style={{ background: "var(--bg-surface)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>CURRENT SCORE</small>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: getScoreColor(scoreResult.overall_skin_health_score), marginTop: "0.2rem" }}>{scoreResult.improvement.current_score} pts</div>
                  </div>

                  <div style={{ background: "var(--bg-surface)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>IMPROVEMENT DELTA</small>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: scoreResult.improvement.delta >= 0 ? "var(--success)" : "var(--danger)", marginTop: "0.2rem" }}>
                      {scoreResult.improvement.delta >= 0 ? `+${scoreResult.improvement.delta}` : scoreResult.improvement.delta} pts
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(59, 130, 246, 0.08)", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#3B82F6", display: "block", marginBottom: "0.2rem" }}>Key Score Drivers:</span>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
                    {scoreResult.improvement.primary_driver}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: CLINICAL ACTION PLAN RECOMMENDATIONS */}
            {activeTab === "recommendations" && (
              <div style={{ background: "var(--input-bg)", padding: "1.1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.85rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ShieldCheck size={18} style={{ color: "var(--primary)" }} /> Recommended Clinical Next Steps
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {scoreResult.recommendations.map((rec, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", background: "var(--bg-surface)", padding: "0.75rem 0.9rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      <CheckCircle2 size={16} style={{ color: "var(--success)", flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default SkinHealthScoringModule;
