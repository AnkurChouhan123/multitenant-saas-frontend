// src/services/superAdminService.js - ENHANCED WITH MORE FEATURES

import api from './api';

const BASE_URL = '/superadmin';

const superAdminService = {
  // ========================================
  // PLATFORM OVERVIEW & STATS
  // ========================================
  
  getPlatformStats: async () => {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  },

  getPlatformHealth: async () => {
    const response = await api.get(`${BASE_URL}/health`);
    return response.data;
  },

  // ========================================
  // TENANT MANAGEMENT
  // ========================================

  getAllTenants: async () => {
    const response = await api.get(`${BASE_URL}/tenants`);
    return response.data;
  },

  getTenantMetadata: async (tenantId) => {
    const response = await api.get(`${BASE_URL}/tenants/${tenantId}`);
    return response.data;
  },

  createTenant: async (tenantData) => {
    const response = await api.post(`${BASE_URL}/tenants`, tenantData);
    return response.data;
  },

  suspendTenant: async (tenantId, reason = '') => {
    const response = await api.put(`${BASE_URL}/tenants/${tenantId}/suspend`, null, {
      params: { reason }
    });
    return response.data;
  },

  activateTenant: async (tenantId) => {
    const response = await api.put(`${BASE_URL}/tenants/${tenantId}/activate`);
    return response.data;
  },

  forceLogoutTenant: async (tenantId) => {
    const response = await api.post(`${BASE_URL}/tenants/${tenantId}/force-logout`);
    return response.data;
  },

  deleteTenant: async (tenantId) => {
    const response = await api.delete(`${BASE_URL}/tenants/${tenantId}`);
    return response.data;
  },

  impersonateTenantOwner: async (tenantId) => {
    const response = await api.post(`${BASE_URL}/tenants/${tenantId}/impersonate`);
    return response.data;
  },

  // ========================================
  // SUBSCRIPTION PLAN MANAGEMENT
  // ========================================

  getAllPlans: async () => {
    const response = await api.get(`${BASE_URL}/plans`);
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post(`${BASE_URL}/plans`, planData);
    return response.data;
  },

  updatePlan: async (planName, planData) => {
    const response = await api.put(`${BASE_URL}/plans/${planName}`, planData);
    return response.data;
  },

  assignPlanToTenant: async (tenantId, planName) => {
    const response = await api.post(`${BASE_URL}/tenants/${tenantId}/assign-plan`, null, {
      params: { planName }
    });
    return response.data;
  },

  getAllSubscriptions: async () => {
    const response = await api.get(`${BASE_URL}/subscriptions`);
    return response.data;
  },

  // ========================================
  // GLOBAL ANALYTICS
  // ========================================

  getGlobalAnalytics: async () => {
    const response = await api.get(`${BASE_URL}/analytics/global`);
    return response.data;
  },

  getPlatformUsage: async () => {
    const response = await api.get(`${BASE_URL}/analytics/usage`);
    return response.data;
  },

  getRevenueAnalytics: async () => {
    const response = await api.get(`${BASE_URL}/analytics/revenue`);
    return response.data;
  },

  // ========================================
  // SECURITY & COMPLIANCE
  // ========================================

  getGlobalAuditLogs: async (page = 0, size = 50) => {
    const response = await api.get(`${BASE_URL}/security/audit-logs`, {
      params: { page, size }
    });
    return response.data;
  },

  getSecurityAlerts: async () => {
    const response = await api.get(`${BASE_URL}/security/alerts`);
    return response.data;
  },

  getGlobalLoginHistory: async () => {
    const response = await api.get(`${BASE_URL}/security/login-history`);
    return response.data;
  },

  forcePasswordReset: async (email) => {
    const response = await api.post(`${BASE_URL}/security/force-password-reset`, null, {
      params: { email }
    });
    return response.data;
  },

  disableAccount: async (userId) => {
    const response = await api.post(`${BASE_URL}/security/disable-account`, null, {
      params: { userId }
    });
    return response.data;
  },

  // ========================================
  // PLATFORM CONFIGURATION
  // ========================================

  getPlatformConfig: async () => {
    const response = await api.get(`${BASE_URL}/config`);
    return response.data;
  },

  updatePlatformConfig: async (config) => {
    const response = await api.put(`${BASE_URL}/config`, config);
    return response.data;
  },

  toggleMaintenanceMode: async (enabled) => {
    const response = await api.post(`${BASE_URL}/config/maintenance-mode`, null, {
      params: { enabled }
    });
    return response.data;
  },

  updateFeatureFlags: async (flags) => {
    const response = await api.put(`${BASE_URL}/config/feature-flags`, flags);
    return response.data;
  },

  // ========================================
  // PLATFORM INTEGRATIONS
  // ========================================

  getIntegrations: async () => {
    const response = await api.get(`${BASE_URL}/integrations`);
    return response.data;
  },

  updatePaymentGateway: async (config) => {
    const response = await api.put(`${BASE_URL}/integrations/payment`, config);
    return response.data;
  },

  updateEmailProvider: async (config) => {
    const response = await api.put(`${BASE_URL}/integrations/email`, config);
    return response.data;
  },

  // ========================================
  // SYSTEM MONITORING & DEBUGGING
  // ========================================

  getSystemErrors: async (page = 0, size = 50) => {
    const response = await api.get(`${BASE_URL}/monitoring/errors`, {
      params: { page, size }
    });
    return response.data;
  },

  getBackendLogs: async (lines = 100) => {
    const response = await api.get(`${BASE_URL}/monitoring/logs`, {
      params: { lines }
    });
    return response.data;
  },

  retryFailedJobs: async () => {
    const response = await api.post(`${BASE_URL}/monitoring/retry-jobs`);
    return response.data;
  },

  // ========================================
  // ADDITIONAL FEATURES - BULK OPERATIONS
  // ========================================

  bulkSuspendTenants: async (tenantIds, reason) => {
    const promises = tenantIds.map(id => 
      api.put(`${BASE_URL}/tenants/${id}/suspend`, null, { params: { reason } })
    );
    return await Promise.all(promises);
  },

  bulkActivateTenants: async (tenantIds) => {
    const promises = tenantIds.map(id => 
      api.put(`${BASE_URL}/tenants/${id}/activate`)
    );
    return await Promise.all(promises);
  },

  bulkDeleteTenants: async (tenantIds) => {
    const promises = tenantIds.map(id => 
      api.delete(`${BASE_URL}/tenants/${id}`)
    );
    return await Promise.all(promises);
  },

  bulkAssignPlan: async (tenantIds, planName) => {
    const promises = tenantIds.map(id => 
      api.post(`${BASE_URL}/tenants/${id}/assign-plan`, null, { params: { planName } })
    );
    return await Promise.all(promises);
  },

  // ========================================
  // ADVANCED FILTERING & SEARCH
  // ========================================

  searchTenants: async (query, filters) => {
    // Client-side filtering for now
    const allTenants = await superAdminService.getAllTenants();
    let filtered = allTenants;

    if (query) {
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(query.toLowerCase()) ||
        t.subdomain?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters?.plan && filters.plan !== 'all') {
      filtered = filtered.filter(t => t.plan === filters.plan);
    }

    if (filters?.minUsers) {
      filtered = filtered.filter(t => t.userCount >= filters.minUsers);
    }

    if (filters?.maxUsers) {
      filtered = filtered.filter(t => t.userCount <= filters.maxUsers);
    }

    return filtered;
  },

  // ========================================
  // NOTIFICATIONS & ANNOUNCEMENTS
  // ========================================

  sendPlatformAnnouncement: async (announcement) => {
    // Mock implementation - implement backend endpoint
    console.log('Sending announcement:', announcement);
    return { success: true, message: 'Announcement sent' };
  },

  sendTenantNotification: async (tenantId, notification) => {
    // Mock implementation - implement backend endpoint
    console.log('Sending notification to tenant:', tenantId, notification);
    return { success: true, message: 'Notification sent' };
  },

  // ========================================
  // BACKUP & RESTORE
  // ========================================

  createPlatformBackup: async () => {
    // Mock implementation - implement backend endpoint
    console.log('Creating platform backup');
    return { success: true, backupId: Date.now() };
  },

  listBackups: async () => {
    // Mock implementation - implement backend endpoint
    return [
      { id: 1, date: new Date().toISOString(), size: '2.5 GB', status: 'completed' },
      { id: 2, date: new Date(Date.now() - 86400000).toISOString(), size: '2.4 GB', status: 'completed' }
    ];
  },

  restoreBackup: async (backupId) => {
    // Mock implementation - implement backend endpoint
    console.log('Restoring backup:', backupId);
    return { success: true, message: 'Backup restored' };
  },

  // ========================================
  // REPORTS & EXPORTS
  // ========================================

  generatePlatformReport: async (reportType, dateRange) => {
    // Mock implementation - implement backend endpoint
    console.log('Generating report:', reportType, dateRange);
    return { 
      success: true, 
      reportUrl: '/reports/platform-report.pdf',
      generatedAt: new Date().toISOString()
    };
  },

  exportAllData: async (format = 'csv') => {
    // Mock implementation - implement backend endpoint
    console.log('Exporting all data in format:', format);
    return { 
      success: true, 
      downloadUrl: `/exports/platform-data.${format}`
    };
  },

  // ========================================
  // SYSTEM HEALTH CHECKS
  // ========================================

  runHealthCheck: async () => {
    // Mock implementation - implement backend endpoint
    return {
      database: { status: 'healthy', responseTime: '23ms' },
      redis: { status: 'healthy', responseTime: '5ms' },
      storage: { status: 'healthy', available: '500GB' },
      email: { status: 'healthy', lastSent: new Date().toISOString() },
      payment: { status: 'healthy', lastTransaction: new Date().toISOString() }
    };
  },

  // ========================================
  // API RATE LIMITING
  // ========================================

  getApiRateLimits: async () => {
    // Mock implementation - implement backend endpoint
    return {
      global: { limit: 10000, used: 3456, remaining: 6544 },
      perTenant: { limit: 1000, averageUsed: 234 }
    };
  },

  updateApiRateLimit: async (tenantId, limit) => {
    // Mock implementation - implement backend endpoint
    console.log('Updating rate limit for tenant:', tenantId, limit);
    return { success: true, message: 'Rate limit updated' };
  }
};

export default superAdminService;