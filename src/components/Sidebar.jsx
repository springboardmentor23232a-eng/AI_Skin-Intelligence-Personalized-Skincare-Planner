import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Sparkles, History, User, Shield, Stethoscope, Award, Droplets, ShoppingBag, Target, Users, BookOpen, Settings, Crown, Moon, Sun, LogOut } from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dark Mode State inside Sidebar
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

  const isActive = (path) => location.pathname === path;

  const isExactActive = (path, roleQuery) => {
    if (location.pathname !== path) return false;
    if (!roleQuery) return !location.search || location.search.includes("role=dermatologist") || !location.search.includes("role=");
    return location.search.includes(roleQuery);
  };

  return (
    <aside className="sidebar">
      <div>
        {/* All 5 Parallel Role Dashboards Section */}
        <div className="sidebar-section">
          <h4 className="sidebar-title">ROLE DASHBOARDS</h4>
          <ul className="sidebar-menu">
            <li>
              <Link to="/user" className={`sidebar-item ${isExactActive("/user") ? "active" : ""}`}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span>User Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/consultant?role=consultant" className={`sidebar-item ${isExactActive("/consultant", "role=consultant") ? "active" : ""}`}>
                <Sparkles size={18} style={{ color: 'var(--secondary)' }} />
                <span>Skincare Consultant</span>
              </Link>
            </li>
            <li>
              <Link to="/consultant?role=dermatologist" className={`sidebar-item ${isExactActive("/consultant", "role=dermatologist") ? "active" : ""}`}>
                <Stethoscope size={18} style={{ color: 'var(--accent)' }} />
                <span>Dermatologist</span>
              </Link>
            </li>
            <li>
              <Link to="/consultant?role=coach" className={`sidebar-item ${isExactActive("/consultant", "role=coach") ? "active" : ""}`}>
                <Award size={18} style={{ color: 'var(--warning)' }} />
                <span>Wellness Coach</span>
              </Link>
            </li>
            <li>
              <Link to="/admin" className={`sidebar-item ${isExactActive("/admin") ? "active" : ""}`}>
                <Shield size={18} style={{ color: 'var(--danger)' }} />
                <span>Administrator</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Section */}
        <div className="sidebar-section">
          <h4 className="sidebar-title">MAIN</h4>
          <ul className="sidebar-menu">
            <li>
              <Link to="/user" className={`sidebar-item ${isActive("/user") ? "active" : ""}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className={`sidebar-item ${isActive("/profile") ? "active" : ""}`}>
                <User size={18} />
                <span>Skin Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/assessment" className={`sidebar-item ${isActive("/assessment") ? "active" : ""}`}>
                <Sparkles size={18} />
                <span>AI Skin Analysis</span>
              </Link>
            </li>
            <li>
              <Link to="/wellness" className={`sidebar-item ${isActive("/wellness") ? "active" : ""}`}>
                <History size={18} />
                <span>Analysis History</span>
              </Link>
            </li>
            <li>
              <Link to="/assessment" className="sidebar-item">
                <ShoppingBag size={18} />
                <span>Product Recommendations</span>
              </Link>
            </li>
            <li>
              <Link to="/user" className="sidebar-item">
                <Target size={18} />
                <span>Skincare Goals</span>
              </Link>
            </li>
            <li>
              <Link to="/wellness" className="sidebar-item">
                <Droplets size={18} />
                <span>Wellness Tracking</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Community Section */}
        <div className="sidebar-section">
          <h4 className="sidebar-title">COMMUNITY</h4>
          <ul className="sidebar-menu">
            <li>
              <Link to="/consultant" className={`sidebar-item ${isActive("/consultant") ? "active" : ""}`}>
                <Stethoscope size={18} />
                <span>Consult a Specialist</span>
              </Link>
            </li>
            <li>
              <Link to="/user" className="sidebar-item">
                <BookOpen size={18} />
                <span>Tips &amp; Articles</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Account Section */}
        <div className="sidebar-section">
          <h4 className="sidebar-title">ACCOUNT</h4>
          <ul className="sidebar-menu">
            <li>
              <Link to="/profile" className="sidebar-item">
                <User size={18} />
                <span>My Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="sidebar-item">
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Unlock Premium Upgrade Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(13, 148, 136, 0.1))',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem 1rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--warning)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Crown size={16} /> <span>Unlock Premium</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: '1.4' }}>
            Get advanced AI insights, detailed reports and personalized routines.
          </p>
          <button className="btn btn-primary btn-block" style={{ padding: '0.45rem', fontSize: '0.8rem' }}>
            Upgrade Now →
          </button>
        </div>
      </div>

      {/* Bottom Controls: Theme Toggle & Logout Button */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            {theme === "light" ? <Sun size={16} style={{ color: 'var(--warning)' }} /> : <Moon size={16} style={{ color: 'var(--primary)' }} />}
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </span>

          <label className="ios-toggle">
            <input type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
            <span className="ios-slider"></span>
          </label>
        </div>

        {/* Dedicated Log Out Button */}
        <button
          onClick={handleLogout}
          className="btn btn-outline btn-block"
          style={{
            color: 'var(--danger)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            padding: '0.5rem',
            fontSize: '0.85rem',
            background: 'rgba(239, 68, 68, 0.06)'
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
