import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import EmptyState from '../components/common/EmptyState';
import { 
  Bell, 
  Calendar, 
  ShoppingBag, 
  Droplet, 
  Moon, 
  TrendingUp, 
  ShieldAlert, 
  CheckCheck, 
  Check, 
  Trash2, 
  ExternalLink,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  Users,
  Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as notificationService from '../services/notificationService';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const userRole = (localStorage.getItem('role') || 'USER').toUpperCase();

  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Notification Center', path: '/dashboard/notifications' }
  ];

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(page, 20, activeTab, unreadOnly);
      setNotifications(data.notifications || []);
      setTotal(data.total || 0);
      setUnreadCount(data.unread_count || 0);
      setTotalPages(data.pages || 1);
    } catch (e) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, unreadOnly, page]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read.');
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (e) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      toast.success('Notification removed.');
    } catch (e) {
      toast.error('Failed to delete notification.');
    }
  };

  const getCategoryDetails = (type) => {
    switch (type) {
      case 'ROUTINE':
        return { icon: Calendar, color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'REPLENISHMENT':
        return { icon: ShoppingBag, color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'HYDRATION':
        return { icon: Droplet, color: 'cyan', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'SLEEP':
        return { icon: Moon, color: 'indigo', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'PROGRESS':
        return { icon: TrendingUp, color: 'brand', bg: 'bg-brand-700 text-brand-700 border-brand-200' };
      case 'CONSULTANT':
        return { icon: Users, color: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'DOCTOR':
        return { icon: Stethoscope, color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'ADMIN':
        return { icon: ShieldAlert, color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'PLATFORM':
      default:
        return { icon: ShieldAlert, color: 'purple', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const filterTabs = userRole === 'CONSULTANT' ? [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'CONSULTANT', label: 'Client Queue' },
    { id: 'PLATFORM', label: 'Announcements' },
  ] : (userRole === 'DOCTOR' || userRole === 'DERMATOLOGIST') ? [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'DOCTOR', label: 'Clinical Alerts' },
    { id: 'PLATFORM', label: 'Announcements' },
  ] : userRole === 'ADMIN' ? [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'ADMIN', label: 'Platform Telemetry' },
    { id: 'PLATFORM', label: 'Announcements' },
  ] : [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'ROUTINE', label: 'Routines' },
    { id: 'REPLENISHMENT', label: 'Replenishment' },
    { id: 'HYDRATION', label: 'Hydration' },
    { id: 'SLEEP', label: 'Sleep & PM' },
    { id: 'PROGRESS', label: 'Progress' },
    { id: 'PLATFORM', label: 'System' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Header Banner */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-900/40 to-transparent pointer-events-none" />
        <div className="space-y-2 z-10">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-405 bg-brand-900 px-3 py-1 rounded-full">
            Notification Center
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Alerts & Reminders
          </h1>
          <p className="text-sm text-brand-200 leading-normal max-w-md">
            Review routine deadlines, estimated replenishment notices, hydration check-ins, and milestone updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="z-10 btn-accent px-4 py-2.5 rounded-xl text-xs font-display flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Controls and Tabs */}
      <div className="glass-effect border border-brand-100 p-4 rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-650 text-white shadow-sm'
                  : 'bg-slate-50 text-brand-850 hover:bg-brand-50 border border-brand-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Unread Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-850 self-end sm:self-center shrink-0">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
          />
          Show Unread Only
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-brand-850 font-semibold">Loading notification feed...</span>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notif => {
            const { icon: CategoryIcon, bg } = getCategoryDetails(notif.type);
            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  !notif.is_read
                    ? 'bg-white border-brand-200 shadow-sm ring-1 ring-brand-100'
                    : 'bg-white/80 border-slate-200 hover:border-brand-200'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-3 rounded-2xl border shrink-0 ${bg}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm font-bold ${!notif.is_read ? 'text-slate-950' : 'text-slate-800'}`}>
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span className="bg-brand-600 text-white text-[9px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                      <span className={`text-[9px] font-display font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${bg}`}>
                        {notif.type}
                      </span>
                    </div>

                    <p className="text-xs text-brand-900 leading-relaxed font-sans">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-sans pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                  {notif.action_url && (
                    <button
                      onClick={() => navigate(notif.action_url)}
                      className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-850 rounded-xl text-xs font-display font-bold flex items-center gap-1 transition-colors"
                    >
                      Open Action
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!notif.is_read && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      className="p-2 hover:bg-brand-50 border border-brand-200 text-brand-700 rounded-xl transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(notif.id, e)}
                    className="p-2 hover:bg-red-50 border border-red-200 text-red-600 rounded-xl transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No Notifications"
            message="No alerts or reminders found for this filter. All caught up!"
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-brand-200 rounded-xl text-xs font-display font-bold disabled:opacity-40 bg-white"
          >
            Previous
          </button>
          <span className="text-xs font-sans text-brand-800 font-semibold px-2">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-brand-200 rounded-xl text-xs font-display font-bold disabled:opacity-40 bg-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
