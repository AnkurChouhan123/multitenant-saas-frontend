// frontend/src/services/settingsService.js

import api from './api';

const settingsService = {
  /**
   * Check if current user can manage tenant settings
   */
  checkSettingsPermission: async (tenantId) => {
    const response = await api.get(`/settings/tenant/${tenantId}/check-permission`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, profileData) => {
    const response = await api.put(`/users/${userId}/profile`, profileData);
    return response.data;
  },

  /**
   * Update tenant/company info - TENANT_OWNER only
   */
  updateCompany: async (tenantId, companyData) => {
    const response = await api.put(`/tenants/${tenantId}`, companyData);
    return response.data;
  },

  /**
   * Update tenant settings - TENANT_OWNER only
   */
  updateSettings: async (tenantId, userId, userEmail, settings) => {
    const response = await api.put(
      `/settings/tenant/${tenantId}`,
      settings,
      {
        params: { userId, userEmail }
      }
    );
    return response.data;
  },

  /**
   * Update branding - TENANT_OWNER only
   */
  updateBranding: async (tenantId, userId, userEmail, branding) => {
    const response = await api.put(
      `/settings/tenant/${tenantId}/branding`,
      null,
      {
        params: {
          userId,
          userEmail,
          ...branding
        }
      }
    );
    return response.data;
  },

  /**
   * Get tenant settings
   */
  getSettings: async (tenantId) => {
    const response = await api.get(`/settings/tenant/${tenantId}`);
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