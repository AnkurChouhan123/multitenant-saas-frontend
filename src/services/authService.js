// frontend/src/services/authService.js

import api from './api';

const authService = {
  /**
   * Login user - Handles 2FA flow
   */
  login: async (email, password, twoFactorCode = null) => {
    const response = await api.post('/auth/login', { 
      email, 
      password,
      twoFactorCode 
    });
    
    // If 2FA is required, return response indicating that
    if (response.data.requiresTwoFactor) {
      return response.data; // { requiresTwoFactor: true, twoFactorMethod: "TOTP", email: ... }
    }
    
    // Store auth data in localStorage (normal login)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('firstName', response.data.firstName);
      localStorage.setItem('lastName', response.data.lastName);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('tenantId', response.data.tenantId);
      localStorage.setItem('tenantName', response.data.tenantName);
      localStorage.setItem('subdomain', response.data.subdomain);
    }
    
    return response.data;
  },

  /**
   * Register new tenant
   */
  register: async (formData) => {
    const response = await api.post('/auth/register', formData);
    
    // Store auth data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('firstName', response.data.firstName);
      localStorage.setItem('lastName', response.data.lastName);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('tenantId', response.data.tenantId);
      localStorage.setItem('tenantName', response.data.tenantName);
      localStorage.setItem('subdomain', response.data.subdomain);
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    return {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('email'),
      firstName: localStorage.getItem('firstName'),
      lastName: localStorage.getItem('lastName'),
      role: localStorage.getItem('role'),
      tenantId: localStorage.getItem('tenantId'),
      tenantName: localStorage.getItem('tenantName'),
      subdomain: localStorage.getItem('subdomain'),
      token: localStorage.getItem('token'),
    };
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // ==================== 2FA METHODS ====================

  /**
   * Initialize 2FA setup - Get QR code
   */
  setup2FA: async (method = 'TOTP') => {
    const response = await api.post('/auth/2fa/setup', { method });
    return response.data;
  },

  /**
   * Verify 2FA code and enable 2FA
   */
  verify2FA: async (code) => {
    const response = await api.post('/auth/2fa/verify', { code });
    return response.data;
  },

  /**
   * Get 2FA status
   */
  get2FAStatus: async () => {
    const response = await api.get('/auth/2fa/status');
    return response.data;
  },

  /**
   * Disable 2FA
   */
  disable2FA: async () => {
    const response = await api.post('/auth/2fa/disable');
    return response.data;
  },

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: async () => {
    const response = await api.post('/auth/2fa/backup-codes/regenerate');
    return response.data;
  },
};

export default authService;