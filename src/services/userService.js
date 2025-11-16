// frontend/src/services/userService.js

import api from './api';

const userService = {
  /**
   * Get all users for a tenant
   */
  getUsersByTenant: async (tenantId) => {
    const response = await api.get(`/users/tenant/${tenantId}`);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (userData, tenantId) => {
    const response = await api.post(`/users?tenantId=${tenantId}`, userData);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    await api.delete(`/users/${userId}`);
  },
};

export default userService;