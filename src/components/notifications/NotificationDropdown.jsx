import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';

export function NotificationDropdown() {
  const { fetchWithAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth('/api/notifications?limit=10&filter=all');
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setNotifications(data.notifications);
        const unread = data.notifications.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
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

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetchWithAuth(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetchWithAuth('/api/notifications/read-all', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
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

  // Get notification type badge color
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2.5 rounded-xl transition-all duration-200',
          'hover:bg-slate-800/60 text-slate-300 hover:text-white',
          isOpen && 'bg-slate-800/80 text-emerald-400'
        )}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 z-50">
          <GlassCard className="p-0 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-700/50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  <p className="text-xs text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center text-sm text-slate-400">
                  Loading notifications...
                </div>
              )}

              {error && !loading && (
                <div className="p-4 flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border-t border-slate-700/50">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">No notifications yet</p>
                </div>
              )}

              {!loading &&
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                      if (notification.action_url) {
                        window.location.href = notification.action_url;
                      }
                    }}
                    className={cn(
                      'w-full p-3 text-left border-b border-slate-700/50 transition-colors duration-150',
                      'hover:bg-slate-800/60',
                      !notification.is_read && 'bg-slate-800/30'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {/* Read indicator */}
                      <div className="mt-1.5">
                        {notification.is_read ? (
                          <Check className="w-4 h-4 text-slate-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant={getNotificationTypeColor(notification.type)}>
                            {notification.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            {/* Footer */}
            {!loading && notifications.length > 0 && (
              <div className="border-t border-slate-700/50 p-3 text-center">
                <a
                  href="/notifications"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View all notifications →
                </a>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
