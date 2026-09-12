import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";

function AdminDashboard() {
  const { user: currentAdmin } = useAuth();

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState("accounts"); // "accounts" or "audit_logs"

  // Telemetry Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Accounts List State
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [usersLoading, setUsersLoading] = useState(true);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");
  const [auditLoading, setAuditLoading] = useState(false);

  // Modals & User Details
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Action Confirmation Modal
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: "", // "BLOCK", "UNBLOCK", "ROLE", "DEACTIVATE", "REACTIVATE", "DELETE"
    user: null,
    reason: "",
    targetRole: "USER",
    submitting: false,
    error: ""
  });

  // Notifications Toast
  const [toast, setToast] = useState({ message: "", type: "success" });

  // 1. Fetch Telemetry Stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await apiService.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin telemetry stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 2. Fetch Users Directory
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_dir: sortDir
      };

      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (verificationFilter === "VERIFIED") params.is_verified = true;
      if (verificationFilter === "UNVERIFIED") params.is_verified = false;

      const res = await apiService.getAdminUsers(params);
      setUsers(res.users || []);
      setTotalUsers(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error("Failed to load platform users:", err);
      setToast({ message: "Failed to load platform users from server.", type: "danger" });
    } finally {
      setUsersLoading(false);
    }
  }, [page, pageSize, sortBy, sortDir, search, roleFilter, statusFilter, verificationFilter]);

  // 3. Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true);
      const params = {
        page: auditPage,
        page_size: 25
      };
      if (auditActionFilter !== "ALL") params.action = auditActionFilter;

      const res = await apiService.getAdminAuditLogs(params);
      setAuditLogs(res.logs || []);
      setAuditTotal(res.total || 0);
      setAuditTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage, auditActionFilter]);

  // Initial Load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "accounts") {
      fetchUsers();
    } else if (activeTab === "audit_logs") {
      fetchAuditLogs();
    }
  }, [activeTab, fetchUsers, fetchAuditLogs]);

  // Open User Details
  const handleViewDetail = async (userId) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const data = await apiService.getAdminUserDetail(userId);
      setSelectedUserDetail(data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setToast({ message: "Unable to load full user details.", type: "danger" });
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open Action Modal
  const openAction = (type, targetUser) => {
    setActionModal({
      isOpen: true,
      type,
      user: targetUser,
      reason: "",
      targetRole: targetUser.role || "USER",
      submitting: false,
      error: ""
    });
  };

  // Close Action Modal
  const closeAction = () => {
    setActionModal({
      isOpen: false,
      type: "",
      user: null,
      reason: "",
      targetRole: "USER",
      submitting: false,
      error: ""
    });
  };

  // Execute Action
  const handleExecuteAction = async (e) => {
    e.preventDefault();
    const { type, user: target, reason, targetRole } = actionModal;
    if (!target) return;

    setActionModal((prev) => ({ ...prev, submitting: true, error: "" }));

    try {
      if (type === "BLOCK") {
        if (!reason.trim()) {
          setActionModal((prev) => ({ ...prev, submitting: false, error: "Please enter a reason for suspension." }));
          return;
        }
        await apiService.updateUserStatus(target.id, "BLOCKED", reason.trim());
        setToast({ message: `Account for ${target.email} has been suspended.`, type: "success" });
      } else if (type === "UNBLOCK") {
        await apiService.updateUserStatus(target.id, "ACTIVE", reason.trim() || "Unblocked by administrator");
        setToast({ message: `Account for ${target.email} has been restored and unblocked.`, type: "success" });
      } else if (type === "DEACTIVATE") {
        await apiService.updateUserStatus(target.id, "DEACTIVATED", reason.trim() || "Deactivated by administrator");
        setToast({ message: `Account for ${target.email} has been deactivated.`, type: "success" });
      } else if (type === "REACTIVATE") {
        await apiService.updateUserStatus(target.id, "ACTIVE", reason.trim() || "Reactivated by administrator");
        setToast({ message: `Account for ${target.email} has been reactivated.`, type: "success" });
      } else if (type === "ROLE") {
        await apiService.updateUserRole(target.id, targetRole);
        setToast({ message: `Role for ${target.email} updated to ${targetRole}.`, type: "success" });
      } else if (type === "DELETE") {
        await apiService.deleteUser(target.id);
        setToast({ message: `Account for ${target.email} safely terminated and access revoked.`, type: "success" });
      }

      closeAction();
      fetchUsers();
      fetchStats();
      if (activeTab === "audit_logs") fetchAuditLogs();
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || "Failed to execute administrative action.";
      setActionModal((prev) => ({ ...prev, submitting: false, error: errMsg }));
    }
  };

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Platform Administration & Governance
          </h2>
          <p className="text-secondary small mb-0">
            Welcome, {currentAdmin?.full_name || "System Admin"}. Manage user access, enforce security boundaries, and monitor telemetry.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${activeTab === "accounts" ? "btn-saas" : "btn-outline-secondary"}`}
            onClick={() => setActiveTab("accounts")}
          >
            👥 Accounts Directory
          </button>
          <button
            className={`btn btn-sm ${activeTab === "audit_logs" ? "btn-saas" : "btn-outline-secondary"}`}
            onClick={() => setActiveTab("audit_logs")}
          >
            📜 Audit Trail
          </button>
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={() => {
              fetchStats();
              if (activeTab === "accounts") fetchUsers();
              if (activeTab === "audit_logs") fetchAuditLogs();
            }}
            title="Refresh dashboard data"
          >
            🔄 Sync
          </button>
        </div>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Accounts</span>
              <span className="stat-value">{statsLoading ? "..." : stats?.total_users ?? 0}</span>
              <span className="stat-trend positive">{stats?.active_accounts ?? 0} Active Status</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "#38bdf8" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Skincare Consultants</span>
              <span className="stat-value">{statsLoading ? "..." : stats?.total_consultants ?? 0}</span>
              <span className="stat-trend positive">Clinical Advisors</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "#a855f7" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Dermatologists</span>
              <span className="stat-value">{statsLoading ? "..." : stats?.total_dermatologists ?? 0}</span>
              <span className="stat-trend positive">Medical Specialists</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card" style={{ borderColor: stats?.blocked_accounts > 0 ? "rgba(239, 68, 68, 0.4)" : "var(--border-subtle)" }}>
            <div className="stat-icon-wrapper" style={{ color: stats?.blocked_accounts > 0 ? "#ef4444" : "#10b981" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Suspended / Blocked</span>
              <span className="stat-value" style={{ color: stats?.blocked_accounts > 0 ? "#ef4444" : "inherit" }}>
                {statsLoading ? "..." : stats?.blocked_accounts ?? 0}
              </span>
              <span className="stat-trend" style={{ color: "var(--text-secondary)" }}>
                {stats?.total_administrators ?? 1} Admins Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="saas-card mb-4 p-3 d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ fontSize: "0.85rem" }}>
        <div className="d-flex align-items-center gap-2">
          <span className="badge badge-saas badge-saas-primary">Telemetry</span>
          <span className="text-secondary">AI Assessments: <strong>{stats?.total_assessments ?? 0}</strong></span>
          <span className="text-muted">•</span>
          <span className="text-secondary">Routines: <strong>{stats?.total_routines ?? 0}</strong></span>
          <span className="text-muted">•</span>
          <span className="text-secondary">Consultations: <strong>{stats?.total_consultations ?? 0}</strong></span>
          <span className="text-muted">•</span>
          <span className="text-secondary">Clinical Reviews: <strong>{stats?.total_reviews ?? 0}</strong></span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge badge-saas badge-saas-success">Database Connected</span>
          <span className="text-muted small">PostgreSQL</span>
        </div>
      </div>

      {/* TAB 1: ACCOUNTS DIRECTORY */}
      {activeTab === "accounts" && (
        <div className="saas-card mb-4">
          <div className="saas-card-header flex-column flex-md-row gap-3 pb-3 border-bottom">
            <div>
              <h5 className="saas-card-title mb-0">Platform User Management</h5>
              <span className="saas-card-subtitle">Control access, enforce status, manage clinical roles, and view accounts</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">{totalUsers} accounts registered</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-3 border-bottom d-flex flex-wrap gap-2 align-items-center justify-content-between" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
            <div className="d-flex flex-wrap gap-2 align-items-center flex-grow-1">
              <div className="position-relative" style={{ minWidth: "220px", maxWidth: "320px" }}>
                <input
                  type="text"
                  className="form-control-saas pe-4"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                {search && (
                  <button
                    className="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-1"
                    onClick={() => { setSearch(""); setPage(1); }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                className="form-select-saas"
                style={{ width: "170px" }}
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Standard User</option>
                <option value="SKINCARE_CONSULTANT">Consultant</option>
                <option value="DERMATOLOGIST">Dermatologist</option>
                <option value="ADMIN">Administrator</option>
              </select>

              <select
                className="form-select-saas"
                style={{ width: "160px" }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Suspended / Blocked</option>
                <option value="DEACTIVATED">Deactivated</option>
              </select>

              <select
                className="form-select-saas"
                style={{ width: "150px" }}
                value={verificationFilter}
                onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">All Verifications</option>
                <option value="VERIFIED">Verified</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select-saas text-muted small"
                style={{ width: "140px" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="created_at">Joined Date</option>
                <option value="full_name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="last_login_at">Last Login</option>
              </select>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSortDir(prev => prev === "asc" ? "desc" : "asc")}
                title={`Sort ${sortDir === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortDir === "asc" ? "▲" : "▼"}
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container-saas">
            {usersLoading ? (
              <div className="p-4">
                <Skeleton height="35px" width="100%" className="mb-2" />
                <Skeleton height="35px" width="100%" className="mb-2" />
                <Skeleton height="35px" width="100%" className="mb-2" />
                <Skeleton height="35px" width="100%" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: "2rem" }}>🔍</div>
                <h6 className="mt-2 fw-semibold">No Accounts Found</h6>
                <p className="small mb-0">Try changing your search keywords or filter criteria.</p>
              </div>
            ) : (
              <table className="table-saas">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>User Name & Contact</th>
                    <th>Role Context</th>
                    <th>Account Status</th>
                    <th>Verification</th>
                    <th>Joined Date</th>
                    <th>Last Active</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentAdmin?.id;
                    return (
                      <tr key={u.id} style={{ backgroundColor: u.is_blocked ? "rgba(239, 68, 68, 0.05)" : "transparent" }}>
                        <td className="fw-semibold">#{u.id}</td>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="fw-semibold text-primary-saas">
                              {u.full_name} {isSelf && <span className="badge badge-saas badge-saas-secondary ms-1">You</span>}
                            </span>
                            <span className="text-muted small" style={{ fontSize: "0.75rem" }}>{u.email}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge badge-saas ${
                              u.role === "ADMIN"
                                ? "badge-saas-danger"
                                : u.role === "SKINCARE_CONSULTANT"
                                ? "badge-saas-info"
                                : u.role === "DERMATOLOGIST"
                                ? "badge-saas-warning"
                                : "badge-saas-primary"
                            }`}
                          >
                            {u.role.replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          {u.is_blocked ? (
                            <span className="badge badge-saas badge-saas-danger" title={u.blocked_reason || "Suspended"}>
                              🚫 Suspended
                            </span>
                          ) : !u.is_active ? (
                            <span className="badge badge-saas badge-saas-secondary">
                              Inactive
                            </span>
                          ) : (
                            <span className="badge badge-saas badge-saas-success">
                              ✓ Active
                            </span>
                          )}
                        </td>
                        <td>
                          {u.is_verified ? (
                            <span className="badge badge-saas badge-saas-success" style={{ fontSize: "0.7rem" }}>Verified</span>
                          ) : (
                            <span className="badge badge-saas badge-saas-secondary" style={{ fontSize: "0.7rem" }}>Pending</span>
                          )}
                        </td>
                        <td className="text-muted small">
                          {new Date(u.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="text-muted small">
                          {u.last_login_at
                            ? new Date(u.last_login_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                            : "Never"}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleViewDetail(u.id)}
                              title="View Full User Dossier"
                            >
                              Details
                            </button>

                            {/* Block / Unblock */}
                            {u.is_blocked ? (
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => openAction("UNBLOCK", u)}
                                title="Restore user platform access"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => openAction("BLOCK", u)}
                                disabled={isSelf}
                                title={isSelf ? "You cannot block yourself" : "Suspend user platform access"}
                              >
                                Block
                              </button>
                            )}

                            {/* Change Role */}
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => openAction("ROLE", u)}
                              title="Modify platform permissions"
                            >
                              Role
                            </button>

                            {/* More Options Dropdown Toggle / Action */}
                            {u.is_active ? (
                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() => openAction("DEACTIVATE", u)}
                                disabled={isSelf}
                                title="Deactivate account"
                              >
                                Deact
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => openAction("REACTIVATE", u)}
                                title="Reactivate account"
                              >
                                React
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => openAction("DELETE", u)}
                              disabled={isSelf}
                              title="Soft delete user account"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="p-3 border-top d-flex align-items-center justify-content-between" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
            <span className="text-muted small">
              Page {page} of {totalPages} ({totalUsers} total accounts)
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || usersLoading}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || usersLoading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS TRAIL */}
      {activeTab === "audit_logs" && (
        <div className="saas-card mb-4">
          <div className="saas-card-header flex-column flex-md-row gap-3 pb-3 border-bottom">
            <div>
              <h5 className="saas-card-title mb-0">Platform Administrative Audit Trail</h5>
              <span className="saas-card-subtitle">Tamper-evident logs of privileged actions, status shifts, and role changes</span>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select-saas"
                style={{ width: "200px" }}
                value={auditActionFilter}
                onChange={(e) => { setAuditActionFilter(e.target.value); setAuditPage(1); }}
              >
                <option value="ALL">All Audit Actions</option>
                <option value="BLOCK_USER">Block Account</option>
                <option value="UNBLOCK_USER">Unblock Account</option>
                <option value="CHANGE_ROLE">Change Role</option>
                <option value="DEACTIVATE_USER">Deactivate User</option>
                <option value="REACTIVATE_USER">Reactivate User</option>
                <option value="DELETE_USER">Terminate / Delete</option>
              </select>
              <button className="btn btn-outline-secondary btn-sm" onClick={fetchAuditLogs}>
                🔄
              </button>
            </div>
          </div>

          <div className="table-container-saas">
            {auditLoading ? (
              <div className="p-4">
                <Skeleton height="30px" width="100%" className="mb-2" />
                <Skeleton height="30px" width="100%" className="mb-2" />
                <Skeleton height="30px" width="100%" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: "2rem" }}>📜</div>
                <h6 className="mt-2 fw-semibold">No Audit Logs Recorded</h6>
                <p className="small mb-0">Privileged actions performed by administrators will appear here in chronological order.</p>
              </div>
            ) : (
              <table className="table-saas">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Timestamp (UTC)</th>
                    <th>Admin Author</th>
                    <th>Action</th>
                    <th>Target Account</th>
                    <th>Change Details</th>
                    <th>Reason / Justification</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="fw-semibold">#{log.id}</td>
                      <td className="text-muted small">
                        {new Date(log.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold small">{log.admin_name || "System"}</span>
                          <span className="text-muted" style={{ fontSize: "0.7rem" }}>{log.admin_email}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge badge-saas ${
                            log.action.includes("BLOCK")
                              ? "badge-saas-danger"
                              : log.action.includes("ROLE")
                              ? "badge-saas-primary"
                              : log.action.includes("UNBLOCK") || log.action.includes("REACTIVATE")
                              ? "badge-saas-success"
                              : "badge-saas-warning"
                          }`}
                        >
                          {log.action.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold small">{log.target_user_name || `User #${log.target_user_id}`}</span>
                          <span className="text-muted" style={{ fontSize: "0.7rem" }}>{log.target_user_email}</span>
                        </div>
                      </td>
                      <td className="small">
                        {log.previous_value && log.new_value ? (
                          <span>
                            <code>{log.previous_value}</code> → <strong><code>{log.new_value}</code></strong>
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="small text-secondary">
                        {log.reason || "No explicit reason logged"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Audit Pagination */}
          <div className="p-3 border-top d-flex align-items-center justify-content-between" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
            <span className="text-muted small">
              Page {auditPage} of {auditTotalPages} ({auditTotal} total events logged)
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                disabled={auditPage <= 1 || auditLoading}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setAuditPage(p => Math.min(auditTotalPages, p + 1))}
                disabled={auditPage >= auditTotalPages || auditLoading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: USER DETAILS DOSSIER */}
      {detailModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}>
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold mb-0">User Dossier: {selectedUserDetail?.full_name}</h5>
                  <span className="text-muted small">Account #{selectedUserDetail?.id} • {selectedUserDetail?.email}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setDetailModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                {detailLoading || !selectedUserDetail ? (
                  <div>
                    <Skeleton height="40px" width="100%" className="mb-3" />
                    <Skeleton height="150px" width="100%" className="mb-3" />
                    <Skeleton height="100px" width="100%" />
                  </div>
                ) : (
                  <div>
                    {/* Status Alert if Suspended */}
                    {selectedUserDetail.is_blocked && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                        <span style={{ fontSize: "1.2rem" }}>🚫</span>
                        <div>
                          <strong>Account Suspended:</strong> {selectedUserDetail.blocked_reason || "No explicit reason logged."}
                          {selectedUserDetail.blocked_at && (
                            <div className="small text-muted">
                              Blocked on {new Date(selectedUserDetail.blocked_at).toLocaleString()} by {selectedUserDetail.blocked_by_name || `Admin #${selectedUserDetail.blocked_by}`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata Overview */}
                    <div className="row g-3 mb-4">
                      <div className="col-sm-4">
                        <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                          <span className="text-muted small d-block">Role Context</span>
                          <span className="fw-bold">{selectedUserDetail.role}</span>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                          <span className="text-muted small d-block">Authentication Provider</span>
                          <span className="fw-bold">{selectedUserDetail.provider}</span>
                        </div>
                      </div>
                      <div className="col-sm-4">
                        <div className="p-3 rounded border" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                          <span className="text-muted small d-block">Account Status</span>
                          <span className="fw-bold">
                            {selectedUserDetail.is_blocked ? "Suspended" : selectedUserDetail.is_active ? "Active" : "Deactivated"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Skin Profile Summary */}
                    <h6 className="fw-bold mb-2">Skin Profile Summary</h6>
                    {selectedUserDetail.profile ? (
                      <div className="p-3 rounded border mb-4" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                        <div className="row g-2 small">
                          <div className="col-6 col-md-3"><strong>Age:</strong> {selectedUserDetail.profile.age}</div>
                          <div className="col-6 col-md-3"><strong>Gender:</strong> {selectedUserDetail.profile.gender}</div>
                          <div className="col-6 col-md-3"><strong>Skin Type:</strong> {selectedUserDetail.profile.skin_type}</div>
                          <div className="col-6 col-md-3"><strong>Skin Tone:</strong> {selectedUserDetail.profile.skin_tone}</div>
                          <div className="col-6 col-md-3"><strong>Water Target:</strong> {selectedUserDetail.profile.water_intake} L</div>
                          <div className="col-6 col-md-3"><strong>Climate:</strong> {selectedUserDetail.profile.climate || "N/A"}</div>
                          <div className="col-6 col-md-3"><strong>Sleep:</strong> {selectedUserDetail.profile.sleep_quality || "N/A"}</div>
                          <div className="col-6 col-md-3"><strong>Stress:</strong> {selectedUserDetail.profile.stress_level || "N/A"}</div>
                          <div className="col-12 mt-2">
                            <strong>Concerns:</strong> {Array.isArray(selectedUserDetail.profile.concerns) ? selectedUserDetail.profile.concerns.join(", ") : "None reported"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted small mb-4">No skin profile registered yet.</p>
                    )}

                    {/* Diagnostic Assessments */}
                    <h6 className="fw-bold mb-2">
                      Recent Assessments ({selectedUserDetail.assessments_count} Total)
                    </h6>
                    {selectedUserDetail.recent_assessments.length > 0 ? (
                      <div className="table-responsive mb-4">
                        <table className="table table-sm table-bordered small">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Date</th>
                              <th>Score</th>
                              <th>Risk Level</th>
                              <th>Priority Concern</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUserDetail.recent_assessments.map((a) => (
                              <tr key={a.id}>
                                <td>#{a.id}</td>
                                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                                <td><span className="fw-bold">{a.overall_score}%</span></td>
                                <td>{a.risk_level}</td>
                                <td>{a.concern_priority}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted small mb-4">No diagnostic assessments completed.</p>
                    )}

                    {/* Consultations */}
                    <h6 className="fw-bold mb-2">
                      Clinical Consultations ({selectedUserDetail.consultations_count} Total)
                    </h6>
                    {selectedUserDetail.consultations.length > 0 ? (
                      <div className="table-responsive mb-4">
                        <table className="table table-sm table-bordered small">
                          <thead>
                            <tr>
                              <th>Role</th>
                              <th>With</th>
                              <th>Scheduled</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUserDetail.consultations.map((c) => (
                              <tr key={c.id}>
                                <td>{c.role_in_consultation}</td>
                                <td>{c.counterparty_name} ({c.counterparty_email})</td>
                                <td>{new Date(c.scheduled_at).toLocaleString()}</td>
                                <td><span className="badge badge-saas badge-saas-secondary">{c.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted small mb-4">No clinical consultations on file.</p>
                    )}

                    {/* Audit Trail for this User */}
                    <h6 className="fw-bold mb-2">Administrative Action History</h6>
                    {selectedUserDetail.audit_trail.length > 0 ? (
                      <div className="list-group list-group-flush border rounded small">
                        {selectedUserDetail.audit_trail.map((entry) => (
                          <div key={entry.id} className="list-group-item p-2 d-flex justify-content-between align-items-center">
                            <div>
                              <span className="fw-bold">{entry.action.replace("_", " ")}</span> by {entry.admin_name}
                              <div className="text-muted">{entry.reason}</div>
                            </div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {new Date(entry.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">No past administrative interventions on this account.</p>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetailModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ACTION CONFIRMATION MODAL (BLOCK, UNBLOCK, ROLE, DELETE) */}
      {actionModal.isOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}>
              <form onSubmit={handleExecuteAction}>
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">
                    {actionModal.type === "BLOCK" && "Suspend / Block Account"}
                    {actionModal.type === "UNBLOCK" && "Restore / Unblock Account"}
                    {actionModal.type === "ROLE" && "Modify Platform Role"}
                    {actionModal.type === "DEACTIVATE" && "Deactivate Account"}
                    {actionModal.type === "REACTIVATE" && "Reactivate Account"}
                    {actionModal.type === "DELETE" && "Safe Account Termination"}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeAction} disabled={actionModal.submitting}></button>
                </div>

                <div className="modal-body p-4">
                  {actionModal.error && (
                    <div className="alert alert-danger small mb-3">
                      ⚠️ {actionModal.error}
                    </div>
                  )}

                  <p className="small mb-3">
                    Target account: <strong>{actionModal.user?.full_name}</strong> (<code>{actionModal.user?.email}</code>)
                  </p>

                  {actionModal.type === "BLOCK" && (
                    <div>
                      <div className="alert alert-warning small mb-3">
                        Blocking this account will immediately revoke access to all platform features, login sessions, and API tokens.
                      </div>
                      <label className="form-label small fw-semibold">Suspension Reason (Required)</label>
                      <textarea
                        className="form-control-saas"
                        rows="3"
                        placeholder="e.g. Terms of service violation, suspicious activity, clinical security audit..."
                        value={actionModal.reason}
                        onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                        required
                      />
                    </div>
                  )}

                  {actionModal.type === "UNBLOCK" && (
                    <div>
                      <div className="alert alert-info small mb-3">
                        Unblocking this account will restore login permissions and API access immediately.
                      </div>
                      <label className="form-label small fw-semibold">Action Note (Optional)</label>
                      <input
                        type="text"
                        className="form-control-saas"
                        placeholder="e.g. Identity verified, review completed"
                        value={actionModal.reason}
                        onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                      />
                    </div>
                  )}

                  {actionModal.type === "ROLE" && (
                    <div>
                      <label className="form-label small fw-semibold">Select New Platform Role</label>
                      <select
                        className="form-select-saas mb-3"
                        value={actionModal.targetRole}
                        onChange={(e) => setActionModal(prev => ({ ...prev, targetRole: e.target.value }))}
                      >
                        <option value="USER">USER (Standard Consumer)</option>
                        <option value="SKINCARE_CONSULTANT">SKINCARE_CONSULTANT (Advisory)</option>
                        <option value="DERMATOLOGIST">DERMATOLOGIST (Clinical Specialist)</option>
                        <option value="ADMIN">ADMIN (System Administrator)</option>
                      </select>
                      <div className="alert alert-secondary small">
                        Role changes are recorded in the audit log. Demoting the last active administrator is strictly disallowed by security policy.
                      </div>
                    </div>
                  )}

                  {actionModal.type === "DELETE" && (
                    <div>
                      <div className="alert alert-danger small mb-3">
                        <strong>Warning:</strong> Soft deleting this account will immediately deactivate credentials and revoke platform access. Historical clinical assessments and audit logs are preserved for clinical compliance.
                      </div>
                      <p className="text-muted small">Are you sure you want to proceed with terminating this account?</p>
                    </div>
                  )}

                  {(actionModal.type === "DEACTIVATE" || actionModal.type === "REACTIVATE") && (
                    <div>
                      <label className="form-label small fw-semibold">Administrative Note</label>
                      <input
                        type="text"
                        className="form-control-saas"
                        placeholder="Optional note for audit logging..."
                        value={actionModal.reason}
                        onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                      />
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={closeAction} disabled={actionModal.submitting}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-sm ${
                      actionModal.type === "BLOCK" || actionModal.type === "DELETE"
                        ? "btn-danger"
                        : actionModal.type === "UNBLOCK" || actionModal.type === "REACTIVATE"
                        ? "btn-success"
                        : "btn-saas"
                    }`}
                    disabled={actionModal.submitting}
                  >
                    {actionModal.submitting ? "Processing..." : "Confirm Action"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AdminDashboard;