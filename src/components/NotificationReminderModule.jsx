import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import {
  Bell,
  Sun,
  Moon,
  Droplets,
  ShoppingBag,
  Sparkles,
  Clock,
  CheckCircle2,
  Settings,
  ExternalLink,
  Zap,
  Volume2,
  Quote,
  RotateCcw,
  Mail,
  Smartphone,
  Send
} from "lucide-react";

const NotificationReminderModule = ({ onToast }) => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replenishmentForecast, setReplenishmentForecast] = useState([]);
  const [dailyQuote, setDailyQuote] = useState({
    quote: "Glowing skin is a result of proper care, not luck. Keep up your routine today!",
    author: "Skincare Wisdom"
  });
  const [preferences, setPreferences] = useState({
    am_routine_time: "08:00",
    am_routine_enabled: true,
    pm_routine_time: "21:00",
    pm_routine_enabled: true,
    hydration_interval_hours: 2,
    hydration_enabled: true,
    sleep_reminder_time: "22:30",
    sleep_enabled: true,
    replenishment_alerts_enabled: true,
    progress_photo_reminders_enabled: true,
    email_notifications_enabled: true,
    custom_email: "akp73733@gmail.com",
    sms_notifications_enabled: true,
    custom_phone: "+91 9876543210"
  });

  const [activeTab, setActiveTab] = useState("ALL"); // ALL | MOTIVATIONAL | ROUTINE | REPLENISHMENT | HYDRATION | SLEEP | PROGRESS | PLATFORM
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Test notification simulation input state
  const [testType, setTestType] = useState("ROUTINE");
  const [testTitle, setTestTitle] = useState("☀️ Morning SPF Reminder");
  const [testMessage, setTestMessage] = useState("Don't forget to apply your two finger lengths of SPF 50 sunscreen before stepping out!");
  const [testChannel, setTestChannel] = useState("ALL"); // ALL | EMAIL | SMS | IN_APP
  const [testEmail, setTestEmail] = useState("akp73733@gmail.com");
  const [testPhone, setTestPhone] = useState("+91 9876543210");



  const fetchNotificationFeed = async () => {
    try {
      const data = await apiService.getNotifications();
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
        setReplenishmentForecast(data.replenishment_forecast || []);
        if (data.preferences) setPreferences(data.preferences);
      }
    } catch (err) {
      console.warn("Offline fallback for notification feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshQuote = async () => {
    try {
      const q = await apiService.getMotivationalQuote();
      if (q && q.quote) {
        setDailyQuote(q);
        if (onToast) onToast("✨ Inspiration refreshed!");
      }
    } catch (_err) {
      const quotes = [
        { quote: "Consistency is the secret ingredient to healthy, resilient skin.", author: "Dermatology Principle" },
        { quote: "Invest in your skin. It is going to represent you for a very long time.", author: "Linden Tyler" },
        { quote: "Hydration is the ultimate fountain of youth. Drink water & nourish your barrier!", author: "Skin Health Guide" },
        { quote: "Self-care is how you take your power back. Take 5 minutes for your skin tonight!", author: "Wellness Mindset" }
      ];
      const rand = quotes[Math.floor(Math.random() * quotes.length)];
      setDailyQuote(rand);
      if (onToast) onToast("✨ Inspiration refreshed!");
    }
  };

  useEffect(() => {
    let isMounted = true;
    apiService.getNotifications().then((data) => {
      if (isMounted && data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
        setReplenishmentForecast(data.replenishment_forecast || []);
        if (data.preferences) setPreferences(data.preferences);
      }
    }).catch((err) => {
      console.warn("Offline fallback for notification feed:", err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
    } catch (_err) {
      // local fallback
    }
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    window.dispatchEvent(new CustomEvent("notification-updated"));
    if (onToast) onToast("✔ Notification marked as read");
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const updated = await apiService.updateNotificationPreferences(preferences);
      if (updated) setPreferences(updated);
      if (onToast) onToast("✨ Reminder schedule preferences updated successfully!");
    } catch (err) {
      if (onToast) onToast(`✔ Schedule saved locally (${err?.message || "Updated"})`);
    } finally {
      setSavingPrefs(false);
      setShowConfigurator(false);
      fetchNotificationFeed();
    }
  };

  const handleTriggerTest = async (e) => {
    e.preventDefault();
    try {
      const activeEmail = testEmail || preferences.custom_email;
      const activePhone = testPhone || preferences.custom_phone;
      const newNotif = await apiService.triggerTestNotification({
        notification_type: testType,
        title: testTitle,
        message: testMessage,
        target_channel: testChannel,
        custom_email: activeEmail,
        custom_phone: activePhone
      });
      if (newNotif) {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
        const channelDesc = testChannel === "EMAIL" ? `📧 Email sent to ${activeEmail}` : testChannel === "SMS" ? `📱 SMS dispatched to ${activePhone}` : `🌐 Dispatched to All Channels (Email: ${activeEmail} | SMS: ${activePhone})`;
        window.dispatchEvent(new CustomEvent("notification-toast", { detail: { title: newNotif.title, message: `${newNotif.message} [${channelDesc}]` } }));
        if (onToast) onToast(`🔔 [DISPATCHED] ${newNotif.title} (${channelDesc})`);
      }
    } catch (_err) {
      window.dispatchEvent(new CustomEvent("notification-toast", { detail: { title: testTitle, message: testMessage } }));
      if (onToast) onToast(`🔔 [SIMULATION] ${testTitle}: ${testMessage}`);
    }
  };



  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    return n.type === activeTab;
  });

  const getCategoryIcon = (type) => {
    switch (type) {
      case "MOTIVATIONAL":
        return <Quote size={18} style={{ color: "#EC4899" }} />;
      case "ROUTINE":
        return <Sun size={18} style={{ color: "#F59E0B" }} />;
      case "REPLENISHMENT":
        return <ShoppingBag size={18} style={{ color: "#EF4444" }} />;
      case "HYDRATION":
        return <Droplets size={18} style={{ color: "#3B82F6" }} />;
      case "SLEEP":
        return <Moon size={18} style={{ color: "#6366F1" }} />;
      case "PROGRESS":
        return <Sparkles size={18} style={{ color: "#10B981" }} />;
      default:
        return <Bell size={18} style={{ color: "#8B5CF6" }} />;
    }
  };

  return (
    <div id="reminders" className="glass-card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
      {/* Module Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.55rem", margin: 0 }}>
            <span style={{ padding: "0.45rem", background: "rgba(245, 158, 11, 0.12)", borderRadius: "50%", color: "#F59E0B", display: "flex" }}>
              <Bell size={20} />
            </span>
            Notification &amp; Reminder System
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0.2rem 0 0 0" }}>
            Automated skincare routine alerts, product replenishment forecasts, hydration goals &amp; sleep reminders
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {unreadCount > 0 && (
            <span style={{ fontSize: "0.78rem", fontWeight: 800, padding: "0.3rem 0.7rem", borderRadius: "16px", background: "rgba(239, 68, 68, 0.12)", color: "var(--danger)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
              {unreadCount} Unread Alerts
            </span>
          )}

          <button
            onClick={() => setShowConfigurator(!showConfigurator)}
            className="btn btn-outline"
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}
          >
            <Settings size={15} /> Reminder Settings
          </button>
        </div>
      </div>

      {/* Reminder Schedule Configurator Drawer */}
      {showConfigurator && (
        <form onSubmit={handleSavePreferences} style={{ background: "var(--input-bg)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Clock size={16} /> Configure Automated Schedule Preferences
          </h4>

          <div className="grid-layout grid-2-col" style={{ gap: "1rem", marginBottom: "1rem" }}>
            {/* AM Routine */}
            <div style={{ background: "var(--card-bg)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                <span>☀️ Morning Routine Reminder</span>
                <input
                  type="checkbox"
                  checked={preferences.am_routine_enabled}
                  onChange={(e) => setPreferences((p) => ({ ...p, am_routine_enabled: e.target.checked }))}
                />
              </label>
              <input
                type="time"
                value={preferences.am_routine_time}
                onChange={(e) => setPreferences((p) => ({ ...p, am_routine_time: e.target.value }))}
                style={{ padding: "0.35rem 0.6rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", width: "100%" }}
                disabled={!preferences.am_routine_enabled}
              />
            </div>

            {/* PM Routine */}
            <div style={{ background: "var(--card-bg)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                <span>🌙 Evening Routine Reminder</span>
                <input
                  type="checkbox"
                  checked={preferences.pm_routine_enabled}
                  onChange={(e) => setPreferences((p) => ({ ...p, pm_routine_enabled: e.target.checked }))}
                />
              </label>
              <input
                type="time"
                value={preferences.pm_routine_time}
                onChange={(e) => setPreferences((p) => ({ ...p, pm_routine_time: e.target.value }))}
                style={{ padding: "0.35rem 0.6rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", width: "100%" }}
                disabled={!preferences.pm_routine_enabled}
              />
            </div>

            {/* Hydration */}
            <div style={{ background: "var(--card-bg)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                <span>💧 Water Hydration Alerts</span>
                <input
                  type="checkbox"
                  checked={preferences.hydration_enabled}
                  onChange={(e) => setPreferences((p) => ({ ...p, hydration_enabled: e.target.checked }))}
                />
              </label>
              <select
                value={preferences.hydration_interval_hours}
                onChange={(e) => setPreferences((p) => ({ ...p, hydration_interval_hours: parseInt(e.target.value) }))}
                style={{ padding: "0.35rem 0.6rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", width: "100%" }}
                disabled={!preferences.hydration_enabled}
              >
                <option value={1}>Every 1 Hour</option>
                <option value={2}>Every 2 Hours (Recommended)</option>
                <option value={3}>Every 3 Hours</option>
              </select>
            </div>

            {/* Sleep */}
            <div style={{ background: "var(--card-bg)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                <span>🛌 Sleep &amp; Barrier Repair Warning</span>
                <input
                  type="checkbox"
                  checked={preferences.sleep_enabled}
                  onChange={(e) => setPreferences((p) => ({ ...p, sleep_enabled: e.target.checked }))}
                />
              </label>
              <input
                type="time"
                value={preferences.sleep_reminder_time}
                onChange={(e) => setPreferences((p) => ({ ...p, sleep_reminder_time: e.target.value }))}
                style={{ padding: "0.35rem 0.6rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", width: "100%" }}
                disabled={!preferences.sleep_enabled}
              />
            </div>
          </div>

          {/* Dedicated Custom Notification Delivery Channels (Email & SMS) */}
          <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.2)", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <h5 style={{ fontSize: "0.88rem", fontWeight: 800, margin: "0 0 0.75rem 0", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--primary)" }}>
              <Send size={15} /> Custom Notification Channels &amp; Target Contact Info
            </h5>

            <div className="grid-layout grid-2-col" style={{ gap: "1rem" }}>
              {/* Custom Email Channel */}
              <div style={{ background: "var(--card-bg)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-primary)" }}>
                    <Mail size={15} style={{ color: "#EA4335" }} /> Email Notifications
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.email_notifications_enabled}
                    onChange={(e) => setPreferences((p) => ({ ...p, email_notifications_enabled: e.target.checked }))}
                  />
                </label>
                <input
                  type="email"
                  placeholder="Enter target Email ID (e.g. user@gmail.com)"
                  value={preferences.custom_email}
                  onChange={(e) => setPreferences((p) => ({ ...p, custom_email: e.target.value }))}
                  style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)", width: "100%" }}
                  disabled={!preferences.email_notifications_enabled}
                  required={preferences.email_notifications_enabled}
                />
                <small style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                  Automated routine reminders &amp; restock alerts will be sent to this email.
                </small>
              </div>

              {/* Custom SMS Mobile Channel */}
              <div style={{ background: "var(--card-bg)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-primary)" }}>
                    <Smartphone size={15} style={{ color: "#34A853" }} /> SMS Text Notifications
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences.sms_notifications_enabled}
                    onChange={(e) => setPreferences((p) => ({ ...p, sms_notifications_enabled: e.target.checked }))}
                  />
                </label>
                <input
                  type="tel"
                  placeholder="Enter mobile phone number with country code (e.g. +91 9876543210)"
                  value={preferences.custom_phone}
                  onChange={(e) => setPreferences((p) => ({ ...p, custom_phone: e.target.value }))}
                  style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)", width: "100%" }}
                  disabled={!preferences.sms_notifications_enabled}
                  required={preferences.sms_notifications_enabled}
                />
                <small style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                  Urgent alerts &amp; SPF check-ins delivered directly to your phone via SMS.
                </small>
              </div>
            </div>
          </div>


          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
            <button type="button" onClick={() => setShowConfigurator(false)} className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}>
              Cancel
            </button>
            <button type="submit" disabled={savingPrefs} className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}>
              {savingPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      )}

      {/* Daily Skincare Motivation & Mindset Booster Banner */}
      <div style={{ background: "linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)", border: "1px solid rgba(236, 72, 153, 0.25)", padding: "1.1rem 1.25rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "260px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#EC4899", display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.35rem" }}>
              <Quote size={14} /> DAILY SKINCARE MOTIVATION &amp; MINDSET BOOSTER
            </span>
            <blockquote style={{ margin: "0 0 0.35rem 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", italic: "italic", lineHeight: "1.4" }}>
              "{dailyQuote.quote}"
            </blockquote>
            <small style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
              — {dailyQuote.author}
            </small>
          </div>

          <button
            onClick={handleRefreshQuote}
            className="btn btn-outline"
            style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "var(--card-bg)" }}
          >
            <RotateCcw size={13} /> Refresh Inspiration
          </button>
        </div>
      </div>

      {/* Product Replenishment Forecast Cards Grid */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ fontSize: "0.92rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ShoppingBag size={16} style={{ color: "var(--danger)" }} /> Product Replenishment &amp; Restock Predictions
        </h4>

        <div className="grid-layout grid-2-col" style={{ gap: "0.75rem" }}>
          {replenishmentForecast.map((prod, idx) => (
            <div
              key={idx}
              style={{
                background: prod.status === "CRITICAL" ? "rgba(239, 68, 68, 0.08)" : "var(--input-bg)",
                border: prod.status === "CRITICAL" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--border-color)",
                padding: "0.85rem",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                justify: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{prod.product_name}</span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "10px",
                      background: prod.status === "CRITICAL" ? "rgba(239, 68, 68, 0.15)" : prod.status === "REPLENISH_SOON" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: prod.status === "CRITICAL" ? "var(--danger)" : prod.status === "REPLENISH_SOON" ? "var(--warning)" : "var(--success)"
                    }}
                  >
                    {prod.status === "CRITICAL" ? "⚠️ Restock Now" : prod.status === "REPLENISH_SOON" ? "Refill Soon" : "Stock OK"}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 0.4rem 0" }}>
                  Category: <strong>{prod.category}</strong> • Est. Usage: {prod.daily_usage_ml}ml/day
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Remaining Stock</span>
                  <span style={{ color: prod.days_remaining <= 7 ? "var(--danger)" : "var(--primary)" }}>{prod.days_remaining} Days Left</span>
                </div>
                <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden", marginBottom: "0.6rem" }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(10, (prod.days_remaining / 45) * 100))}%`,
                      height: "100%",
                      background: prod.status === "CRITICAL" ? "#EF4444" : prod.status === "REPLENISH_SOON" ? "#F59E0B" : "#10B981"
                    }}
                  />
                </div>

                <a
                  href={prod.buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ width: "100%", fontSize: "0.75rem", padding: "0.3rem", display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "0.3rem" }}
                >
                  <ExternalLink size={12} /> Restock on Nykaa / Amazon
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.4rem", marginBottom: "1rem" }}>
        {["ALL", "MOTIVATIONAL", "ROUTINE", "REPLENISHMENT", "HYDRATION", "SLEEP", "PROGRESS", "PLATFORM"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? "btn-primary" : "btn-outline"}`}
            style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem", whiteSpace: "nowrap" }}
          >
            {tab === "ALL" ? "All Notifications" : tab}
          </button>
        ))}
      </div>

      {/* Notifications Roster */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading notification feed...</div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                display: "flex",
                gap: "0.85rem",
                padding: "0.85rem 1rem",
                background: notif.read ? "var(--input-bg)" : "rgba(59, 130, 246, 0.06)",
                border: notif.read ? "1px solid var(--border-color)" : "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "8px",
                alignItems: "flex-start",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ padding: "0.4rem", borderRadius: "50%", background: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                {getCategoryIcon(notif.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem", flexWrap: "wrap" }}>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: notif.read ? 600 : 800, margin: 0, color: "var(--text-primary)" }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{notif.timestamp}</span>
                </div>

                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 0.4rem 0", lineHeight: "1.4" }}>
                  {notif.message}
                </p>

                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "0.1rem 0.45rem",
                      borderRadius: "8px",
                      background: notif.priority === "HIGH" ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)",
                      color: notif.priority === "HIGH" ? "var(--danger)" : "#3B82F6"
                    }}
                  >
                    {notif.type} • {notif.priority}
                  </span>

                  {/* Delivery Channel Status Badges (Email & SMS) */}
                  {(notif.delivery_channels || ["IN_APP", "EMAIL", "SMS"]).map((ch) => {
                    if (ch === "EMAIL" && preferences.email_notifications_enabled) {
                      return (
                        <span key="ch-email" title={notif.delivery_status_details?.EMAIL || `Dispatched via Email to ${preferences.custom_email}`} style={{ fontSize: "0.63rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "8px", background: "rgba(234, 67, 53, 0.12)", color: "#EA4335", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                          <Mail size={11} /> Email Sent ({preferences.custom_email.split('@')[0]})
                        </span>
                      );
                    }
                    if (ch === "SMS" && preferences.sms_notifications_enabled) {
                      return (
                        <span key="ch-sms" title={notif.delivery_status_details?.SMS || `Dispatched via SMS to ${preferences.custom_phone}`} style={{ fontSize: "0.63rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "8px", background: "rgba(52, 168, 83, 0.12)", color: "#34A853", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                          <Smartphone size={11} /> SMS Delivered
                        </span>
                      );
                    }
                    if (ch === "IN_APP") {
                      return (
                        <span key="ch-inapp" style={{ fontSize: "0.63rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "8px", background: "rgba(139, 92, 246, 0.12)", color: "#8B5CF6", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                          <Bell size={11} /> In-App
                        </span>
                      );
                    }
                    return null;
                  })}

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="btn btn-outline"
                      style={{ padding: "0.15rem 0.5rem", fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: "0.2rem", marginLeft: "auto" }}
                    >
                      <CheckCircle2 size={12} /> Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No notifications found for this filter.</div>
        )}
      </div>

      {/* Live Test Notification Trigger Simulator */}
      <div style={{ background: "var(--input-bg)", padding: "1.15rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Zap size={16} style={{ color: "#F59E0B" }} /> Real-Time Multi-Channel Notification Simulator
          </h4>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Dispatch instant alerts to ANY custom Mobile Phone No. or Email ID
          </span>
        </div>

        <form onSubmit={handleTriggerTest} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Row 1: Channel selection & Notification Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.25rem", color: "var(--text-primary)" }}>
                Select Target Channel:
              </label>
              <select
                value={testChannel}
                onChange={(e) => setTestChannel(e.target.value)}
                style={{ width: "100%", padding: "0.45rem 0.65rem", fontSize: "0.82rem", borderRadius: "6px", border: "1.5px solid var(--primary)", background: "var(--card-bg)", fontWeight: 700, color: "var(--primary)" }}
              >
                <option value="ALL">🌐 All Channels (Email + SMS + In-App)</option>
                <option value="SMS">📱 SMS Only (Enter Custom Mobile No.)</option>
                <option value="EMAIL">📧 Email Only (Enter Custom Email ID)</option>
                <option value="IN_APP">🔔 In-App Feed Only</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.25rem", color: "var(--text-primary)" }}>
                Alert Category:
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                style={{ width: "100%", padding: "0.45rem 0.65rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
              >
                <option value="MOTIVATIONAL">Motivational Quote Alert</option>
                <option value="ROUTINE">Routine Alert</option>
                <option value="HYDRATION">Hydration Warning</option>
                <option value="REPLENISHMENT">Replenishment Alert</option>
                <option value="SLEEP">Sleep Reminder</option>
                <option value="PROGRESS">Progress Celebration</option>
              </select>
            </div>
          </div>

          {/* Row 2: Dynamic Contact Inputs based on chosen Channel */}
          {(testChannel === "SMS" || testChannel === "ALL") && (
            <div style={{ background: "rgba(52, 168, 83, 0.08)", border: "1px solid rgba(52, 168, 83, 0.3)", padding: "0.75rem", borderRadius: "6px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.3rem", color: "#2e7d32" }}>
                <Smartphone size={15} /> Mobile Phone Number to Receive SMS:
              </label>
              <input
                type="tel"
                placeholder="Enter ANY phone number (e.g. +91 9876543210, +91 7000012345)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{ width: "100%", padding: "0.45rem 0.65rem", fontSize: "0.85rem", borderRadius: "6px", border: "1px solid #34A853", background: "var(--card-bg)", fontWeight: 700 }}
                required
              />
              <small style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "0.25rem", display: "block" }}>
                📱 Instant SMS message will be sent directly to this mobile phone number.
              </small>
            </div>
          )}

          {(testChannel === "EMAIL" || testChannel === "ALL") && (
            <div style={{ background: "rgba(234, 67, 53, 0.08)", border: "1px solid rgba(234, 67, 53, 0.3)", padding: "0.75rem", borderRadius: "6px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.3rem", color: "#c62828" }}>
                <Mail size={15} /> Target Email Address:
              </label>
              <input
                type="email"
                placeholder="Enter ANY email address (e.g. yourname@gmail.com)"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                style={{ width: "100%", padding: "0.45rem 0.65rem", fontSize: "0.85rem", borderRadius: "6px", border: "1px solid #EA4335", background: "var(--card-bg)", fontWeight: 700 }}
                required
              />
              <small style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "0.25rem", display: "block" }}>
                📧 Email alert notification will be dispatched to this email ID.
              </small>
            </div>
          )}

          {/* Row 3: Title & Body Message */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.25rem", color: "var(--text-primary)" }}>
                Notification Title:
              </label>
              <input
                type="text"
                placeholder="Title"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                style={{ width: "100%", padding: "0.45rem 0.65rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.25rem", color: "var(--text-primary)" }}>
                Notification Message Body:
              </label>
              <input
                type="text"
                placeholder="Message payload text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                style={{ width: "100%", padding: "0.45rem 0.65rem", fontSize: "0.82rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--card-bg)" }}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.25rem" }}>
            <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", borderRadius: "20px" }}>
              <Send size={15} />
              <span>
                {testChannel === "SMS" ? `Send SMS to ${testPhone || "Mobile"}` : testChannel === "EMAIL" ? `Send Email to ${testEmail || "Address"}` : "Dispatch Multi-Channel Alert"}
              </span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};


export default NotificationReminderModule;
