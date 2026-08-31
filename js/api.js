/**
 * PanaceaAI API Client
 * Manages JWT Tokens and Backend Express + FastAPI HTTP Requests
 * Enhanced with Module 3: Skin Assessment Engine Integration
 */

import {
  MASTER_PRODUCT_CATALOG,
  filterProductCatalog,
  generateProductComparison,
  getAlternativeProductsFor,
  MOCK_USER_DATA
} from './mockData.js';

const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

// Module 3: Skin Assessment Engine FastAPI Base URL
const ASSESSMENT_API_URL = typeof window !== 'undefined'
  ? (window.ASSESSMENT_API_URL || 'http://localhost:8000')
  : 'http://localhost:8000';

class ApiClient {
  constructor() {
    this._onSessionExpired = null;
    this._requestQueue = new Map(); // Deduplication: prevent concurrent identical GET requests
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
      if (remember) {
        localStorage.setItem('panacea_jwt_token', token);
      }
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

  /**
   * Core HTTP request handler for Express backend (port 3000).
   * Includes automatic retry on transient 5xx errors and 401 session expiry handling.
   */
  async request(endpoint, options = {}, retries = 1) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    try {
      const response = await fetch(url, config);

      // Retry once on transient server errors (502, 503, 504)
      if (retries > 0 && [502, 503, 504].includes(response.status)) {
        await new Promise(r => setTimeout(r, 800));
        return this.request(endpoint, options, retries - 1);
      }

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: false, message: text || 'Unexpected non-JSON response from server.' };
      }

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

