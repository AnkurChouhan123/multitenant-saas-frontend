// frontend/src/pages/ApiKeysPage.jsx - FIXED

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import apiKeyService from '../services/apiKeyService';

const ApiKeysPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scopes: 'read,write',
    expiresInDays: 365
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔑 Fetching API keys for tenant:', user.tenantId);
      console.log('📤 User role:', user.role);
      console.log('📤 Token exists:', !!localStorage.getItem('token'));
      
      const data = await apiKeyService.getApiKeysByTenant(user.tenantId);
      
      console.log('✅ API keys fetched:', data.length);
      setApiKeys(data);
    } catch (error) {
      console.error('❌ Error fetching API keys:', error);
      console.error('❌ Error response:', error.response);
      
      if (error.response?.status === 403) {
        setError('Access denied. Only admins can manage API keys.');
        addToast('Access denied. Admin role required.', 'error');
      } else if (error.response?.status === 401) {
        setError('Unauthorized. Please login again.');
        addToast('Session expired. Please login again.', 'error');
      } else {
        setError('Failed to load API keys: ' + (error.response?.data?.message || error.message));
        addToast('Failed to load API keys', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      console.log('➕ Creating API key:', formData);
      
      await apiKeyService.createApiKey(user.tenantId, {
        userId: user.userId,
        ...formData
      });
      
      addToast('API Key created successfully!', 'success');
      setShowModal(false);
      setFormData({ name: '', scopes: 'read,write', expiresInDays: 365 });
      fetchApiKeys();
    } catch (error) {
      console.error('❌ Error creating API key:', error);
      
      if (error.response?.status === 403) {
        addToast('Access denied. Admin role required.', 'error');
      } else {
        addToast('Failed to create API key: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const handleRevoke = async (keyId, keyName) => {
    if (!window.confirm(`Revoke API key "${keyName}"?`)) return;
    
    try {
      await apiKeyService.revokeApiKey(keyId);
      addToast('API Key revoked', 'success');
      fetchApiKeys();
    } catch (error) {
      console.error('❌ Error revoking:', error);
      addToast('Failed to revoke API key', 'error');
    }
  };

  const handleDelete = async (keyId, keyName) => {
    if (!window.confirm(`Delete API key "${keyName}"? This cannot be undone.`)) return;
    
    try {
      await apiKeyService.deleteApiKey(keyId);
      addToast('API Key deleted', 'success');
      fetchApiKeys();
    } catch (error) {
      console.error('❌ Error deleting:', error);
      addToast('Failed to delete API key', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API keys...</p>
        </div>
      </div>
    );
  }

  // Show error if access denied
  if (error && (error.includes('Access denied') || error.includes('Unauthorized'))) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">Access Restricted</h3>
                <p className="mt-2 text-sm text-yellow-700">{error}</p>
                <p className="mt-2 text-sm text-yellow-700">
                  Your current role: <strong>{user.role}</strong>
                </p>
                <p className="mt-2 text-sm text-yellow-700">
                  Required role: <strong>TENANT_ADMIN or SUPER_ADMIN</strong>
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
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
              <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
              <p className="text-sm text-gray-500">Manage API keys for external integrations</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              + Create API Key
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && !error.includes('Access denied') && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchApiKeys}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {apiKeys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔑</div>
            <p className="text-gray-500 mb-4">No API keys yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first API key to integrate with external services</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First API Key
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scopes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{key.name}</div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {key.keyValue.substring(0, 20)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.keyValue)}
                          className="text-primary-600 hover:text-primary-700"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {key.scopes}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.usageCount || 0} calls
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {key.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {key.isActive && (
                        <button
                          onClick={() => handleRevoke(key.id, key.name)}
                          className="text-yellow-600 hover:text-yellow-700 mr-3"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(key.id, key.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create API Key</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Production API Key"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scopes *</label>
                  <select
                    value={formData.scopes}
                    onChange={(e) => setFormData({...formData, scopes: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="read">Read Only</option>
                    <option value="read,write">Read & Write</option>
                    <option value="read,write,delete">Full Access</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expires In (Days)</label>
                  <input
                    type="number"
                    value={formData.expiresInDays}
                    onChange={(e) => setFormData({...formData, expiresInDays: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                    max="3650"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave as 365 for 1 year expiration</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', scopes: 'read,write', expiresInDays: 365 });
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeysPage;