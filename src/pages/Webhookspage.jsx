import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import webhookService from '../services/webhookService';
import { FormInput, FormButton } from '../components/common/FormComponents';
import { ArrowLeft, Plus, RefreshCw, Link as LinkIcon, Activity, Trash2, Play, BarChart3 } from 'lucide-react';
import { canManageWebhooks, USER_ROLES } from '../utils/roleUtils';

const WebhooksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [webhookStats, setWebhookStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(null);

  // Check if user can manage webhooks
  // Only TENANT_OWNER and TENANT_ADMIN can manage webhooks
  // SUPER_ADMIN, USER, and VIEWER cannot access by default
  const userCanManage = canManageWebhooks(user?.role);

  // Wait for auth to load and then decide what to do.
  useEffect(() => {
    // If user is not loaded yet, wait.
    if (!user) return;

    // If user can manage, fetch webhooks.
    if (userCanManage) {
      fetchWebhooks();
      return;
    }

    // User loaded but doesn't have permission -> stop loading and show Access Denied UI.
    setLoading(false);
    // Do not redirect. We intentionally *do not* call navigate() or show error toast here.
    // If you still want a toast, uncomment the line below:
    // addToast('You do not have permission to manage webhooks', 'error');
  }, [user, userCanManage]);

  const fetchWebhooks = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const data = await webhookService.getWebhooksByTenant(user.tenantId);
      console.log('✅ Fetched webhooks:', data);
      setWebhooks(data);
    } catch (error) {
      console.error('❌ Error fetching webhooks:', error);
      addToast('Failed to load webhooks', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    console.log('📤 Creating webhook with data:', formData);
    
    try {
      await webhookService.createWebhook(user.tenantId, user.userId, formData);
      console.log('✅ Webhook created successfully');
      addToast('Webhook created successfully!', 'success');
      setShowModal(false);
      setFormData({
        name: '',
        url: '',
        events: '',
        isActive: true,
      });
      fetchWebhooks();
    } catch (err) {
      console.error('❌ Failed to create webhook:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create webhook';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (webhookId, webhookName) => {
    if (!window.confirm(`Delete webhook "${webhookName}"?`)) return;
    
    try {
      await webhookService.deleteWebhook(webhookId);
      addToast('Webhook deleted successfully!', 'success');
      fetchWebhooks();
    } catch (error) {
      console.error('❌ Failed to delete webhook:', error);
      addToast('Failed to delete webhook', 'error');
    }
  };

  const handleTest = async (webhookId, webhookName) => {
    setTestingWebhook(webhookId);
    try {
      const response = await webhookService.testWebhook(webhookId);
      addToast(`Webhook "${webhookName}" tested successfully!`, 'success');
      console.log('Test response:', response);
    } catch (error) {
      console.error('❌ Failed to test webhook:', error);
      addToast(`Failed to test webhook "${webhookName}"`, 'error');
    } finally {
      setTestingWebhook(null);
    }
  };

  const handleToggleStatus = async (webhook) => {
    try {
      await webhookService.updateWebhook(webhook.id, {
        ...webhook,
        isActive: !webhook.isActive
      });
      addToast(`Webhook ${webhook.isActive ? 'disabled' : 'enabled'}!`, 'success');
      fetchWebhooks();
    } catch (error) {
      console.error('❌ Failed to toggle webhook status:', error);
      addToast('Failed to update webhook status', 'error');
    }
  };

  const handleViewStats = async (webhook) => {
    setSelectedWebhook(webhook);
    setShowStatsModal(true);
    setLoadingStats(true);
    
    try {
      const stats = await webhookService.getWebhookStats(webhook.id);
      setWebhookStats(stats);
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      addToast('Failed to load webhook statistics', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const getEventBadges = (events) => {
    if (!events) return [];
    return events.split(',').map(e => e.trim()).filter(Boolean);
  };

  // If loading (auth not finished or fetching webhooks)
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-purple-500 dark:text-purple-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading webhooks...</p>
        </div>
      </div>
    );
  }

  // If user is loaded but does NOT have permission, show Access Denied (keeps same route & header)
  if (!userCanManage) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen">
        {/* Page Header (same look as normal header to keep context) */}
        <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition transform" />
              Back to Dashboard
            </button>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  🔗 Webhooks
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Access information for this tenant
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchWebhooks()}
                  disabled
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-400 font-semibold rounded-lg transition opacity-50 cursor-not-allowed"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-white font-semibold rounded-lg transition shadow-lg opacity-50 cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Webhook</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Access Denied card */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-10 text-center shadow-lg max-w-2xl mx-auto">
            <div className="text-6xl mb-4">⛔</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don’t have permission to view or manage webhooks for this tenant.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Please contact your Tenant Owner if you believe this is an error.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition shadow-md"
              >
                Go Back to Dashboard
              </button>
              {/* <button
                onClick={() => addToast('Request sent to tenant owner (not implemented)', 'info')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 transition"
              >
                Request Access
              </button> */}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ------------------------------------------
  // MAIN (userCanManage === true)
  // ------------------------------------------
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Page Header */}
      <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition transform" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                🔗 Webhooks
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchWebhooks}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Webhook</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Webhooks List */}
        {webhooks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-lg">
            <div className="text-5xl sm:text-6xl mb-4">🔗</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">No webhooks configured</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first webhook to receive real-time notifications
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Webhook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                        {webhook.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <LinkIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{webhook.url}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(webhook)}
                      className={`flex-shrink-0 ml-3 px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                        webhook.isActive
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {webhook.isActive ? '✓ Active' : '✗ Inactive'}
                    </button>
                  </div>

                  {/* Events */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-400 mb-2">Events:</p>
                    <div className="flex flex-wrap gap-2">
                      {getEventBadges(webhook.events).map((event, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Success</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {webhook.successCount || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Failed</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {webhook.failureCount || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {(webhook.successCount || 0) + (webhook.failureCount || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Last Triggered */}
                  {webhook.lastTriggeredAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTest(webhook.id, webhook.name)}
                      disabled={testingWebhook === webhook.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 rounded-lg transition disabled:opacity-50"
                    >
                      {testingWebhook === webhook.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Test
                    </button>
                    
                    <button
                      onClick={() => handleViewStats(webhook)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800/50 rounded-lg transition"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Stats
                    </button>
                    
                    <button
                      onClick={() => handleDelete(webhook.id, webhook.name)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Webhook Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl z-50 max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Webhook</h2>
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-semibold">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Webhook Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="My Webhook"
                  helperText="A friendly name for this webhook"
                />
                
                <FormInput
                  label="Webhook URL"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  placeholder="https://your-domain.com/webhook"
                  helperText="The endpoint that will receive webhook notifications"
                />
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Events
                  </label>
                  <input
                    name="events"
                    value={formData.events}
                    onChange={handleChange}
                    required
                    placeholder="user.created, file.uploaded, payment.success"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Comma-separated list of events to listen for
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 dark:text-purple-400 rounded accent-purple-600"
                  />
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Enable webhook immediately
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2"
                  >
                    Cancel
                  </FormButton>
                  <FormButton
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="px-6 py-2"
                  >
                    Create Webhook
                  </FormButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedWebhook && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowStatsModal(false)}></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl z-50 max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Webhook Statistics
              </h2>
              
              {loadingStats ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-12 h-12 text-purple-500 dark:text-purple-400 mx-auto animate-spin" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading statistics...</p>
                </div>
              ) : webhookStats ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{webhookStats.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: <span className={`font-semibold ${webhookStats.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {webhookStats.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-300 font-semibold mb-1">Success Count</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {webhookStats.successCount}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-300 font-semibold mb-1">Failure Count</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {webhookStats.failureCount}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg">
                    <p className="text-sm text-purple-800 dark:text-purple-300 font-semibold mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {webhookStats.successRate?.toFixed(1)}%
                    </p>
                  </div>

                  {webhookStats.lastTriggered && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Triggered</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {new Date(webhookStats.lastTriggered).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No statistics available</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhooksPage;
