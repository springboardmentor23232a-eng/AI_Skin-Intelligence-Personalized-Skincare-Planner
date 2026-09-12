import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Save, Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

export function ReminderSchedulePanel() {
  const { fetchWithAuth } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(`${API_BASE_URL}/reminders/schedule`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to load schedules');
      }

      // Ensure schedules is an array
      const schedulesArray = Array.isArray(data) ? data : data.schedules || [];
      setSchedules(schedulesArray);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load reminder schedules');
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = (id, field, value) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, [field]: value } : schedule
      )
    );
    setSuccess(null);
    setError(null);
  };

  const saveSchedules = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        schedules: schedules.map((s) => ({
          id: s.id,
          notification_type: s.notification_type,
          scheduled_time: s.scheduled_time,
          frequency: s.frequency,
          is_active: s.is_active,
        })),
      };

      const response = await fetchWithAuth(`${API_BASE_URL}/reminders/schedule`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to save schedules');
      }

      setSuccess('Reminder schedules saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving schedules:', err);
      setError('Failed to save reminder schedules');
    } finally {
      setSaving(false);
    }
  };

  const sendTestReminder = async (notificationType) => {
    try {
      setError(null);
      const response = await fetchWithAuth(`${API_BASE_URL}/reminders/test`, {
        method: 'POST',
        body: JSON.stringify({ notification_type: notificationType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to send test reminder');
      }

      setSuccess(`Test reminder sent for ${notificationType}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error sending test reminder:', err);
      setError('Failed to send test reminder');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Info */}
      <GlassCard>
        <div className="flex items-start gap-2 text-sm text-slate-300">
          <Clock className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Reminder Configuration</p>
            <p className="text-xs text-slate-400">
              Configure when you want to receive reminders for different activities. 
              Reminders are currently in-app only.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Schedules */}
      {schedules.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-slate-400 text-center py-8">
            No reminder schedules available
          </p>
        </GlassCard>
      ) : (
        schedules.map((schedule) => (
          <GlassCard key={schedule.id} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white capitalize">
                  {schedule.notification_type?.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {schedule.is_active ? '✓ Active' : '○ Inactive'}
                </p>
              </div>
              <Badge
                variant={schedule.is_active ? 'emerald' : 'slate'}
                className="text-xs"
              >
                {schedule.is_active ? 'On' : 'Off'}
              </Badge>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800/50">
              {/* Active Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule.is_active}
                  onChange={(e) =>
                    updateSchedule(schedule.id, 'is_active', e.target.checked)
                  }
                  className="w-4 h-4 rounded accent-emerald-400"
                />
                <span className="text-sm text-slate-300">Enable this reminder</span>
              </label>

              {schedule.is_active && (
                <>
                  {/* Scheduled Time */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={schedule.scheduled_time || '09:00'}
                      onChange={(e) =>
                        updateSchedule(schedule.id, 'scheduled_time', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
                      Frequency
                    </label>
                    <select
                      value={schedule.frequency || 'daily'}
                      onChange={(e) =>
                        updateSchedule(schedule.id, 'frequency', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {/* Test Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => sendTestReminder(schedule.notification_type)}
                    className="w-full"
                  >
                    Send Test Reminder
                  </Button>
                </>
              )}
            </div>
          </GlassCard>
        ))
      )}

      {/* Save Button */}
      {schedules.length > 0 && (
        <Button
          onClick={saveSchedules}
          disabled={saving}
          className="w-full"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Schedule Changes'}
        </Button>
      )}

      {/* Note */}
      <GlassCard className="bg-slate-900/30 border-slate-800/50">
        <p className="text-xs text-slate-400 space-y-2">
          <span className="block">
            <strong>Note:</strong> These settings configure when reminders are scheduled.
          </span>
          <span className="block">
            Automatic reminder generation is handled by the backend reminder engine.
          </span>
          <span className="block text-slate-500">
            The actual delivery of reminders depends on your notification preferences.
          </span>
        </p>
      </GlassCard>
    </div>
  );
}
