import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import ProfileDropdown from "./ProfileDropdown";

function Navbar() {
  const { user } = useAuth();

  return (
    <header
      className="navbar navbar-expand-lg px-4 border-bottom shadow-sm"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        height: "var(--header-height)",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none" to="/">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white"
              style={{ width: "32px", height: "32px", background: "var(--accent-gradient)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a9 9 0 0 1 9 9c0 5-4 9-9 9s-9-4-9-9a9 9 0 0 1 9-9z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span style={{ color: "var(--text-primary)", fontSize: "1.05rem", letterSpacing: "-0.2px" }}>Skin Intelligence</span>
          </Link>
        </div>

        <div className="d-none d-md-flex align-items-center" style={{ width: "320px" }}>
          <input
            type="text"
            className="form-control-saas"
            placeholder="Search routines, ingredients, guides..."
            style={{ fontSize: "0.85rem" }}
          />
        </div>

        <div className="d-flex align-items-center gap-3">
          <ThemeToggle />
          {user && <NotificationCenter />}
          {user ? (
            <ProfileDropdown />
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-saas-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-saas">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;