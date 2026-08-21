import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Sparkles, History, User, Shield, Stethoscope, Award, BookOpen, Settings, Crown, Moon, Sun, LogOut } from "lucide-react";

import { getDashboardForRole, normalizeRole } from "../utils/roleUtils";

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
  const userRole = normalizeRole(user?.role);
  const activeDashboard = getDashboardForRole(user?.role);

  return (
    <aside className="sidebar">
      <div>
        {/* Active Role Portal Badge Banner */}
        <div className="sidebar-section">
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--input-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <LayoutDashboard size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                ACTIVE DASHBOARD
              </span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {userRole === 'ADMIN' && 'System Administrator'}
                {userRole === 'DERMATOLOGIST' && 'Dermatologist Portal'}
                {userRole === 'SKINCARE_CONSULTANT' && 'Consultant Portal'}
                {userRole === 'USER' && 'User Dashboard'}
              </strong>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation according to Role */}
        <div className="sidebar-section">
          <h4 className="sidebar-title">NAVIGATION</h4>
          <ul className="sidebar-menu">
            <li>
              <Link to={`${activeDashboard}#overview`} className={`sidebar-item ${isActive(activeDashboard) && (!location.hash || location.hash === "#overview") ? "active" : ""}`}>
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </Link>
            </li>

            {/* Role Specific Navigation Items */}
            {userRole === 'USER' && (
              <>
                <li>
                  <Link to="/assessment" className={`sidebar-item ${isActive("/assessment") ? "active" : ""}`}>
                    <Sparkles size={18} />
                    <span>AI Skin Analysis</span>
                  </Link>
                </li>
                <li>
                  <Link to="/user#ingredients" className={`sidebar-item ${isActive("/user") && location.hash === "#ingredients" ? "active" : ""}`}>
                    <Shield size={18} />
                    <span>Ingredient Intelligence</span>
                  </Link>
                </li>
                <li>
                  <Link to="/user#products" className={`sidebar-item ${isActive("/user") && location.hash === "#products" ? "active" : ""}`}>
                    <Crown size={18} />
                    <span>Product Recommendations</span>
                  </Link>
                </li>
                <li>
                  <Link to="/user#progress" className={`sidebar-item ${isActive("/user") && location.hash === "#progress" ? "active" : ""}`}>
                    <History size={18} />
                    <span>Daily Progress Tracker</span>
                  </Link>
                </li>
                <li>
                  <Link to="/user#analytics" className={`sidebar-item ${isActive("/user") && location.hash === "#analytics" ? "active" : ""}`}>
                    <Award size={18} />
                    <span>Skincare Analytics</span>
                  </Link>
                </li>
              </>
            )}

            {userRole === 'SKINCARE_CONSULTANT' && (
              <>
                <li>
                  <Link to="/consultant#assigned-clients" className={`sidebar-item ${isActive("/consultant") && location.hash === "#assigned-clients" ? "active" : ""}`}>
                    <Sparkles size={18} />
                    <span>Assigned Clients</span>
                  </Link>
                </li>
              </>
            )}

            {userRole === 'DERMATOLOGIST' && (
              <>
                <li>
                  <Link to="/doctor#patients" className={`sidebar-item ${isActive("/doctor") && location.hash === "#patients" ? "active" : ""}`}>
                    <Stethoscope size={18} />
                    <span>Patient Consultations</span>
                  </Link>
                </li>
              </>
            )}

            {userRole === 'WELLNESS_COACH' && (
              <>
                <li>
                  <Link to="/wellness#clients" className={`sidebar-item ${isActive("/wellness") && location.hash === "#clients" ? "active" : ""}`}>
                    <Award size={18} />
                    <span>Lifestyle & Habits</span>
                  </Link>
                </li>
              </>
            )}

            {userRole === 'ADMIN' && (
              <>
                <li>
                  <Link to="/admin#users" className={`sidebar-item ${isActive("/admin") && location.hash === "#users" ? "active" : ""}`}>
                    <Shield size={18} />
                    <span>System Command</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Community Section */}
        <div className="sidebar-section">
          <h4 className="sidebar-title">COMMUNITY</h4>
          <ul className="sidebar-menu">
            <li>
              <Link to={userRole === 'USER' ? "/user#consult" : "/consultant"} className={`sidebar-item ${(isActive("/consultant") || (isActive("/user") && location.hash === "#consult")) ? "active" : ""}`}>
                <Stethoscope size={18} />
                <span>Consult a Specialist</span>
              </Link>
            </li>
            <li>
              <Link to="/user#tips" className={`sidebar-item ${isActive("/user") && location.hash === "#tips" ? "active" : ""}`}>
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
              <Link to="/profile" className={`sidebar-item ${isActive("/profile") && location.search !== "?tab=settings" ? "active" : ""}`}>
                <User size={18} />
                <span>My Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/profile?tab=settings" className={`sidebar-item ${isActive("/profile") && location.search === "?tab=settings" ? "active" : ""}`}>
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
