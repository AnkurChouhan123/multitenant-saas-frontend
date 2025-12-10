// frontend/src/services/userService.js

import api from './api';

const userService = {
  /**
   * Check if current user has permissions to view/manage users
   */
  checkUserPermission: async (tenantId) => {
    const response = await api.get(`/users/check-permission/${tenantId}`);
    return response.data;
  },

  /**
   * Get all users for a tenant
   * VIEW ACCESS: TENANT_OWNER, TENANT_ADMIN, USER
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
   * Create new user - ADMIN only
   */
  createUser: async (userData, tenantId) => {
    const response = await api.post(`/users?tenantId=${tenantId}`, userData);
    return response.data;
  },

  /**
   * Update user - ADMIN only
   */
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  /**
   * Delete user - ADMIN only
   */
  deleteUser: async (userId) => {
    await api.delete(`/users/${userId}`);
  },
};

export default userService;