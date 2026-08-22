import api from './api';

export const getDashboard = async () => {
  const response = await api.get('/api/consultant/dashboard');
  return response.data;
};

export const getClients = async () => {
  const response = await api.get('/api/consultant/clients');
  return response.data;
};

export const getClientDetails = async (userId) => {
  const response = await api.get(`/api/consultant/clients/${userId}`);
  return response.data;
};

export const getAllAssessments = async () => {
  const response = await api.get('/api/consultant/assessments');
  return response.data;
};
