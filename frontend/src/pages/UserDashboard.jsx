import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import authService from "../services/authService";
import { Link } from "react-router-dom";

function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [todayLogs, setTodayLogs] = useState({});
  const [streak, setStreak] = useState(0);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [smsConfigured, setSmsConfigured] = useState(null);
  const [smsProviderName, setSmsProviderName] = useState("CONSOLE");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneStatus, setPhoneStatus] = useState({
    verified: !!user?.phone_verified,
    number: user?.phone_number || ""
  });
  const [phoneFeedback, setPhoneFeedback] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user) {
      setPhoneStatus({
        verified: !!user.phone_verified,
        number: user.phone_number || ""
      });
      if (user.phone_number) {
        setPhoneNumber(user.phone_number);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const res = await authService.getVerificationStatus();
        if (res) {
          setSmsConfigured(!!res.sms_provider_configured);
          setSmsProviderName(res.sms_provider_name || "CONSOLE");
          if (res.phone_number) {
            setPhoneStatus({
              verified: !!res.phone_verified,
              number: res.phone_number
            });
            setPhoneNumber(res.phone_number);
          }
        }
      } catch {
        // graceful fallback if not logged in yet
      }
    };
    fetchVerificationStatus();
  }, []);

  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleSendPhoneOtp = async (e) => {
    e?.preventDefault();
    if (!phoneNumber.trim()) {
      setPhoneFeedback({ text: "Please enter a valid phone number.", type: "error" });
      return;
    }
    setPhoneLoading(true);
    setPhoneFeedback({ text: "", type: "" });
    try {
      const res = await authService.sendPhoneOtp(phoneNumber.trim());
      setOtpSent(true);
      setResendCooldown(60);
      setPhoneFeedback({
        text: res.message || "Verification code sent. Check your phone.",
        type: "success"
      });
    } catch (err) {
      // Strictly do not transition to OTP entry on failure
      setPhoneFeedback({
        text: err.message || "Unable to send verification code. Please try again.",
        type: "error"
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e?.preventDefault();
    if (!phoneOtp.trim()) {
      setPhoneFeedback({ text: "Please enter the 6-digit OTP code.", type: "error" });
      return;
    }
    setPhoneLoading(true);
    setPhoneFeedback({ text: "", type: "" });
    try {
      const res = await authService.verifyPhoneOtp(phoneNumber.trim(), phoneOtp.trim());
      setPhoneStatus({
        verified: true,
        number: res.phone_number || phoneNumber.trim()
      });
      setOtpSent(false);
      setPhoneOtp("");
      setPhoneFeedback({
        text: "Phone number successfully verified!",
        type: "success"
      });
    } catch (err) {
      setPhoneFeedback({
        text: err.message || "Invalid or expired OTP code.",
        type: "error"
      });
    } finally {
      setPhoneLoading(false);
    }
  };

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

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendingEmail(true);
    setVerificationFeedback("");
    try {
      const res = await authService.resendVerification(user.email);
      setVerificationFeedback(res.message || "Verification link sent to your email.");
    } catch (err) {
      setVerificationFeedback(err.message || "Failed to resend verification link.");
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0" style={{ color: "var(--text-primary)" }}>
              Welcome back, {user?.full_name?.split(" ")[0] || "there"}
            </h2>
            {user?.email_verified ? (
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: "0.75rem" }}>
                ✓ Verified
              </span>
            ) : (
              <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25" style={{ fontSize: "0.75rem" }}>
                Unverified
              </span>
            )}
          </div>
          <p className="text-secondary small mb-0">
            Here is your daily skin wellness summary and routine overview.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {profile?.skin_type && (
            <span className="badge badge-saas badge-saas-primary">{profile.skin_type} Skin</span>
          )}
          {profile?.climate && (
            <span className="badge badge-saas badge-saas-secondary">{profile.climate} Climate</span>
          )}
        </div>
      </div>

      {/* Email Verification Required Banner */}
      {user && !user.email_verified && (
        <div
          className="p-3 mb-4 rounded-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
          style={{
            backgroundColor: "rgba(234, 179, 8, 0.1)",
            border: "1px solid rgba(234, 179, 8, 0.3)"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
            <div>
              <div className="fw-semibold small" style={{ color: "var(--text-primary)" }}>
                Email Verification Required
              </div>
              <div className="text-secondary small">
                Verify your address ({user.email}) to unlock transactional routine alerts and clinical email delivery.
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            {verificationFeedback && (
              <span className="small text-muted">{verificationFeedback}</span>
            )}
            <button
              type="button"
              className="btn btn-sm btn-saas-outline"
              onClick={handleResendVerification}
              disabled={resendingEmail}
            >
              {resendingEmail ? "Dispatching..." : "Resend Link"}
            </button>
          </div>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Skin Health</span>
              <span className="stat-value">{latestAssessment ? `${latestAssessment.overall_score}/100` : "Pending"}</span>
              <span className="stat-trend positive">{latestAssessment ? latestAssessment.risk_level : "Take assessment"}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Hydration Target</span>
              <span className="stat-value">{profile ? `${profile.water_intake} L` : "2.0 L"}</span>
              <span className="stat-trend positive">{profile?.climate ? `${profile.climate} climate` : "Daily intake target"}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Routine Streak</span>
              <span className="stat-value">{streak} Days</span>
              <span className="stat-trend positive">Active consistency</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">UV Exposure</span>
              <span className="stat-value">{profile?.uv_exposure || "Moderate"}</span>
              <span className="stat-trend positive">Sun barrier care</span>
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

      {/* Verified Communication Channels & Security Card */}
      <div className="saas-card mb-4">
        <div className="saas-card-header">
          <div>
            <h5 className="saas-card-title mb-0">Verified Communication Channels</h5>
            <span className="saas-card-subtitle">
              Clinical identity protection and transactional delivery controls
            </span>
          </div>
          <span className="badge badge-saas badge-saas-primary">Channel Security</span>
        </div>

        <div className="row g-4 mt-1">
          {/* Email Verification Card */}
          <div className="col-md-6">
            <div
              className="p-3 rounded h-100 d-flex flex-column justify-content-between"
              style={{
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "1.2rem" }}>✉️</span>
                    <span className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                      Email Address
                    </span>
                  </div>
                  {user?.email_verified ? (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                      Action Required
                    </span>
                  )}
                </div>
                <p className="text-secondary small mb-2">
                  <strong>Registered Address:</strong> {user?.email || "No email on record"}
                </p>
                <p className="text-muted small mb-3">
                  {user?.email_verified
                    ? "Verified via Google identity or cryptographic verification link. Transactional routine emails and reports are active."
                    : "Your email must be verified before the system can dispatch routine reminders or clinical consultation reports."}
                </p>
              </div>

              {!user?.email_verified && (
                <div className="pt-2 border-top border-secondary border-opacity-10">
                  {verificationFeedback && (
                    <div className="small text-info mb-2">{verificationFeedback}</div>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-saas-outline w-100"
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                  >
                    {resendingEmail ? "Dispatching link..." : "Resend Verification Email"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Phone SMS OTP Card */}
          <div className="col-md-6">
            <div
              className="p-3 rounded h-100 d-flex flex-column justify-content-between"
              style={{
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "1.2rem" }}>📱</span>
                    <span className="fw-semibold" style={{ color: "var(--text-primary)" }}>
                      SMS & Phone Alerts
                    </span>
                  </div>
                  {phoneStatus.verified ? (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
                      Not Verified
                    </span>
                  )}
                </div>

                <p className="text-secondary small mb-2">
                  <strong>Current Phone:</strong>{" "}
                  {phoneStatus.number || "No phone number linked"}
                </p>
                <p className="text-muted small mb-3">
                  {phoneStatus.verified
                    ? "Phone number verified with SMS OTP. Critical appointment reminders and alerts are enabled."
                    : "Link and verify your phone number via 6-digit SMS OTP to receive instant regimen notifications."}
                </p>
              </div>

              <div>
                {smsConfigured === false && !phoneStatus.verified && (
                  <div
                    className="small p-2 rounded mb-2 d-flex align-items-center gap-2"
                    style={{
                      backgroundColor: "rgba(148, 163, 184, 0.1)",
                      border: "1px solid rgba(148, 163, 184, 0.25)",
                      color: "var(--text-secondary)"
                    }}
                  >
                    <span>ℹ️</span>
                    <span>
                      SMS verification is not configured in this environment ({smsProviderName} mode). Live SMS delivery requires a configured SMS provider (e.g. Twilio).
                    </span>
                  </div>
                )}

                {phoneFeedback.text && (
                  <div
                    className={`small mb-2 p-2 rounded ${
                      phoneFeedback.type === "success"
                        ? "bg-success bg-opacity-10 text-success"
                        : "bg-danger bg-opacity-10 text-danger"
                    }`}
                  >
                    {phoneFeedback.text}
                  </div>
                )}

                {!phoneStatus.verified && (
                  <div>
                    {!otpSent ? (
                      <form onSubmit={handleSendPhoneOtp} className="d-flex gap-2">
                        <input
                          type="tel"
                          className="form-control form-control-sm"
                          placeholder="+91 9876543210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          disabled={phoneLoading}
                          style={{
                            backgroundColor: "var(--bg-surface)",
                            color: "var(--text-primary)",
                            borderColor: "var(--border-subtle)"
                          }}
                        />
                        <button
                          type="submit"
                          className="btn btn-sm btn-saas flex-shrink-0"
                          disabled={phoneLoading}
                        >
                          {phoneLoading ? "Sending..." : "Send OTP"}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyPhoneOtp} className="d-flex flex-column gap-2">
                        <div className="d-flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            className="form-control form-control-sm"
                            placeholder="Enter 6-digit OTP"
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value)}
                            disabled={phoneLoading}
                            style={{
                              backgroundColor: "var(--bg-surface)",
                              color: "var(--text-primary)",
                              borderColor: "var(--border-subtle)",
                              letterSpacing: "4px",
                              textAlign: "center"
                            }}
                          />
                          <button
                            type="submit"
                            className="btn btn-sm btn-saas-success flex-shrink-0"
                            disabled={phoneLoading}
                          >
                            {phoneLoading ? "Verifying..." : "Confirm OTP"}
                          </button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between pt-1">
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-secondary p-0 text-start"
                            onClick={() => {
                              setOtpSent(false);
                              setPhoneOtp("");
                              setPhoneFeedback({ text: "", type: "" });
                            }}
                            disabled={phoneLoading}
                            style={{ fontSize: "0.75rem" }}
                          >
                            ← Change phone number
                          </button>
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-primary p-0 text-end"
                            onClick={handleSendPhoneOtp}
                            disabled={phoneLoading || resendCooldown > 0}
                            style={{ fontSize: "0.75rem" }}
                          >
                            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend OTP code"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;