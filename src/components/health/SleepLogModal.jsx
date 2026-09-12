import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

// Backend accepts only these exact values (case-sensitive)
const SLEEP_QUALITY_OPTIONS = [
  { value: 'Good', label: 'Good' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Poor', label: 'Poor' },
];

/**
 * Format FastAPI validation errors into readable text.
 */
function formatApiError(detail) {
  if (!detail) return 'An unexpected error occurred';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : 'field';
        const msg = err.msg || 'Invalid value';
        return `${field}: ${msg}`;
      })
      .join('\n');
  }
  return JSON.stringify(detail);
}

export function SleepLogModal({ isOpen, onClose, onSuccess, existingLog = null }) {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    sleep_hours: 8,
    sleep_quality: 'Good',
    bedtime: '',
    wake_time: '',
    notes: '',
  });

  useEffect(() => {
    if (existingLog) {
      setFormData({
        log_date: existingLog.log_date,
        sleep_hours: existingLog.sleep_hours,
        sleep_quality: existingLog.sleep_quality || 'Good',
        bedtime: existingLog.bedtime || '',
        wake_time: existingLog.wake_time || '',
        notes: existingLog.notes || '',
      });
    }
  }, [existingLog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'sleep_hours'
          ? value === '' ? '' : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Frontend validation
    const hours = Number(formData.sleep_hours);
    if (formData.sleep_hours === '' || isNaN(hours) || hours < 0 || hours > 24) {
      setError('Sleep hours must be between 0 and 24');
      return;
    }

    try {
      setLoading(true);

      // Backend expects query parameters, NOT a JSON body.
      // Time fields must be HH:MM:SS; convert HH:MM to HH:MM:SS
      const toHHMMSS = (t) => (t && t.trim().length === 5 ? `${t.trim()}:00` : t?.trim() || null);

      let url;
      let method;

      if (existingLog) {
        const params = new URLSearchParams();
        params.set('sleep_hours', String(hours));
        if (formData.sleep_quality) params.set('sleep_quality', formData.sleep_quality);
        const bt = toHHMMSS(formData.bedtime);
        if (bt) params.set('bedtime', bt);
        const wt = toHHMMSS(formData.wake_time);
        if (wt) params.set('wake_time', wt);
        if (formData.notes.trim()) params.set('notes', formData.notes.trim());
        url = `${API_BASE_URL}/sleep/logs/${existingLog.id}?${params.toString()}`;
        method = 'PUT';
      } else {
        const params = new URLSearchParams();
        params.set('log_date', formData.log_date);
        params.set('sleep_hours', String(hours));
        if (formData.sleep_quality) params.set('sleep_quality', formData.sleep_quality);
        const bt = toHHMMSS(formData.bedtime);
        if (bt) params.set('bedtime', bt);
        const wt = toHHMMSS(formData.wake_time);
        if (wt) params.set('wake_time', wt);
        if (formData.notes.trim()) params.set('notes', formData.notes.trim());
        url = `${API_BASE_URL}/sleep/logs?${params.toString()}`;
        method = 'POST';
      }

      const response = await fetchWithAuth(url, { method });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(formatApiError(data?.detail));
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error saving sleep log:', err);
      setError(err.message || 'Failed to save sleep log');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {existingLog ? 'Edit' : 'Log'} Sleep
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap font-sans">{error}</pre>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Sleep log saved successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
            <input
              type="date"
              name="log_date"
              value={formData.log_date}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Sleep Duration (hours)
            </label>
            <input
              type="number"
              name="sleep_hours"
              value={formData.sleep_hours}
              onChange={handleChange}
              min="0"
              max="24"
              step="0.5"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Sleep Quality
            </label>
            <select
              name="sleep_quality"
              value={formData.sleep_quality}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            >
              {SLEEP_QUALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Bedtime — Optional
            </label>
            <input
              type="time"
              name="bedtime"
              value={formData.bedtime}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Wake Time — Optional
            </label>
            <input
              type="time"
              name="wake_time"
              value={formData.wake_time}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Notes — Optional
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g., Had trouble falling asleep"
              rows="3"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Log'
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
