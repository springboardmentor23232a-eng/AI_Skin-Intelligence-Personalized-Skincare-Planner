import { useState, useEffect } from "react";
import apiService from "../services/apiService";

function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  const handleTriggerReminders = async () => {
    setLoading(true);
    try {
      await apiService.triggerReminders();
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to trigger reminders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await apiService.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn btn-outline-secondary position-relative p-2 rounded-circle"
        onClick={() => setOpen(!open)}
        style={{ width: "36px", height: "36px", border: "1px solid var(--border-strong)" }}
        title="Notifications"
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.65rem" }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-2 p-3 shadow-lg rounded"
          style={{
            width: "360px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            zIndex: 1050
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
              Notifications
            </h6>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-link p-0 text-muted small" onClick={handleTriggerReminders} disabled={loading}>
                {loading ? "..." : "🔄 Sync"}
              </button>
              <button className="btn btn-sm btn-link p-0 text-primary small ms-2" onClick={handleMarkAllRead}>
                Read all
              </button>
            </div>
          </div>

          <div className="list-group list-group-flush" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`list-group-item bg-transparent px-0 py-2 border-bottom ${!n.is_read ? "fw-bold" : ""}`}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="small" style={{ color: "var(--text-primary)" }}>{n.title}</span>
                    <button className="btn btn-sm text-danger p-0 ms-2" style={{ fontSize: "0.75rem" }} onClick={(e) => handleDelete(n.id, e)}>
                      ✕
                    </button>
                  </div>
                  <p className="mb-0 text-secondary small">{n.message}</p>
                  <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted small">No notifications currently logged.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
