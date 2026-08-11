import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import { Link } from "react-router-dom";

function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [todayLogs, setTodayLogs] = useState({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prof = await apiService.getProfile();
        setProfile(prof);
      } catch {
        // profile optional
      }

      try {
        const history = await apiService.getAssessmentHistory();
        if (history && history.length > 0) {
          setLatestAssessment(history[0]);
        }
      } catch {
        // assessment optional
      }

      try {
        const routineData = await apiService.getRoutines();
        setRoutines(routineData || []);
      } catch {
        setRoutines([]);
      }

      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const logs = await apiService.getRoutineLogs(todayStr, todayStr);
        const logMap = {};
        logs.forEach((log) => {
          logMap[log.routine_type] = log.completed;
        });
        setTodayLogs(logMap);
      } catch {
        setTodayLogs({});
      }

      try {
        // Calculate streak from all logs
        const allLogs = await apiService.getRoutineLogs();
        if (allLogs && allLogs.length > 0) {
          // Sort by logged_date descending
          const sortedLogs = [...allLogs].sort((a, b) => new Date(b.logged_date) - new Date(a.logged_date));
          let currentStreak = 0;
          let checkDate = new Date();
          checkDate.setHours(0, 0, 0, 0);

          // We check day by day backwards
          while (true) {
            const checkDateStr = checkDate.toISOString().split("T")[0];
            const dayLogs = sortedLogs.filter(
              (l) => new Date(l.logged_date).toISOString().split("T")[0] === checkDateStr && l.completed
            );

            if (dayLogs.length > 0) {
              currentStreak++;
              // Go to previous day
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              // If checkDate is today, it's fine if they haven't completed anything yet today, check yesterday
              const todayStr = new Date().toISOString().split("T")[0];
              if (checkDateStr === todayStr) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
              }
              break;
            }
          }
          setStreak(currentStreak);
        } else {
          setStreak(0);
        }
      } catch {
        setStreak(0);
      }
    };
    fetchData();
  }, []);

  const handleToggleRoutine = async (routineType) => {
    const isCompleted = !todayLogs[routineType];
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await apiService.logRoutine({
        routine_type: routineType,
        logged_date: todayStr,
        completed: isCompleted,
        notes: `Logged via dashboard overview.`
      });

      setTodayLogs((prev) => ({
        ...prev,
        [routineType]: isCompleted
      }));

      // Refresh streak after logging
      const allLogs = await apiService.getRoutineLogs();
      if (allLogs) {
        const sortedLogs = [...allLogs].sort((a, b) => new Date(b.logged_date) - new Date(a.logged_date));
        let currentStreak = 0;
        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        while (true) {
          const checkDateStr = checkDate.toISOString().split("T")[0];
          const dayLogs = sortedLogs.filter(
            (l) => new Date(l.logged_date).toISOString().split("T")[0] === checkDateStr && l.completed
          );
          if (dayLogs.length > 0) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            const todayStr = new Date().toISOString().split("T")[0];
            if (checkDateStr === todayStr) {
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
            break;
          }
        }
        setStreak(currentStreak);
      }
    } catch (err) {
      console.error("Failed to log routine:", err);
    }
  };

  const totalGenerated = routines.length;
  const completedToday = Object.values(todayLogs).filter(Boolean).length;

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Welcome back, {user?.full_name || "User"} 👋
          </h2>
          <p className="text-secondary small mb-0">
            Here is your daily skin health summary and routine overview.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge badge-saas badge-saas-primary">Provider: {user?.provider || "LOCAL"}</span>
          <span className="badge badge-saas badge-saas-success">Role: {user?.role}</span>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">✨</div>
            <div className="stat-info">
              <span className="stat-label">Skin Health Score</span>
              <span className="stat-value">{latestAssessment ? `${latestAssessment.overall_score}%` : "No Score"}</span>
              <span className="stat-trend positive">{latestAssessment ? latestAssessment.risk_level : "Take assessment"}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">💧</div>
            <div className="stat-info">
              <span className="stat-label">Hydration Target</span>
              <span className="stat-value">{profile ? `${profile.water_intake} L` : "2.0 L"}</span>
              <span className="stat-trend positive">{profile?.climate ? `${profile.climate} climate` : "Set in profile"}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">⚡</div>
            <div className="stat-info">
              <span className="stat-label">Routine Streak</span>
              <span className="stat-value">{streak} Days</span>
              <span className="stat-trend positive">🔥 Consistent</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">🛡️</div>
            <div className="stat-info">
              <span className="stat-label">UV Protection</span>
              <span className="stat-value">{profile?.uv_exposure || "Moderate"}</span>
              <span className="stat-trend positive">UV Exposure Level</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="row g-4 mb-4">
        {/* Today's Routine Checklist */}
        <div className="col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <div>
                <h5 className="saas-card-title mb-0">Today's Skincare Routine</h5>
                <span className="saas-card-subtitle">Morning & Evening Schedule</span>
              </div>
              <span className="badge badge-saas badge-saas-primary">
                {completedToday} / {totalGenerated > 0 ? totalGenerated : 0} Logged
              </span>
            </div>

            <div className="d-flex flex-column gap-3 mt-3">
              {totalGenerated > 0 ? (
                routines.map((routine) => (
                  <div
                    key={routine.id}
                    className="d-flex align-items-center justify-content-between p-3 rounded"
                    style={{
                      backgroundColor: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      opacity: todayLogs[routine.routine_type] ? 0.75 : 1
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!todayLogs[routine.routine_type]}
                        onChange={() => handleToggleRoutine(routine.routine_type)}
                        className="form-check-input mt-0"
                        style={{ cursor: "pointer", width: "1.2rem", height: "1.2rem" }}
                      />
                      <div>
                        <div
                          className="fw-semibold"
                          style={{
                            color: "var(--text-primary)",
                            fontSize: "0.9rem",
                            textDecoration: todayLogs[routine.routine_type] ? "line-through" : "none"
                          }}
                        >
                          {routine.title}
                        </div>
                        <div className="text-muted small">
                          {routine.routine_type} • {routine.steps?.length || 0} Steps
                        </div>
                      </div>
                    </div>
                    <span
                      className={`badge badge-saas ${
                        todayLogs[routine.routine_type] ? "badge-saas-success" : "badge-saas-primary"
                      }`}
                    >
                      {todayLogs[routine.routine_type] ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted small mb-3">No personalized routines generated yet.</p>
                  <Link to="/routines" className="btn btn-sm btn-saas">
                    ⚡ Go Generate Routine
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Analytics Preview Card */}
        <div className="col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <div>
                <h5 className="saas-card-title mb-0">Skin Condition Trend</h5>
                <span className="saas-card-subtitle">AI Analytics Overview</span>
              </div>
              <Link to="/analytics" className="badge badge-saas badge-saas-info text-decoration-none">
                View Trends 📈
              </Link>
            </div>

            <div
              className="d-flex flex-column align-items-center justify-content-center p-4 my-3 text-center rounded"
              style={{
                backgroundColor: "var(--bg-surface-elevated)",
                minHeight: "180px",
                border: "1px dashed var(--border-strong)"
              }}
            >
              <span style={{ fontSize: "2rem" }}>📈</span>
              <h6 className="fw-semibold mt-2 mb-1" style={{ color: "var(--text-primary)" }}>
                Interactive Chart Visualizer
              </h6>
              <p className="text-muted small mb-3">
                Visualize your skin health score history and track your improvements over time.
              </p>
              <Link to="/analytics" className="btn btn-sm btn-saas-secondary">
                Explore Analytics Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;