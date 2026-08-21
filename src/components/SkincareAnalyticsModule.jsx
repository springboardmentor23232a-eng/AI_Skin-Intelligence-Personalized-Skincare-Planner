import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { BarChart3, TrendingUp, Award, Activity, PieChart, Sparkles, CheckCircle2 } from "lucide-react";

const SkincareAnalyticsModule = ({ _onToast }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await apiService.getUserAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.warn("Could not load skincare analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) await fetchAnalytics();
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div id="analytics" className="glass-card" style={{ marginBottom: "2rem", padding: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.6rem", margin: 0 }}>
            <span style={{ padding: "0.45rem", background: "rgba(59, 130, 246, 0.12)", borderRadius: "50%", color: "#3B82F6", display: "flex" }}>
              <BarChart3 size={22} />
            </span>
            Skincare Analytics & Health Progression Dashboard
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0 0" }}>
            Real-time analytics engine visualizing your skin health trajectory, hydration trends, and compliance metrics.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)", fontSize: "0.88rem" }}>
          Generating skincare analytics charts...
        </div>
      ) : !analytics ? (
        <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
          Analytics currently unavailable.
        </div>
      ) : (
        <div>
          {/* Top 4 KPI Metrics */}
          <div className="grid-layout grid-4-col" style={{ marginBottom: "1.75rem" }}>
            <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 700 }}>
                <span>Current Skin Score</span>
                <Activity size={16} style={{ color: "var(--success)" }} />
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.3rem" }}>
                {analytics.current_skin_score} <small style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/100</small>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 700, marginTop: "0.3rem" }}>
                ▲ {analytics.score_change_pct}% overall growth
              </div>
            </div>

            <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 700 }}>
                <span>Avg Moisture Index</span>
                <TrendingUp size={16} style={{ color: "#3B82F6" }} />
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#3B82F6", marginTop: "0.3rem" }}>
                {analytics.hydration_avg}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.3rem" }}>
                Optimal Hydration Band
              </div>
            </div>

            <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 700 }}>
                <span>Routine Compliance</span>
                <Award size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent)", marginTop: "0.3rem" }}>
                {analytics.compliance_rate}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600, marginTop: "0.3rem" }}>
                Consistent Application
              </div>
            </div>

            <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 700 }}>
                <span>Total Assessments</span>
                <PieChart size={16} style={{ color: "var(--warning)" }} />
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--warning)", marginTop: "0.3rem" }}>
                {analytics.total_assessments}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginTop: "0.3rem" }}>
                Clinical Records Saved
              </div>
            </div>
          </div>

          {/* SVG Trajectory Chart & Concern Breakdown */}
          <div className="grid-layout grid-2-col" style={{ marginBottom: "1.75rem" }}>
            {/* Visual Skin Health Score Trajectory Chart */}
            <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 1rem 0" }}>Skin Health Score Trajectory</h4>
              
              {/* Custom SVG Line Chart */}
              <div style={{ height: "180px", width: "100%", position: "relative", display: "flex", alignItems: "flex-end", gap: "1.2rem", paddingBottom: "1.5rem" }}>
                {analytics.score_trajectory.map((dp, i) => {
                  const heightPct = Math.max(15, (dp.skin_score / 100) * 150);
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--primary)", marginBottom: "4px" }}>{dp.skin_score}</span>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "28px",
                          height: `${heightPct}px`,
                          background: "linear-gradient(180deg, var(--primary) 0%, var(--primary-light) 100%)",
                          borderRadius: "6px 6px 0 0",
                          transition: "all 0.3s ease"
                        }}
                      />
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "6px", fontWeight: 600 }}>{dp.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Concerns Distribution */}
            <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 1rem 0" }}>Skin Concern Resolution Breakdown</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {analytics.top_concerns.map((tc, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                      <span>{tc.concern}</span>
                      <span style={{ color: "var(--text-muted)" }}>{tc.percentage}%</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${tc.percentage}%`,
                          height: "100%",
                          background: idx === 0 ? "var(--primary)" : idx === 1 ? "var(--accent)" : idx === 2 ? "#3B82F6" : "var(--warning)",
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Clinical Insights Card */}
          <div style={{ background: "rgba(124, 58, 237, 0.08)", border: "1px solid rgba(124, 58, 237, 0.25)", padding: "1.25rem", borderRadius: "var(--radius-md)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--accent)", margin: "0 0 0.6rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={18} /> AI Clinical Analytics Insights
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {analytics.recommendations_summary.map((rec, i) => (
                <div key={i} style={{ fontSize: "0.82rem", color: "var(--text-primary)", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: "2px" }} />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkincareAnalyticsModule;
