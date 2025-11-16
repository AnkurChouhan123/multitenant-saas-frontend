// frontend/src/services/subscriptionService.js

import api from './api';

const subscriptionService = {
  /**
   * Get subscription for tenant
   */
  getSubscription: async (tenantId) => {
    const response = await api.get(`/subscriptions/tenant/${tenantId}`);
    return response.data;
  },

  /**
   * Get all available plans
   */
  getPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  /**
   * Change subscription plan
   */
  changePlan: async (tenantId, plan) => {
    const response = await api.post(`/subscriptions/${tenantId}/change-plan`, null, {
      params: { plan }
    });
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (tenantId) => {
    const response = await api.post(`/subscriptions/${tenantId}/cancel`);
    return response.data;
  },

  /**
   * Check if subscription is valid
   */
  isSubscriptionValid: async (tenantId) => {
    const response = await api.get(`/subscriptions/${tenantId}/valid`);
    return response.data;
  },
};

export default subscriptionService;