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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              <span>Dashboard</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>My Skin Profile</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span>Skin Assessment</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Daily Routines</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Skin Progress</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Ingredient Safety</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Products</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Product Matches</span>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Reports</span>
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
