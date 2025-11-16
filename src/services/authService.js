// frontend/src/services/authService.js

import api from './api';

const authService = {
  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Store auth data in localStorage
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
};

export default authService;