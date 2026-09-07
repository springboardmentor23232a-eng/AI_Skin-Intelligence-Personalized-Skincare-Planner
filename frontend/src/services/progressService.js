import api from './api';

/**
 * Retrieves the overall progress summary, recent delta changes, and high-level KPIs.
 */
export const getProgressSummary = async () => {
  const response = await api.get('/api/progress/summary');
  return response.data;
};

/**
 * Retrieves chronological multi-metric trend data points and concern severity trends.
 * @param {string} range - Time range ('7d', '30d', '3m', '6m', 'all')
 */
export const getProgressTrends = async (range = '30d') => {
  const response = await api.get(`/api/progress/trends?range=${range}`);
  return response.data;
};

/**
 * Retrieves routine adherence analytics, step totals, and recent daily logs.
 */
export const getAdherenceAnalytics = async () => {
  const response = await api.get('/api/progress/adherence');
  return response.data;
};

/**
 * Retrieves before & after comparison details for two historical snapshots.
 * @param {number|null} earlierId 
 * @param {number|null} laterId 
 * @param {string} type - 'assessment' or 'health_score'
 */
export const getComparisonData = async (earlierId = null, laterId = null, type = 'assessment') => {
  let url = `/api/progress/comparison?type=${type}`;
  if (earlierId) url += `&earlier_id=${earlierId}`;
  if (laterId) url += `&later_id=${laterId}`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Retrieves the list of available historical snapshots for comparison selectors.
 */
export const getAvailableSnapshots = async () => {
  const response = await api.get('/api/progress/snapshots');
  return response.data;
};
