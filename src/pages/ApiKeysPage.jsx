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
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scopes: 'read,write',
    expiresInDays: 365
  });

  const hasAdminAccess = ['TENANT_ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  useEffect(() => {
    if (hasAdminAccess) {
      fetchApiKeys();
    } else {
      setLoading(false);
      setError('Access denied. Only admins can manage API keys.');
    }
  }, [hasAdminAccess]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔑 Fetching API keys for tenant:', user.tenantId);
      const data = await apiKeyService.getApiKeysByTenant(user.tenantId);
      
      console.log('✅ API keys fetched:', data.length);
      setApiKeys(data);
    } catch (error) {
      console.error('❌ Error fetching API keys:', error);
      
      if (error.response?.status === 403) {
        setError('Access denied. Only admins can manage API keys.');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        addToast('Session expired. Please login again.', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to load API keys: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      console.log('➕ Creating API key:', formData);
      
      const response = await apiKeyService.createApiKey(user.tenantId, {
        userId: user.userId,
        ...formData
      });
      
      console.log('✅ API key created:', response);
      
      setNewlyCreatedKey(response);
      setShowModal(false);
      setShowKeyModal(true);
      
      addToast('API Key created successfully!', 'success');
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
    if (!window.confirm(`Revoke API key "${keyName}"? It will no longer work.`)) return;
    
    try {
      await apiKeyService.revokeApiKey(keyId);
      addToast('API Key revoked successfully', 'success');
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
      addToast('API Key deleted successfully', 'success');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center dark:text-gray-300">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading API keys...</p>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess || error?.includes('Access denied')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 flex items-center"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Keys</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-8 rounded-lg shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-xl font-medium text-yellow-800 dark:text-yellow-300 mb-2">🔒 Access Restricted</h3>
                <p className="text-yellow-700 dark:text-yellow-200 mb-3">{error || 'You do not have permission to access API key management.'}</p>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Your current role:</strong> 
                    <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {user?.role}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Required role:</strong> 
                    <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                      TENANT_ADMIN
                    </span>
                    <span className="mx-2">or</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold">
                      SUPER_ADMIN
                    </span>
                  </p>
                </div>

                <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-4">
                  API key management is restricted to administrators to ensure security. 
                  Please contact your system administrator if you need to manage API keys.
                </p>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition font-medium"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What are API Keys?</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                🔑 <strong>API Keys</strong> are used to authenticate external applications and services 
                that need to interact with your platform programmatically.
              </p>
              <p>
                🛡️ <strong>Security:</strong> Only administrators can create and manage API keys to prevent 
                unauthorized access to your data.
              </p>
              <p>
                💡 <strong>Need Access?</strong> Contact your administrator at <strong>{user?.tenantName}</strong> 
                to request API key management permissions.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Keys</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage API keys for external integrations</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 font-medium transition transform hover:scale-105 shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create API Key
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {apiKeys.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔑</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No API keys yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first API key to integrate with external services</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 font-medium transition transform hover:scale-105"
            >
              Create Your First API Key
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scopes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{key.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created: {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 rounded font-mono">
                          {key.keyValue.substring(0, 20)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.keyValue)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 p-1 hover:bg-primary-50 dark:hover:bg-gray-700 rounded transition"
                          title="Copy to clipboard"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full font-semibold">
                        {key.scopes}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{key.usageCount || 0} calls</div>
                      {key.lastUsedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Last: {new Date(key.lastUsedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        key.isActive 
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                      }`}>
                        {key.isActive ? '✓ Active' : '✗ Revoked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {key.isActive && (
                        <button
                          onClick={() => handleRevoke(key.id, key.name)}
                          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium hover:underline"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(key.id, key.name)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium hover:underline"
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

        {apiKeys.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Keys</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{apiKeys.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/40 rounded-lg p-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Keys</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {apiKeys.filter(k => k.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/40 rounded-lg p-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total API Calls</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {apiKeys.reduce((sum, k) => sum + (k.usageCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create API Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl">
            <form onSubmit={handleCreate}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create API Key</h2>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Production API Key"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">A descriptive name for this API key</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scopes *</label>
                  <select
                    value={formData.scopes}
                    onChange={(e) => setFormData({...formData, scopes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="read">Read Only</option>
                    <option value="read,write">Read & Write</option>
                    <option value="read,write,delete">Full Access</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">What permissions this key should have</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires In (Days)</label>
                  <input
                    type="number"
                    value={formData.expiresInDays}
                    onChange={(e) => setFormData({...formData, expiresInDays: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    max="3650"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Key will expire after this many days (365 = 1 year)</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ⚠️ <strong>Important:</strong> The API key will only be shown once after creation. 
                    Make sure to copy and store it securely.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-2 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', scopes: 'read,write', expiresInDays: 365 });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-medium text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition font-medium"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show New API Key Modal */}
      {showKeyModal && newlyCreatedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎉 API Key Created!</h2>
            </div>
            
            <div className="px-6 py-6 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">
                  ⚠️ This is the only time you'll see this key. Copy it now!
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your API Key:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newlyCreatedKey.keyValue}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey.keyValue)}
                    className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Name:</strong> {newlyCreatedKey.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Scopes:</strong> {newlyCreatedKey.scopes}
                </p>
                {newlyCreatedKey.expiresAt && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Expires:</strong> {new Date(newlyCreatedKey.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 rounded">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Store this key in a secure location like a password manager 
                  or environment variables. Never commit it to version control!
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end rounded-b-lg">
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setNewlyCreatedKey(null);
                }}
                className="px-6 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition font-medium"
              >
                Got it, close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeysPage;