import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Sun, Moon, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const morningBadgeVariants = ['slate', 'emerald', 'cyan', 'amber'];
const eveningBadgeVariants = ['slate', 'violet', 'teal', 'violet'];

export default function RoutinePlannerPage() {
  const { fetchWithAuth } = useAuth();
  
  const handleRegenerateRoutine = async () => {
  try {
    setRegenerating(true);
    setRegenerateSuccess(false);
    setError('');

    const response = await fetchWithAuth(
      `${API_BASE_URL}/routine/regenerate`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.detail || 'Unable to regenerate personalized routine.'
      );
    }

    const data = await response.json();

    setRoutine(data);
    setRegenerateSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setRegenerateSuccess(false);
    }, 3000);

  } catch (err) {
    console.error('Routine regeneration failed:', err);

    setError(
      err.message || 'Unable to regenerate personalized routine.'
    );
  } finally {
    setRegenerating(false);
  }
};

const startEditing = (type, index, item) => {
  setEditingStep({
    type,
    index,
  });

  setEditName(item.name);
  setEditDescription(item.description || '');
};
const cancelEditing = () => {
  setEditingStep(null);
  setEditName('');
  setEditDescription('');
};
const saveEditing = async () => {
  if (!editingStep || !routine) return;

  try {
    setSaving(true);
    setError('');

    // Update the selected routine step
    const updatedRoutine = {
      ...routine,
      [editingStep.type]: routine[editingStep.type].map((item, index) => {
        if (index !== editingStep.index) {
          return item;
        }

        return {
          ...item,
          name: editName,
          description: editDescription,
        };
      }),
    };

    // Save the COMPLETE routine to the backend
    const response = await fetchWithAuth(
      `${API_BASE_URL}/routine/update`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routine_data: updatedRoutine,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.detail || 'Unable to save routine changes.'
      );
    }

    const data = await response.json();

    // Use the routine returned by the backend
    setRoutine(data.routine);

    // Close edit mode
    cancelEditing();

  } catch (err) {
    console.error('Routine update failed:', err);

    setError(
      err.message || 'Unable to save routine changes.'
    );
  } finally {
    setSaving(false);
  }
};
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [editingStep, setEditingStep] = useState(null);
  const [editName, setEditName] = useState('');
