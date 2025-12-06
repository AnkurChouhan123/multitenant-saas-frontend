import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import { ArrowLeft, RefreshCw, Filter } from 'lucide-react';

const ActivityLogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, activities]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getActivitiesByTenant(user.tenantId);
      setActivities(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(a => a.actionType === filter));
    }
  };

  const getActivityIcon = (actionType) => {
    const icons = {
      auth: '🔑',
      user: '👤',
      billing: '💳',
      settings: '⚙️',
      data: '📥',
      security: '🔐'
    };
    return icons[actionType] || '📝';
  };

  const getActivityColorClasses = (actionType) => {
    const colors = {
      auth: { bg: 'bg-green-50 dark:bg-green-900/20', badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
      user: { bg: 'bg-blue-50 dark:bg-blue-900/20', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
      billing: { bg: 'bg-purple-50 dark:bg-purple-900/20', badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
      settings: { bg: 'bg-gray-50 dark:bg-gray-900/20', badge: 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-800' },
      data: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
      security: { bg: 'bg-orange-50 dark:bg-orange-900/20', badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' }
    };
    return colors[actionType] || colors.settings;
  };

  const filterButtons = [
    { label: 'All', value: 'all', icon: '📋', count: activities.length },
    { label: 'Auth', value: 'auth', icon: '🔑', count: activities.filter(a => a.actionType === 'auth').length },
    { label: 'Users', value: 'user', icon: '👤', count: activities.filter(a => a.actionType === 'user').length },
    { label: 'Billing', value: 'billing', icon: '💳', count: activities.filter(a => a.actionType === 'billing').length },
    { label: 'Settings', value: 'settings', icon: '⚙️', count: activities.filter(a => a.actionType === 'settings').length },
    { label: 'Security', value: 'security', icon: '🔐', count: activities.filter(a => a.actionType === 'security').length },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <svg className="animate-spin h-16 w-16 text-purple-500 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading activity log...</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Page Title */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">📊 Activity Log</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Track all actions in your workspace</p>
          </div>
          <button 
            onClick={fetchActivities}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition transform" />
          Back to Dashboard
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 backdrop-blur-sm p-4 rounded-xl animate-in slide-in-from-top">
          <p className="text-sm text-red-700 dark:text-red-300 font-semibold">⚠️ {error}</p>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden md:inline">Filter by:</span>
        </div>
        
        {/* Desktop Filters */}
        <div className="hidden md:flex flex-wrap gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 active:scale-95 flex items-center gap-1.5 text-sm ${
                filter === btn.value
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
            >
              <span>{btn.icon}</span>
              {btn.label}
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">{btn.count}</span>
            </button>
          ))}
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold flex items-center justify-between hover:border-purple-300 dark:hover:border-purple-600 transition"
          >
            <span>Filters</span>
            <span className={`transition transform ${mobileFilterOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {mobileFilterOpen && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => {
                    setFilter(btn.value);
                    setMobileFilterOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg font-semibold transition text-xs flex flex-col items-center gap-1 ${
                    filter === btn.value
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-lg">{btn.icon}</span>
                  <span>{btn.label}</span>
                  <span className="text-xs opacity-75">({btn.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-5xl sm:text-6xl mb-4">📋</div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No activities found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Activity logs will appear here as users interact with the system</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredActivities.map((activity) => {
            const colors = getActivityColorClasses(activity.actionType);
            return (
              <div
                key={activity.id}
                className={`bg-white dark:bg-gray-800/50 backdrop-blur-sm border ${colors.border} rounded-xl sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 hover:-translate-y-1`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} flex-none`}>
                    <span className="text-2xl">{getActivityIcon(activity.actionType)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">{activity.userName}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{formatDate(activity.createdAt)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{activity.action}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span>🌐</span>
                        <span className="font-medium">IP: {activity.ipAddress || 'N/A'}</span>
                      </span>
                      <span className={`inline-flex px-3 py-1 rounded-full font-bold ${colors.badge}`}>
                        {activity.actionType.charAt(0).toUpperCase() + activity.actionType.slice(1)}
                      </span>
                    </div>
                    
                    {activity.details && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3 mt-2">{activity.details}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Info */}
      {filteredActivities.length > 0 && (
        <div className="mt-8 p-4 sm:p-6 bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-gray-900 dark:text-gray-100">{filteredActivities.length}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-gray-100">{activities.length}</span> activities
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Auto-refreshes every 30 seconds</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogPage;