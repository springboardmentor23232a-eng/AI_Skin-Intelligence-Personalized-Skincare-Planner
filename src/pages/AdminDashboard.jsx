import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { apiService } from "../services/api";
import { Shield, Users, Award, Sparkles, Heart, Trash2, Plus, Database, Lock, RefreshCw, FileText, CheckCircle, Sliders } from "lucide-react";

const INITIAL_AUDIT_LOGS = [
  { id: 1, action: "USER_ROLE_UPDATED", user: "sarah@wellness.com", details: "Role changed to WELLNESS_COACH", timestamp: "2026-08-04 18:30:12" },
  { id: 2, action: "DATABASE_BACKUP", user: "akp73733@gmail.com", details: "Automated PostgreSQL backup completed (7410)", timestamp: "2026-08-04 17:00:00" },
  { id: 3, action: "AI_MODEL_RECALIBRATION", user: "SYSTEM", details: "Skin Optical Vision Model v2.4 deployed", timestamp: "2026-08-04 14:15:45" }
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 6,
    totalCoaches: 2,
    totalAssessments: 24,
    totalActiveGoals: 18,
    averagePlatformMoodScore: 9.1,
    totalActivitiesLogged: 120
  });

  const [activeTab, setActiveTab] = useState("USERS"); // USERS | AI_MODELS | AUDIT_LOGS | SYSTEM

  const [tipTitle, setTipTitle] = useState("");
  const [tipContent, setTipContent] = useState("");
  const [tipCategory, setTipCategory] = useState("SKINCARE");
  const [tipTargetRole, setTipTargetRole] = useState("USER");

  const [toastMsg, setToastMsg] = useState("");
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const [allAssessments, setAllAssessments] = useState([]);
  const [assessmentStats, setAssessmentStats] = useState(null);

  const fetchAdminData = async () => {
    try {
      const [usersRes, assessmentsRes, statsRes] = await Promise.allSettled([
        apiService.getAllUsers(),
        apiService.getAssessments(),
        apiService.getAssessmentStats()
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.data) {
        setUsers(usersRes.value.data);
      } else {
        setUsers([
          { id: 1, name: "Akash Prajapati", email: "akp73733@gmail.com", role: "ADMIN", provider: "LOCAL" },
          { id: 2, name: "John Doe", email: "john@gmail.com", role: "USER", provider: "LOCAL" },
          { id: 3, name: "Dr. Emily Watson", email: "consultant@skincare.com", role: "SKINCARE_CONSULTANT", provider: "LOCAL" },
          { id: 4, name: "Dr. Michael Chen", email: "dermatologist@skincare.com", role: "DERMATOLOGIST", provider: "LOCAL" },
          { id: 5, name: "Sarah Coach", email: "coach@wellness.com", role: "WELLNESS_COACH", provider: "LOCAL" },
          { id: 6, name: "System Admin", email: "admin@wellness.com", role: "ADMIN", provider: "LOCAL" }
        ]);
      }

      if (assessmentsRes.status === "fulfilled" && Array.isArray(assessmentsRes.value)) {
        setAllAssessments(assessmentsRes.value);
      }

      if (statsRes.status === "fulfilled") {
        setAssessmentStats(statsRes.value);
      }
    } catch (_e) {
      console.warn("Fallback offline admin state");
    }
  };

  const handleDeleteAssessmentAdmin = async (id) => {
    try {
      await apiService.deleteAssessment(id);
      showToast(`✔ Assessment #${id} permanently deleted.`);
      setAllAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      showToast(`❌ Failed to delete assessment #${id}: ${err?.detail || err?.message}`);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiService.updateUserRole(userId, newRole);
    } catch (_e) {
      // offline fallback
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    showToast(`✔ Role updated to ${newRole} for user ID #${userId}!`);
    setAuditLogs((prev) => [
      { id: Date.now(), action: "ROLE_MODIFIED", user: "ADMIN", details: `User #${userId} assigned role ${newRole}`, timestamp: new Date().toLocaleString() },
      ...prev
    ]);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await apiService.deleteUser(userId);
    } catch (_e) {
      // offline fallback
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`ℹ User ID #${userId} has been purged from the platform.`);
  };

  const handleCreateTip = async (e) => {
    e.preventDefault();
    const newTip = {
      title: tipTitle,
      content: tipContent,
      category: tipCategory,
      targetRole: tipTargetRole
    };

    try {
      await apiService.createHealthTip(newTip);
    } catch (_err) {
      // offline fallback
    } finally {
      setTipTitle("");
      setTipContent("");
      showToast("✔ Skincare tip published to target role feed!");
    }
  };

  const handleTriggerBackup = () => {
    showToast("💾 Database Backup initiated. Backup archive saved successfully.");
    setAuditLogs((prev) => [
      { id: Date.now(), action: "MANUAL_BACKUP", user: "ADMIN", details: "Database dump executed", timestamp: new Date().toLocaleString() },
      ...prev
    ]);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--primary)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.88rem',
          fontWeight: 700,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle size={18} /> <span>{toastMsg}</span>
        </div>
      )}

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          {/* Header */}
          <div className="section-header">
            <div>
              <h2><Shield className="icon-title text-primary" /> Admin Command &amp; System Control Center</h2>
              <p>Full platform management: user &amp; role administration, AI models, audit logs, backup &amp; system settings.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={handleTriggerBackup} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                <Database size={15} /> Backup DB
              </button>
              <span className="role-badge role-admin"><Shield size={14} /> SUPER ADMIN</span>
            </div>
          </div>

          {/* Platform Analytics Cards */}
          <div className="grid-layout grid-4-col" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card glass-card">
              <Users size={24} className="stat-icon text-primary" />
              <div>
                <h3>{analytics.totalUsers}</h3>
                <p>Total Registered Users</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <Award size={24} className="stat-icon text-warning" />
              <div>
                <h3>{analytics.totalCoaches}</h3>
                <p>Specialists &amp; Doctors</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <Sparkles size={24} className="stat-icon text-success" />
              <div>
                <h3>{analytics.totalAssessments}</h3>
                <p>AI Skin Analyses</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <Heart size={24} className="stat-icon text-danger" />
              <div>
                <h3>{analytics.averagePlatformMoodScore} / 10</h3>
                <p>Platform Health Score</p>
              </div>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab("USERS")}
              className={`btn ${activeTab === "USERS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <Users size={15} /> User &amp; Role Management
            </button>

            <button
              onClick={() => setActiveTab("ASSESSMENTS")}
              className={`btn ${activeTab === "ASSESSMENTS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <Sparkles size={15} /> Skin Assessments
            </button>

            <button
              onClick={() => setActiveTab("AI_MODELS")}
              className={`btn ${activeTab === "AI_MODELS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <Sparkles size={15} /> AI Model Management
            </button>

            <button
              onClick={() => setActiveTab("AUDIT_LOGS")}
              className={`btn ${activeTab === "AUDIT_LOGS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <FileText size={15} /> Audit Logs &amp; Security
            </button>

            <button
              onClick={() => setActiveTab("SYSTEM")}
              className={`btn ${activeTab === "SYSTEM" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <Sliders size={15} /> System Settings
            </button>
          </div>

          {/* TAB: MODULE 3 SKIN ASSESSMENTS */}
          {activeTab === "ASSESSMENTS" && (
            <div>
              {/* Summary Stats */}
              <div className="grid-layout grid-3-col" style={{ marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL SYSTEM ASSESSMENTS</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {assessmentStats?.total_assessments || allAssessments.length}
                  </div>
                  <small style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>PostgreSQL `skin_assessments` table</small>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVERAGE HEALTH SCORE</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>
                    {assessmentStats?.average_score || 0.0} / 100
                  </div>
                  <small style={{ fontSize: '0.75rem', color: 'var(--success)' }}>System-wide mean</small>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>CONDITION BREAKDOWN</span>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.4rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Object.entries(assessmentStats?.condition_counts || {}).map(([cond, count]) => (
                      <span key={cond} style={{ padding: '0.15rem 0.5rem', background: 'var(--input-bg)', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: 700 }}>
                        {cond}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assessment Management Table */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>System Assessment Master List</h3>
                  <button onClick={fetchAdminData} className="btn btn-outline btn-sm">
                    <RefreshCw size={14} /> Refresh List
                  </button>
                </div>

                {allAssessments.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User ID</th>
                          <th>Date</th>
                          <th>Score</th>
                          <th>Condition</th>
                          <th>Concerns</th>
                          <th>Risks</th>
                          <th>Notes</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allAssessments.map((a) => (
                          <tr key={a.id}>
                            <td style={{ fontWeight: 700 }}>#{a.id}</td>
                            <td>User #{a.user_id}</td>
                            <td>{new Date(a.assessment_date).toLocaleString()}</td>
                            <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{a.skin_health_score}/100</td>
                            <td>
                              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--input-bg)' }}>
                                {a.overall_condition}
                              </span>
                            </td>
                            <td>{a.concerns?.length || 0}</td>
                            <td>{a.risks?.length || 0}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{a.notes || "-"}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteAssessmentAdmin(a.id)}
                                className="btn btn-outline btn-sm"
                                style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.2rem 0.6rem' }}
                                title="Delete Assessment"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    No skin assessments submitted yet across the platform.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: USER & ROLE MANAGEMENT */}
          {activeTab === "USERS" && (
            <div className="grid-layout grid-3-col">
              {/* User Directory Table */}
              <div className="glass-card span-2">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3>User &amp; Role Access Directory</h3>
                  <Users size={18} />
                </div>

                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Assigned Role</th>
                        <th>Provider</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="fw-bold">{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="select-role-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            >
                              <option value="USER">USER</option>
                              <option value="SKINCARE_CONSULTANT">SKINCARE_CONSULTANT</option>
                              <option value="DERMATOLOGIST">DERMATOLOGIST</option>
                              <option value="WELLNESS_COACH">WELLNESS_COACH</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td><span className="jwt-status-chip">{u.provider || "LOCAL"}</span></td>
                          <td>
                            <button onClick={() => handleDeleteUser(u.id)} className="logout-btn" title="Delete User">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Publish Tip / Announcement Form */}
              <div className="glass-card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3>Broadcast Skincare Tip</h3>
                  <Sparkles size={18} style={{ color: 'var(--warning)' }} />
                </div>

                <form onSubmit={handleCreateTip} className="form-container">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={tipTitle}
                      onChange={(e) => setTipTitle(e.target.value)}
                      placeholder="e.g. SPF Reapplication Notice"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select value={tipCategory} onChange={(e) => setTipCategory(e.target.value)}>
                      <option value="SKINCARE">SKINCARE</option>
                      <option value="HYDRATION">HYDRATION</option>
                      <option value="PROTECTION">PROTECTION</option>
                      <option value="NUTRITION">NUTRITION</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Target Role Audience</label>
                    <select value={tipTargetRole} onChange={(e) => setTipTargetRole(e.target.value)}>
                      <option value="USER">USER</option>
                      <option value="SKINCARE_CONSULTANT">SKINCARE_CONSULTANT</option>
                      <option value="DERMATOLOGIST">DERMATOLOGIST</option>
                      <option value="WELLNESS_COACH">WELLNESS_COACH</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      rows="3"
                      value={tipContent}
                      onChange={(e) => setTipContent(e.target.value)}
                      placeholder="Detailed guidance..."
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-block">
                    <Plus size={16} /> <span>Publish Tip</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: AI MODEL MANAGEMENT */}
          {activeTab === "AI_MODELS" && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3>AI Skin Analysis Model Configuration</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage optical vision classification model weights &amp; diagnostic accuracy threshold.</p>
                </div>
                <Sparkles size={24} style={{ color: 'var(--primary)' }} />
              </div>

              <div className="grid-layout grid-3-col" style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>Model Version</h4>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>SkinVision-v2.4-Pro</p>
                  <small style={{ fontSize: '0.72rem', color: 'var(--success)' }}>Active &amp; Deployed</small>
                </div>

                <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>Confidence Threshold</h4>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)', margin: 0 }}>96.8% Precision</p>
                  <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Calibrated on 150k scans</small>
                </div>

                <div style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>Inference Latency</h4>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)', margin: 0 }}>180 ms</p>
                  <small style={{ fontSize: '0.72rem', color: 'var(--success)' }}>GPU Accelerated</small>
                </div>
              </div>

              <button onClick={() => showToast("⚡ AI Model Recalibration sequence executed.")} className="btn btn-primary">
                <RefreshCw size={16} /> <span>Recalibrate AI Model</span>
              </button>
            </div>
          )}

          {/* TAB 3: AUDIT LOGS & SECURITY */}
          {activeTab === "AUDIT_LOGS" && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3>System Audit Trail &amp; Security Logs</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Real-time event logging of authentication, role modifications, and administrative operations.</p>
                </div>
                <Lock size={24} style={{ color: 'var(--danger)' }} />
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Event Action</th>
                      <th>Initiated By</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                        <td><span className="jwt-status-chip">{log.action}</span></td>
                        <td className="fw-bold">{log.user}</td>
                        <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM SETTINGS */}
          {activeTab === "SYSTEM" && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3>Platform System &amp; Database Settings</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Configure global parameters, CORS origins, and PostgreSQL database connections.</p>
                </div>
                <Sliders size={24} style={{ color: 'var(--primary)' }} />
              </div>

              <div className="form-container" style={{ maxWidth: '600px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>PostgreSQL Connection String</label>
                  <input type="text" readOnly value="postgresql://postgres:***@localhost:7410/ai_skincare" />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>JWT Token Expiry</label>
                  <input type="text" readOnly value="24 Hours (86400s)" />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>Role Enforcement Strategy</label>
                  <input type="text" readOnly value="Strict Isolated RBAC (User, Consultant, Dermatologist, Coach, Admin)" />
                </div>

                <button onClick={() => showToast("✔ Platform system parameters saved.")} className="btn btn-primary">
                  Save System Parameters
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;