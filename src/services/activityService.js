// frontend/src/services/activityService.js - ENHANCED

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

  /**
   * Export activities to CSV
   */
  exportActivitiesToCSV: (activities) => {
    const headers = ['Date', 'User', 'Action', 'Type', 'IP Address', 'Details'];
    const rows = activities.map(a => [
      new Date(a.createdAt).toLocaleString(),
      a.userName,
      a.action,
      a.actionType,
      a.ipAddress || 'N/A',
      a.details || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Get activity statistics
   */
  getActivityStatistics: (activities) => {
    const stats = {
      total: activities.length,
      byType: {},
      byUser: {},
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0
    };

    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    activities.forEach(activity => {
      const activityDate = new Date(activity.createdAt);

      // Count by type
      stats.byType[activity.actionType] = (stats.byType[activity.actionType] || 0) + 1;

      // Count by user
      stats.byUser[activity.userName] = (stats.byUser[activity.userName] || 0) + 1;

      // Count by time range
      if (activityDate > oneDayAgo) stats.last24Hours++;
      if (activityDate > sevenDaysAgo) stats.last7Days++;
      if (activityDate > thirtyDaysAgo) stats.last30Days++;
    });

    return stats;
  },
};

export default activityService;