import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className="d-none d-md-flex flex-column p-3 border-end"
      style={{
        width: "var(--sidebar-width)",
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        minHeight: "calc(100vh - var(--header-height))"
      }}
    >
      <div className="mb-4">
        <div className="small fw-bold text-uppercase px-3 mb-2" style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "1px" }}>
          Core Dashboard
        </div>
        
        {user.role === "USER" && (
          <>
            <Link
              to="/user"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/user") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/user") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/user") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>📊</span>
              <span>User Overview</span>
            </Link>

            <Link
              to="/profile"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/profile") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/profile") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/profile") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>👤</span>
              <span>Skin Profile</span>
            </Link>

            <Link
              to="/assessment"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/assessment") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/assessment") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/assessment") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>🧬</span>
              <span>AI Assessment</span>
            </Link>

            <Link
              to="/routines"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/routines") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/routines") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/routines") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>⚡</span>
              <span>Adaptive Routines</span>
            </Link>

            <Link
              to="/analytics"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/analytics") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/analytics") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/analytics") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>📈</span>
              <span>Skin Analytics</span>
            </Link>

            <Link
              to="/ingredients"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/ingredients") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/ingredients") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/ingredients") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>🧪</span>
              <span>Ingredient Intelligence</span>
            </Link>

            <Link
              to="/products"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/products") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/products") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/products") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>🛍️</span>
              <span>Products Catalog</span>
            </Link>

            <Link
              to="/recommendations"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/recommendations") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/recommendations") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/recommendations") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>🎯</span>
              <span>AI Recommendations</span>
            </Link>

            <Link
              to="/reports"
              className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
                isActive("/reports") ? "fw-bold" : ""
              }`}
              style={{
                backgroundColor: isActive("/reports") ? "var(--accent-subtle)" : "transparent",
                color: isActive("/reports") ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>📊</span>
              <span>Reports & Export</span>
            </Link>
          </>


        )}

        {(user.role === "SKINCARE_CONSULTANT" || user.role === "DERMATOLOGIST" || user.role === "ADMIN") && (
          <Link
            to="/consultant"
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
              isActive("/consultant") ? "fw-bold" : ""
            }`}
            style={{
              backgroundColor: isActive("/consultant") ? "var(--accent-subtle)" : "transparent",
              color: isActive("/consultant") ? "var(--accent-primary)" : "var(--text-secondary)"
            }}
          >
            <span>👨‍⚕️</span>
            <span>Consultant Workspace</span>
          </Link>
        )}

        {(user.role === "DERMATOLOGIST" || user.role === "ADMIN") && (
          <Link
            to="/dermatologist"
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all mb-1 ${
              isActive("/dermatologist") ? "fw-bold" : ""
            }`}
            style={{
              backgroundColor: isActive("/dermatologist") ? "var(--accent-subtle)" : "transparent",
              color: isActive("/dermatologist") ? "var(--accent-primary)" : "var(--text-secondary)"
            }}
          >
            <span>🩺</span>
            <span>Dermatologist Workspace</span>
          </Link>
        )}

        {user.role === "ADMIN" && (
          <Link
            to="/admin"
            className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none transition-all ${
              isActive("/admin") ? "fw-bold" : ""
            }`}
            style={{
              backgroundColor: isActive("/admin") ? "var(--accent-subtle)" : "transparent",
              color: isActive("/admin") ? "var(--accent-primary)" : "var(--text-secondary)"
            }}
          >
            <span>⚙️</span>
            <span>Admin Control Panel</span>
          </Link>
        )}
      </div>

      <div className="mb-4">
        <div className="small fw-bold text-uppercase px-3 mb-2" style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "1px" }}>
          Navigation
        </div>
        
        <Link
          to="/"
          className="d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>🏠</span>
          <span>Platform Home</span>
        </Link>
      </div>

      <div className="mt-auto p-3 rounded" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge badge-saas badge-saas-success">Active</span>
          <span className="small fw-semibold" style={{ color: "var(--text-primary)" }}>AI Engine v2.4</span>
        </div>
        <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
          Connected to PostgreSQL DB.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
