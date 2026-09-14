import api from './api';

/**
 * Retrieves global platform metrics and entity counters for admin dashboard.
 */
export const getDashboard = async () => {
  const response = await api.get('/api/admin/dashboard');
  return response.data;
};

/**
 * Retrieves full user directory for administrative management.
 */
export const getUsers = async (search = '', role = 'All') => {
  let url = '/api/admin/users?';
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (role && role !== 'All') url += `role=${encodeURIComponent(role)}&`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Updates permission role for a user account.
 */
export const updateUserRole = async (userId, newRole) => {
  const response = await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
  return response.data;
};

/**
 * Deletes a user account with database cascade.
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};

/**
 * Retrieves platform analytics, 7-day registration history, and role distribution.
 */
export const getPlatformAnalytics = async () => {
  const response = await api.get('/api/admin/analytics');
  return response.data;
};

/**
 * Audits product catalog and recommendation engine metrics.
 */
export const getRecommendationMetrics = async () => {
  const response = await api.get('/api/admin/recommendation-metrics');
  return response.data;
};

/**
 * Performs database ping latency test and entity row count audit.
 */
export const getSystemHealth = async () => {
  const response = await api.get('/api/admin/system-health');
  return response.data;
};
