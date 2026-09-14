import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Calendar, 
  ShoppingBag, 
  Droplet, 
  Moon, 
  TrendingUp, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Clock,
  Users,
  Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as notificationService from '../../services/notificationService';

export default function HeaderNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnread = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (e) {
      // Quiet background failure
    }
  };

  const fetchDropdownNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(1, 6, 'ALL', false);
      setRecentNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30s background poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownNotifications();
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setRecentNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    } catch (e) {
      toast.error('Failed to mark notifications as read.');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationService.markAsRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setRecentNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (e) {
        // Continue navigation regardless
      }
    }
    setIsOpen(false);
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'ROUTINE':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'REPLENISHMENT':
        return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'HYDRATION':
        return <Droplet className="w-4 h-4 text-cyan-600" />;
      case 'SLEEP':
        return <Moon className="w-4 h-4 text-indigo-600" />;
      case 'PROGRESS':
        return <TrendingUp className="w-4 h-4 text-brand-600" />;
      case 'CONSULTANT':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'DOCTOR':
        return <Stethoscope className="w-4 h-4 text-rose-600" />;
      case 'ADMIN':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'PLATFORM':
      default:
        return <ShieldAlert className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-brand-850 hover:bg-brand-100/60 rounded-xl transition-colors flex items-center justify-center focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-brand-800" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-brand-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in font-sans">
          
          {/* Header */}
          <div className="p-3.5 px-4 bg-brand-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-brand-800 text-brand-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-brand-300 hover:text-white flex items-center gap-1 transition-colors font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-brand-100/60">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-brand-700">Loading alerts...</span>
              </div>
            ) : recentNotifications.length > 0 ? (
              recentNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-brand-50/70 transition-colors cursor-pointer flex gap-3 items-start ${
                    !notif.is_read ? 'bg-brand-50/30' : 'bg-white'
                  }`}
                >
                  <div className="p-2 bg-slate-50 border border-brand-100 rounded-xl shrink-0 mt-0.5">
                    {getCategoryIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-semibold truncate ${!notif.is_read ? 'text-slate-950 font-bold' : 'text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-brand-850 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9.5px] text-slate-400 block pt-0.5">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center space-y-1">
                <Bell className="w-7 h-7 text-brand-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-800">All caught up!</p>
                <p className="text-[10.5px] text-brand-700">No active alerts or reminders right now.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-brand-100 text-center">
            <Link
              to="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-display font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 transition-colors"
            >
              Open Notification Center
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
