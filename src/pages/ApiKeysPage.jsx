import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import apiKeyService from '../services/apiKeyService';
import { ArrowLeft, Plus, Copy, Trash2, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState({});
  const [refreshing, setRefreshing] = useState(false);
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
      setRefreshing(true);
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
      setRefreshing(false);
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
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-purple-500 dark:text-purple-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading API keys...</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess || error?.includes('Access denied')) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition transform" />
            Back to Dashboard
          </button>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 border-l-4 border-yellow-500 dark:border-yellow-600 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600 dark:text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-yellow-900 dark:text-yellow-300 mb-3">🔒 Access Restricted</h3>
                <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200 mb-4">{error || 'You do not have permission to access API key management.'}</p>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-3">
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <strong>Your current role:</strong> 
                    <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {user?.role}
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <strong>Required role:</strong> 
                    <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                      TENANT_ADMIN
                    </span>
                    <span className="mx-2 hidden sm:inline">or</span>
                    <span className="block sm:inline mt-2 sm:mt-0 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold">
                      SUPER_ADMIN
                    </span>
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 mb-6">
                  API key management is restricted to administrators to ensure security. 
                  Please contact your system administrator if you need to manage API keys.
                </p>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">What are API Keys?</h3>
            <div className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <p className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🔑</span>
                <span><strong>API Keys</strong> are used to authenticate external applications and services that need to interact with your platform programmatically.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🛡️</span>
                <span><strong>Security:</strong> Only administrators can create and manage API keys to prevent unauthorized access to your data.</span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <span><strong>Need Access?</strong> Contact your administrator at <strong>{user?.tenantName}</strong> to request API key management permissions.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Page Title */}
      <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
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
                🔑 API Keys
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                Manage API keys for external integrations
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Create Key</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-lg backdrop-blur-sm animate-in slide-in-from-top">
            <p className="text-sm text-red-700 dark:text-red-300 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {apiKeys.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-6xl sm:text-7xl mb-4">🔑</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">No API keys yet</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">Create your first API key to integrate with external services</p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First API Key
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Total Keys
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {apiKeys.length}
                    </p>
                  </div>
                  <span className="text-3xl flex-shrink-0">🔑</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Active Keys
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                      {apiKeys.filter(k => k.isActive).length}
                    </p>
                  </div>
                  <span className="text-3xl flex-shrink-0">✅</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Total API Calls
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {apiKeys.reduce((sum, k) => sum + (k.usageCount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-3xl flex-shrink-0">⚡</span>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={fetchApiKeys}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* API Keys Table - Desktop */}
            <div className="hidden md:block bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/50">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Key</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Scopes</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{key.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {new Date(key.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 rounded font-mono break-all">
                              {key.keyValue.substring(0, 20)}...
                            </code>
                            <button
                              onClick={() => copyToClipboard(key.keyValue)}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 p-1.5 hover:bg-purple-50 dark:hover:bg-gray-700 rounded transition"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-semibold">
                            {key.scopes}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{key.usageCount || 0} calls</div>
                          {key.lastUsedAt && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Last: {new Date(key.lastUsedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold inline-flex items-center gap-1 ${
                            key.isActive 
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                              : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                          }`}>
                            {key.isActive ? '✓ Active' : '✗ Revoked'}
                          </span>
                        </td>
                        <td className="px-6 py-4 space-x-2 flex flex-wrap gap-2">
                          {key.isActive && (
                            <button
                              onClick={() => handleRevoke(key.id, key.name)}
                              className="text-xs px-3 py-1.5 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-semibold bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded transition"
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(key.id, key.name)}
                            className="text-xs px-3 py-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Keys Cards - Mobile */}
            <div className="md:hidden space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{key.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Created: {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-semibold flex-shrink-0 ml-2 ${
                      key.isActive 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                    }`}>
                      {key.isActive ? '✓ Active' : '✗ Revoked'}
                    </span>
                  </div>

                  {/* Key Display */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">API Key:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded font-mono flex-1 break-all">
                        {key.keyValue.substring(0, 15)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.keyValue)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded transition flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Scopes:</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full font-semibold">
                        {key.scopes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Usage:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{key.usageCount || 0} calls</span>
                    </div>
                    {key.lastUsedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Last Used:</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(key.lastUsedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {key.isActive && (
                      <button
                        onClick={() => handleRevoke(key.id, key.name)}
                        className="flex-1 text-xs px-3 py-2 text-yellow-600 dark:text-yellow-400 font-semibold bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded transition"
                      >
                        🔒 Revoke
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(key.id, key.name)}
                      className={`flex-1 text-xs px-3 py-2 text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition ${
                        key.isActive ? '' : 'flex-1'
                      }`}
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Create API Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreate}>
              <div className="sticky top-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create API Key</h2>
              </div>
              
              <div className="px-6 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                    placeholder="Production API Key"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">A descriptive name for this API key</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Scopes *</label>
                  <select
                    value={formData.scopes}
                    onChange={(e) => setFormData({...formData, scopes: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  >
                    <option value="read">Read Only</option>
                    <option value="read,write">Read & Write</option>
                    <option value="read,write,delete">Full Access</option>
                  </select>
                  <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">What permissions this key should have</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expires In (Days)</label>
                  <input
                    type="number"
                    value={formData.expiresInDays}
                    onChange={(e) => setFormData({...formData, expiresInDays: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    min="1"
                    max="3650"
                  />
                  <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">Key will expire after this many days (365 = 1 year)</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-3.5 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    <strong>Important:</strong> The API key will only be shown once after creation. Make sure to copy and store it securely.
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', scopes: 'read,write', expiresInDays: 365 });
                  }}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition font-semibold text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition font-semibold"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎉 API Key Created!</h2>
            </div>
            
            <div className="px-6 py-6 space-y-5">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>This is the only time you'll see this key. Copy it now!</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your API Key:</label>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={newlyCreatedKey.keyValue}
                    readOnly
                    className="flex-1 bg-transparent text-gray-900 dark:text-white font-mono text-xs overflow-x-auto"
                  />
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey.keyValue)}
                    className="flex-shrink-0 px-3 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition font-semibold flex items-center gap-1 text-xs"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Name:</strong> <span className="text-gray-900 dark:text-white">{newlyCreatedKey.name}</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Scopes:</strong> <span className="text-gray-900 dark:text-white">{newlyCreatedKey.scopes}</span>
                </p>
                {newlyCreatedKey.expiresAt && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Expires:</strong> <span className="text-gray-900 dark:text-white">{new Date(newlyCreatedKey.expiresAt).toLocaleDateString()}</span>
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-3.5 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>💡 Tip:</strong> Store this key in a secure location like a password manager or environment variables. Never commit it to version control!
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end rounded-b-2xl">
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setNewlyCreatedKey(null);
                }}
                className="px-6 py-2.5 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition font-semibold"
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