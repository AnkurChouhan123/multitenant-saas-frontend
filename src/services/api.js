// frontend/src/services/api.js - UPDATED

import axios from 'axios';

// Get API URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

console.log('🔧 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - Add auth token and tenant ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Redirecting to login');
      localStorage.clear();
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - Access denied');
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('💥 Server Error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Utility function to handle API errors globally
export const handleApiError = (error) => {
  const message = error.response?.data?.message 
    || error.response?.data?.error
    || error.message 
    || 'An unexpected error occurred';
  
  return {
    message,
    status: error.response?.status,
    data: error.response?.data
  };
};

// Utility function to check if request needs authentication
export const requiresAuth = (url) => {
  const publicEndpoints = ['/auth/login', '/auth/register', '/auth/health'];
  return !publicEndpoints.some(endpoint => url.includes(endpoint));
};

export default api;