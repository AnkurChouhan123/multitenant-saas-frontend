import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import superAdminService from '../services/superAdminService';
import StatsCard from '../components/common/StatsCard';
import { 
  Building2, DollarSign, Activity, TrendingUp, Shield, Settings, 
  Database, Server, Users, CreditCard, BarChart3, 
  Pause, Play, Trash2, UserCheck, Search, RefreshCw, Plus, 
  Download, CheckCircle, XCircle, Edit, Mail,
  Zap, AlertTriangle, Power, Code, ArrowLeft
} from 'lucide-react';

// Separate component for the create plan form to isolate state
const CreatePlanForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    maxUsers: -1,
    maxStorage: -1,
    maxApiCalls: -1,
    features: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Plan name is required');
      return;
    }
    if (!formData.price) {
      alert('Price is required');
      return;
    }

    setSubmitting(true);
    try {
      const planData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        maxUsers: parseInt(formData.maxUsers),
        maxStorage: parseInt(formData.maxStorage),
        maxApiCalls: parseInt(formData.maxApiCalls),
        features: formData.features,
        description: formData.description
      };

      await superAdminService.createPlan(planData);
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Plan</h3>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Plan Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Professional, Enterprise"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Price (USD/month) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          placeholder="99.00"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Brief description of the plan"
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Resource Limits</h4>
        <p className="text-xs text-gray-500 mb-3">Leave as -1 for unlimited</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Users</label>
            <input
              type="number"
              value={formData.maxUsers}
              onChange={(e) => setFormData({...formData, maxUsers: e.target.value})}
              placeholder="-1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Storage (GB)</label>
            <input
              type="number"
              value={formData.maxStorage}
              onChange={(e) => setFormData({...formData, maxStorage: e.target.value})}
              placeholder="-1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max API Calls</label>
            <input
              type="number"
              value={formData.maxApiCalls}
              onChange={(e) => setFormData({...formData, maxApiCalls: e.target.value})}
              placeholder="-1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Features (optional)</label>
        <textarea
          value={formData.features}
          onChange={(e) => setFormData({...formData, features: e.target.value})}
          placeholder="Feature 1, Feature 2, Feature 3"
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !formData.name.trim() || !formData.price}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {submitting ? 'Creating...' : 'Create Plan'}
        </button>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [platformStats, setPlatformStats] = useState(null);
  const [platformHealth, setPlatformHealth] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [globalAnalytics, setGlobalAnalytics] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'overview') {
        await Promise.all([
          loadPlatformStats(),
          loadPlatformHealth()
        ]);
      } else if (activeTab === 'tenants') {
        await loadTenants();
      } else if (activeTab === 'plans') {
        await Promise.all([
          loadPlans(),
          loadSubscriptions()
        ]);
      } else if (activeTab === 'analytics') {
        await loadGlobalAnalytics();
      } else if (activeTab === 'security') {
        await Promise.all([
          loadSecurityAlerts(),
          loadLoginHistory(),
          loadAuditLogs()
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformStats = async () => {
    try {
      const data = await superAdminService.getPlatformStats();
      setPlatformStats(data);
    } catch (error) {
      setPlatformStats({ totalTenants: 0, totalUsers: 0, mrr: 0, activeTenants: 0 });
    }
  };

  const loadPlatformHealth = async () => {
    try {
      const data = await superAdminService.getPlatformHealth();
      setPlatformHealth(data);
    } catch (error) {
      setPlatformHealth({ status: 'unknown', database: 'unknown' });
    }
  };

  const loadTenants = async () => {
    try {
      const data = await superAdminService.getAllTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (error) {
      setTenants([]);
      showToast('Failed to load tenants', 'error');
    }
  };

  const loadPlans = async () => {
    try {
      const data = await superAdminService.getAllPlans();
      console.log('Plans loaded:', data);
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load plans:', error);
      setPlans([]);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const data = await superAdminService.getAllSubscriptions();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      setSubscriptions([]);
    }
  };

  const loadGlobalAnalytics = async () => {
    try {
      const data = await superAdminService.getGlobalAnalytics();
      setGlobalAnalytics(data);
    } catch (error) {
      setGlobalAnalytics({ totalRevenue: 0, totalUsers: 0, apiCalls: 0 });
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      const data = await superAdminService.getSecurityAlerts();
      setSecurityAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      setSecurityAlerts([]);
    }
  };

  const loadLoginHistory = async () => {
    try {
      const data = await superAdminService.getGlobalLoginHistory();
      setLoginHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoginHistory([]);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await superAdminService.getGlobalAuditLogs();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      setAuditLogs([]);
    }
  };

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
    if (!window.confirm('Suspend this tenant?')) return;
    try {
      const reason = window.prompt('Reason (optional):');
      await superAdminService.suspendTenant(tenantId, reason);
      showToast('Tenant suspended', 'success');
      loadTenants();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to suspend', 'error');
    }
  };

  const handleActivateTenant = async (tenantId) => {
    try {
      await superAdminService.activateTenant(tenantId);
      showToast('Tenant activated', 'success');
      loadTenants();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to activate', 'error');
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!window.confirm('Delete this tenant? This action cannot be undone.')) return;
    try {
      await superAdminService.deleteTenant(tenantId);
      showToast('Tenant deleted', 'success');
      loadTenants();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const handleImpersonate = async (tenantId) => {
    if (!window.confirm('Impersonate this tenant owner?')) return;
    try {
      const res = await superAdminService.impersonateTenantOwner(tenantId);
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('email', res.email);
        localStorage.setItem('firstName', res.firstName);
        localStorage.setItem('lastName', res.lastName);
        localStorage.setItem('role', res.role);
        localStorage.setItem('tenantId', res.tenantId);
        localStorage.setItem('tenantName', res.tenantName);
        localStorage.setItem('subdomain', res.subdomain);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to impersonate', 'error');
    }
  };

  const handleAssignPlan = async (tenantId, planName) => {
    if (!planName) return;
    try {
      await superAdminService.assignPlanToTenant(tenantId, planName);
      showToast('Plan assigned successfully', 'success');
      loadTenants();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to assign plan', 'error');
    }
  };

  const handlePlanCreated = async () => {
    showToast('Plan created successfully!', 'success');
    await loadPlans();
  };

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
    await loadData();
    showToast('Data refreshed', 'success');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) {
      showToast('No data to export', 'error');
      return;
    }
    try {
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Exported successfully', 'success');
    } catch (error) {
      showToast('Export failed', 'error');
    }
  };

  const LoadingState = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );

  const ErrorState = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
      <p className="text-red-700 font-medium mb-3">{message}</p>
      <button onClick={onRetry} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
        Retry
      </button>
    </div>
  );

  const ToastUI = () => {
    if (!toast.show) return null;
    const bgColor = toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    return (
      <div className={`fixed right-6 top-6 z-50 p-4 rounded-lg shadow-lg ${bgColor} text-white max-w-sm`}> 
        <div className="flex items-center gap-3">
          <div className="text-xl">{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</div>
          <div className="text-sm font-medium">{toast.message}</div>
        </div>
      </div>
    );
  };

  const Modal = ({ open, onClose, children }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
            <h3 className="text-xl font-bold text-gray-900">
              {modalType === 'createTenant' ? 'Create New Tenant' : 
               modalType === 'createPlan' ? 'Create New Plan' : 'Modal'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  const filteredTenants = tenants.filter(t => {
    const matchSearch = !searchTerm || 
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.subdomain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const renderOverview = () => {
    if (error) return <ErrorState message={error} onRetry={loadData} />;
    if (loading) return <LoadingState />;
    if (!platformStats) return <EmptyState message="No data available" />;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            icon={<Building2 />} 
            title="Total Tenants" 
            value={platformStats.totalTenants || 0} 
            trendValue={`${platformStats.activeTenants || 0} active`} 
            color="blue" 
          />
          <StatsCard 
            icon={<Users />} 
            title="Total Users" 
            value={(platformStats.totalUsers || 0).toLocaleString()} 
            trendValue={`${platformStats.dau || 0} daily active`} 
            color="green" 
          />
          <StatsCard 
            icon={<DollarSign />} 
            title="MRR" 
            value={`$${(platformStats.mrr || 0).toLocaleString()}`} 
            trendValue="Monthly Recurring" 
            color="purple" 
          />
          <StatsCard 
            icon={<Activity />} 
            title="API Calls" 
            value={`${((platformStats.totalApiCalls || 0)/1e6).toFixed(1)}M`} 
            trendValue="Last 30 days" 
            color="orange" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold ${(platformHealth?.status === 'healthy' || platformHealth?.status === 'HEALTHY') ? 'text-green-600' : 'text-red-600'}`}>
                  {platformHealth?.status || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold text-gray-900">{platformStats.uptime || 99.9}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database</span>
                <span className={`font-semibold ${(platformHealth?.database === 'connected' || platformHealth?.database === 'CONNECTED') ? 'text-green-600' : 'text-red-600'}`}>
                  {platformHealth?.database || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-semibold text-gray-900">{platformStats.errorRate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Tenant Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold text-gray-900">{platformStats.activeTenants || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trial</span>
                <span className="font-semibold text-gray-900">{platformStats.trialTenants || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Suspended</span>
                <span className="font-semibold text-gray-900">{platformStats.suspendedTenants || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">DAU</span>
                <span className="font-semibold text-gray-900">{platformStats.dau || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTenants = () => {
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search tenants..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <button 
              onClick={() => exportCSV(tenants, 'tenants')} 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => openModal('createTenant')} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Tenant
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredTenants.length === 0 ? (
          <EmptyState message="No tenants found" />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTenants.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.subdomain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        t.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        t.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={t.plan || ''} 
                        onChange={(e) => handleAssignPlan(t.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Plan</option>
                        {plans.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.userCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {t.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => handleSuspendTenant(t.id)} 
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                            title="Suspend"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : t.status === 'SUSPENDED' ? (
                          <button 
                            onClick={() => handleActivateTenant(t.id)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Activate"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button 
                          onClick={() => handleImpersonate(t.id)} 
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                          title="Impersonate"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTenant(t.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderPlans = () => {
    if (error) return <ErrorState message={error} onRetry={loadData} />;
    if (loading) return <LoadingState />;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
          <button 
            onClick={() => openModal('createPlan')} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <EmptyState message="No plans created yet" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-blue-600">${p.price || 0}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {p.maxUsers === -1 ? 'Unlimited' : p.maxUsers} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    {p.maxStorage === -1 ? 'Unlimited' : `${p.maxStorage} GB`} storage
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    {p.maxApiCalls === -1 ? 'Unlimited' : p.maxApiCalls.toLocaleString()} API calls
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Tenants:</span>
                    <span className="font-semibold text-gray-900">{p.tenantCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (error) return <ErrorState message={error} onRetry={loadData} />;
    if (loading) return <LoadingState />;
    if (!globalAnalytics) return <EmptyState message="No analytics data available" />;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">${(globalAnalytics.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">MRR: ${(globalAnalytics.mrr || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{(globalAnalytics.totalUsers || 0).toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-2">MAU: {(globalAnalytics.mau || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">API Usage</h3>
            <p className="text-3xl font-bold text-gray-900">{((globalAnalytics.apiCalls || 0)/1e6).toFixed(2)}M</p>
            <p className="text-sm text-orange-600 mt-2">Last 30 days</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSecurity = () => {
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Security Alerts
          </h3>
          {loading ? (
            <LoadingState />
          ) : securityAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">No security alerts</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {securityAlerts.map((alert, i) => (
                <li key={i} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{alert.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{alert.description}</div>
                    <div className="text-xs text-gray-400 mt-2">{formatDate(alert.timestamp)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Login Activity
            </h3>
            {loading ? (
              <LoadingState />
            ) : loginHistory.length === 0 ? (
              <EmptyState message="No login history available" />
            ) : (
              <div className="space-y-2">
                {loginHistory.slice(0, 10).map((login, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{login.userEmail}</div>
                      <div className="text-xs text-gray-500">{login.ipAddress}</div>
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(login.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-600" />
              Audit Logs
            </h3>
            {loading ? (
              <LoadingState />
            ) : auditLogs.length === 0 ? (
              <EmptyState message="No audit logs available" />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLogs.map((log, i) => (
                  <div key={i} className="text-sm py-2 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">by {log.actor}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Platform management and monitoring</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh} 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.email}</span>
              </div>
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 py-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'tenants', label: 'Tenants', icon: <Building2 className="w-4 h-4" /> },
              { id: 'plans', label: 'Plans', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tenants' && renderTenants()}
        {activeTab === 'plans' && renderPlans()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'security' && renderSecurity()}
      </div>

      <Modal open={showModal} onClose={closeModal}>
        {modalType === 'createTenant' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={modalData.name || ''}
                onChange={(e) => setModalData({...modalData, name: e.target.value})}
                placeholder="Acme Corporation"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
              <input
                type="text"
                value={modalData.subdomain || ''}
                onChange={(e) => setModalData({...modalData, subdomain: e.target.value})}
                placeholder="acme"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Will be: {modalData.subdomain || 'subdomain'}.platform.com</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTenant}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Tenant
              </button>
            </div>
          </div>
        )}

        {modalType === 'createPlan' && (
          <CreatePlanForm onClose={closeModal} onSuccess={handlePlanCreated} />
        )}
      </Modal>

      <ToastUI />
    </div>
  );
};

export default SuperAdminDashboard;