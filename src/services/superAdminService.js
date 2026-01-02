// src/services/superAdminService.js - ENHANCED WITH MORE FEATURES

import api from "./api";

const BASE_URL = "/superadmin";

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

  suspendTenant: async (tenantId, reason = "") => {
    const response = await api.put(
      `${BASE_URL}/tenants/${tenantId}/suspend`,
      null,
      {
        params: { reason },
      }
    );
    return response.data;
  },

  activateTenant: async (tenantId) => {
    const response = await api.put(`${BASE_URL}/tenants/${tenantId}/activate`);
    return response.data;
  },

  forceLogoutTenant: async (tenantId) => {
    const response = await api.post(
      `${BASE_URL}/tenants/${tenantId}/force-logout`
    );
    return response.data;
  },

  deleteTenant: async (tenantId) => {
    const response = await api.delete(`${BASE_URL}/tenants/${tenantId}`);
    return response.data;
  },

  impersonateTenantOwner: async (tenantId) => {
    const response = await api.post(
      `${BASE_URL}/tenants/${tenantId}/impersonate`
    );
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
    const response = await api.post(
      `${BASE_URL}/tenants/${tenantId}/assign-plan`,
      null,
      {
        params: { planName },
      }
    );
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
      params: { page, size },
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
    const response = await api.post(
      `${BASE_URL}/security/force-password-reset`,
      null,
      {
        params: { email },
      }
    );
    return response.data;
  },

  disableAccount: async (userId) => {
    const response = await api.post(
      `${BASE_URL}/security/disable-account`,
      null,
      {
        params: { userId },
      }
    );
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
    const response = await api.post(
      `${BASE_URL}/config/maintenance-mode`,
      null,
      {
        params: { enabled },
      }
    );
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

  // ========================================
  // NEW FEATURES - ADD TO YOUR EXISTING superAdminService.js
  // ========================================

  // TENANT DATA EXPORT & BACKUP
  exportTenantData: async (tenantId) => {
    const response = await api.post(
      `${BASE_URL}/tenants/${tenantId}/export`,
      null,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  bulkExportAllTenants: async () => {
    const response = await api.post(`${BASE_URL}/tenants/bulk-export`, null, {
      responseType: "blob",
    });
    return response.data;
  },

  // ADVANCED TENANT SEARCH
  searchTenantsAdvanced: async (filters) => {
    const params = new URLSearchParams();
    if (filters.name) params.append("name", filters.name);
    if (filters.status) params.append("status", filters.status);
    if (filters.plan) params.append("plan", filters.plan);
    if (filters.createdAfter)
      params.append("createdAfter", filters.createdAfter);
    if (filters.createdBefore)
      params.append("createdBefore", filters.createdBefore);
    if (filters.subscriptionActive !== undefined)
      params.append("subscriptionActive", filters.subscriptionActive);
    params.append("page", filters.page || 0);
    params.append("size", filters.size || 20);

    const response = await api.get(
      `${BASE_URL}/tenants/search?${params.toString()}`
    );
    return response.data;
  },

  // BULK OPERATIONS (Enhanced)
  bulkSuspendTenantsEnhanced: async (tenantIds, reason) => {
    const response = await api.post(
      `${BASE_URL}/tenants/bulk-suspend`,
      tenantIds,
      {
        params: { reason },
      }
    );
    return response.data;
  },

  bulkActivateTenantsEnhanced: async (tenantIds) => {
    const response = await api.post(
      `${BASE_URL}/tenants/bulk-activate`,
      tenantIds
    );
    return response.data;
  },

  bulkChangePlan: async (tenantIds, planName) => {
    const response = await api.post(
      `${BASE_URL}/tenants/bulk-change-plan`,
      tenantIds,
      {
        params: { planName },
      }
    );
    return response.data;
  },

  // REAL-TIME MONITORING
  getRealtimeMetrics: async () => {
    const response = await api.get(`${BASE_URL}/monitoring/realtime`);
    return response.data;
  },

  getResourceAlerts: async () => {
    const response = await api.get(`${BASE_URL}/monitoring/resource-alerts`);
    return response.data;
  },

  // TENANT COMMUNICATION
  sendAnnouncement: async (announcementData) => {
    const response = await api.post(
      `${BASE_URL}/communications/send-announcement`,
      announcementData
    );
    return response.data;
  },

  broadcastMessage: async (subject, message, urgency = "normal") => {
    const response = await api.post(
      `${BASE_URL}/communications/broadcast`,
      null,
      {
        params: { subject, message, urgency },
      }
    );
    return response.data;
  },

  // USAGE ANALYTICS & REPORTING
  generateCustomReport: async (
    reportType,
    startDate,
    endDate,
    format = "JSON"
  ) => {
    const response = await api.post(`${BASE_URL}/reports/generate`, null, {
      params: { reportType, startDate, endDate, format },
    });
    return response.data;
  },

  getUsageTrends: async (days = 30) => {
    const response = await api.get(`${BASE_URL}/analytics/usage-trends`, {
      params: { days },
    });
    return response.data;
  },

  getChurnAnalysis: async () => {
    const response = await api.get(`${BASE_URL}/analytics/churn`);
    return response.data;
  },

  // AUTOMATED ALERTS
  configureAlert: async (alertConfig) => {
    const response = await api.post(
      `${BASE_URL}/alerts/configure`,
      alertConfig
    );
    return response.data;
  },

  getAlertHistory: async (page = 0, size = 50) => {
    const response = await api.get(`${BASE_URL}/alerts/history`, {
      params: { page, size },
    });
    return response.data;
  },

  // DATABASE MANAGEMENT
  getDatabaseStats: async () => {
    const response = await api.get(`${BASE_URL}/database/stats`);
    return response.data;
  },

  optimizeDatabase: async () => {
    const response = await api.post(`${BASE_URL}/database/optimize`);
    return response.data;
  },

  createDatabaseBackup: async () => {
    const response = await api.post(`${BASE_URL}/database/backup`);
    return response.data;
  },

  // TENANT LIFECYCLE AUTOMATION
  cleanupInactiveTenants: async (inactiveDays, dryRun = true) => {
    const response = await api.post(
      `${BASE_URL}/automation/cleanup-inactive`,
      null,
      {
        params: { inactiveDays, dryRun },
      }
    );
    return response.data;
  },

  handleExpiredTrials: async () => {
    const response = await api.post(
      `${BASE_URL}/automation/handle-expired-trials`
    );
    return response.data;
  },

  scheduleTenantMigration: async (tenantId, targetRegion, scheduledTime) => {
    const response = await api.post(
      `${BASE_URL}/tenants/${tenantId}/schedule-migration`,
      null,
      {
        params: { targetRegion, scheduledTime },
      }
    );
    return response.data;
  },

  // API RATE LIMITING & QUOTA
  getTenantApiUsage: async (tenantId, days = 30) => {
    const response = await api.get(
      `${BASE_URL}/tenants/${tenantId}/api-usage`,
      {
        params: { days },
      }
    );
    return response.data;
  },

  setCustomRateLimit: async (tenantId, requestsPerHour) => {
    const response = await api.post(
      `${BASE_URL}/tenants/${tenantId}/set-rate-limit`,
      null,
      {
        params: { requestsPerHour },
      }
    );
    return response.data;
  },

  throttleTenant: async (tenantId, percentage, durationMinutes) => {
    const response = await api.post(
      `${BASE_URL}/tenants/${tenantId}/throttle`,
      null,
      {
        params: { percentage, durationMinutes },
      }
    );
    return response.data;
  },

  getSystemErrors: async (page = 0, size = 50) => {
    const response = await api.get(`${BASE_URL}/monitoring/errors`, {
      params: { page, size },
    });
    return response.data;
  },

  getBackendLogs: async (lines = 100) => {
    const response = await api.get(`${BASE_URL}/monitoring/logs`, {
      params: { lines },
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
    const promises = tenantIds.map((id) =>
      api.put(`${BASE_URL}/tenants/${id}/suspend`, null, { params: { reason } })
    );
    return await Promise.all(promises);
  },

  bulkActivateTenants: async (tenantIds) => {
    const promises = tenantIds.map((id) =>
      api.put(`${BASE_URL}/tenants/${id}/activate`)
    );
    return await Promise.all(promises);
  },

  bulkDeleteTenants: async (tenantIds) => {
    const promises = tenantIds.map((id) =>
      api.delete(`${BASE_URL}/tenants/${id}`)
    );
    return await Promise.all(promises);
  },

  bulkAssignPlan: async (tenantIds, planName) => {
    const promises = tenantIds.map((id) =>
      api.post(`${BASE_URL}/tenants/${id}/assign-plan`, null, {
        params: { planName },
      })
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
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(query.toLowerCase()) ||
          t.subdomain?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters?.plan && filters.plan !== "all") {
      filtered = filtered.filter((t) => t.plan === filters.plan);
    }

    if (filters?.minUsers) {
      filtered = filtered.filter((t) => t.userCount >= filters.minUsers);
    }

    if (filters?.maxUsers) {
      filtered = filtered.filter((t) => t.userCount <= filters.maxUsers);
    }

    return filtered;
  },

  // ========================================
  // NOTIFICATIONS & ANNOUNCEMENTS
  // ========================================

  sendPlatformAnnouncement: async (announcement) => {
    // Mock implementation - implement backend endpoint
    console.log("Sending announcement:", announcement);
    return { success: true, message: "Announcement sent" };
  },

  sendTenantNotification: async (tenantId, notification) => {
    // Mock implementation - implement backend endpoint
    console.log("Sending notification to tenant:", tenantId, notification);
    return { success: true, message: "Notification sent" };
  },

  // ========================================
  // BACKUP & RESTORE
  // ========================================

  createPlatformBackup: async () => {
    // Mock implementation - implement backend endpoint
    console.log("Creating platform backup");
    return { success: true, backupId: Date.now() };
  },

  listBackups: async () => {
    // Mock implementation - implement backend endpoint
    return [
      {
        id: 1,
        date: new Date().toISOString(),
        size: "2.5 GB",
        status: "completed",
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString(),
        size: "2.4 GB",
        status: "completed",
      },
    ];
  },

  restoreBackup: async (backupId) => {
    // Mock implementation - implement backend endpoint
    console.log("Restoring backup:", backupId);
    return { success: true, message: "Backup restored" };
  },

  // ========================================
  // REPORTS & EXPORTS
  // ========================================

  generatePlatformReport: async (reportType, dateRange) => {
    // Mock implementation - implement backend endpoint
    console.log("Generating report:", reportType, dateRange);
    return {
      success: true,
      reportUrl: "/reports/platform-report.pdf",
      generatedAt: new Date().toISOString(),
    };
  },

  exportAllData: async (format = "csv") => {
    // Mock implementation - implement backend endpoint
    console.log("Exporting all data in format:", format);
    return {
      success: true,
      downloadUrl: `/exports/platform-data.${format}`,
    };
  },

  // ========================================
  // SYSTEM HEALTH CHECKS
  // ========================================

  runHealthCheck: async () => {
    // Mock implementation - implement backend endpoint
    return {
      database: { status: "healthy", responseTime: "23ms" },
      redis: { status: "healthy", responseTime: "5ms" },
      storage: { status: "healthy", available: "500GB" },
      email: { status: "healthy", lastSent: new Date().toISOString() },
      payment: { status: "healthy", lastTransaction: new Date().toISOString() },
    };
  },

  // ========================================
  // API RATE LIMITING
  // ========================================

  getApiRateLimits: async () => {
    // Mock implementation - implement backend endpoint
    return {
      global: { limit: 10000, used: 3456, remaining: 6544 },
      perTenant: { limit: 1000, averageUsed: 234 },
    };
  },

  updateApiRateLimit: async (tenantId, limit) => {
    // Mock implementation - implement backend endpoint
    console.log("Updating rate limit for tenant:", tenantId, limit);
    return { success: true, message: "Rate limit updated" };
  },
};

export default superAdminService;
