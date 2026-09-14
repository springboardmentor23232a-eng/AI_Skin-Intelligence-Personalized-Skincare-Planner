import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Calendar, 
  ShoppingBag, 
  Droplet, 
  Moon, 
  TrendingUp, 
  ShieldAlert, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Mail,
  Users,
  Stethoscope,
  Info,
  ShieldCheck,
  Activity,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as notificationService from '../services/notificationService';

export default function Settings() {
  const { user } = useAuth();
  const rawRole = (user?.role || localStorage.getItem('role') || 'USER').toUpperCase();
  const initialRole = (rawRole === 'DOCTOR' || rawRole === 'DERMATOLOGIST') ? 'DERMATOLOGIST' : rawRole;

  const [userRole, setUserRole] = useState(initialRole);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userEmail = user?.email || localStorage.getItem('email') || '';

  const [preferences, setPreferences] = useState({
    // USER In-App
    routine_reminders_enabled: true,
    morning_reminder_time: '08:00',
    evening_reminder_time: '20:00',
    replenishment_reminders_enabled: true,
    hydration_reminders_enabled: true,
    hydration_interval_hours: 4,
    sleep_reminders_enabled: true,
    sleep_reminder_time: '22:00',
    progress_alerts_enabled: true,

    // CONSULTANT In-App
    consultant_client_updates_enabled: true,
    consultant_progress_enabled: true,
    consultant_assessment_enabled: true,
    consultant_routine_enabled: true,

    // DOCTOR / DERMATOLOGIST In-App
    doctor_patient_alerts_enabled: true,
    doctor_assessment_enabled: true,
    doctor_progress_enabled: true,
    doctor_treatment_enabled: true,

    // ADMIN In-App
    admin_system_alerts_enabled: true,
    admin_user_alerts_enabled: true,
    admin_analytics_alerts_enabled: true,
    admin_recommendation_alerts_enabled: true,
    admin_reports_alerts_enabled: true,

    // Platform & Quiet Hours (All Roles)
    platform_announcements_enabled: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:30',
    quiet_hours_end: '07:00',
    
    // Email Preferences (Explicit Opt-In - Default OFF for privacy)
    email_notifications_enabled: false,
    email_routine_enabled: true,
    email_replenishment_enabled: true,
    email_hydration_enabled: true,
    email_sleep_enabled: true,
    email_progress_enabled: true,
    email_platform_enabled: true,
    email_consultant_enabled: true,
    email_doctor_enabled: true,
    email_admin_enabled: true,
    registered_email: userEmail
  });

  // Trackers state (for USER role only)
  const [trackers, setTrackers] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newOpenedOn, setNewOpenedOn] = useState(new Date().toISOString().split('T')[0]);
  const [newCycleDays, setNewCycleDays] = useState(45);
  const [addingTracker, setAddingTracker] = useState(false);

  const crumbs = [
    { label: 'Portal', path: '/' },
    { label: 'Settings & Preferences', path: '/dashboard/settings' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const prefData = await notificationService.getPreferences();
      const detectedRole = (prefData.user_role || rawRole).toUpperCase();
      const normalizedDetected = (detectedRole === 'DOCTOR' || detectedRole === 'DERMATOLOGIST') ? 'DERMATOLOGIST' : detectedRole;
      setUserRole(normalizedDetected);

      let trackerData = [];
      if (normalizedDetected === 'USER') {
        try {
          trackerData = await notificationService.getProductTrackers();
        } catch (err) {
          trackerData = [];
        }
      }

      setPreferences(prev => ({
        ...prev,
        ...prefData,
        registered_email: prefData.registered_email || userEmail
      }));
      setTrackers(trackerData || []);
    } catch (e) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build strictly role-specific payload to respect backend schema validation
      let payload = {
        email_notifications_enabled: preferences.email_notifications_enabled,
        email_platform_enabled: preferences.email_platform_enabled,
        platform_announcements_enabled: preferences.platform_announcements_enabled,
        quiet_hours_enabled: preferences.quiet_hours_enabled,
        quiet_hours_start: preferences.quiet_hours_start,
        quiet_hours_end: preferences.quiet_hours_end,
      };

      if (userRole === 'USER') {
        payload = {
          ...payload,
          routine_reminders_enabled: preferences.routine_reminders_enabled,
          morning_reminder_time: preferences.morning_reminder_time,
          evening_reminder_time: preferences.evening_reminder_time,
          replenishment_reminders_enabled: preferences.replenishment_reminders_enabled,
          hydration_reminders_enabled: preferences.hydration_reminders_enabled,
          hydration_interval_hours: preferences.hydration_interval_hours,
          sleep_reminders_enabled: preferences.sleep_reminders_enabled,
          sleep_reminder_time: preferences.sleep_reminder_time,
          progress_alerts_enabled: preferences.progress_alerts_enabled,
          email_routine_enabled: preferences.email_routine_enabled,
          email_replenishment_enabled: preferences.email_replenishment_enabled,
          email_hydration_enabled: preferences.email_hydration_enabled,
          email_sleep_enabled: preferences.email_sleep_enabled,
          email_progress_enabled: preferences.email_progress_enabled,
        };
      } else if (userRole === 'CONSULTANT') {
        payload = {
          ...payload,
          consultant_client_updates_enabled: preferences.consultant_client_updates_enabled,
          consultant_progress_enabled: preferences.consultant_progress_enabled,
          consultant_assessment_enabled: preferences.consultant_assessment_enabled,
          consultant_routine_enabled: preferences.consultant_routine_enabled,
          email_consultant_enabled: preferences.email_consultant_enabled,
        };
      } else if (userRole === 'DOCTOR' || userRole === 'DERMATOLOGIST') {
        payload = {
          ...payload,
          doctor_patient_alerts_enabled: preferences.doctor_patient_alerts_enabled,
          doctor_assessment_enabled: preferences.doctor_assessment_enabled,
          doctor_progress_enabled: preferences.doctor_progress_enabled,
          doctor_treatment_enabled: preferences.doctor_treatment_enabled,
          email_doctor_enabled: preferences.email_doctor_enabled,
        };
      } else if (userRole === 'ADMIN') {
        payload = {
          ...payload,
          admin_system_alerts_enabled: preferences.admin_system_alerts_enabled,
          admin_user_alerts_enabled: preferences.admin_user_alerts_enabled,
          admin_analytics_alerts_enabled: preferences.admin_analytics_alerts_enabled,
          admin_recommendation_alerts_enabled: preferences.admin_recommendation_alerts_enabled,
          admin_reports_alerts_enabled: preferences.admin_reports_alerts_enabled,
          email_admin_enabled: preferences.email_admin_enabled,
        };
      }

      const updated = await notificationService.updatePreferences(payload);
      setPreferences(prev => ({
        ...prev,
        ...updated,
        registered_email: updated.registered_email || prev.registered_email || userEmail
      }));
      toast.success('Notification & Email preferences saved successfully! ⚙️');
    } catch (e) {
      toast.error('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTracker = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      toast.error('Please enter a product name.');
      return;
    }
    setAddingTracker(true);
    try {
      await notificationService.createProductTracker({
        product_name: newProductName.trim(),
        opened_on: newOpenedOn,
        cycle_days: parseInt(newCycleDays, 10)
      });
      toast.success(`Tracking started for ${newProductName}! 🛍️`);
      setNewProductName('');
      const updated = await notificationService.getProductTrackers();
      setTrackers(updated || []);
    } catch (e) {
      toast.error('Failed to add product tracker.');
    } finally {
      setAddingTracker(false);
    }
  };

  const handleDeleteTracker = async (id, name) => {
    try {
      await notificationService.deleteProductTracker(id);
      setTrackers(prev => prev.filter(t => t.id !== id));
      toast.success(`Removed tracking for ${name}.`);
    } catch (e) {
      toast.error('Failed to remove tracker.');
    }
  };

  const isEmailActive = preferences.email_notifications_enabled;

  // Role Metadata for Banner
  const roleMeta = {
    USER: {
      badge: 'User Account',
      title: 'Notification & Email Preferences',
      subtitle: 'Personal skincare routine reminders, hydration check-ins, sleep wind-down prompts, progress alerts, and product replenishment trackers.'
    },
    CONSULTANT: {
      badge: 'Consultant Account',
      title: 'Consultant Notification & Email Preferences',
      subtitle: 'Client queue alerts, unreviewed assessment notifications, client progress updates, and platform announcements.'
    },
    DERMATOLOGIST: {
      badge: 'Dermatologist Account',
      title: 'Dermatologist Notification & Email Preferences',
      subtitle: 'Patient clinical alerts, high-risk case notifications, diagnostic assessment updates, and treatment alerts.'
    },
    DOCTOR: {
      badge: 'Doctor Account',
      title: 'Dermatologist Notification & Email Preferences',
      subtitle: 'Patient clinical alerts, high-risk case notifications, diagnostic assessment updates, and treatment alerts.'
    },
    ADMIN: {
      badge: 'Admin Account',
      title: 'Admin Notification & Email Preferences',
      subtitle: 'User management alerts, platform analytics, recommendation monitoring, system reports, and platform telemetry.'
    }
  }[userRole] || {
    badge: `${userRole} Account`,
    title: `${userRole} Notification & Email Preferences`,
    subtitle: 'Manage your notification and email settings.'
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Header Banner */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-900/40 to-transparent pointer-events-none" />
        <div className="space-y-2 z-10">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-brand-405 bg-brand-900 px-3 py-1 rounded-full">
            {roleMeta.badge}
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {roleMeta.title}
          </h1>
          <p className="text-sm text-brand-200 leading-normal max-w-md">
            {roleMeta.subtitle}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading preferences...</span>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${userRole === 'USER' ? 'lg:grid-cols-3' : ''} gap-6`}>
          
          {/* Main Preferences Form */}
          <form onSubmit={handleSavePreferences} className={`${userRole === 'USER' ? 'lg:col-span-2' : 'max-w-3xl'} space-y-6`}>
            
            {/* 1. EMAIL NOTIFICATIONS & USER CONSENT SECTION */}
            <div className="glass-effect border border-brand-200/80 p-6 rounded-3xl bg-white shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-700">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-950">Email Notifications & Consent</h3>
                  <p className="text-[11px] text-brand-800">Receive eligible {userRole.toLowerCase()} notifications at your registered email address</p>
                </div>
              </div>

              {/* Registered Email Info Box */}
              <div className="p-3.5 bg-slate-50 border border-brand-100/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-brand-700 shrink-0" />
                  <span className="text-slate-700">Registered Account Email:</span>
                </div>
                <span className="font-mono font-bold text-brand-950 bg-white px-2.5 py-1 rounded-lg border border-brand-200/60 truncate">
                  {preferences.registered_email || userEmail || 'user@example.com'}
                </span>
              </div>

              {/* Master Email Toggle */}
              <label className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl cursor-pointer transition-colors hover:bg-indigo-50/80">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                    Enable Email Delivery Channel
                  </span>
                  <span className="text-[11px] text-indigo-900/80">
                    Deliver eligible notifications to your registered email in addition to in-app alerts
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.email_notifications_enabled}
                  onChange={(e) => setPreferences({ ...preferences, email_notifications_enabled: e.target.checked })}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </label>

              {/* Category-Level Email Controls */}
              <div className={`space-y-3 pt-2 ${!isEmailActive ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-[10px] uppercase tracking-wider text-brand-700">
                    {userRole} Email Subscriptions
                  </span>
                  {!isEmailActive && (
                    <span className="text-[10px] text-slate-500 italic">
                      (Enable email delivery above to customize)
                    </span>
                  )}
                </div>

                {/* USER Email Options */}
                {userRole === 'USER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Routine Reminders</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_routine_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_routine_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Product Replenishment</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_replenishment_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_replenishment_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Hydration Check-ins</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_hydration_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_hydration_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Sleep & PM Skincare</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_sleep_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_sleep_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Skin Score Progress</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_progress_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_progress_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Platform Updates</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_platform_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_platform_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>
                  </div>
                )}

                {/* CONSULTANT Email Options */}
                {userRole === 'CONSULTANT' && (
                  <div className="space-y-2.5 text-xs font-sans">
                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Client Queue & Unreviewed Assessments</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_consultant_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_consultant_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Platform Announcements</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_platform_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_platform_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>
                  </div>
                )}

                {/* DOCTOR / DERMATOLOGIST Email Options */}
                {(userRole === 'DOCTOR' || userRole === 'DERMATOLOGIST') && (
                  <div className="space-y-2.5 text-xs font-sans">
                    <label className="flex items-center justify-between p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Patient Clinical & Critical Alerts</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_doctor_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_doctor_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Platform Announcements</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_platform_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_platform_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                      />
                    </label>
                  </div>
                )}

                {/* ADMIN Email Options */}
                {userRole === 'ADMIN' && (
                  <div className="space-y-2.5 text-xs font-sans">
                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Platform Telemetry & System Digests</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_admin_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_admin_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100/60 rounded-xl cursor-pointer">
                      <span className="font-semibold text-slate-800">Platform Announcements</span>
                      <input
                        type="checkbox"
                        checked={preferences.email_platform_enabled}
                        onChange={(e) => setPreferences({ ...preferences, email_platform_enabled: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* 2. IN-APP NOTIFICATION SETTINGS (ROLE SPECIFIC) */}
            
            {/* USER IN-APP SETTINGS */}
            {userRole === 'USER' && (
              <>
                {/* Routine & Timing */}
                <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-950">In-App Routine Reminders</h3>
                      <p className="text-[11px] text-brand-800">AM & PM routine consistency notifications</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <label className="flex items-center justify-between p-3 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                      <div>
                        <span className="font-bold text-slate-900 block">Enable Daily Routine Reminders</span>
                        <span className="text-[10.5px] text-brand-800">Alert me when AM or PM skincare checklist steps are pending</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.routine_reminders_enabled}
                        onChange={(e) => setPreferences({ ...preferences, routine_reminders_enabled: e.target.checked })}
                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                      />
                    </label>

                    {preferences.routine_reminders_enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="p-3 bg-slate-50 border border-brand-100/60 rounded-2xl space-y-1.5">
                          <label className="font-display font-bold text-[10px] uppercase text-brand-700 block">
                            Morning Reminder Time
                          </label>
                          <input
                            type="time"
                            value={preferences.morning_reminder_time}
                            onChange={(e) => setPreferences({ ...preferences, morning_reminder_time: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <div className="p-3 bg-slate-50 border border-brand-100/60 rounded-2xl space-y-1.5">
                          <label className="font-display font-bold text-[10px] uppercase text-brand-700 block">
                            Evening Reminder Time
                          </label>
                          <input
                            type="time"
                            value={preferences.evening_reminder_time}
                            onChange={(e) => setPreferences({ ...preferences, evening_reminder_time: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hydration & Sleep */}
                <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                    <div className="p-2 bg-cyan-50 rounded-xl text-cyan-700">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-950">Hydration & Rest Prompts</h3>
                      <p className="text-[11px] text-brand-800">Support your skin barrier with water check-ins & nocturnal wind-down</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    {/* Hydration */}
                    <div className="p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">Daily Hydration Check-in Prompts</span>
                          <span className="text-[10.5px] text-brand-800">Remind me to drink water regularly during daytime</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.hydration_reminders_enabled}
                          onChange={(e) => setPreferences({ ...preferences, hydration_reminders_enabled: e.target.checked })}
                          className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                        />
                      </div>

                      {preferences.hydration_reminders_enabled && (
                        <div className="pt-2 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-700">Check-in frequency:</span>
                          <select
                            value={preferences.hydration_interval_hours}
                            onChange={(e) => setPreferences({ ...preferences, hydration_interval_hours: parseInt(e.target.value, 10) })}
                            className="px-3 py-1.5 bg-white border border-brand-200 rounded-xl text-xs font-sans text-brand-950 font-bold cursor-pointer"
                          >
                            <option value={2}>Every 2 Hours</option>
                            <option value={4}>Every 4 Hours (Standard)</option>
                            <option value={6}>Every 6 Hours</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Sleep */}
                    <div className="p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">Night Wind-Down & Rest Reminder</span>
                          <span className="text-[10.5px] text-brand-800">Alert to finish PM routine before nightly cellular repair</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.sleep_reminders_enabled}
                          onChange={(e) => setPreferences({ ...preferences, sleep_reminders_enabled: e.target.checked })}
                          className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                        />
                      </div>

                      {preferences.sleep_reminders_enabled && (
                        <div className="pt-2 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-700">Wind-down alert time:</span>
                          <input
                            type="time"
                            value={preferences.sleep_reminder_time}
                            onChange={(e) => setPreferences({ ...preferences, sleep_reminder_time: e.target.value })}
                            className="px-3 py-1.5 bg-white border border-brand-200 rounded-xl text-xs font-sans text-brand-950"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Alerts */}
                <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                    <div className="p-2 bg-brand-50 rounded-xl text-brand-700">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-950">Skin Score & Progress Alerts</h3>
                      <p className="text-[11px] text-brand-800">Score milestones and streak updates</p>
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-3 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer text-xs font-sans">
                    <div>
                      <span className="font-bold text-slate-900 block">Skin Health Score & Milestone Alerts</span>
                      <span className="text-[10.5px] text-brand-800">Notify when score increases, decreases, or streaks are reached</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.progress_alerts_enabled}
                      onChange={(e) => setPreferences({ ...preferences, progress_alerts_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>
                </div>
              </>
            )}

            {/* CONSULTANT IN-APP SETTINGS */}
            {userRole === 'CONSULTANT' && (
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                  <div className="p-2 bg-accent-100 rounded-xl text-accent-800">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-950">Consultant Client Notifications</h3>
                    <p className="text-[11px] text-brand-800">In-app notifications for client queue, assessment reviews, and routine updates</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Client Assignment & Queue Alerts</span>
                      <span className="text-[10.5px] text-brand-800">Notify when new clients are assigned or enter your consultation queue</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.consultant_client_updates_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, consultant_client_updates_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Client Assessment & Report Updates</span>
                      <span className="text-[10.5px] text-brand-800">Notify when client submits or updates a skin assessment scan</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.consultant_assessment_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, consultant_assessment_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Client Progress & Adherence Updates</span>
                      <span className="text-[10.5px] text-brand-800">Alert on client routine adherence milestones or score drops</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.consultant_progress_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, consultant_progress_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Recommendation & Client Routine Updates</span>
                      <span className="text-[10.5px] text-brand-800">Notify when product recommendations or routines are generated for clients</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.consultant_routine_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, consultant_routine_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* DOCTOR / DERMATOLOGIST IN-APP SETTINGS */}
            {(userRole === 'DOCTOR' || userRole === 'DERMATOLOGIST') && (
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-700">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-950">Clinical & Patient Alerts</h3>
                    <p className="text-[11px] text-brand-800">In-app notifications for patient assignments, critical conditions, and diagnostic reports</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <label className="flex items-center justify-between p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Patient Assignment & Clinical Updates</span>
                      <span className="text-[10.5px] text-indigo-950/80">Notify when a patient is assigned to your clinical roster</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.doctor_patient_alerts_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, doctor_patient_alerts_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">High-Risk Case & Critical Assessment Alerts</span>
                      <span className="text-[10.5px] text-indigo-950/80">Immediate priority alerts for severe skin conditions (high severity or allergic flags)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.doctor_assessment_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, doctor_assessment_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Patient Progress & Report Updates</span>
                      <span className="text-[10.5px] text-indigo-950/80">Notify when patient progress reports or longitudinal assessments are generated</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.doctor_progress_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, doctor_progress_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Treatment Recommendation Updates</span>
                      <span className="text-[10.5px] text-indigo-950/80">Notify on treatment modifications, clinical routines, and ingredient contraindications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.doctor_treatment_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, doctor_treatment_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* ADMIN IN-APP SETTINGS */}
            {userRole === 'ADMIN' && (
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                  <div className="p-2 bg-brand-50 rounded-xl text-brand-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-950">Administrative Platform Notifications</h3>
                    <p className="text-[11px] text-brand-800">In-app notifications for user management, platform analytics, recommendation monitoring, and reports</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">User Management & Role Clearance Alerts</span>
                      <span className="text-[10.5px] text-brand-800">Notify on new user registrations, role changes, and account security flags</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.admin_user_alerts_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, admin_user_alerts_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Platform Analytics & Growth Digests</span>
                      <span className="text-[10.5px] text-brand-800">Daily and weekly platform activity, DAU metrics, and module adoption rates</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.admin_analytics_alerts_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, admin_analytics_alerts_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Recommendation Engine Monitoring Alerts</span>
                      <span className="text-[10.5px] text-brand-800">Notify on vector search latency spikes or recommendation engine anomalies</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.admin_recommendation_alerts_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, admin_recommendation_alerts_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">System Reports & Audit Log Alerts</span>
                      <span className="text-[10.5px] text-brand-800">Alert on gateway errors, export activity spikes, and security audit events</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.admin_reports_alerts_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, admin_reports_alerts_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-900 block">Platform Telemetry & System Status</span>
                      <span className="text-[10.5px] text-brand-800">In-app notices for server latencies, database status, and uptime</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.admin_system_alerts_enabled !== false}
                      onChange={(e) => setPreferences({ ...preferences, admin_system_alerts_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Platform Announcements & Quiet Hours (All Roles) */}
            <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-950">Platform Updates & Quiet Hours</h3>
                  <p className="text-[11px] text-brand-800">System maintenance notices and do-not-disturb periods</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <label className="flex items-center justify-between p-3 bg-brand-50/40 border border-brand-100/60 rounded-2xl cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Platform Announcements</span>
                    <span className="text-[10.5px] text-brand-800">System updates, maintenance, and administrative announcements</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.platform_announcements_enabled}
                    onChange={(e) => setPreferences({ ...preferences, platform_announcements_enabled: e.target.checked })}
                    className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                  />
                </label>

                {/* Quiet Hours */}
                <div className="p-3.5 bg-brand-50/40 border border-brand-100/60 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Quiet Hours (Do Not Disturb)</span>
                      <span className="text-[10.5px] text-brand-800">Mute non-critical prompts during resting hours</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.quiet_hours_enabled}
                      onChange={(e) => setPreferences({ ...preferences, quiet_hours_enabled: e.target.checked })}
                      className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                    />
                  </div>

                  {preferences.quiet_hours_enabled && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-700 block mb-1">Start Time</span>
                        <input
                          type="time"
                          value={preferences.quiet_hours_start}
                          onChange={(e) => setPreferences({ ...preferences, quiet_hours_start: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-brand-200 rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-700 block mb-1">End Time</span>
                        <input
                          type="time"
                          value={preferences.quiet_hours_end}
                          onChange={(e) => setPreferences({ ...preferences, quiet_hours_end: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-brand-200 rounded-xl text-xs font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full btn-accent py-3 rounded-2xl text-xs font-display font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Preferences...' : 'Save All Preferences'}
            </button>
          </form>

          {/* Right Column: Product Replenishment Tracker Manager (USER role ONLY) */}
          {userRole === 'USER' && (
            <div className="space-y-6">
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl bg-white shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-950">Product Tracker</h3>
                    <p className="text-[10.5px] text-brand-800">Log product start date for [ESTIMATED] replenishment alerts</p>
                  </div>
                </div>

                {/* Add Tracker Form */}
                <form onSubmit={handleAddTracker} className="space-y-3 text-xs">
                  <div>
                    <label className="font-display font-bold text-[9.5px] uppercase text-brand-750 block mb-1">
                      Skincare Product Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ceramide Moisturizing Cream"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="w-full px-3 py-2 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-display font-bold text-[9.5px] uppercase text-brand-750 block mb-1">
                        Date Opened
                      </label>
                      <input
                        type="date"
                        value={newOpenedOn}
                        onChange={(e) => setNewOpenedOn(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-display font-bold text-[9.5px] uppercase text-brand-750 block mb-1">
                        Expected Duration
                      </label>
                      <select
                        value={newCycleDays}
                        onChange={(e) => setNewCycleDays(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-brand-200 rounded-xl text-xs font-sans text-brand-950 bg-white font-bold"
                      >
                        <option value={30}>30 Days (~1 mo)</option>
                        <option value={45}>45 Days (~1.5 mo)</option>
                        <option value={60}>60 Days (~2 mo)</option>
                        <option value={90}>90 Days (~3 mo)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addingTracker}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {addingTracker ? 'Adding...' : 'Track Product Depletion'}
                  </button>
                </form>

                {/* Active Trackers List */}
                <div className="space-y-2.5 pt-2 border-t border-brand-100/60">
                  <span className="font-display font-bold text-[9px] uppercase tracking-wider text-brand-650 block">
                    Active Tracked Products ({trackers.length})
                  </span>

                  {trackers.length > 0 ? (
                    trackers.map(t => (
                      <div
                        key={t.id}
                        className="p-3 bg-slate-50 border border-brand-100 rounded-2xl flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-bold text-slate-950 truncate">{t.product_name}</div>
                          <div className="text-[10px] text-brand-800 flex items-center gap-1">
                            <span>Opened: {t.opened_on}</span>
                            <span>•</span>
                            <span className={t.is_depletion_imminent ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                              {t.days_elapsed}/{t.cycle_days} days
                            </span>
                          </div>
                          {t.is_depletion_imminent && (
                            <span className="inline-block bg-amber-100 text-amber-800 text-[8.5px] font-bold px-1.5 py-0.2 rounded font-mono">
                              [ESTIMATED] Depletion Imminent
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteTracker(t.id, t.product_name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete tracker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 text-center py-4">
                      No products tracked yet. Add your current cleanser or moisturizer above to receive replenishment alerts.
                    </p>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
