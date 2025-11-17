

import api from './api';

const apiKeyService = {
  /**
   * Get all API keys for tenant
   */
  getApiKeysByTenant: async (tenantId) => {
    const response = await api.get(`/keys/tenant/${tenantId}`);
    return response.data;
  },

  /**
   * Create new API key
   */
  createApiKey: async (tenantId, data) => {
    const response = await api.post(`/keys/tenant/${tenantId}`, {
      userId: data.userId,
      name: data.name,
      scopes: data.scopes || 'read,write',
      expiresInDays: data.expiresInDays || null
    });
    return response.data;
  },

  /**
   * Revoke API key
   */
  revokeApiKey: async (keyId) => {
    const response = await api.put(`/keys/${keyId}/revoke`);
    return response.data;
  },

  /**
   * Delete API key
   */
  deleteApiKey: async (keyId) => {
    await api.delete(`/keys/${keyId}`);
  },

  /**
   * Get API key usage statistics
   */
  getApiKeyUsage: async (keyId) => {
    const response = await api.get(`/keys/${keyId}/usage`);
    return response.data;
  },
};

export default apiKeyService;