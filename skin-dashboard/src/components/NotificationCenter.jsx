import { useState, useEffect } from "react";
import apiService from "../services/apiService";
import { Bell, RefreshCw, CheckCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
        onClick={() => setOpen(!open)}
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                Notifications
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  onClick={handleTriggerReminders}
                  disabled={loading}
                  title="Sync Routine Notifications"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck size={14} /> Read all
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      !n.is_read
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {n.title}
                      </span>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                        onClick={(e) => handleDelete(n.id, e)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No unread notifications right now.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;
