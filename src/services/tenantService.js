import api from './api';

const tenantService = {
  /**
   * Get all tenants (Super Admin only)
   */
  getAllTenants: async () => {
    const response = await api.get('/tenants');
    return response.data;
  },

  /**
   * Get tenant by ID
   */
  getTenantById: async (tenantId) => {
    const response = await api.get(`/tenants/${tenantId}`);
    return response.data;
  },

  /**
   * Get tenant by subdomain
   */
  getTenantBySubdomain: async (subdomain) => {
    const response = await api.get(`/tenants/subdomain/${subdomain}`);
    return response.data;
  },

  /**
   * Update tenant information
   */
  updateTenant: async (tenantId, data) => {
    const response = await api.put(`/tenants/${tenantId}`, {
      name: data.name,
      status: data.status
    });
    return response.data;
  },

  /**
   * Delete tenant (Super Admin only)
   */
  deleteTenant: async (tenantId) => {
    await api.delete(`/tenants/${tenantId}`);
  },

  /**
   * Get tenant settings
   */
  getTenantSettings: async (tenantId) => {
    const response = await api.get(`/settings/tenant/${tenantId}`);
    return response.data;
  },

  /**
   * Update tenant settings
   */
  updateTenantSettings: async (tenantId, userId, userEmail, settings) => {
    const response = await api.put(
      `/settings/tenant/${tenantId}?userId=${userId}&userEmail=${userEmail}`,
      settings
    );
    return response.data;
  },

  /**
   * Update tenant branding
   */
  updateTenantBranding: async (tenantId, userId, userEmail, branding) => {
    const response = await api.put(
      `/settings/tenant/${tenantId}/branding`,
      null,
      {
        params: {
          userId,
          userEmail,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          logoUrl: branding.logoUrl,
          faviconUrl: branding.faviconUrl
        }
      }
    );
    return response.data;
  },

  /**
   * Reset tenant settings to defaults
   */
  resetTenantSettings: async (tenantId, userId, userEmail) => {
    const response = await api.post(
      `/settings/tenant/${tenantId}/reset?userId=${userId}&userEmail=${userEmail}`
    );
    return response.data;
  },

  /**
   * Check if feature is enabled for tenant
   */
  isFeatureEnabled: async (tenantId, feature) => {
    const response = await api.get(`/settings/tenant/${tenantId}/feature/${feature}`);
    return response.data;
  },
};

export default tenantService;