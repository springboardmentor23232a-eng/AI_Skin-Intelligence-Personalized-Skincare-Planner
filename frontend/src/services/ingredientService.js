import api from './api';

export const getIngredients = async (search, category) => {
  const params = {};
  if (search) params.search = search;
  if (category && category !== 'All') params.category = category;
  const response = await api.get('/api/ingredients', { params });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/api/ingredients/categories');
  return response.data;
};

export const getIngredientDetails = async (id) => {
  const response = await api.get(`/api/ingredients/${id}`);
  return response.data;
};

export const checkSuitability = async (ingredientId) => {
  const response = await api.post('/api/ingredients/check', { ingredient_id: ingredientId });
  return response.data;
};

export const analyzeInteractions = async (ingredientIds) => {
  const response = await api.post('/api/ingredients/interactions', { ingredient_ids: ingredientIds });
  return response.data;
};

export const getProfileContext = async () => {
  const response = await api.get('/api/ingredients/my-profile-context');
  return response.data;
};
