import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function NotificationsList() {
  const { fetchWithAuth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(
        `/api/notifications?limit=100&filter=${filter}`
      );
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setNotifications(data.notifications);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      setError('Error fetching notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetchWithAuth(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Dismiss notification
  const dismissNotification = async (notificationId) => {
    try {
      const response = await fetchWithAuth(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
      }
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetchWithAuth('/api/notifications/read-all', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Get notification type color
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'routine_reminder':
        return 'emerald';
      case 'product_replenishment':
        return 'amber';
      case 'hydration':
        return 'cyan';
      case 'sleep':
        return 'violet';
      case 'progress_alert':
        return 'teal';
      case 'platform':
        return 'slate';
      default:
        return 'slate';
    }
  };

  // Format time
  const formatTime = (isoTime) => {
    const date = new Date(isoTime);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'unread'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
            }`}
          >
            Unread
          </button>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <Button size="sm" variant="ghost" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {loading && (
        <GlassCard className="text-center py-8">
          <p className="text-slate-400">Loading notifications...</p>
        </GlassCard>
      )}

      {error && !loading && (
        <GlassCard className="bg-rose-500/10 border-rose-500/20">
          <p className="text-rose-400 text-sm">{error}</p>
        </GlassCard>
      )}

      {!loading && notifications.length === 0 && (
        <GlassCard className="text-center py-12">
          <Bell className="w-8 h-8 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </GlassCard>
      )}

      {!loading &&
        notifications.map((notification) => (
          <GlassCard
            key={notification.id}
            className={`cursor-pointer transition-all ${
              !notification.is_read && 'border-emerald-500/30'
            }`}
            onClick={() => {
              if (!notification.is_read) {
                markAsRead(notification.id);
              }
              if (notification.action_url) {
                window.location.href = notification.action_url;
              }
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                  <Badge variant={getNotificationTypeColor(notification.type)}>
                    {notification.type.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <h4 className="text-sm font-semibold text-white mb-1">
                  {notification.title}
                </h4>

                <p className="text-sm text-slate-400 mb-2">
                  {notification.message}
                </p>

                <p className="text-xs text-slate-500">
                  {formatTime(notification.created_at)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(notification.id);
                }}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </GlassCard>
        ))}
    </div>
  );
}
