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
