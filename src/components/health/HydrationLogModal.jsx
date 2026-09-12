import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

/**
 * Format FastAPI validation errors into readable text.
 * Handles both string and array detail formats.
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

export function HydrationLogModal({ isOpen, onClose, onSuccess, existingLog = null }) {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    quantity_glasses: 1,
    quantity_ml: '',
    log_time: '',
  });

  useEffect(() => {
    if (existingLog) {
      setFormData({
        log_date: existingLog.log_date,
        quantity_glasses: existingLog.quantity_glasses,
        quantity_ml: existingLog.quantity_ml || '',
        log_time: existingLog.log_time || '',
      });
    }
  }, [existingLog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'quantity_glasses' || name === 'quantity_ml'
          ? value === '' ? '' : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Frontend validation
    if (formData.quantity_glasses === '' || isNaN(formData.quantity_glasses) || formData.quantity_glasses < 0) {
      setError('Water intake must be a non-negative number');
      return;
    }

    try {
      setLoading(true);

      // Backend expects query parameters, NOT a JSON body.
      const params = new URLSearchParams();
      params.set('log_date', formData.log_date);
      params.set('quantity_glasses', String(formData.quantity_glasses));
      if (formData.quantity_ml !== '' && formData.quantity_ml !== null) {
        params.set('quantity_ml', String(Math.round(Number(formData.quantity_ml))));
      }
      // Backend expects HH:MM:SS; convert HH:MM to HH:MM:SS
      if (formData.log_time) {
        const t = formData.log_time.trim();
        params.set('log_time', t.length === 5 ? `${t}:00` : t);
      }

      let url;
      let method;
      if (existingLog) {
        // PUT also accepts query params for the update fields
        const putParams = new URLSearchParams();
        putParams.set('quantity_glasses', String(formData.quantity_glasses));
        if (formData.quantity_ml !== '' && formData.quantity_ml !== null) {
          putParams.set('quantity_ml', String(Math.round(Number(formData.quantity_ml))));
        }
        if (formData.log_time) {
          const t = formData.log_time.trim();
          putParams.set('log_time', t.length === 5 ? `${t}:00` : t);
        }
        url = `${API_BASE_URL}/hydration/logs/${existingLog.id}?${putParams.toString()}`;
        method = 'PUT';
      } else {
        url = `${API_BASE_URL}/hydration/logs?${params.toString()}`;
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
      console.error('Error saving hydration log:', err);
      setError(err.message || 'Failed to save hydration log');
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
            {existingLog ? 'Edit' : 'Log'} Water Intake
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
            Water intake logged successfully
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
              Water Intake (glasses)
            </label>
            <input
              type="number"
              name="quantity_glasses"
              value={formData.quantity_glasses}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Water Intake (ml) — Optional
            </label>
            <input
              type="number"
              name="quantity_ml"
              value={formData.quantity_ml}
              onChange={handleChange}
              min="0"
              step="50"
              placeholder="e.g., 500"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Time — Optional
            </label>
            <input
              type="time"
              name="log_time"
              value={formData.log_time}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
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
