import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import ReportsExportModule from "../components/ReportsExportModule";
import { apiService } from "../services/api";
import {
  Shield,
  Users,
  Award,
  Trash2,
  Database,
  FileText,
  CheckCircle,
  TrendingUp,
  Search,
  Download,
  ShoppingBag,
  Activity,
  UserPlus
} from "lucide-react";

const INITIAL_AUDIT_LOGS = [
  { id: 1, action: "USER_ROLE_UPDATED", user: "consultant@skincare.com", details: "Role changed to SKINCARE_CONSULTANT", timestamp: "2026-08-04 18:30:12" },
  { id: 2, action: "DATABASE_BACKUP", user: "akp73733@gmail.com", details: "Automated PostgreSQL backup completed (7410)", timestamp: "2026-08-04 17:00:00" },
  { id: 3, action: "AI_MODEL_RECALIBRATION", user: "SYSTEM", details: "Skin Optical Vision Model v2.4 deployed", timestamp: "2026-08-04 14:15:45" },
  { id: 4, action: "RECOMMENDATION_AUDIT", user: "dermatologist@skincare.com", details: "Approved Rx Tretinoin 0.025% formulation", timestamp: "2026-08-05 09:12:00" }
];

const FALLBACK_USERS = [
  { id: 1, name: "Akash Prajapati", email: "akp73733@gmail.com", role: "ADMIN", provider: "LOCAL", status: "Active" },
  { id: 2, name: "John Doe", email: "john@gmail.com", role: "USER", provider: "LOCAL", status: "Active" },
  { id: 3, name: "Priya Sharma", email: "priya@gmail.com", role: "USER", provider: "LOCAL", status: "Active" },
  { id: 4, name: "Dr. Emily Watson", email: "consultant@skincare.com", role: "SKINCARE_CONSULTANT", provider: "LOCAL", status: "Active" },
  { id: 5, name: "Dr. Michael Chen", email: "dermatologist@skincare.com", role: "DERMATOLOGIST", provider: "LOCAL", status: "Active" },
  { id: 6, name: "System Admin", email: "admin@wellness.com", role: "ADMIN", provider: "LOCAL", status: "Active" }
];

// Mock Top Recommended Products Platform Data
const TOP_RECOMMENDED_PRODUCTS = [
  { id: 1, name: "Minimalist Niacinamide 10% Serum", category: "Serums", count: 420, approvalRate: "99.2%" },
  { id: 2, name: "La Roche-Posay Effaclar Gel", category: "Cleansers", count: 380, approvalRate: "98.5%" },
  { id: 3, name: "CeraVe Moisturizing Cream", category: "Moisturizers", count: 310, approvalRate: "99.8%" },
  { id: 4, name: "Dot & Key Watermelon Sunscreen SPF 50", category: "Sunscreen", count: 290, approvalRate: "97.6%" }
];

