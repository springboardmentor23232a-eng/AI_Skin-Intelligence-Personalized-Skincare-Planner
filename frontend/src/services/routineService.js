import api from './api';

/**
 * Gets the user's 28-question profile answers.
 */
export const getRoutineProfile = async () => {
  const response = await api.get('/api/routine/profile');
  return response.data;
};

/**
 * Creates or updates the user's 28-question routine profile.
 */
export const saveRoutineProfile = async (profileData) => {
  const response = await api.post('/api/routine/profile', profileData);
  return response.data;
};

/**
 * Generates a brand new skincare routine.
 */
export const generateRoutine = async () => {
  const response = await api.post('/api/routine/generate');
  return response.data;
};

/**
 * Gets the most recently generated skincare routine.
 */
export const getCurrentRoutine = async () => {
  const response = await api.get('/api/routine/current');
  return response.data;
};

/**
 * Gets the list of past skincare routines.
 */
export const getRoutineHistory = async () => {
  const response = await api.get('/api/routine/history');
  return response.data;
};

/**
 * Gets details of a specific routine by ID.
 */
export const getRoutineDetails = async (id) => {
  const response = await api.get(`/api/routine/${id}`);
  return response.data;
};

/**
 * Saves manual modifications to a routine card.
 */
export const updateRoutineManually = async (id, items) => {
  const response = await api.put(`/api/routine/${id}`, { items });
  return response.data;
};

/**
 * Deletes a routine card from history logs.
 */
export const deleteRoutine = async (id) => {
  const response = await api.delete(`/api/routine/${id}`);
  return response.data;
};

/**
 * Re-runs the rule engine on the specified routine card ID.
 */
export const regenerateRoutine = async (id) => {
  const response = await api.post(`/api/routine/${id}/regenerate`);
  return response.data;
};
