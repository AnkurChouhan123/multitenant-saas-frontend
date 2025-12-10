// src/services/webhookService.js

import api from './api';

const webhookService = {
  /**
   * Get all webhooks for a tenant
   */
  getWebhooksByTenant: async (tenantId) => {
    const response = await api.get(`/webhooks/tenant/${tenantId}`);
    return response.data;
  },

  /**
   * Create new webhook
   */
  createWebhook: async (tenantId, userId, webhookData) => {
    const response = await api.post(
      `/webhooks/tenant/${tenantId}?userId=${userId}`,
      webhookData
    );
    return response.data;
  },

  /**
   * Update webhook
   */
  updateWebhook: async (webhookId, webhookData) => {
    const response = await api.put(`/webhooks/${webhookId}`, webhookData);
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