const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetchWithAuth(
          `${API_BASE_URL}/routine/current`
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.detail || 'Unable to load personalized routine.'
          );
        }

        const data = await response.json();
        setRoutine(data);
      } catch (err) {
        console.error('Routine loading failed:', err);
        setError(err.message || 'Unable to load personalized routine.');
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [fetchWithAuth]);

  if (loading) {
    return (
      <div className="space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Personalized Routine Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Document Module 4: Morning, Evening, Weekly Treatment & Seasonal Regimens.
          </p>
        </div>

        <GlassCard className="p-6">
          <p className="text-sm text-slate-400">
            Generating your personalized skincare routine...
          </p>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Personalized Routine Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Document Module 4: Morning, Evening, Weekly Treatment & Seasonal Regimens.
          </p>
        </div>

        <GlassCard className="p-6 border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-slate-500 mt-2">
            Please complete a skin assessment before generating your routine.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!routine) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Personalized Routine Generator
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Document Module 4: Morning, Evening, Weekly Treatment & Seasonal Regimens.
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="emerald">
              Skin Type: {routine.skin_type}
            </Badge>

            <Badge variant="cyan">
              Health Score: {routine.health_score}
            </Badge>

            <Badge variant="slate">
              {routine.overall_condition}
            </Badge>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRegenerateRoutine}
          disabled={regenerating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
        >
          <RefreshCw
            className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`}
          />

          {regenerating ? 'Regenerating...' : 'Regenerate Routine'}
        </button>
        {regenerateSuccess && (
  <p className="text-xs text-emerald-400 mt-2 text-right">
    ✓ Routine regenerated successfully
  </p>
)}
      </div>
    

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* AM Routine */}
        <GlassCard className="space-y-4 border-amber-500/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Morning Routine (AM)
              </h2>
            </div>

            <Badge variant="amber">
              {routine.morning_routine.length} Steps
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {routine.morning_routine.map((item, index) => (
              <div
  key={`${item.step}-${item.name}`}
  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800"
>
  {editingStep?.type === 'morning_routine' &&
  editingStep?.index === index ? (
    <div className="space-y-3">

      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-emerald-500"
        placeholder="Routine name"
      />

      <textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-emerald-500"
        rows={2}
        placeholder="Description"
      />

      <div className="flex gap-2">
        <button
  type="button"
  onClick={saveEditing}
  disabled={saving}
  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
>
  {saving ? 'Saving...' : 'Save'}
</button>

        <button
          type="button"
          onClick={cancelEditing}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
        >
          Cancel
        </button>
      </div>

    </div>
  ) : (
    <div className="flex items-start justify-between gap-4">

      <div>
        <span className="font-bold text-slate-200 block text-sm">
          Step {item.step}: {item.category}
        </span>

        <span className="text-slate-400">
          {item.name}
        </span>

        {item.description && (
          <p className="text-slate-500 mt-1">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">

        <Badge variant={morningBadgeVariants[index] || 'slate'}>
          {item.duration || item.benefit || 'Routine Step'}
        </Badge>

        <button
          type="button"
          onClick={() =>
            startEditing('morning_routine', index, item)
          }
          className="text-xs text-slate-400 hover:text-emerald-400 transition"
        >
          Edit
        </button>

      </div>

    </div>
  )}
</div>
            ))}
          </div>
        </GlassCard>

        {/* PM Routine */}
        <GlassCard className="space-y-4 border-violet-500/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">
                Evening Routine (PM)
              </h2>
            </div>

            <Badge variant="violet">
              {routine.evening_routine.length} Steps
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {routine.evening_routine.map((item, index) => (
              <div
  key={`${item.step}-${item.name}`}
  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800"
>
  {editingStep?.type === 'evening_routine' &&
  editingStep?.index === index ? (
    <div className="space-y-3">

      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-emerald-500"
        placeholder="Routine name"
      />

      <textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-emerald-500"
        rows={2}
        placeholder="Description"
      />

      <div className="flex gap-2">
        <button
  type="button"
  onClick={saveEditing}
  disabled={saving}
  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
>
  {saving ? 'Saving...' : 'Save'}
</button>

        <button
          type="button"
          onClick={cancelEditing}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
        >
          Cancel
        </button>
      </div>

    </div>
  ) : (
    <div className="flex items-start justify-between gap-4">

      <div>
        <span className="font-bold text-slate-200 block text-sm">
          Step {item.step}: {item.category}
        </span>

        <span className="text-slate-400">
          {item.name}
        </span>

        {item.description && (
          <p className="text-slate-500 mt-1">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">

        <Badge variant={eveningBadgeVariants[index] || 'slate'}>
          {item.duration || item.benefit || 'Routine Step'}
        </Badge>

        <button
          type="button"
          onClick={() =>
            startEditing('evening_routine', index, item)
          }
          className="text-xs text-slate-400 hover:text-emerald-400 transition"
        >
          Edit
        </button>

      </div>

    </div>
  )}
</div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Weekly & Seasonal skincare recommendations */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calendar className="w-5 h-5 text-teal-400" />

          <h2 className="text-lg font-bold text-white">
            Weekly Treatment & Seasonal Skincare
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

          {/* Weekly Treatment */}
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-1">
            <span className="font-bold text-teal-300 block text-sm">
              {routine.weekly_treatment_plan.day}{' '}
              {routine.weekly_treatment_plan.title}
            </span>

            <p className="text-slate-300">
              {routine.weekly_treatment_plan.description}
            </p>
          </div>

          {/* Seasonal Recommendations */}
<div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-4">

  <span className="font-bold text-cyan-300 block text-sm">
    Seasonal Recommendations
  </span>

  {/* Current Season */}
  <div className="space-y-2">
    <span className="text-cyan-400 font-semibold text-sm">
      🌧️ Current Season: {routine.seasonal_recommendations.current_season}
    </span>

    <ul className="list-disc list-inside text-slate-300 space-y-1">
      {routine.seasonal_recommendations.recommendations.map(
        (recommendation, index) => (
          <li key={index}>{recommendation}</li>
        )
      )}
    </ul>
  </div>

  {/* Next Season */}
  <div className="pt-3 border-t border-slate-700">
    <span className="text-violet-400 font-semibold text-sm">
      ❄️ Next Season: {routine.seasonal_recommendations.next_season}
    </span>

    <p className="text-slate-300 mt-1">
      {routine.seasonal_recommendations.upcoming_season_note}
    </p>
  </div>

</div>
        </div>
      </GlassCard>
    </div>
  );
}