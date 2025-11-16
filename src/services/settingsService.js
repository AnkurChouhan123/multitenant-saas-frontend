// frontend/src/services/settingsService.js

import api from './api';

const settingsService = {
  /**
   * Update user profile
   */
  updateProfile: async (userId, profileData) => {
    const response = await api.put(`/users/${userId}/profile`, profileData);
    return response.data;
  },

  /**
   * Update tenant/company info
   */
  updateCompany: async (tenantId, companyData) => {
    const response = await api.put(`/tenants/${tenantId}`, companyData);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (userId, oldPassword, newPassword) => {
    const response = await api.post(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword
    });
    return response.data;
  },
};

export default settingsService;