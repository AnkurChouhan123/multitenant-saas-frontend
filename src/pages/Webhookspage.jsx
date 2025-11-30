import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import webhookService from '../services/webhookService';

const WebhooksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: 'user.created,user.updated'
  });

  const availableEvents = [
    { value: 'user.created', label: 'User Created', icon: '👤' },
    { value: 'user.updated', label: 'User Updated', icon: '✏️' },
    { value: 'user.deleted', label: 'User Deleted', icon: '🗑️' },
    { value: 'subscription.changed', label: 'Subscription Changed', icon: '💳' },
    { value: 'payment.success', label: 'Payment Success', icon: '✅' },
    { value: 'payment.failed', label: 'Payment Failed', icon: '❌' },
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await webhookService.getWebhooksByTenant(user.tenantId);
      setWebhooks(data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setError('Failed to load webhooks');
      addToast('Failed to load webhooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await webhookService.createWebhook(user.tenantId, user.userId, formData);
      addToast('Webhook created successfully!', 'success');
      setShowModal(false);
      setFormData({ name: '', url: '', events: 'user.created,user.updated' });
      fetchWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create webhook';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    }
  };

  const handleTest = async (webhookId, name) => {
    try {
      await webhookService.testWebhook(webhookId);
      addToast(`✅ Test sent to "${name}"`, 'success');
    } catch (error) {
      addToast(`❌ Test failed: ${error.response?.data?.message || 'Unknown error'}`, 'error');
    }
  };

  const handleToggle = async (webhook) => {
    try {
      await webhookService.updateWebhook(webhook.id, {
        ...webhook,
        isActive: !webhook.isActive
      });
      addToast(`Webhook ${!webhook.isActive ? 'enabled' : 'disabled'}`, 'success');
      fetchWebhooks();
    } catch (error) {
      addToast('Failed to update webhook', 'error');
    }
  };

  const handleDelete = async (webhookId, name) => {
    if (!window.confirm(`Delete webhook "${name}"? This action cannot be undone.`)) return;
    
    try {
      await webhookService.deleteWebhook(webhookId);
      addToast('Webhook deleted successfully', 'success');
      fetchWebhooks();
    } catch (error) {
      addToast('Failed to delete webhook', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading webhooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 flex items-center transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Receive real-time event notifications ({webhooks.length} configured)
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 font-medium transition transform hover:scale-105 shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Webhook
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {webhooks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🪝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No webhooks configured</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first webhook to receive real-time event notifications
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105"
            >
              + Create Your First Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {webhooks.map((webhook) => (
              <div 
                key={webhook.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition p-6 border-l-4 border-primary-500"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {webhook.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono break-all">
                      {webhook.url}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-4 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                      webhook.isActive 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {webhook.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                </div>

                {/* Events Section */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📋 Events Subscribed:</p>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.split(',').map((event) => {
                      const eventObj = availableEvents.find(e => e.value === event.trim());
                      return (
                        <span 
                          key={event} 
                          className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full flex items-center space-x-1"
                        >
                          <span>{eventObj?.icon || '🔔'}</span>
                          <span>{event.trim()}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Stats Section */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Success</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {webhook.successCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Failed</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {webhook.failureCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Triggered</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {webhook.lastTriggeredAt 
                          ? new Date(webhook.lastTriggeredAt).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleTest(webhook.id, webhook.name)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center space-x-1"
                    title="Send a test request to this webhook"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Test</span>
                  </button>
                  
                  <button
                    onClick={() => handleToggle(webhook)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center space-x-1 ${
                      webhook.isActive
                        ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40'
                        : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40'
                    }`}
                    title={webhook.isActive ? 'Disable this webhook' : 'Enable this webhook'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>{webhook.isActive ? 'Disable' : 'Enable'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(webhook.id, webhook.name)}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center space-x-1 ml-auto"
                    title="Delete this webhook"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Webhook Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl">
            <form onSubmit={handleCreate}>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Webhook</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Set up a new webhook to receive event notifications
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Modal Body */}
              <div className="px-6 py-4 space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="User Events Webhook"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A descriptive name for this webhook</p>
                </div>

                {/* URL Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="https://api.example.com/webhook"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The endpoint that will receive webhook events</p>
                </div>

                {/* Events Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Events *
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-3 max-h-56 overflow-y-auto bg-white dark:bg-gray-700">
                    {availableEvents.map((event) => (
                      <label key={event.value} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded transition">
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event.value)}
                          onChange={(e) => {
                            const events = formData.events.split(',').filter(Boolean);
                            if (e.target.checked) {
                              events.push(event.value);
                            } else {
                              const index = events.indexOf(event.value);
                              if (index > -1) events.splice(index, 1);
                            }
                            setFormData({...formData, events: events.join(',')});
                          }}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          <span className="mr-2">{event.icon}</span>
                          {event.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {formData.events.split(',').filter(Boolean).length} event(s) selected
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Webhook events will be sent to your URL as POST requests 
                    with event details in the JSON body.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setFormData({
                      name: '',
                      url: '',
                      events: 'user.created,user.updated'
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition font-medium"
                >
                  Create Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhooksPage;