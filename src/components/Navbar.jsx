import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, Shield, Award, Sparkles, HeartPulse, Sun, Moon, LayoutDashboard, History, ShoppingBag } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Dark Mode State
  const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get real authenticated user name from PostgreSQL/JWT
  const getDisplayName = () => {
    if (!user || !user.name || user.name === "Google Account User" || user.name === "Google User") {
      return user?.email ? user.email.split("@")[0] : "Skin Planner User";
    }
    return user.name;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          <Sparkles className="brand-icon" size={24} />
          <span className="brand-title" style={{ fontSize: '1.05rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
            AI Skin Intelligence &amp; Skincare Planner
          </span>
          <span className="brand-badge">PRO</span>
        </Link>

        <div className="navbar-right-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', flexWrap: 'nowrap' }}>
          {isAuthenticated && (
            <div className="navbar-links" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
              <Link to="/user" className="nav-link" style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                <LayoutDashboard size={16} />
                <span>User Dashboard</span>
              </Link>

              <Link to="/assessment" className="nav-link" style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                <Sparkles size={16} />
                <span>Skin Analysis</span>
              </Link>

              <Link to="/wellness" className="nav-link" style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                <History size={16} />
                <span>Skin History</span>
              </Link>

              <Link to="/consultant" className="nav-link coach-link" style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                <Award size={16} />
                <span>Specialist Portal</span>
              </Link>

              <Link to="/admin" className="nav-link admin-link" style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                <Shield size={16} />
                <span>Admin Command</span>
              </Link>

              <div className="user-profile-menu" style={{ flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link to="/profile" className="profile-chip" title="View Profile Settings" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
                  <User size={16} />
                  <span>{getDisplayName()}</span>
                  <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                    {user?.role}
                  </span>
                </Link>

                <button 
                  onClick={handleLogout} 
                  className="navbar-logout-btn" 
                  title="Sign Out / Logout"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="navbar-auth" style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', flexWrap: 'nowrap' }}>
              <Link to="/login" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Get Started</Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            aria-label="Toggle theme"
            style={{ flexShrink: 0 }}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;