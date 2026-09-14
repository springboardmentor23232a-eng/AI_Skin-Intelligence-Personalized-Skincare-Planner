import api from './api';

/**
 * Retrieves dermatologist dashboard clinical statistics and critical cases queue.
 */
export const getDashboard = async () => {
  const response = await api.get('/api/dermatologist/dashboard');
  return response.data;
};

/**
 * Retrieves patient roster with diagnostic concerns, allergies, and sensitivity indicators.
 */
export const getPatients = async (search = '', status = 'All') => {
  let url = '/api/dermatologist/patients?';
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (status && status !== 'All') url += `status=${encodeURIComponent(status)}&`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Retrieves condition reports with real distribution counts and severity ratings.
 */
export const getConditions = async () => {
  const response = await api.get('/api/dermatologist/conditions');
  return response.data;
};

/**
 * Retrieves clinical progress analytics, treatment recovery rates, and disease distribution.
 */
export const getAnalytics = async () => {
  const response = await api.get('/api/dermatologist/analytics');
  return response.data;
};
