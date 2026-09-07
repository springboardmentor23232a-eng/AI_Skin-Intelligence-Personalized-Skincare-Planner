import api from './api';

/**
 * Retrieves the user's latest overall skin health score and component breakdown.
 */
export const getCurrentScore = async () => {
  const response = await api.get('/api/score/current');
  return response.data;
};

/**
 * Triggers an explicit recalculation of the user's skin health score and stores a new history snapshot.
 */
export const recalculateScore = async () => {
  const response = await api.post('/api/score/calculate');
  return response.data;
};

/**
 * Retrieves chronological skin health score history records for progress trend tracking.
 */
export const getScoreHistory = async () => {
  const response = await api.get('/api/score/history');
  return response.data;
};

/**
 * Logs daily checklist completions to PostgreSQL to update Routine Consistency adherence.
 */
export const logChecklistAdherence = async (completedCount, totalCount) => {
  const response = await api.post('/api/score/checklist-log', {
    completed_count: completedCount,
    total_count: totalCount,
  });
  return response.data;
};
