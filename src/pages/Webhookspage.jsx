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
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: 'user.created,user.updated'
  });

  const availableEvents = [
    { value: 'user.created', label: 'User Created' },
    { value: 'user.updated', label: 'User Updated' },
    { value: 'user.deleted', label: 'User Deleted' },
    { value: 'subscription.changed', label: 'Subscription Changed' },
    { value: 'payment.success', label: 'Payment Success' },
    { value: 'payment.failed', label: 'Payment Failed' },
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const data = await webhookService.getWebhooksByTenant(user.tenantId);
      setWebhooks(data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      addToast('Failed to load webhooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await webhookService.createWebhook(user.tenantId, user.userId, formData);
      addToast('Webhook created successfully!', 'success');
      setShowModal(false);
      setFormData({ name: '', url: '', events: 'user.created,user.updated' });
      fetchWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
      addToast('Failed to create webhook', 'error');
    }
  };

  const handleTest = async (webhookId, name) => {
    try {
      await webhookService.testWebhook(webhookId);
      addToast(`Test sent to "${name}"`, 'success');
    } catch (error) {
      addToast('Test failed', 'error');
    }
  };

  const handleToggle = async (webhook) => {
    try {
      await webhookService.updateWebhook(webhook.id, {
        ...webhook,
        isActive: !webhook.isActive
      });
      addToast(`Webhook ${webhook.isActive ? 'disabled' : 'enabled'}`, 'success');
      fetchWebhooks();
    } catch (error) {
      addToast('Failed to update webhook', 'error');
    }
  };

  const handleDelete = async (webhookId, name) => {
    if (!window.confirm(`Delete webhook "${name}"?`)) return;
    
    try {
      await webhookService.deleteWebhook(webhookId);
      addToast('Webhook deleted', 'success');
      fetchWebhooks();
    } catch (error) {
      addToast('Failed to delete webhook', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
              <p className="text-sm text-gray-500">Receive real-time event notifications</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              + Create Webhook
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {webhooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No webhooks configured</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First Webhook
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{webhook.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{webhook.url}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      webhook.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {webhook.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Events:</p>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.split(',').map((event) => (
                      <span key={event} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {event.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div>
                    <span className="font-medium">Success:</span> {webhook.successCount || 0}
                  </div>
                  <div>
                    <span className="font-medium">Failed:</span> {webhook.failureCount || 0}
                  </div>
                  <div>
                    <span className="font-medium">Last triggered:</span>{' '}
                    {webhook.lastTriggeredAt 
                      ? new Date(webhook.lastTriggeredAt).toLocaleString()
                      : 'Never'}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleTest(webhook.id, webhook.name)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleToggle(webhook)}
                    className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                  >
                    {webhook.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(webhook.id, webhook.name)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Webhook</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Webhook URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://api.example.com/webhook"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Events</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {availableEvents.map((event) => (
                      <label key={event.value} className="flex items-center">
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
                          className="mr-2"
                        />
                        <span className="text-sm">{event.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create
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