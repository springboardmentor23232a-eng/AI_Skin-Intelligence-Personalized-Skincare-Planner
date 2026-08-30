import api from './api';

/**
 * Lists products with optional filters (category, budget, search).
 */
export const listProducts = async (filters = {}) => {
  const params = {};
  if (filters.category) params.category = filters.category;
  if (filters.budget) params.budget = filters.budget;
  if (filters.search) params.search = filters.search;

  const response = await api.get('/api/products', { params });
  return response.data;
};

/**
 * Gets all unique product categories.
 */
export const listCategories = async () => {
  const response = await api.get('/api/products/categories');
  return response.data;
};

/**
 * Gets personalized product recommendations for the logged-in user.
 */
export const getPersonalizedRecommendations = async () => {
  const response = await api.get('/api/products/recommended');
  return response.data;
};

/**
 * Gets details of a single product.
 */
export const getProductDetails = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

/**
 * Gets suitability details of a single product for the logged-in user.
 */
export const getProductSuitability = async (id) => {
  const response = await api.get(`/api/products/${id}/suitability`);
  return response.data;
};

/**
 * Compares selected products.
 */
export const compareProducts = async (productIds) => {
  const response = await api.post('/api/products/compare', { product_ids: productIds });
  return response.data;
};

/**
 * Gets suitable alternatives for a product.
 */
export const getProductAlternatives = async (id) => {
  const response = await api.get(`/api/products/${id}/alternatives`);
  return response.data;
};
