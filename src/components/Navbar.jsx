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
              ✨
            </div>
            <span style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}>AI Skin Intelligence</span>
          </Link>
        </div>

        <div className="d-none d-md-flex align-items-center" style={{ width: "320px" }}>
          <input
            type="text"
            className="form-control-saas"
            placeholder="Search AI features, routines, logs..."
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