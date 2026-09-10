import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, LogOut, Sparkles, Sun, Moon, LayoutDashboard, 
  Bell, CheckCircle2, AlertTriangle, Droplets, Bed, 
  ExternalLink, X, Quote 
} from "lucide-react";
import { getDashboardForRole } from "../utils/roleUtils";
import { api } from "../services/api";

const INITIAL_FALLBACK_NOTIFICATIONS = [
  {
    id: "notif-100",
    type: "MOTIVATIONAL",
    title: "✨ Daily Skin Positivity & Motivation",
    message: "\"Glowing skin is a result of proper care, not luck. Keep up your routine today!\" — Skincare Wisdom",
    timestamp: "Today, 07:00 AM",
    read: false,
    priority: "HIGH"
  },
  {
    id: "notif-101",
    type: "ROUTINE",
    title: "☀️ Morning Skincare Routine Reminder",
    message: "It's 8:00 AM! Complete your 4-step AM routine: Gentle Cleanser, Niacinamide Serum, Hydrating Cream, and SPF 50.",
    timestamp: "Today, 08:00 AM",
    read: false,
    priority: "HIGH"
  },
  {
    id: "notif-102",
    type: "REPLENISHMENT",
    title: "⚠️ Sunscreen Restock Alert",
    message: "Dot & Key Sunscreen has ~4 days remaining. Restock now on Nykaa or Amazon!",
    timestamp: "Today, 09:15 AM",
    read: false,
    priority: "HIGH"
  }
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Dark Mode State
  const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "light");

  // Notifications State for Top Header
  const [showPopover, setShowPopover] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_FALLBACK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(3);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  const popoverRef = useRef(null);

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

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      if (data && Array.isArray(data.items)) {
        setNotifications(data.items);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // Use fallback state cleanly if microservice offline
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      api.getNotifications().then((data) => {
        if (isMounted && data && Array.isArray(data.items)) {
          setNotifications(data.items);
          setUnreadCount(data.unread_count || 0);
        }
      }).catch(() => {
        // Fallback
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Listen for real-time notification update events
  useEffect(() => {
    const handleNotificationUpdate = () => {
      fetchNotifications();
    };

    const handleToastEvent = (e) => {
      if (e.detail) {
        setToast(e.detail);
        fetchNotifications();
        setTimeout(() => {
          setToast(null);
        }, 4500);
      }
    };

    window.addEventListener("notification-updated", handleNotificationUpdate);
    window.addEventListener("notification-toast", handleToastEvent);

    return () => {
      window.removeEventListener("notification-updated", handleNotificationUpdate);
      window.removeEventListener("notification-toast", handleToastEvent);
    };
  }, [fetchNotifications]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark single notification as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.markNotificationAsRead(id);
      window.dispatchEvent(new CustomEvent("notification-updated"));
    } catch {
      // Fallback updated locally
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);

    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => api.markNotificationAsRead(n.id))
      );
      window.dispatchEvent(new CustomEvent("notification-updated"));
    } catch {
      // Updated locally
    }
  };

  const getDisplayName = () => {
    if (!user || !user.name || user.name === "Google Account User" || user.name === "Google User") {
      return user?.email ? user.email.split("@")[0] : "Skin Planner User";
    }
    return user.name;
  };

  const dashboardPath = getDashboardForRole(user?.role);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "ALL") return true;
    return n.type === activeFilter;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case "MOTIVATIONAL":
        return <Quote size={16} style={{ color: "#F59E0B" }} />;
      case "ROUTINE":
        return <Sun size={16} style={{ color: "#3B82F6" }} />;
      case "REPLENISHMENT":
        return <AlertTriangle size={16} style={{ color: "#EF4444" }} />;
      case "HYDRATION":
        return <Droplets size={16} style={{ color: "#06B6D4" }} />;
      case "SLEEP":
        return <Bed size={16} style={{ color: "#8B5CF6" }} />;
      default:
        return <Sparkles size={16} style={{ color: "#10B981" }} />;
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to={isAuthenticated ? dashboardPath : "/"} className="navbar-brand" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
            <Sparkles className="brand-icon" size={24} />
            <span className="brand-title" style={{ fontSize: "1.05rem", fontWeight: 800, whiteSpace: "nowrap" }}>
              AI Skin Intelligence &amp; Skincare Planner
            </span>
            <span className="brand-badge">PRO</span>
          </Link>

          <div className="navbar-right-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.75rem", flexWrap: "nowrap" }}>
            {isAuthenticated && (
              <div className="navbar-links" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", flexWrap: "nowrap" }}>
                <Link to={dashboardPath} className="nav-link" style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center" }}>
                  <LayoutDashboard size={16} />
                  <span>My Dashboard</span>
                </Link>

                {/* Top Navbar Bell Notification Popover Logo Button */}
                <div className="nav-notif-container" ref={popoverRef}>
                  <button
                    onClick={() => setShowPopover((prev) => !prev)}
                    className="nav-notif-btn"
                    title="Notifications & Reminders"
                    aria-label="View notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="nav-notif-badge">{unreadCount}</span>}
                  </button>

                  {/* Dropdown Popover Modal Menu */}
                  {showPopover && (
                    <div className="notif-popover-menu">
                      <div className="notif-popover-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Bell size={17} style={{ color: "var(--primary)" }} />
                          <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800 }}>Notifications</h4>
                          {unreadCount > 0 && (
                            <span
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                padding: "0.15rem 0.5rem",
                                borderRadius: "10px",
                                fontSize: "0.7rem",
                                fontWeight: 800
                              }}
                            >
                              {unreadCount} New
                            </span>
                          )}
                        </div>

                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--primary)",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem"
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      {/* Category Filter Tabs */}
                      <div className="notif-popover-tabs">
                        {[
                          { id: "ALL", label: "All" },
                          { id: "MOTIVATIONAL", label: "Quotes ✨" },
                          { id: "ROUTINE", label: "Routine ☀️" },
                          { id: "REPLENISHMENT", label: "Restock ⚠️" },
                          { id: "HYDRATION", label: "Hydration 💧" }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            className={`notif-tab-btn ${activeFilter === tab.id ? "active" : ""}`}
                            onClick={() => setActiveFilter(tab.id)}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Notification Items List */}
                      <div className="notif-popover-body">
                        {filteredNotifications.length === 0 ? (
                          <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                            <Sparkles size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
                            <p style={{ margin: 0 }}>No notifications found in this category.</p>
                          </div>
                        ) : (
                          filteredNotifications.map((item) => (
                            <div
                              key={item.id}
                              className={`notif-item-row ${!item.read ? "unread" : ""}`}
                              onClick={(e) => handleMarkAsRead(item.id, e)}
                            >
                              <div
                                style={{
                                  padding: "0.45rem",
                                  borderRadius: "10px",
                                  background: "var(--input-bg)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0
                                }}
                              >
                                {getNotifIcon(item.type)}
                              </div>

                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                                  <strong style={{ fontSize: "0.83rem", color: "var(--text-primary)" }}>{item.title}</strong>
                                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{item.timestamp}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                                  {item.message}
                                </p>

                                {/* If Restock alert, render buy buttons */}
                                {item.type === "REPLENISHMENT" && (
                                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.45rem" }}>
                                    <a
                                      href="https://www.nykaa.com"
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        padding: "0.2rem 0.5rem",
                                        borderRadius: "6px",
                                        background: "#e91e63",
                                        color: "#fff",
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}
                                    >
                                      <span>Nykaa</span>
                                      <ExternalLink size={10} />
                                    </a>
                                    <a
                                      href="https://www.amazon.in"
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        padding: "0.2rem 0.5rem",
                                        borderRadius: "6px",
                                        background: "#ff9900",
                                        color: "#111",
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.2rem"
                                      }}
                                    >
                                      <span>Amazon</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  </div>
                                )}
                              </div>

                              {!item.read && (
                                <span
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "var(--primary)",
                                    flexShrink: 0,
                                    marginTop: "0.3rem"
                                  }}
                                />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Popover Footer Navigation Link */}
                      <div className="notif-popover-footer">
                        <Link
                          to="/user#reminders"
                          onClick={() => setShowPopover(false)}
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            color: "var(--primary)",
                            textDecoration: "none"
                          }}
                        >
                          View Reminders &amp; Notification System →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="user-profile-menu" style={{ flexShrink: 0, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Link to="/profile" className="profile-chip" title="View Profile Settings" style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
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
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "20px",
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.35)",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="navbar-auth" style={{ display: "flex", flexDirection: "row", gap: "0.5rem", flexWrap: "nowrap" }}>
                <Link to="/login" className="btn btn-outline" style={{ whiteSpace: "nowrap" }}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>Get Started</Link>
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

      {/* Floating Live Notification Toast Pop-Up */}
      {toast && (
        <div className="notif-toast-overlay">
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Bell size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: "0.88rem", display: "block", color: "var(--text-primary)" }}>{toast.title || "Notification Alert"}</strong>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer"
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;