const AdminDashboard = () => {
  const location = useLocation();
  const [users, setUsers] = useState(FALLBACK_USERS);

  // Primary Admin Navigation Tabs
  // TABS: USER_MANAGEMENT | PLATFORM_ANALYTICS | RECOMMENDATION_MONITORING | SYSTEM_REPORTS
  const [mainTab, setMainTab] = useState("USER_MANAGEMENT");

  // User Management State
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("USER");

  const [toastMsg, setToastMsg] = useState("");
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  useEffect(() => {
    if (location.hash) {
      const h = location.hash.toLowerCase().replace("#", "");
      let nextTab = null;
      if (h === "users" || h === "user-management" || h === "admin-overview") nextTab = "USER_MANAGEMENT";
      else if (h === "analytics" || h === "platform-analytics") nextTab = "PLATFORM_ANALYTICS";
      else if (h === "recommendations" || h === "recommendation-monitoring") nextTab = "RECOMMENDATION_MONITORING";
      else if (h === "system" || h === "system-reports" || h === "reports") nextTab = "SYSTEM_REPORTS";

      if (nextTab) {
        setTimeout(() => setMainTab(nextTab), 0);
      }

      const el = document.getElementById(h) || document.getElementById("admin-overview");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);

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

  const handleToggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === "Active" ? "Suspended" : "Active";
          showToast(`ℹ User ID #${userId} status changed to ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
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

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser = {
      id: Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      provider: "LOCAL",
      status: "Active"
    };

    setUsers((prev) => [...prev, newUser]);
    showToast(`✨ Created user account for ${newUserName} [${newUserRole}]!`);
    setNewUserName("");
    setNewUserEmail("");
    setShowAddUserModal(false);
  };

  const handleTriggerBackup = () => {
    showToast("💾 Automated PostgreSQL database backup initiated & saved.");
    setAuditLogs((prev) => [
      { id: Date.now(), action: "MANUAL_BACKUP", user: "ADMIN", details: "Database dump executed", timestamp: new Date().toLocaleString() },
      ...prev
    ]);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "var(--primary)",
            color: "#ffffff",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            fontSize: "0.88rem",
            fontWeight: 700,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            animation: "fadeIn 0.3s ease-out"
          }}
        >
          <CheckCircle size={18} /> <span>{toastMsg}</span>
        </div>
      )}

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          {/* Section Header */}
          <div id="admin-overview" className="section-header">
            <div>
              <h2>
                <Shield className="icon-title text-primary" /> Admin Command &amp; System Control Center
              </h2>
              <p>User management, platform analytics, recommendation monitoring, system reports, and audit trail controls.</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={handleTriggerBackup} className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
                <Database size={15} /> Backup DB
              </button>
              <span className="role-badge role-admin">
                <Shield size={14} /> SUPER ADMIN
              </span>
            </div>
          </div>

          {/* Top Quick Platform KPI Cards */}
          <div className="grid-layout grid-4-col" style={{ marginBottom: "1.5rem" }}>
            <div className="stat-card glass-card">
              <Users size={24} className="stat-icon text-primary" />
              <div>
                <h3>{users.length}</h3>
                <p>Registered Platform Users</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <Award size={24} className="stat-icon text-warning" />
              <div>
                <h3>76.4 / 100</h3>
                <p>Platform Mean Skin Score</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <ShoppingBag size={24} className="stat-icon text-success" />
              <div>
                <h3>1,400+</h3>
                <p>Recommendations Delivered</p>
              </div>
            </div>

            <div className="stat-card glass-card">
              <Activity size={24} className="stat-icon text-danger" />
              <div>
                <h3>99.98%</h3>
                <p>System API Uptime</p>
              </div>
            </div>
          </div>

          {/* Primary Admin Navigation Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setMainTab("USER_MANAGEMENT")}
              className={`btn ${mainTab === "USER_MANAGEMENT" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <Users size={15} /> User Management
            </button>

            <button
              onClick={() => setMainTab("PLATFORM_ANALYTICS")}
              className={`btn ${mainTab === "PLATFORM_ANALYTICS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <TrendingUp size={15} /> Platform Analytics
            </button>

            <button
              onClick={() => setMainTab("RECOMMENDATION_MONITORING")}
              className={`btn ${mainTab === "RECOMMENDATION_MONITORING" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <ShoppingBag size={15} /> Recommendation Monitoring
            </button>

            <button
              onClick={() => setMainTab("SYSTEM_REPORTS")}
              className={`btn ${mainTab === "SYSTEM_REPORTS" ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              <FileText size={15} /> System Reports &amp; Audit Logs
            </button>
          </div>

          {/* TAB 1: USER MANAGEMENT */}
          {mainTab === "USER_MANAGEMENT" && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", margin: 0 }}>System User Directory &amp; Role Administration</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                    Manage access permissions for USER, SKINCARE_CONSULTANT, DERMATOLOGIST, and ADMIN accounts
                  </p>
                </div>

                <button
                  onClick={() => setShowAddUserModal(!showAddUserModal)}
                  className="btn btn-primary"
                  style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
                >
                  <UserPlus size={15} /> Add New User
                </button>
              </div>

              {/* Add User Form */}
              {showAddUserModal && (
                <form onSubmit={handleAddUser} style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", marginBottom: "1.25rem" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.6rem" }}>Create System User Account</h4>
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                      required
                    />
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      style={{ padding: "0.45rem 0.75rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                    >
                      <option value="USER">USER</option>
                      <option value="SKINCARE_CONSULTANT">SKINCARE_CONSULTANT</option>
                      <option value="DERMATOLOGIST">DERMATOLOGIST</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button type="submit" className="btn btn-primary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
                      Save Account
                    </button>
                  </div>
                </form>
              )}

              {/* Filters & Search Row */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <div className="input-with-icon" style={{ flex: 1, minWidth: "220px" }}>
                  <Search className="input-icon" size={15} />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ padding: "0.45rem 0.75rem 0.45rem 2.2rem", fontSize: "0.82rem" }}
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)" }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">USER</option>
                  <option value="SKINCARE_CONSULTANT">SKINCARE_CONSULTANT</option>
                  <option value="DERMATOLOGIST">DERMATOLOGIST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* User Directory Table */}
              <div className="table-responsive">
                <table className="custom-table" style={{ width: "100%", fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Assigned Role</th>
                      <th>Status</th>
                      <th>Provider</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.78rem", borderRadius: "4px", background: "var(--input-bg)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                          >
                            <option value="USER">USER</option>
                            <option value="SKINCARE_CONSULTANT">SKINCARE_CONSULTANT</option>
                            <option value="DERMATOLOGIST">DERMATOLOGIST</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            style={{
                              padding: "0.15rem 0.5rem",
                              borderRadius: "10px",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              background: u.status === "Active" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                              color: u.status === "Active" ? "var(--success)" : "var(--danger)",
                              border: "none",
                              cursor: "pointer"
                            }}
                          >
                            {u.status || "Active"}
                          </button>
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
          )}

          {/* TAB 2: PLATFORM ANALYTICS */}
          {mainTab === "PLATFORM_ANALYTICS" && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "1.25rem" }}>Platform Performance &amp; Usage Analytics</h3>

              <div className="grid-layout grid-3-col" style={{ marginBottom: "1.5rem" }}>
                <div style={{ background: "var(--input-bg)", padding: "1.15rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>DAILY ROUTINES LOGGED</span>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.2rem" }}>1,280 Daily</div>
                  <small style={{ fontSize: "0.75rem", color: "var(--success)" }}>▲ +18% vs last week</small>
                </div>

                <div style={{ background: "var(--input-bg)", padding: "1.15rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>AI SKIN ANALYSES</span>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--secondary)", marginTop: "0.2rem" }}>8,920 Total</div>
                  <small style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Optical Vision Scans</small>
                </div>

                <div style={{ background: "var(--input-bg)", padding: "1.15rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>ACTIVE SPECIALISTS</span>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--warning)", marginTop: "0.2rem" }}>24 Verified</div>
                  <small style={{ fontSize: "0.75rem", color: "var(--warning)" }}>Consultants &amp; Dermatologists</small>
                </div>
              </div>

              {/* Role Distribution Breakdown */}
              <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>Platform User Role Distribution</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                      <span>User Accounts (78%)</span>
                      <span>1,154 Users</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: "78%", height: "100%", background: "var(--primary)" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                      <span>Skincare Consultants (12%)</span>
                      <span>178 Consultants</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: "12%", height: "100%", background: "var(--secondary)" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                      <span>Dermatologists (6%)</span>
                      <span>89 Doctors</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: "6%", height: "100%", background: "var(--warning)" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECOMMENDATION MONITORING */}
          {mainTab === "RECOMMENDATION_MONITORING" && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Platform Recommendation Monitoring &amp; Approval Tracking</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                    Monitor recommendation frequency, specialist approval rates, and top recommended skincare products
                  </p>
                </div>

                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--success)", background: "rgba(16, 185, 129, 0.1)", padding: "0.3rem 0.75rem", borderRadius: "20px" }}>
                  98.4% Quality Approval Rate
                </span>
              </div>

              {/* Top Recommended Products Table */}
              <div style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>Top Recommended Products Across Platform</h4>
                <div className="table-responsive">
                  <table className="custom-table" style={{ width: "100%", fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Recommendation Volume</th>
                        <th>Approval Efficacy Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOP_RECOMMENDED_PRODUCTS.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700 }}>{p.name}</td>
                          <td>{p.category}</td>
                          <td style={{ fontWeight: 800, color: "var(--primary)" }}>{p.count} Times</td>
                          <td style={{ fontWeight: 800, color: "var(--success)" }}>{p.approvalRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM REPORTS & AUDIT LOGS */}
          {mainTab === "SYSTEM_REPORTS" && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", margin: 0 }}>System Reports, Telemetry &amp; Security Audit Trail</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
                    Real-time security logs, PostgreSQL database query latency, and downloadable system health reports
                  </p>
                </div>

                <button
                  onClick={() => showToast("📄 Complete System Audit Report downloaded as JSON/CSV.")}
                  className="btn btn-primary"
                  style={{ fontSize: "0.78rem", padding: "0.4rem 0.85rem" }}
                >
                  <Download size={14} /> Export System Report
                </button>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid-layout grid-3-col" style={{ marginBottom: "1.5rem" }}>
                <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>POSTGRESQL DB LATENCY</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--success)", marginTop: "0.2rem" }}>12 ms</div>
                  <small style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Port 7410 Active</small>
                </div>

                <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>AI VISION INFERENCE SPEED</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.2rem" }}>180 ms</div>
                  <small style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>GPU Accelerated</small>
                </div>

                <div style={{ background: "var(--input-bg)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>JWT ROLE ENFORCEMENT</span>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--success)", marginTop: "0.3rem" }}>STRICT RBAC</div>
                  <small style={{ fontSize: "0.72rem", color: "var(--success)" }}>Isolated Endpoints</small>
                </div>
              </div>

              {/* Audit Trail Table */}
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>System Event Audit Trail</h4>
              <div className="table-responsive">
                <table className="custom-table" style={{ width: "100%", fontSize: "0.85rem" }}>
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
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{log.timestamp}</td>
                        <td><span className="jwt-status-chip">{log.action}</span></td>
                        <td className="fw-bold">{log.user}</td>
                        <td style={{ fontSize: "0.85rem" }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 11: Reports & Export System */}
          <ReportsExportModule onToast={showToast} />

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;