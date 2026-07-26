import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          AI_Skin-Intelligence-Personalized-Skincare-Planner
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/") ? "active" : ""}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/user") ? "active" : ""}`} to="/user">
                User Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/consultant") ? "active" : ""}`} to="/consultant">
                Consultant Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/admin") ? "active" : ""}`} to="/admin">
                Admin Dashboard
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-light small">
                  Logged in as: <strong>{user?.name}</strong> ({user?.role})
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Login (Demo)
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}