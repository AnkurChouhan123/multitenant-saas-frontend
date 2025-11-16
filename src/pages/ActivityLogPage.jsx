// frontend/src/pages/ActivityLogPage.jsx - FIXED WITH REAL DATA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';

const ActivityLogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const getActivityColor = (actionType) => {
    const colors = {
      auth: 'green',
      user: 'blue',
      billing: 'purple',
      settings: 'gray',
      data: 'yellow',
      security: 'orange'
    };
    return colors[actionType] || 'gray';
  };

  const filterButtons = [
    { label: 'All', value: 'all', count: activities.length },
    { label: 'Authentication', value: 'auth', count: activities.filter(a => a.actionType === 'auth').length },
    { label: 'Users', value: 'user', count: activities.filter(a => a.actionType === 'user').length },
    { label: 'Billing', value: 'billing', count: activities.filter(a => a.actionType === 'billing').length },
    { label: 'Settings', value: 'settings', count: activities.filter(a => a.actionType === 'settings').length },
    { label: 'Security', value: 'security', count: activities.filter(a => a.actionType === 'security').length },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading activity log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
              <p className="mt-1 text-sm text-gray-500">Track all actions in your workspace</p>
            </div>
            <button 
              onClick={fetchActivities}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === btn.value
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {btn.label} <span className="ml-1 text-xs">({btn.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-500">Activity logs will appear here as users interact with the system</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-${getActivityColor(activity.actionType)}-100`}>
                      <span className="text-2xl">{getActivityIcon(activity.actionType)}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{activity.userName}</p>
                        <span className="text-xs text-gray-400">{formatDate(activity.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{activity.action}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">🌐</span>
                          IP: {activity.ipAddress || 'N/A'}
                        </span>
                        <span className={`px-2 py-1 rounded-full bg-${getActivityColor(activity.actionType)}-100 text-${getActivityColor(activity.actionType)}-800 font-medium`}>
                          {activity.actionType}
                        </span>
                      </div>
                      {activity.details && (
                        <p className="mt-2 text-xs text-gray-500 italic">{activity.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Info */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredActivities.length}</span> of{' '}
              <span className="font-medium">{activities.length}</span> activities
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivityLogPage;