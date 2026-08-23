/**
 * Authentication & Role Management Controller
 * Integrates JWT Tokens, Google OAuth 2.0, and Role State Management
 * Session Persistence, Avatar Display, and Security Hardening
 */

import { MOCK_ROLES } from './mockData.js';
import { api } from './api.js';

class AuthController {
  constructor() {
    this.currentRole = null; // null represents Landing Page / Logged Out state
    this.currentUser = null;
    this.jwtToken = null;
    this.listeners = [];
  }

  getCurrentRole() {
    return this.currentRole;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getCurrentRoleInfo() {
    if (!this.currentRole) return null;
    return MOCK_ROLES[this.currentRole.toUpperCase()] || null;
  }

  /**
   * BUG 1 FIX: Restore session from stored JWT token on page load.
   * Calls /api/auth/me to rehydrate user state from the server.
   */
  async restoreSession() {
    const existingToken = api.getToken();
    if (!existingToken) return false;

    try {
      const res = await api.getAuthenticatedUser();
      if (res && res.success && res.user) {
        this.currentUser = res.user;
        this.jwtToken = existingToken;
        const role = (res.user.role || 'user').toLowerCase();
        this.currentRole = role;
        this.notify();
        return true;
      }
    } catch (e) {
      console.warn('[Session Restore] Failed to verify stored token:', e.message);
    }

    // Token is invalid/expired — clear it
    api.clearToken();
    this.currentRole = null;
    this.currentUser = null;
    this.jwtToken = null;
    return false;
  }

  login(roleId) {
    const key = roleId.toUpperCase();
    if (MOCK_ROLES[key]) {
      this.currentRole = roleId.toLowerCase();
      this.notify();
      return true;
    }
    return false;
  }

  async loginWithCredentials(username, password, role, rememberMe = false) {
    if (!username || !password || !username.trim() || !password.trim()) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    let targetRole = role ? role.toLowerCase() : null;
    if (!targetRole) {
      if (cleanUser.includes('admin')) targetRole = 'admin';
      else if (cleanUser.includes('doctor') || cleanUser.includes('dermatologist')) targetRole = 'dermatologist';
      else if (cleanUser.includes('consultant')) targetRole = 'consultant';
      else targetRole = 'user';
    }

    // Call Express API for JWT token & PostgreSQL verification
    const apiRes = await api.login(cleanUser, cleanPass, targetRole, rememberMe);

    if (apiRes && apiRes.success && apiRes.user) {
      const userRole = apiRes.user.role.toLowerCase();
      this.currentUser = apiRes.user;
      this.jwtToken = apiRes.token;
      this.login(userRole);

      return {
        success: true,
        role: userRole,
        userName: apiRes.user.username,
        token: this.jwtToken,
        message: apiRes.message || `Welcome back! Logged in as ${apiRes.user.username}.`
      };
    }

    // BUG 5 FIX: No offline demo fallback — return the server's error directly
    return {
      success: false,
      pendingApproval: apiRes?.pendingApproval || false,
      message: apiRes?.message || 'Login failed. Server may be offline — please try again later.'
    };
  }

  async loginWithGoogle(credential, role = 'user') {
    const apiRes = await api.loginWithGoogle(credential, role);
    if (apiRes && apiRes.success && apiRes.token) {
      this.currentUser = apiRes.user;
      this.jwtToken = apiRes.token;
      const userRole = apiRes.user.role || role;
      this.login(userRole);
      return {
        success: true,
        user: apiRes.user,
        message: apiRes.message
      };
    }
    return {
      success: false,
      pendingApproval: apiRes?.pendingApproval || false,
      message: apiRes?.message || 'Google OAuth login failed.'
    };
  }

  async registerUser(username, email, password, role = 'user') {
    const apiRes = await api.register(username, email, password, role);
    if (apiRes && apiRes.success) {
      if (!apiRes.pendingApproval && apiRes.token && apiRes.user) {
        this.currentUser = apiRes.user;
        this.jwtToken = apiRes.token;
        const userRole = (apiRes.user.role || 'user').toLowerCase();
        this.login(userRole);
      }
      return {
        success: true,
        pendingApproval: apiRes.pendingApproval || false,
        user: apiRes.user,
        token: apiRes.token || null,
        message: apiRes.message || 'Registration completed successfully!'
      };
    }
    return {
      success: false,
      message: apiRes?.message || 'Registration failed.'
    };
  }

  logout() {
    this.currentRole = null;
    this.currentUser = null;
    this.jwtToken = null;
    api.clearToken();
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentRole));
  }
}

export const auth = new AuthController();
