import api from './api';

/**
 * Registers a new local email/password user account.
 */
export const register = async (name, email, password, role = 'USER') => {
  const response = await api.post('/api/auth/register', {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

/**
 * Logs in with email and password credentials, returning token details.
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Validates Google Client SSO ID tokens, returning signed session details.
 */
export const googleLogin = async (token) => {
  const response = await api.post('/api/auth/google', {
    token,
  });
  return response.data;
};

/**
 * Retrieves the current authenticated user's profile details.
 */
export const getProfile = async () => {
  const response = await api.get('/api/profile');
  return response.data;
};

/**
 * Updates the current authenticated user's name attribute.
 */
export const updateProfile = async (name) => {
  const response = await api.put('/api/profile', {
    name,
  });
  return response.data;
};
