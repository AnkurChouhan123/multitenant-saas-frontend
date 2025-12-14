// src/pages/SuperAdminDashboard.jsx - FIXED AND COMPLETE
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import superAdminService from '../services/superAdminService';
import StatsCard from '../components/common/StatsCard';
import { 
  Building2, DollarSign, Activity, TrendingUp, Shield, Settings, 
  Database, Server, Lock, Users, CreditCard, BarChart3, 
  Pause, Play, Trash2, UserCheck, Search, RefreshCw, Plus, 
  Download, CheckCircle, XCircle, ArrowLeft, Edit, Mail,
  Zap, AlertTriangle, Eye, Power, FileText, Code
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data States
  const [platformStats, setPlatformStats] = useState(null);
  const [platformHealth, setPlatformHealth] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [globalAnalytics, setGlobalAnalytics] = useState(null);
  const [platformUsage, setPlatformUsage] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loginHistory, setLoginHistory] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [platformConfig, setPlatformConfig] = useState(null);
  const [integrations, setIntegrations] = useState(null);
  const [systemErrors, setSystemErrors] = useState([]);
  const [backendLogs, setBackendLogs] = useState([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        await Promise.all([loadPlatformStats(), loadPlatformHealth()]);
      } else if (activeTab === 'tenants') {
        await loadTenants();
      } else if (activeTab === 'plans') {
        await Promise.all([loadPlans(), loadSubscriptions()]);
      } else if (activeTab === 'analytics') {
        await Promise.all([loadGlobalAnalytics(), loadPlatformUsage(), loadRevenueAnalytics()]);
      } else if (activeTab === 'security') {
        await Promise.all([loadSecurityAlerts(), loadLoginHistory(), loadAuditLogs()]);
      } else if (activeTab === 'config') {
        await loadPlatformConfig();
      } else if (activeTab === 'integrations') {
        await loadIntegrations();
      } else if (activeTab === 'monitoring') {
        await Promise.all([loadSystemErrors(), loadBackendLogs()]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // API Calls
  const loadPlatformStats = async () => {
    const data = await superAdminService.getPlatformStats();
    setPlatformStats(data);
  };

  const loadPlatformHealth = async () => {
    const data = await superAdminService.getPlatformHealth();
    setPlatformHealth(data);
  };

  const loadTenants = async () => {
    const data = await superAdminService.getAllTenants();
    setTenants(data);
  };

  const loadPlans = async () => {
    const data = await superAdminService.getAllPlans();
    setPlans(data);
  };

  const loadSubscriptions = async () => {
    const data = await superAdminService.getAllSubscriptions();
    setSubscriptions(data);
  };

  const loadGlobalAnalytics = async () => {
    const data = await superAdminService.getGlobalAnalytics();
    setGlobalAnalytics(data);
  };

  const loadPlatformUsage = async () => {
    const data = await superAdminService.getPlatformUsage();
    setPlatformUsage(data);
  };

  const loadRevenueAnalytics = async () => {
    const data = await superAdminService.getRevenueAnalytics();
    setRevenueAnalytics(data);
  };

  const loadSecurityAlerts = async () => {
    const data = await superAdminService.getSecurityAlerts();
    setSecurityAlerts(data);
  };

  const loadLoginHistory = async () => {
    const data = await superAdminService.getGlobalLoginHistory();
    setLoginHistory(data);
  };

  const loadAuditLogs = async () => {
    const data = await superAdminService.getGlobalAuditLogs();
    setAuditLogs(data);
  };

  const loadPlatformConfig = async () => {
    const data = await superAdminService.getPlatformConfig();
    setPlatformConfig(data);
  };

  const loadIntegrations = async () => {
    const data = await superAdminService.getIntegrations();
    setIntegrations(data);
  };

  const loadSystemErrors = async () => {
    const data = await superAdminService.getSystemErrors();
    setSystemErrors(data);
  };

  const loadBackendLogs = async () => {
    const data = await superAdminService.getBackendLogs();
    setBackendLogs(data);
  };

  // Tenant Actions
  const handleCreateTenant = async () => {
    if (!modalData.name || !modalData.subdomain) {
      showToast('Please fill all fields', 'error');
      return;
    }
    try {
      await superAdminService.createTenant(modalData);
      showToast('Tenant created successfully', 'success');
      closeModal();
      loadTenants();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create tenant', 'error');
    }
  };

  const handleSuspendTenant = async (tenantId) => {
    if (!confirm('Suspend this tenant?')) return;
    try {
      const reason = prompt('Reason (optional):');
      await superAdminService.suspendTenant(tenantId, reason);
      showToast('Tenant suspended', 'success');
      loadTenants();
    } catch (error) {
      showToast('Failed to suspend', 'error');
    }
  };

  const handleActivateTenant = async (tenantId) => {
    try {
      await superAdminService.activateTenant(tenantId);
      showToast('Tenant activated', 'success');
      loadTenants();
    } catch (error) {
      showToast('Failed to activate', 'error');
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!confirm('Delete this tenant? Cannot be undone.')) return;
    try {
      await superAdminService.deleteTenant(tenantId);
      showToast('Tenant deleted', 'success');
      loadTenants();
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleImpersonate = async (tenantId) => {
    if (!confirm('Impersonate this tenant owner?')) return;
    try {
      const res = await superAdminService.impersonateTenantOwner(tenantId);
      localStorage.setItem('token', res.token);
      window.location.href = '/dashboard';
    } catch (error) {
      showToast('Failed to impersonate', 'error');
    }
  };

  const handleForceLogout = async (tenantId) => {
    if (!confirm('Force logout all users of this tenant?')) return;
    try {
      await superAdminService.forceLogoutTenant(tenantId);
      showToast('All users logged out', 'success');
    } catch (error) {
      showToast('Failed to force logout', 'error');
    }
  };

  const handleAssignPlan = async (tenantId, planName) => {
    try {
      await superAdminService.assignPlanToTenant(tenantId, planName);
      showToast('Plan assigned successfully', 'success');
      loadTenants();
    } catch (error) {
      showToast('Failed to assign plan', 'error');
    }
  };

  const handleCreatePlan = async () => {
    try {
      await superAdminService.createPlan(modalData);
      showToast('Plan created successfully', 'success');
      closeModal();
      loadPlans();
    } catch (error) {
      showToast('Failed to create plan', 'error');
    }
  };

  const handleForcePasswordReset = async () => {
    const email = prompt('Enter user email:');
    if (!email) return;
    try {
      await superAdminService.forcePasswordReset(email);
      showToast('Password reset email sent', 'success');
    } catch (error) {
      showToast('Failed to reset password', 'error');
    }
  };

  const handleDisableAccount = async () => {
    const userId = prompt('Enter user ID:');
    if (!userId) return;
    try {
      await superAdminService.disableAccount(parseInt(userId));
      showToast('Account disabled', 'success');
    } catch (error) {
      showToast('Failed to disable account', 'error');
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await superAdminService.updatePlatformConfig(platformConfig);
      showToast('Configuration updated', 'success');
    } catch (error) {
      showToast('Failed to update configuration', 'error');
    }
  };

  const handleToggleMaintenance = async (enabled) => {
    if (!confirm(`${enabled ? 'Enable' : 'Disable'} maintenance mode?`)) return;
    try {
      await superAdminService.toggleMaintenanceMode(enabled);
      showToast(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
      loadPlatformConfig();
    } catch (error) {
      showToast('Failed to toggle maintenance mode', 'error');
    }
  };

  const handleRetryFailedJobs = async () => {
    if (!confirm('Retry all failed jobs?')) return;
    try {
      const result = await superAdminService.retryFailedJobs();
      showToast(result.message, 'success');
    } catch (error) {
      showToast('Failed to retry jobs', 'error');
    }
  };

  // Helper Functions
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setModalData({});
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    showToast('Data refreshed', 'success');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) {
      showToast('No data to export', 'error');
      return;
    }
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(r => headers.map(h => JSON.stringify(r[h] || '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Exported successfully', 'success');
  };

  // Small UI helpers
  const LoadingState = () => (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
        <span className="text-gray-600 font-medium">Loading...</span>
      </div>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">{message}</div>
  );

  const styles = {
    primaryBtn: 'px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
    secondaryBtn: 'px-3 py-2 border rounded-md bg-white hover:bg-gray-50',
    subtleBtn: 'px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200',
    card: 'bg-white rounded-lg shadow-sm p-6',
    tabActive: 'bg-blue-600 text-white',
    tabInactive: 'bg-white border',
    iconBtnSmall: 'w-8 h-8 inline-flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100'
  };

  const IconButton = ({ onClick, icon, title, variant = 'default' }) => (
    <button onClick={onClick} title={title} className={styles.iconBtnSmall}>{icon}</button>
  );

  const HealthRow = ({ label, value, good }) => (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-sm font-medium ${good ? 'text-green-600' : 'text-red-600'}`}>{value}</div>
    </div>
  );

  const MetricRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );

  // Modal UI
  const Modal = ({ open, onClose, children }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div />
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  // Simple toast based on local state
  const ToastUI = () => {
    if (!toast.show) return null;
    const bg = toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    return (
      <div className={`fixed right-6 top-6 z-50 p-4 rounded-lg shadow-lg ${bg} text-white max-w-sm`}> 
        <div className="flex items-start gap-3">
          <div className="text-xl">{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</div>
          <div className="text-sm font-medium">{toast.message}</div>
        </div>
      </div>
    );
  };

  const filteredTenants = tenants.filter(t => {
    const match = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  t.subdomain?.toLowerCase().includes(searchTerm.toLowerCase());
    const filter = filterStatus === 'all' || t.status === filterStatus;
    return match && filter;
  });

  // RENDER FUNCTIONS
  const renderOverview = () => {
    if (!platformStats || !platformHealth) return <LoadingState />;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={<Building2 />} title="Total Tenants" value={platformStats.totalTenants || 0} 
            trendValue={`${platformStats.activeTenants || 0} active`} color="blue" />
          <StatsCard icon={<Users />} title="Total Users" value={(platformStats.totalUsers || 0).toLocaleString()} 
            trendValue={`${platformStats.dau || 0} today`} color="green" />
          <StatsCard icon={<DollarSign />} title="MRR" value={`$${(platformStats.mrr || 0).toLocaleString()}`} 
            trendValue="Monthly" color="purple" />
          <StatsCard icon={<Activity />} title="API Calls" value={`${((platformStats.totalApiCalls || 0)/1e6).toFixed(1)}M`} 
            trendValue="Last 30 days" color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />System Health
            </h3>
            <div className="space-y-3">
              <HealthRow label="Status" value={platformHealth.status || 'Unknown'} good={platformHealth.status === 'healthy'} />
              <HealthRow label="Uptime" value={`${platformStats.uptime || 0}%`} good={platformStats.uptime > 99} />
              <HealthRow label="Error Rate" value={`${platformStats.errorRate || 0}%`} good={platformStats.errorRate < 1} />
              <HealthRow label="Storage" value={`${(platformStats.totalStorageGB || 0).toFixed(2)} GB`} good={true} />
              <HealthRow label="Database" value={platformHealth.database || 'Unknown'} good={platformHealth.database === 'connected'} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />Tenant Breakdown
            </h3>
            <div className="space-y-3">
              <MetricRow label="Active" value={platformStats.activeTenants || 0} />
              <MetricRow label="Trial" value={platformStats.trialTenants || 0} />
              <MetricRow label="Suspended" value={platformStats.suspendedTenants || 0} />
              <MetricRow label="DAU" value={platformStats.dau || 0} />
              <MetricRow label="MAU" value={platformStats.mau || 0} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTenants = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-300" />
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg">
            <option value="all">All</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <button onClick={() => exportCSV(tenants, 'tenants')} 
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />Export
          </button>
          <button onClick={() => openModal('createTenant')} 
            className={`${styles.primaryBtn} flex items-center gap-2`}>
            <Plus className="w-4 h-4" />New
          </button>
        </div>
      </div>

      {loading ? <LoadingState /> : filteredTenants.length === 0 ? 
        <EmptyState message="No tenants found" /> :
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Calls</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTenants.map(t => (
              <tr key={t.id} className="even:bg-gray-50 hover:bg-gray-100">
                <td className="px-6 py-4">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.subdomain}.platform.com</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    t.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    t.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'}`}>{t.status}</span>
                </td>
                <td className="px-6 py-4">
                  <select value={t.plan || ''} onChange={(e) => handleAssignPlan(t.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1">
                    <option value="">Select Plan</option>
                    {plans.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">{t.userCount || 0}</td>
                <td className="px-6 py-4 text-sm">{(t.storageUsedGB || 0).toFixed(2)} GB</td>
                <td className="px-6 py-4 text-sm">{(t.apiCallCount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {t.status === 'ACTIVE' ? 
                      <IconButton onClick={() => handleSuspendTenant(t.id)} icon={<Pause className="w-4 h-4" />} 
                        title="Suspend" color="orange" /> :
                      t.status === 'SUSPENDED' ?
                      <IconButton onClick={() => handleActivateTenant(t.id)} icon={<Play className="w-4 h-4" />} 
                        title="Activate" color="green" /> : null}
                    <IconButton onClick={() => handleImpersonate(t.id)} icon={<UserCheck className="w-4 h-4" />} 
                      title="Impersonate" color="purple" />
                    <IconButton onClick={() => handleForceLogout(t.id)} icon={<Power className="w-4 h-4" />} 
                      title="Force Logout" color="yellow" />
                    <IconButton onClick={() => handleDeleteTenant(t.id)} icon={<Trash2 className="w-4 h-4" />} 
                      title="Delete" color="red" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );

  const renderPlans = () => {
    if (loading) return <LoadingState />;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Subscription Plans</h2>
          <button onClick={() => openModal('createPlan')} 
            className={`${styles.primaryBtn} flex items-center gap-2`}>
            <Plus className="w-4 h-4" />Create Plan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{p.name}</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600">${p.price || 0}</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {p.maxUsers === -1 ? 'Unlimited' : p.maxUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {p.maxStorage === -1 ? 'Unlimited' : `${p.maxStorage} GB`}
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {p.maxApiCalls === -1 ? 'Unlimited' : p.maxApiCalls.toLocaleString()} calls
                </div>
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tenants:</span>
                  <span className="font-semibold">{p.tenantCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold">${((p.price || 0) * (p.tenantCount || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {subscriptions && subscriptions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Active Subscriptions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subscriptions.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{s.tenantName}</td>
                      <td className="px-4 py-3 text-sm font-medium">{s.plan}</td>
                      <td className="px-4 py-3 text-sm">${s.revenue}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(s.startDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(s.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (loading || !globalAnalytics) return <LoadingState />;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">${(globalAnalytics.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">MRR: ${(globalAnalytics.mrr || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{(globalAnalytics.totalUsers || 0).toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-1">MAU: {(globalAnalytics.mau || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">API Usage</h3>
            <p className="text-3xl font-bold text-gray-900">{((globalAnalytics.apiCalls || 0)/1e6).toFixed(2)}M</p>
            <p className="text-sm text-orange-600 mt-1">Last 30 days</p>
          </div>
        </div>

        {revenueAnalytics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />Revenue Trends
            </h3>
            <div className="text-sm text-gray-600 mb-2">Total for period: <strong>${(revenueAnalytics.total || 0).toLocaleString()}</strong></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(revenueAnalytics.byMonth || []).map((m, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">{m.month}</div>
                  <div className="font-bold">${m.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Shield className="w-5 h-5 text-red-600" />Security Alerts</h3>
        {securityAlerts.length === 0 ? <EmptyState message="No alerts" /> : (
          <ul className="space-y-2">
            {securityAlerts.map((a, i) => (
              <li key={i} className="flex items-start gap-3 p-3 border rounded">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-sm text-gray-500">{a.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{formatDate(a.timestamp)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Login History</h3>
          {(!loginHistory || loginHistory.length === 0) ? <EmptyState message="No login history" /> : (
            <div className="space-y-2 text-sm text-gray-700">
              {loginHistory.map((l, i) => (
                <div key={i} className="flex justify-between">
                  <div>{l.userEmail}</div>
                  <div className="text-gray-500">{formatDate(l.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Audit Logs</h3>
          {auditLogs.length === 0 ? <EmptyState message="No audit logs" /> : (
            <div className="space-y-2 text-sm text-gray-700 max-h-64 overflow-auto">
              {auditLogs.map((a, i) => (
                <div key={i} className="text-xs text-gray-600 border-b py-2">{formatDate(a.timestamp)} — {a.action} by {a.actor}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Settings className="w-5 h-5 text-gray-700" />Platform Configuration</h3>
          <div className="flex gap-2">
            <button onClick={() => handleToggleMaintenance(!platformConfig?.maintenance)} className={`${styles.secondaryBtn} bg-yellow-500 text-white`}>{platformConfig?.maintenance ? 'Disable Maintenance' : 'Enable Maintenance'}</button>
            <button onClick={handleUpdateConfig} className={`${styles.primaryBtn}`}>Save</button>
          </div>
        </div>
        {!platformConfig ? <EmptyState message="No configuration" /> : (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between"><div>Maintenance</div><div>{platformConfig.maintenance ? 'Enabled' : 'Disabled'}</div></div>
            <div className="flex justify-between"><div>Feature Flags</div><div>{Object.keys(platformConfig.featureFlags || {}).length} flags</div></div>
            <div className="flex justify-between"><div>Default Plan</div><div>{platformConfig.defaultPlan || '—'}</div></div>
          </div>
        )}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3"><Zap className="w-5 h-5 text-indigo-600" />Integrations</h3>
        {!integrations ? <EmptyState message="No integrations configured" /> : (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between"><div>Email Provider</div><div>{integrations.email?.provider || 'Not configured'}</div></div>
            <div className="flex justify-between"><div>Payment Gateway</div><div>{integrations.payment?.provider || 'Not configured'}</div></div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Code className="w-5 h-5 text-gray-700" />System Errors</h3>
          <div className="flex gap-2">
            <button onClick={() => handleRetryFailedJobs()} className={`${styles.primaryBtn}`}>Retry Jobs</button>
            <button onClick={() => exportCSV(systemErrors, 'system_errors')} className={`${styles.secondaryBtn}`}>Export</button>
          </div>
        </div>
        {systemErrors.length === 0 ? <EmptyState message="No errors" /> : (
          <div className="space-y-2 text-sm text-gray-700 max-h-64 overflow-auto">
            {systemErrors.map((e, i) => (
              <div key={i} className="border-b py-2">
                <div className="font-medium">{e.message}</div>
                <div className="text-xs text-gray-500">{formatDate(e.timestamp)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Backend Logs</h3>
        <pre className="bg-gray-50 p-4 rounded max-h-64 overflow-auto text-xs">{backendLogs.join('\n')}</pre>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Platform Admin</h1>
            <div className="text-sm text-gray-500">Super admin overview and controls</div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} className={`${styles.subtleBtn} flex items-center gap-2`}><RefreshCw className="w-4 h-4" />Refresh</button>
            <button onClick={() => exportCSV(tenants, 'tenants')} className={`${styles.secondaryBtn} flex items-center gap-2`}><Download className="w-4 h-4" />Export</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Signed in as <strong>{user?.email}</strong></div>
          <button onClick={logout} className="px-3 py-2 bg-red-500 text-white rounded">Logout</button>
        </div>
      </div>

      <div className="mb-6">
        <nav className="flex gap-2 flex-wrap">
          {['overview','tenants','plans','analytics','security','config','integrations','monitoring'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab===tab ? styles.tabActive : styles.tabInactive}`}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tenants' && renderTenants()}
        {activeTab === 'plans' && renderPlans()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'config' && renderConfig()}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'monitoring' && renderMonitoring()}
      </div>

      <Modal open={showModal} onClose={closeModal}>
        {modalType === 'createTenant' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Create Tenant</h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={modalData.name || ''} onChange={(e) => setModalData({...modalData, name: e.target.value})} placeholder="Name" className="block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
              <label className="block text-sm font-medium text-gray-700">Subdomain</label>
              <input value={modalData.subdomain || ''} onChange={(e) => setModalData({...modalData, subdomain: e.target.value})} placeholder="Subdomain" className="block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
              <div className="flex justify-end gap-2">
                <button onClick={closeModal} className={`${styles.secondaryBtn}`}>Cancel</button>
                <button onClick={handleCreateTenant} className={`${styles.primaryBtn}`}>Create</button>
              </div>
            </div>
          </div>
        )}

        {modalType === 'createPlan' && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Create Plan</h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={modalData.name || ''} onChange={(e) => setModalData({...modalData, name: e.target.value})} placeholder="Name" className="block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input value={modalData.price || ''} onChange={(e) => setModalData({...modalData, price: parseFloat(e.target.value || 0)})} placeholder="Price" type="number" className="block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
              <div className="flex justify-end gap-2">
                <button onClick={closeModal} className={`${styles.secondaryBtn}`}>Cancel</button>
                <button onClick={handleCreatePlan} className={`${styles.primaryBtn}`}>Create</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ToastUI />
    </div>
  );

    };

    export default SuperAdminDashboard;