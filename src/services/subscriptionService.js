// frontend/src/services/subscriptionService.js

import api from './api';

const subscriptionService = {
  /**
   * Check if current user has subscription permission
   */
  checkPermission: async () => {
    const response = await api.get('/subscriptions/check-permission');
    return response.data;
  },

  /**
   * Get subscription for tenant - SUPER_ADMIN only
   */
  getSubscription: async (tenantId) => {
    const response = await api.get(`/subscriptions/tenant/${tenantId}`);
    return response.data;
  },

  /**
   * Get all available plans - SUPER_ADMIN only
   */
  getPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  /**
   * Change subscription plan - SUPER_ADMIN only
   */
  changePlan: async (tenantId, plan) => {
    const response = await api.post(`/subscriptions/${tenantId}/change-plan`, null, {
      params: { plan }
    });
    return response.data;
  },

  /**
   * Cancel subscription - SUPER_ADMIN only
   */
  cancelSubscription: async (tenantId) => {
    const response = await api.post(`/subscriptions/${tenantId}/cancel`);
    return response.data;
  },

  /**
   * Check if subscription is valid - SUPER_ADMIN only
   */
  isSubscriptionValid: async (tenantId) => {
    const response = await api.get(`/subscriptions/${tenantId}/valid`);
    return response.data;
  },
};

export default subscriptionService;