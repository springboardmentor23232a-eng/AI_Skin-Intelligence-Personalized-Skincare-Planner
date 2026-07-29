/**
 * Authentication & Role Management Controller
 */

import { MOCK_ROLES } from './mockData.js';

class AuthController {
  constructor() {
    this.currentRole = null; // null represents Landing Page / Logged Out state
    this.listeners = [];
  }

  getCurrentRole() {
    return this.currentRole;
  }

  getCurrentRoleInfo() {
    if (!this.currentRole) return null;
    return MOCK_ROLES[this.currentRole.toUpperCase()] || null;
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

  loginWithCredentials(username, password) {
    if (!username || !password || !username.trim() || !password.trim()) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    let targetRole = 'user';

    if (cleanUser.includes('admin') || cleanUser === 'admin') {
      targetRole = 'admin';
    } else if (cleanUser.includes('doctor') || cleanUser.includes('dermatologist') || cleanUser === 'doctor') {
      targetRole = 'dermatologist';
    } else if (cleanUser.includes('consultant') || cleanUser.includes('sarah') || cleanUser === 'consultant') {
      targetRole = 'consultant';
    } else if (cleanUser === 'user' || cleanUser.includes('alex')) {
      targetRole = 'user';
    } else {
      // Fallback dummy login for any non-empty custom username/password
      targetRole = 'user';
    }

    const success = this.login(targetRole);
    const roleObj = MOCK_ROLES[targetRole.toUpperCase()];
    return {
      success,
      role: targetRole,
      userName: roleObj?.name || 'User',
      message: `Welcome back! Logged in as ${roleObj?.name || targetRole} (${roleObj?.title || 'Account'}).`
    };
  }

  logout() {
    this.currentRole = null;
    this.notify();
  }

  switchRole(roleId) {
    return this.login(roleId);
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentRole));
  }
}

export const auth = new AuthController();
