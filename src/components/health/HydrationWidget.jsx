import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Droplets, Loader, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';
import { HydrationLogModal } from './HydrationLogModal';

export function HydrationWidget() {
  const { fetchWithAuth } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(`${API_BASE_URL}/hydration/summary`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data?.detail;
        throw new Error(typeof detail === 'string' ? detail : 'Failed to load hydration summary');
      }

      // Backend returns: { status, summary: { logged_glasses, goal_glasses, ... } }
      setSummary(data.summary ?? data);
    } catch (err) {
      console.error('Error loading hydration summary:', err);
      setError(err.message || 'Failed to load hydration data');
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
          <Droplets className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Hydration</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Hydration</h3>
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
          <Droplets className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Hydration</h3>
        </div>
        <p className="text-xs text-slate-400">No data available</p>
      </GlassCard>
    );
  }

  // Backend summary fields: logged_glasses, goal_glasses, percentage, goal_met, remaining_glasses
  const goal = summary.goal_glasses ?? 8;
  const today = summary.logged_glasses ?? 0;
  const progressPercent = Math.min((today / goal) * 100, 100);

  return (
    <>
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Hydration</h3>
          </div>
          {today >= goal && (
            <span className="text-xs font-semibold text-emerald-400">Goal Met ✓</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-400">
              {typeof today === 'number' ? today.toFixed(1) : 0}
            </span>
            <span className="text-xs text-slate-400">of {goal} glasses</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-400">
          {today >= goal ? (
            <span className="text-emerald-400">✓ You've reached your hydration goal for today!</span>
          ) : (
            <span>{(goal - today).toFixed(1)} glasses remaining to reach your goal</span>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="w-full">
          <Droplets className="w-4 h-4" />
          Log Water
        </Button>
      </GlassCard>

      <HydrationLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadSummary}
      />
    </>
  );
}
