import api from './api';

/**
 * Uploads a skin image and runs the AI diagnostic analysis pipeline.
 */
export const createAssessment = async (imageFile, notes = '') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (notes) {
    formData.append('notes', notes);
  }
  
  const response = await api.post('/api/assessment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Retrieves the full assessments list.
 */
export const getAssessments = async () => {
  const response = await api.get('/api/assessment');
  return response.data;
};

/**
 * Retrieves assessment summary logs.
 */
export const getAssessmentHistory = async () => {
  const response = await api.get('/api/assessment/history');
  return response.data;
};

/**
 * Retrieves specific assessment details by ID.
 */
export const getAssessmentDetails = async (id) => {
  const response = await api.get(`/api/assessment/${id}`);
  return response.data;
};

/**
 * Updates the notes section of an assessment.
 */
export const updateAssessmentNotes = async (id, notes) => {
  const response = await api.put(`/api/assessment/${id}`, { notes });
  return response.data;
};

/**
 * Deletes an assessment card and purges its nested concerns/risks.
 */
export const deleteAssessment = async (id) => {
  const response = await api.delete(`/api/assessment/${id}`);
  return response.data;
};
