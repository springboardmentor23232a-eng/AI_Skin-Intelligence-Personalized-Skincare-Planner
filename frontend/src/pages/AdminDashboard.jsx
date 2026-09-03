import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();

  const usersList = [
    { id: 1, name: "Verification User", email: "verified_user@skincare.com", role: "USER", status: "Active", joined: "2026-07-31" },
    { id: 2, name: "Dr. Audit Consultant", email: "consultant_audit@skincare.com", role: "SKINCARE_CONSULTANT", status: "Active", joined: "2026-07-30" },
    { id: 3, name: "System Administrator", email: "admin_audit@skincare.com", role: "ADMIN", status: "Active", joined: "2026-07-29" }
  ];

  return (
    <Layout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            System Administration
          </h2>
          <p className="text-secondary small mb-0">
            Welcome, {user?.full_name || "Admin"}. System telemetry, account access, and service health.
          </p>
        </div>
        <span className="badge badge-saas badge-saas-success">System Online</span>
      </div>

      {/* Metrics Row */}
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
              <span className="stat-label">Total Users</span>
              <span className="stat-value">1,250</span>
              <span className="stat-trend positive">+12% this month</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Consultants</span>
              <span className="stat-value">42</span>
              <span className="stat-trend positive">Active Providers</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">API Latency</span>
              <span className="stat-value">14 ms</span>
              <span className="stat-trend positive">Healthy Response</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ color: "var(--accent-primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Database Health</span>
              <span className="stat-value">99.99%</span>
              <span className="stat-trend positive">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="saas-card mb-4">
        <div className="saas-card-header">
          <div>
            <h5 className="saas-card-title mb-0">Platform User Management</h5>
            <span className="saas-card-subtitle">Registered user profiles, roles, and status</span>
          </div>
          <span className="badge badge-saas badge-saas-primary">Real-Time Sync</span>
        </div>

        <div className="table-container-saas">
          <table className="table-saas">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role Context</th>
                <th>Status</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-saas ${u.role === 'ADMIN' ? 'badge-saas-danger' : u.role === 'SKINCARE_CONSULTANT' ? 'badge-saas-info' : 'badge-saas-primary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-saas badge-saas-success">{u.status}</span>
                  </td>
                  <td>{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;