import api from './api';

const analyticsService = {
  /**
   * Get complete dashboard metrics
   */
  getDashboardMetrics: async (tenantId) => {
    const response = await api.get(`/analytics/dashboard/${tenantId}`);
    return response.data;
  },

  /**
   * Get activities by date range
   */
  getActivitiesByRange: async (tenantId, startDate, endDate) => {
    const response = await api.get('/analytics/activities/range', {
      params: {
        tenantId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data;
  },

  /**
   * Get activities by type
   */
  getActivitiesByType: async (tenantId, actionType) => {
    const response = await api.get('/analytics/activities/type', {
      params: {
        tenantId,
        actionType
      }
    });
    return response.data;
  },

  /**
   * Get user growth metrics
   */
  getUserGrowthMetrics: async (tenantId) => {
    try {
      const dashboard = await analyticsService.getDashboardMetrics(tenantId);
      return dashboard.userGrowth || {
        monthlyUsers: 0,
        weeklyUsers: 0,
        totalUsers: 0,
        growthPercentage: 0
      };
    } catch (error) {
      console.error('Error fetching user growth:', error);
      return null;
    }
  },

  /**
   * Get API usage metrics
   */
  getApiUsageMetrics: async (tenantId) => {
    try {
      const dashboard = await analyticsService.getDashboardMetrics(tenantId);
      return dashboard.apiUsage || {
        dailyApiCalls: 0,
        weeklyApiCalls: 0,
        monthlyApiCalls: 0,
        averageResponseTime: 0,
        errorRate: 0
      };
    } catch (error) {
      console.error('Error fetching API usage:', error);
      return null;
    }
  },

  /**
   * Get subscription metrics
   */
  getSubscriptionMetrics: async (tenantId) => {
    try {
      const dashboard = await analyticsService.getDashboardMetrics(tenantId);
      return dashboard.subscriptionMetrics || null;
    } catch (error) {
      console.error('Error fetching subscription metrics:', error);
      return null;
    }
  },
};

export default analyticsService;