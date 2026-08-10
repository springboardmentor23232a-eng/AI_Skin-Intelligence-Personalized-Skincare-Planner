import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn d-flex align-items-center gap-2 border-0 bg-transparent p-0"
        onClick={() => setOpen(!open)}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
          style={{
            width: "36px",
            height: "36px",
            background: "var(--accent-gradient)",
            fontSize: "0.9rem"
          }}
        >
          {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
        </div>
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-2 p-2 shadow-lg rounded"
          style={{
            width: "220px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            zIndex: 1050
          }}
        >
          <div className="px-3 py-2 border-bottom mb-2">
            <div className="fw-semibold text-truncate" style={{ color: "var(--text-primary)" }}>{user.full_name}</div>
            <div className="small text-muted text-truncate">{user.email}</div>
            <span className="badge badge-saas badge-saas-primary mt-1">{user.role}</span>
          </div>

          <button
            type="button"
            className="w-100 text-start btn btn-sm btn-light mb-1 border-0"
            onClick={() => {
              setOpen(false);
              navigate("/" + user.role.toLowerCase().replace("skincare_consultant", "consultant"));
            }}
          >
            📊 Dashboard
          </button>

          <button
            type="button"
            className="w-100 text-start btn btn-sm btn-outline-danger border-0 text-danger"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
