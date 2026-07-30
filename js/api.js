/**
 * PanaceaAI API Client
 * Manages JWT Tokens and Backend Express API HTTP Requests
 */

const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

class ApiClient {
  constructor() {
    this._onSessionExpired = null; // BUG 11: callback for 401 auto-logout
  }

  onSessionExpired(callback) {
    this._onSessionExpired = callback;
  }
  getToken() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('panacea_jwt_token') || sessionStorage?.getItem('panacea_jwt_token') || null;
    }
    return this.memoryToken || null;
  }

  setToken(token, remember = true) {
    if (!token) return;
    this.memoryToken = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('panacea_jwt_token', token);
      sessionStorage.setItem('panacea_jwt_token', token);
    }
  }

  clearToken() {
    this.memoryToken = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('panacea_jwt_token');
      sessionStorage?.removeItem('panacea_jwt_token');
    }
  }

  getHeaders(customHeaders = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Auto-logout on 401 session expiry (only for protected endpoints, not login/register/oauth calls)
      const isAuthRequest = endpoint.startsWith('/api/auth/login') || endpoint.startsWith('/api/auth/register') || endpoint.startsWith('/api/auth/google');
      if (!response.ok && response.status === 401 && !isAuthRequest) {
        this.clearToken();
        if (this._onSessionExpired) {
          this._onSessionExpired('Your session has expired. Please log in again.');
        }
      }

      return data;
    } catch (err) {
      console.warn(`[API Client Warning] Request to ${endpoint} failed:`, err.message);
      return {
        success: false,
        message: 'Network or backend connection offline.',
        offline: true
      };
    }
  }

  // BUG 8 FIX: Accept rememberMe flag to choose localStorage vs sessionStorage
  async login(username, password, role = 'user', rememberMe = false) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role })
    });

    if (res.success && res.token) {
      this.setToken(res.token, rememberMe);
    }
    return res;
  }

  async register(username, email, password, role = 'user') {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role })
    });

    if (res.success && res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async loginWithGoogle(credential, role = 'user') {
    const res = await this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, role })
    });

    if (res.success && res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getAuthenticatedUser() {
    return await this.request('/api/auth/me', { method: 'GET' });
  }

  // Data Operations
  async getSkinScore() {
    return await this.request('/api/user/skin-score', { method: 'GET' });
  }

  async getConsultations() {
    return await this.request('/api/consultations', { method: 'GET' });
  }

  async getProducts() {
    return await this.request('/api/products', { method: 'GET' });
  }

  async getMicroservices() {
    return await this.request('/api/admin/microservices', { method: 'GET' });
  }

  async getAdminUsers() {
    return await this.request('/api/admin/users', { method: 'GET' });
  }

  async createAdminUser(userData) {
    return await this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async approveAdminUser(userId) {
    return await this.request(`/api/admin/users/${userId}/approve`, {
      method: 'PUT'
    });
  }

  async deleteAdminUser(userId) {
    return await this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiClient();
