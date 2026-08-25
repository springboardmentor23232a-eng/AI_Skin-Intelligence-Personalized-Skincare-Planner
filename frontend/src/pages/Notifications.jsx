import React, { useEffect, useState } from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Droplets,
  Moon,
  Sparkles,
  TrendingUp,
  RefreshCw,
  CalendarCheck,
} from "lucide-react";

import client from "../api/client";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD REAL NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await client.get("/notifications");

      setNotifications(response.data || []);
    } catch (err) {
      console.error("Notifications loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadNotifications();
  }, []);

  // =========================================================
  // MARK ONE AS READ
  // =========================================================

  const markAsRead = async (notificationId) => {
    try {
      await client.post(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to mark notification as read."
      );
    }
  };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (item) => !item.is_read
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      setError("");

      await Promise.all(
        unreadNotifications.map((item) =>
          client.post(
            `/notifications/${item.id}/read`
          )
        )
      );

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to mark all notifications as read."
      );
    }
  };

  // =========================================================
  // ICON
  // =========================================================

  const getIcon = (type) => {
    switch (type) {
      case "appointment_update":
        return (
          <CalendarCheck
            size={22}
            className="text-violet-600"
          />
        );

      case "hydration":
        return (
          <Droplets
            size={22}
            className="text-cyan-600"
          />
        );

      case "sleep":
        return (
          <Moon
            size={22}
            className="text-indigo-600"
          />
        );

      case "routine_reminder":
        return (
          <Sparkles
            size={22}
            className="text-violet-600"
          />
        );

      case "progress_alert":
        return (
          <TrendingUp
            size={22}
            className="text-green-600"
          />
        );

      case "replenishment":
        return (
          <RefreshCw
            size={22}
            className="text-orange-600"
          />
        );

      default:
        return (
          <Bell
            size={22}
            className="text-violet-600"
          />
        );
    }
  };

  // =========================================================
  // TYPE LABEL
  // =========================================================

  const getTypeLabel = (notification) => {
    switch (notification.type) {
      case "appointment_update":
        return "Appointment Update";

      case "routine_reminder":
        return "Routine Reminder";

      case "hydration":
        return "Hydration Reminder";

      case "sleep":
        return "Sleep Reminder";

      case "progress_alert":
        return "Progress Alert";

      case "replenishment":
        return "Product Reminder";

      default:
        return "Notification";
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Notifications
          </h1>

          <p className="text-gray-500 mt-2">
            Stay updated with your appointments,
            skincare progress, and important updates.
          </p>
        </div>

        {/* ONLY REFRESH BUTTON */}
        <button
          type="button"
          onClick={loadNotifications}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
        >
          <RefreshCw
            size={17}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      {!loading && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">

                <Bell
                  size={21}
                  className="text-violet-600"
                />

              </div>

              <div>

                <h2 className="font-semibold text-gray-800">
                  Your Notifications
                </h2>

                <p className="text-sm text-gray-500">

                  {notifications.length === 0
                    ? "You're all caught up."
                    : unreadCount === 0
                    ? "You're all caught up."
                    : `${unreadCount} unread notification${
                        unreadCount > 1
                          ? "s"
                          : ""
                      }`}

                </p>

              </div>

            </div>

            {/* MARK ALL AS READ */}

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800"
              >
                <CheckCheck size={17} />

                Mark all as read
              </button>
            )}

          </div>

        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center text-gray-500">
          Loading notifications...
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {!loading && notifications.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-violet-100 flex items-center justify-center mb-4">

            <Bell
              size={28}
              className="text-violet-600"
            />

          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            No notifications yet
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Your appointment updates and important
            skincare notifications will appear here.
          </p>

        </div>
      )}

      {/* =====================================================
          NOTIFICATION LIST
      ====================================================== */}

      {!loading && notifications.length > 0 && (
        <div className="space-y-4">

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 transition ${
                notification.is_read
                  ? "border-gray-100"
                  : "border-violet-200 bg-violet-50/30"
              }`}
            >

              <div className="flex items-start gap-4">

                {/* ICON */}

                <div className="w-11 h-11 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center">

                  {getIcon(notification.type)}

                </div>

                {/* CONTENT */}

                <div className="flex-1 min-w-0">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    <div className="flex items-center gap-2">

                      <h3 className="font-semibold text-gray-800">
                        {getTypeLabel(notification)}
                      </h3>

                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-violet-600" />
                      )}

                    </div>

                    <span className="text-xs text-gray-400">
                      {formatDate(
                        notification.created_at
                      )}
                    </span>

                  </div>

                  {/* REAL DATABASE MESSAGE */}

                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {notification.message}
                  </p>

                  {/* MARK AS READ */}

                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                      className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-violet-600 hover:text-violet-800"
                    >
                      <Check size={16} />

                      Mark as read
                    </button>
                  )}

                  {notification.is_read && (
                    <p className="text-xs text-gray-400 mt-4">
                      Read
                    </p>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}