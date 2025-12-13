import React, { useState, useEffect } from 'react';
import { Building2, DollarSign, Activity, TrendingUp, Shield, Settings, Database, Server, AlertTriangle, Lock, Zap, Mail, Code, Flag, Wrench, Users, Globe, CreditCard, BarChart3, Bell, Power, Pause, Play, Trash2, Eye, UserCheck, Clock, CheckCircle, XCircle, Search, Filter, RefreshCw, Plus, Edit } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Platform-wide data (aggregates only)
  const [platformStats, setPlatformStats] = useState({
    totalTenants: 127,
    activeTenants: 98,
    suspendedTenants: 12,
    trialTenants: 17,
    totalUsers: 3420,
    dau: 1250,
    mau: 2890,
    mrr: 45670.00,
    totalRevenue: 156780.00,
    apiCalls: 4567890,
    storageUsed: 456.7, // GB
    errorRate: 0.12,
    uptime: 99.97
  });

  const [tenants, setTenants] = useState([
    { id: 1, name: 'Acme Corp', subdomain: 'acme', status: 'ACTIVE', plan: 'PRO', userCount: 45, storage: 23.4, apiCalls: 45670, createdAt: '2024-01-15', lastActive: '2024-12-13 10:30' },
    { id: 2, name: 'TechStart Inc', subdomain: 'techstart', status: 'TRIAL', plan: 'FREE', userCount: 5, storage: 1.2, apiCalls: 2340, createdAt: '2024-11-20', lastActive: '2024-12-13 09:15' },
    { id: 3, name: 'GlobalSoft', subdomain: 'globalsoft', status: 'ACTIVE', plan: 'ENTERPRISE', userCount: 150, storage: 89.5, apiCalls: 234560, createdAt: '2023-08-10', lastActive: '2024-12-13 11:45' },
    { id: 4, name: 'StartupHub', subdomain: 'startuphub', status: 'SUSPENDED', plan: 'BASIC', userCount: 15, storage: 4.3, apiCalls: 0, createdAt: '2024-06-05', lastActive: '2024-11-28 14:20' },
  ]);

  const [plans, setPlans] = useState([
    { id: 1, name: 'FREE', price: 0, maxUsers: 5, maxStorage: 5, maxApiCalls: 1000, features: 'Basic features', active: true, tenantCount: 17 },
    { id: 2, name: 'BASIC', price: 29.99, maxUsers: 25, maxStorage: 50, maxApiCalls: 10000, features: 'All basic features', active: true, tenantCount: 42 },
    { id: 3, name: 'PRO', price: 99.99, maxUsers: 100, maxStorage: 200, maxApiCalls: 50000, features: 'Advanced features', active: true, tenantCount: 56 },
    { id: 4, name: 'ENTERPRISE', price: 299.99, maxUsers: -1, maxStorage: -1, maxApiCalls: -1, features: 'Unlimited everything', active: true, tenantCount: 12 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', subdomain: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Export data to CSV
  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportTenants = () => {
    exportToCSV(tenants, 'tenants');
    alert('Tenants exported successfully');
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Tab: Platform Overview
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Building2 />} title="Total Tenants" value={platformStats.totalTenants} subtitle={`${platformStats.activeTenants} active`} trend="+8%" color="blue" />
        <StatCard icon={<Users />} title="Total Users" value={platformStats.totalUsers.toLocaleString()} subtitle={`${platformStats.dau} active today`} trend="+12%" color="green" />
        <StatCard icon={<DollarSign />} title="MRR" value={`$${platformStats.mrr.toLocaleString()}`} subtitle="Monthly recurring" trend="+15%" color="purple" />
        <StatCard icon={<Activity />} title="API Calls" value={`${(platformStats.apiCalls / 1000000).toFixed(1)}M`} subtitle="Last 30 days" trend="+5%" color="orange" />
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            System Health
          </h3>
          <div className="space-y-4">
            <HealthMetric label="Uptime" value={`${platformStats.uptime}%`} status="good" />
            <HealthMetric label="Error Rate" value={`${platformStats.errorRate}%`} status="good" />
            <HealthMetric label="Database" value="Healthy" status="good" />
            <HealthMetric label="Storage Used" value={`${platformStats.storageUsed} GB`} status="good" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Growth Metrics
          </h3>
          <div className="space-y-4">
            <GrowthMetric label="New Tenants (30d)" value="23" change="+18%" />
            <GrowthMetric label="Total Revenue" value={`$${platformStats.totalRevenue.toLocaleString()}`} change="+15%" />
            <GrowthMetric label="MAU" value={platformStats.mau.toLocaleString()} change="+12%" />
            <GrowthMetric label="DAU" value={platformStats.dau.toLocaleString()} change="+8%" />
          </div>
        </div>
      </div>

      {/* Recent Platform Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Activity</h3>
        <div className="space-y-3">
          <ActivityItem icon={<Plus className="w-4 h-4 text-green-600" />} text="New tenant registered: TechStart Inc" time="2 hours ago" />
          <ActivityItem icon={<AlertTriangle className="w-4 h-4 text-orange-600" />} text="Tenant suspended due to payment failure: StartupHub" time="5 hours ago" />
          <ActivityItem icon={<TrendingUp className="w-4 h-4 text-blue-600" />} text="Acme Corp upgraded to PRO plan" time="1 day ago" />
          <ActivityItem icon={<Lock className="w-4 h-4 text-red-600" />} text="Security alert: 3 failed login attempts detected" time="2 days ago" />
        </div>
      </div>
    </div>
  );

  // Tab: Tenant Management
  const renderTenants = () => (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tenants by name or subdomain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
              onClick={handleExportTenants}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => setShowCreateTenantModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Calls</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTenants.map(tenant => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{tenant.name}</div>
                    <div className="text-sm text-gray-500">{tenant.subdomain}.platform.com</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    tenant.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{tenant.plan}</td>
                <td className="px-6 py-4 text-sm">{tenant.userCount}</td>
                <td className="px-6 py-4 text-sm">{tenant.storage} GB</td>
                <td className="px-6 py-4 text-sm">{tenant.apiCalls.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{tenant.lastActive}</td>
                                  <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert('View tenant details')}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {tenant.status === 'ACTIVE' ? (
                      <button 
                        onClick={() => handleSuspendTenant(tenant.id)}
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded" 
                        title="Suspend"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : tenant.status === 'SUSPENDED' ? (
                      <button 
                        onClick={() => handleActivateTenant(tenant.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded" 
                        title="Activate"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : null}
                    <button 
                      onClick={() => handleImpersonate(tenant.id)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded" 
                      title="Impersonate Owner"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded" 
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
    </div>
  );

  // Tab: Subscription Plans
  const renderPlans = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6 relative">
            <div className="absolute top-4 right-4">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-blue-600">${plan.price}</span>
              <span className="text-gray-500">/month</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers} users
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                {plan.maxStorage === -1 ? 'Unlimited' : `${plan.maxStorage} GB`} storage
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {plan.maxApiCalls === -1 ? 'Unlimited' : plan.maxApiCalls.toLocaleString()} API calls
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active tenants:</span>
                <span className="font-semibold">{plan.tenantCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Tab: Global Analytics
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">${platformStats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">+15% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-gray-900">{platformStats.mau.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">+12% growth</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">API Usage</h3>
          <p className="text-3xl font-bold text-gray-900">{(platformStats.apiCalls / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-green-600 mt-1">+5% increase</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Usage (Last 30 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UsageMetric label="Storage Usage" value={`${platformStats.storageUsed} GB`} max="1000 GB" percentage={45.7} />
          <UsageMetric label="API Calls" value={`${(platformStats.apiCalls / 1000000).toFixed(1)}M`} max="10M" percentage={45.7} />
          <UsageMetric label="Daily Active Users" value={platformStats.dau.toLocaleString()} max={platformStats.totalUsers.toLocaleString()} percentage={36.5} />
          <UsageMetric label="Monthly Active Users" value={platformStats.mau.toLocaleString()} max={platformStats.totalUsers.toLocaleString()} percentage={84.5} />
        </div>
      </div>
    </div>
  );

  // Tab: Security & Compliance
  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Security Alerts
          </h3>
          <div className="space-y-3">
            <SecurityAlert type="warning" text="15 failed login attempts detected" time="2 hours ago" />
            <SecurityAlert type="info" text="New IP access from unusual location" time="5 hours ago" />
            <SecurityAlert type="success" text="All systems secure" time="Ongoing" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Login Activity (24h)
          </h3>
          <div className="space-y-3">
            <LoginStat label="Total Logins" value="1,234" />
            <LoginStat label="Failed Attempts" value="23" />
            <LoginStat label="Unique IPs" value="856" />
            <LoginStat label="Suspicious Activity" value="2" />
          </div>
        </div>
      </div>
    </div>
  );

  // Tab: Platform Configuration
  const renderPlatformConfig = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
        <div className="space-y-4">
          <ConfigInput label="Platform Name" value="SaaS Platform" />
          <ConfigInput label="Support Email" value="support@platform.com" />
          <ConfigInput label="Default Subdomain" value=".platform.com" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConfigInput label="Max File Upload (MB)" type="number" value="10" />
          <ConfigInput label="API Rate Limit (/hour)" type="number" value="1000" />
          <ConfigInput label="Session Timeout (min)" type="number" value="120" />
          <ConfigInput label="Trial Period (days)" type="number" value="14" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Feature Flags</h3>
        <div className="space-y-4">
          <FeatureToggle label="Allow New Registrations" enabled={true} />
          <FeatureToggle label="Maintenance Mode" enabled={false} />
          <FeatureToggle label="Email Notifications" enabled={true} />
          <FeatureToggle label="Webhooks" enabled={true} />
        </div>
      </div>
    </div>
  );

  // Tab: Integrations
  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntegrationCard
          icon={<CreditCard className="w-6 h-6" />}
          name="Payment Gateway"
          description="Stripe, Razorpay"
          status="connected"
          color="green"
        />
        <IntegrationCard
          icon={<Mail className="w-6 h-6" />}
          name="Email Provider"
          description="SendGrid, AWS SES"
          status="connected"
          color="blue"
        />
        <IntegrationCard
          icon={<Bell className="w-6 h-6" />}
          name="SMS Provider"
          description="Twilio, SNS"
          status="not-configured"
          color="gray"
        />
        <IntegrationCard
          icon={<Globe className="w-6 h-6" />}
          name="OAuth Providers"
          description="Google, GitHub"
          status="connected"
          color="purple"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
                <p className="text-sm text-gray-500">Platform Management Console</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 />} label="Overview" />
            <TabButton active={activeTab === 'tenants'} onClick={() => setActiveTab('tenants')} icon={<Building2 />} label="Tenants" />
            <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={<CreditCard />} label="Plans" />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<Activity />} label="Analytics" />
            <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Lock />} label="Security" />
            <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings />} label="Config" />
            <TabButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={<Zap />} label="Integrations" />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tenants' && renderTenants()}
        {activeTab === 'plans' && renderPlans()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'config' && renderPlatformConfig()}
        {activeTab === 'integrations' && renderIntegrations()}
      </main>

      {/* Create Tenant Modal */}
      {showCreateTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Create New Tenant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTenant.subdomain}
                    onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value.toLowerCase() })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="acme"
                  />
                  <span className="text-sm text-gray-500">.platform.com</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateTenantModal(false);
                  setNewTenant({ name: '', subdomain: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTenant}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Tenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Components
const StatCard = ({ icon, title, value, subtitle, trend, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>{icon}</div>
      <span className="text-green-600 text-sm font-medium">{trend}</span>
    </div>
    <p className="text-sm text-gray-600 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
);

const HealthMetric = ({ label, value, status }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <span className="text-sm text-gray-700">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold">{value}</span>
      {status === 'good' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
    </div>
  </div>
);

const GrowthMetric = ({ label, value, change }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <span className="text-sm text-gray-700">{label}</span>
    <div className="text-right">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-xs text-green-600">{change}</div>
    </div>
  </div>
);

const ActivityItem = ({ icon, text, time }) => (
  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
    <div className="mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-gray-900">{text}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </div>
);

const UsageMetric = ({ label, value, max, percentage }) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="text-gray-700">{label}</span>
      <span className="text-gray-600">{value} / {max}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

const SecurityAlert = ({ type, text, time }) => {
  const colors = {
    warning: 'text-orange-600 bg-orange-50',
    info: 'text-blue-600 bg-blue-50',
    success: 'text-green-600 bg-green-50'
  };
  return (
    <div className={`p-3 rounded-lg ${colors[type]}`}>
      <p className="text-sm font-medium">{text}</p>
      <p className="text-xs mt-1">{time}</p>
    </div>
  );
};

const LoginStat = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
    <span className="text-sm text-gray-700">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ConfigInput = ({ label, type = 'text', value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      defaultValue={value}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const FeatureToggle = ({ label, enabled }) => {
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const IntegrationCard = ({ icon, name, description, status, color }) => {
  const statusColors = {
    connected: 'bg-green-100 text-green-800',
    'not-configured': 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800'
  };

  const iconColors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColors[color]}`}>
          {icon}
        </div>
        <span className={`px-3 py-1 text-xs rounded-full ${statusColors[status]}`}>
          {status === 'connected' ? 'Connected' : status === 'not-configured' ? 'Not Configured' : 'Error'}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
        Configure
      </button>
    </div>
  );
};

export default SuperAdminDashboard;