  /**
   * Core HTTP request handler for FastAPI Assessment Engine (port 8000).
   * Supports GET/POST/PUT/DELETE with JWT forwarding and automatic error normalization.
   */
  async assessmentRequest(endpoint, options = {}) {
    const url = `${ASSESSMENT_API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    // GET request deduplication: prevent duplicate concurrent GET calls to the same endpoint
    if ((!options.method || options.method === 'GET') && this._requestQueue.has(url)) {
      return this._requestQueue.get(url);
    }

    const promise = (async () => {
      try {
        const response = await fetch(url, config);

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { success: false, message: text || 'Unexpected non-JSON response from Assessment Engine.' };
        }

        if (!response.ok) {
          return {
            success: false,
            status: response.status,
            message: data?.detail || data?.message || `Assessment Engine Error (HTTP ${response.status})`,
            ...data
          };
        }

        return { success: true, ...data };
      } catch (err) {
        console.warn(`[Assessment Engine] Request to ${endpoint} failed:`, err.message);
        return {
          success: false,
          message: 'Skin Assessment Engine is offline or unreachable.',
          offline: true
        };
      } finally {
        this._requestQueue.delete(url);
      }
    })();

    if (!options.method || options.method === 'GET') {
      this._requestQueue.set(url, promise);
    }

    return promise;
  }

  // ════════════════════════════════════════════════════════════════
  // EXPRESS BACKEND AUTH & DATA ENDPOINTS (port 3000)
  // ════════════════════════════════════════════════════════════════

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

  // Data Operations (Express)
  async getSkinScore() {
    return await this.request('/api/user/skin-score', { method: 'GET' });
  }

  async updateUserProfile(profileData) {
    return await this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
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

  // ════════════════════════════════════════════════════════════════
  // MODULE 3: SKIN ASSESSMENT ENGINE APIs (FastAPI - port 8000)
  // ════════════════════════════════════════════════════════════════

  /**
   * POST /assessment — Create new skin assessment.
   * Runs scoring engine, concern identification, and risk analysis.
   * @param {Object} assessmentData - Skin profile parameters
   */
  async createAssessment(assessmentData) {
    return await this.assessmentRequest('/assessment', {
      method: 'POST',
      body: JSON.stringify(assessmentData)
    });
  }

  /**
   * GET /assessment — Retrieve paginated list of user assessments.
   * @param {number} skip - Pagination offset (default 0)
   * @param {number} limit - Pagination limit (default 20)
   */
  async getAssessments(skip = 0, limit = 20) {
    return await this.assessmentRequest(`/assessment?skip=${skip}&limit=${limit}`, {
      method: 'GET'
    });
  }

  /**
   * GET /assessment/{id} — Get detailed assessment with concerns & risks.
   * @param {number} assessmentId
   */
  async getAssessmentById(assessmentId) {
    return await this.assessmentRequest(`/assessment/${assessmentId}`, {
      method: 'GET'
    });
  }

  /**
   * PUT /assessment/{id} — Update assessment and re-evaluate engines.
   * @param {number} assessmentId
   * @param {Object} updateData - Updated skin parameters
   */
  async updateAssessment(assessmentId, updateData) {
    return await this.assessmentRequest(`/assessment/${assessmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * DELETE /assessment/{id} — Delete assessment record.
   * @param {number} assessmentId
   */
  async deleteAssessment(assessmentId) {
    return await this.assessmentRequest(`/assessment/${assessmentId}`, {
      method: 'DELETE'
    });
  }

  /**
   * GET /assessment/history — Get assessment history timeline & score trends.
   */
  async getAssessmentHistory() {
    return await this.assessmentRequest('/assessment/history', {
      method: 'GET'
    });
  }

  /**
   * GET /assessment/score — Get latest skin health score breakdown & insights.
   */
  async getAssessmentScore() {
    return await this.assessmentRequest('/assessment/score', {
      method: 'GET'
    });
  }

  /**
   * GET /assessment/risks — Get active risk factors categorized by severity.
   */
  async getAssessmentRisks() {
    return await this.assessmentRequest('/assessment/risks', {
      method: 'GET'
    });
  }

  /**
   * GET /health — Check Assessment Engine health & DB connectivity.
   */
  /**
   * Module 5: POST /ingredient/analyze
   */
  async analyzeIngredients(payload) {
    return await this.assessmentRequest('/ingredient/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Module 5: GET /ingredient/categories
   */
  async getIngredientCategories() {
    return await this.assessmentRequest('/ingredient/categories', {
      method: 'GET'
    });
  }

  /**
   * Module 6: GET /api/products/catalog — Search, sort, and filter complete master products catalog
   */
  async getProductCatalog(params = {}, profile = MOCK_USER_DATA.profile) {
    try {
      const queryStr = new URLSearchParams(params).toString();
      const res = await this.request(`/api/products/catalog?${queryStr}`);
      if (res && res.success && res.products) {
        return res;
      }
    } catch (err) {
      console.warn('[API Client] Products catalog request fallback to local dataset:', err.message);
    }
    const products = filterProductCatalog(params, profile);
    return {
      success: true,
      total_count: products.length,
      products
    };
  }

  /**
   * Module 6: POST /product/recommend
   */
  async getRecommendedProducts(payload = {}, profile = MOCK_USER_DATA.profile) {
    try {
      const res = await this.assessmentRequest('/product/recommend', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res && res.success && res.recommendations) {
        return res;
      }
    } catch (err) {
      console.warn('[API Client] Product recommendations fallback to local engine:', err.message);
    }

    const filtered = filterProductCatalog(payload, profile);
    const recs = filtered.slice(0, payload.limit || 10).map(p => ({
      product: p,
      suitability_score: p.suitability.score,
      match_tier: p.suitability.badge,
      reason: p.suitability.reason,
      pros: p.pros,
      cons: p.cons
    }));

    return {
      success: true,
      user_id: 1,
      total_found: recs.length,
      category_filter: payload.category || 'All',
      budget_filter: payload.budget_tier || 'All',
      recommendations: recs
    };
  }

  /**
   * Module 6: POST /product/compare
   */
  async compareProducts(productIds, profile = MOCK_USER_DATA.profile) {
    try {
      const res = await this.assessmentRequest('/product/compare', {
        method: 'POST',
        body: JSON.stringify({ product_ids: productIds })
      });
      if (res && res.success && res.matrix) {
        return res;
      }
    } catch (err) {
      console.warn('[API Client] Product comparison fallback to local engine:', err.message);
    }
    return generateProductComparison(productIds, profile);
  }

  /**
   * Module 6: GET /product/alternatives/{productId}
   */
  async getAlternativeProducts(productId, profile = MOCK_USER_DATA.profile) {
    try {
      const res = await this.assessmentRequest(`/product/alternatives/${productId}`, {
        method: 'GET'
      });
      if (res && res.success) {
        return res;
      }
    } catch (err) {
      console.warn('[API Client] Product alternatives fallback to local engine:', err.message);
    }
    return getAlternativeProductsFor(productId, profile);
  }

  /**
   * Module 7: POST /scoring/calculate
   */
  async calculateSkinHealthScore(payload) {
    return await this.assessmentRequest('/scoring/calculate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Module 7: GET /scoring/trend/{userId}
   */
  async getScoreTrend(userId = 1) {
    return await this.assessmentRequest(`/scoring/trend/${userId}`, {
      method: 'GET'
    });
  }

  /**
   * Module 7: POST /scoring/adherence
   */
  async logRoutineAdherence(payload) {
    return await this.assessmentRequest('/scoring/adherence', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const api = new ApiClient();
