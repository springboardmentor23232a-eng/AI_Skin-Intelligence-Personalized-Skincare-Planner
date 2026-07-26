import { SCORING_WEIGHTS } from './constants';

export function calculateOverallSkinScore({
  assessmentScore = 82,
  lifestyleScore = 78,
  routineConsistencyScore = 88,
  sleepScore = 70,
  hydrationScore = 85,
} = {}) {
  const score =
    assessmentScore * SCORING_WEIGHTS.SKIN_ASSESSMENT +
    lifestyleScore * SCORING_WEIGHTS.LIFESTYLE_HABITS +
    routineConsistencyScore * SCORING_WEIGHTS.ROUTINE_CONSISTENCY +
    sleepScore * SCORING_WEIGHTS.SLEEP_QUALITY +
    hydrationScore * SCORING_WEIGHTS.HYDRATION_LEVEL;

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getScoreCategory(score) {
  if (score >= 85) return { label: 'Optimal Skin Barrier', color: 'text-emerald-400', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  if (score >= 70) return { label: 'Moderate Skin Health', color: 'text-cyan-400', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
  if (score >= 55) return { label: 'Needs Targeted Care', color: 'text-amber-400', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  return { label: 'High Skin Sensitivity', color: 'text-rose-400', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
}
