import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";

function ReportsPage() {
  const [report, setReport] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [savingReminders, setSavingReminders] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reportData = await apiService.getReportSummary();
      setReport(reportData);

      const reminderData = await apiService.getReminderSettings();
      setReminders(reminderData);
    } catch (err) {
      console.error("Failed to load report data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = async (format) => {
    setDownloading(true);
    try {
      await apiService.downloadReport(format);
    } catch (err) {
      console.error(`Failed to export ${format} report`, err);
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleReminder = (type) => {
    setReminders((prev) =>
      prev.map((r) => (r.reminder_type === type ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleTimeChange = (type, timeVal) => {
    setReminders((prev) =>
      prev.map((r) => (r.reminder_type === type ? { ...r, time_of_day: timeVal } : r))
    );
  };

  const handleSaveReminders = async () => {
    setSavingReminders(true);
    try {
      await apiService.updateReminderSettings(reminders);
      await apiService.triggerReminders();
    } catch (err) {
      console.error("Failed to save reminder preferences", err);
    } finally {
      setSavingReminders(false);
    }
  };

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Health Reports & Data Export Engine 📊
          </h2>
          <p className="text-secondary small mb-0">
            Generate clinical PDF/Excel health records & manage automated routine reminders
          </p>
        </div>

        {/* Multi-Format Export Controls */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
            onClick={() => handleDownload("pdf")}
            disabled={downloading}
          >
            📄 Export PDF
          </button>
          <button
            className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
            onClick={() => handleDownload("xlsx")}
            disabled={downloading}
          >
            📊 Export Excel (.xlsx)
          </button>
          <button
            className="btn btn-outline-info btn-sm d-flex align-items-center gap-2"
            onClick={() => handleDownload("csv")}
            disabled={downloading}
          >
            📁 Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted small">Compiling health summary report...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Main Health Report Card */}
          <div className="col-12 col-lg-8">
            <div className="saas-card shadow-lg mb-4">
              <div className="saas-card-header border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="saas-card-title mb-0">Clinical Summary Preview</h5>
                  <span className="saas-card-subtitle">
                    Patient: {report?.patient?.full_name} ({report?.patient?.email})
                  </span>
                </div>
                <span className="badge badge-saas badge-saas-primary">
                  Generated: {new Date(report?.generated_at).toLocaleDateString()}
                </span>
              </div>

              {/* Patient Parameter Highlights */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <div className="text-muted small">Skin Type</div>
                    <div className="fw-bold fs-6">{report?.profile?.skin_type || "N/A"}</div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <div className="text-muted small">Fitzpatrick Tone</div>
                    <div className="fw-bold fs-6">{report?.profile?.skin_tone || "N/A"}</div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <div className="text-muted small">Routine Adherence</div>
                    <div className="fw-bold fs-6 text-success">{report?.adherence?.adherence_percentage}%</div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <div className="text-muted small">Latest Diagnostic</div>
                    <div className="fw-bold fs-6" style={{ color: "var(--accent-primary)" }}>
                      {report?.latest_assessment?.overall_score ? `${report.latest_assessment.overall_score}%` : "Not Assessed"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Breakdown */}
              <h6 className="fw-bold border-bottom pb-2 mb-3" style={{ color: "var(--accent-primary)" }}>
                Diagnostic Sub-Parameter Spectrum
              </h6>
              {report?.latest_assessment ? (
                <div className="row g-2 mb-4">
                  <div className="col-4 col-sm-2 text-center p-2 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                    <div className="text-muted small">Acne</div>
                    <div className="fw-bold">{report.latest_assessment.acne}</div>
                  </div>
                  <div className="col-4 col-sm-2 text-center p-2 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                    <div className="text-muted small">Pigment</div>
                    <div className="fw-bold">{report.latest_assessment.hyperpigmentation}</div>
                  </div>
                  <div className="col-4 col-sm-2 text-center p-2 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                    <div className="text-muted small">Dryness</div>
                    <div className="fw-bold">{report.latest_assessment.dryness}</div>
                  </div>
                  <div className="col-4 col-sm-2 text-center p-2 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                    <div className="text-muted small">Oiliness</div>
                    <div className="fw-bold">{report.latest_assessment.oiliness}</div>
                  </div>
                  <div className="col-4 col-sm-2 text-center p-2 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                    <div className="text-muted small">Redness</div>
                    <div className="fw-bold">{report.latest_assessment.redness}</div>
                  </div>
                  <div className="col-4 col-sm-2 text-center p-2 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                    <div className="text-muted small">Sensitivity</div>
                    <div className="fw-bold">{report.latest_assessment.sensitivity}</div>
                  </div>
                </div>
              ) : (
                <div className="text-muted small mb-4">No diagnostic assessment logged yet.</div>
              )}

              {/* Primary Concerns & Allergies */}
              <div className="row g-3">
                <div className="col-md-6">
                  <h6 className="fw-bold mb-2">Target Concerns</h6>
                  <p className="small text-secondary mb-0">
                    {report?.profile?.concerns?.join(", ") || "No specific concerns selected."}
                  </p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold mb-2 text-danger">Allergy Warnings</h6>
                  <p className="small text-danger mb-0">
                    {report?.profile?.allergies || "No active ingredient allergies reported."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder Preferences Controls Card */}
          <div className="col-12 col-lg-4">
            <div className="saas-card shadow-lg h-100">
              <h5 className="saas-card-title border-bottom pb-3 mb-3">Reminder Engine Controls</h5>

              <div className="d-flex flex-column gap-3 mb-4">
                {reminders.map((r) => (
                  <div
                    key={r.reminder_type}
                    className="p-3 rounded d-flex align-items-center justify-content-between"
                    style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}
                  >
                    <div>
                      <div className="fw-semibold small">
                        {r.reminder_type === "ROUTINE_MORNING" && "☀️ Morning Routine"}
                        {r.reminder_type === "ROUTINE_EVENING" && "🌙 Evening Routine"}
                        {r.reminder_type === "HYDRATION" && "💧 Hydration Reminder"}
                        {r.reminder_type === "ASSESSMENT_CHECK" && "🔍 Weekly Assessment"}
                      </div>
                      <input
                        type="time"
                        className="form-control-saas mt-1 py-0 px-1"
                        style={{ fontSize: "0.75rem", width: "110px" }}
                        value={r.time_of_day}
                        onChange={(e) => handleTimeChange(r.reminder_type, e.target.value)}
                      />
                    </div>
                    <div className="form-check form-switch ms-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={r.enabled}
                        onChange={() => handleToggleReminder(r.reminder_type)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-saas w-100 mt-auto"
                onClick={handleSaveReminders}
                disabled={savingReminders}
              >
                {savingReminders ? "Saving..." : "💾 Save & Sync Reminders"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ReportsPage;
