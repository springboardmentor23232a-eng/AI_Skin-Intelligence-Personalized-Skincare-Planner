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
            Admin Control Panel ⚙️
          </h2>
          <p className="text-secondary small mb-0">
            Welcome, Administrator {user?.full_name || "Admin"}. System health, role management, and PostgreSQL database telemetry.
          </p>
        </div>
        <span className="badge badge-saas badge-saas-danger">Provider: {user?.provider || "LOCAL"}</span>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">👥</div>
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">1,250</span>
              <span className="stat-trend positive">↑ +12% this month</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">👨‍⚕️</div>
            <div className="stat-info">
              <span className="stat-label">Consultants</span>
              <span className="stat-value">42</span>
              <span className="stat-trend positive">Verified Providers</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">⚡</div>
            <div className="stat-info">
              <span className="stat-label">API Latency</span>
              <span className="stat-value">14 ms</span>
              <span className="stat-trend positive">⚡ Optimal</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-icon-wrapper">🗄️</div>
            <div className="stat-info">
              <span className="stat-label">PostgreSQL Health</span>
              <span className="stat-value">99.99%</span>
              <span className="stat-trend positive">🟢 Connected</span>
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