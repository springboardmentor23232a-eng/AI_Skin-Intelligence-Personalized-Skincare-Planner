import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Moon, Loader, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';
import { SleepLogModal } from './SleepLogModal';

export function SleepWidget() {
  const { fetchWithAuth } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      // Explicitly request today's date — backend defaults to yesterday, which would
      // show 0 hours even after the user just logged today's sleep.
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const response = await fetchWithAuth(
        `${API_BASE_URL}/sleep/summary?target_date=${todayStr}`,
        { method: 'GET' }
      );

      const data = await response.json();

      if (!response.ok) {
        const detail = data?.detail;
        throw new Error(typeof detail === 'string' ? detail : 'Failed to load sleep summary');
      }

      // Backend returns: { status, summary: { logged_hours, goal_hours, sleep_quality, ... } }
      setSummary(data.summary ?? data);
    } catch (err) {
      console.error('Error loading sleep summary:', err);
      setError(err.message || 'Failed to load sleep data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white">Sleep</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader className="w-5 h-5 text-violet-400 animate-spin" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white">Sleep</h3>
        </div>
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      </GlassCard>
    );
  }

  if (!summary) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white">Sleep</h3>
        </div>
        <p className="text-xs text-slate-400">No data available</p>
      </GlassCard>
    );
  }

  // Backend summary fields: logged_hours, goal_hours, sleep_quality, percentage, goal_met, deficit_hours
  const goal = summary.goal_hours ?? 8;
  const latest = summary.logged_hours ?? 0;
  const quality = summary.sleep_quality || 'not logged';
  const progressPercent = Math.min((latest / goal) * 100, 100);

  return (
    <>
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Sleep</h3>
          </div>
          {latest >= goal && (
            <span className="text-xs font-semibold text-emerald-400">Goal Met ✓</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-violet-400">
              {typeof latest === 'number' ? latest.toFixed(1) : 0}
            </span>
            <span className="text-xs text-slate-400">of {goal} hours</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">Quality:</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            quality === 'not logged'
              ? 'bg-slate-800/50 text-slate-400 border-slate-700'
              : quality === 'Good'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : quality === 'Medium'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {quality.charAt(0).toUpperCase() + quality.slice(1)}
          </span>
        </div>

        <div className="text-xs text-slate-400">
          {latest >= goal ? (
            <span className="text-emerald-400">✓ You met your sleep goal!</span>
          ) : latest > 0 ? (
            <span>{(goal - latest).toFixed(1)} more hours to reach your goal</span>
          ) : (
            <span>No sleep logged yet</span>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="w-full">
          <Moon className="w-4 h-4" />
          Log Sleep
        </Button>
      </GlassCard>

      <SleepLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadSummary}
      />
    </>
  );
}
