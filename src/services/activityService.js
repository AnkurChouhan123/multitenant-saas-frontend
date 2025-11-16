// frontend/src/services/activityService.js

import api from './api';

const activityService = {
  /**
   * Get all activities for a tenant
   */
  getActivitiesByTenant: async (tenantId) => {
    const response = await api.get(`/activities/tenant/${tenantId}`);
    return response.data;
  },

  /**
   * Get activities with pagination
   */
  getActivitiesPage: async (tenantId, page = 0, size = 20) => {
    const response = await api.get(`/activities/tenant/${tenantId}/page`, {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Get activities by type
   */
  getActivitiesByType: async (tenantId, actionType) => {
    const response = await api.get(`/activities/tenant/${tenantId}/type/${actionType}`);
    return response.data;
  },

  /**
   * Get activities in date range
   */
  getActivitiesByDateRange: async (tenantId, startDate, endDate) => {
    const response = await api.get(`/activities/tenant/${tenantId}/range`, {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
    return response.data;
  },
};

export default activityService;