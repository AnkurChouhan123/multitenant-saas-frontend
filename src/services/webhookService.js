// frontend/src/services/webhookService.js - NEW FILE

import api from './api';

const webhookService = {
  /**
   * Get all webhooks for tenant
   */
  getWebhooksByTenant: async (tenantId) => {
    const response = await api.get(`/webhooks/tenant/${tenantId}`);
    return response.data;
  },

  /**
   * Create new webhook
   */
  createWebhook: async (tenantId, userId, data) => {
    const response = await api.post(`/webhooks/tenant/${tenantId}?userId=${userId}`, {
      name: data.name,
      url: data.url,
      events: data.events,
      isActive: true
    });
    return response.data;
  },

  /**
   * Update webhook
   */
  updateWebhook: async (webhookId, data) => {
    const response = await api.put(`/webhooks/${webhookId}`, {
      name: data.name,
      url: data.url,
      events: data.events,
      isActive: data.isActive
    });
    return response.data;
  },

  /**
   * Delete webhook
   */
  deleteWebhook: async (webhookId) => {
    await api.delete(`/webhooks/${webhookId}`);
  },

  /**
   * Test webhook
   */
  testWebhook: async (webhookId) => {
    const response = await api.post(`/webhooks/${webhookId}/test`);
    return response.data;
  },

  /**
   * Get webhook statistics
   */
  getWebhookStats: async (webhookId) => {
    const response = await api.get(`/webhooks/${webhookId}/stats`);
    return response.data;
  },
};

export default webhookService;