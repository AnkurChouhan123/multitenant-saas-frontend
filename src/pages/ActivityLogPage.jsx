// frontend/src/pages/ActivityLogPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ActivityLogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  // Mock activity data - In production, fetch from API
  const activities = [
    { id: 1, user: 'Ankur Chouhan', action: 'Logged in', type: 'auth', timestamp: '2024-01-15 10:30:00', ip: '192.168.1.1', icon: '🔑', color: 'green' },
    { id: 2, user: 'Ankur Chouhan', action: 'Created new user: John Doe', type: 'user', timestamp: '2024-01-15 10:35:00', ip: '192.168.1.1', icon: '👤', color: 'blue' },
    { id: 3, user: 'Ankur Chouhan', action: 'Updated subscription plan to PRO', type: 'billing', timestamp: '2024-01-15 11:00:00', ip: '192.168.1.1', icon: '💳', color: 'purple' },
    { id: 4, user: 'Ankur Chouhan', action: 'Changed company settings', type: 'settings', timestamp: '2024-01-15 11:15:00', ip: '192.168.1.1', icon: '⚙️', color: 'gray' },
    { id: 5, user: 'Ankur Chouhan', action: 'Exported user data', type: 'data', timestamp: '2024-01-15 11:30:00', ip: '192.168.1.1', icon: '📥', color: 'yellow' },
    { id: 6, user: 'John Doe', action: 'Logged in', type: 'auth', timestamp: '2024-01-15 12:00:00', ip: '192.168.1.5', icon: '🔑', color: 'green' },
    { id: 7, user: 'Ankur Chouhan', action: 'Deleted user: Jane Smith', type: 'user', timestamp: '2024-01-15 13:00:00', ip: '192.168.1.1', icon: '🗑️', color: 'red' },
    { id: 8, user: 'Ankur Chouhan', action: 'API key regenerated', type: 'security', timestamp: '2024-01-15 14:00:00', ip: '192.168.1.1', icon: '🔐', color: 'orange' },
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  const filterButtons = [
    { label: 'All', value: 'all', count: activities.length },
    { label: 'Authentication', value: 'auth', count: activities.filter(a => a.type === 'auth').length },
    { label: 'Users', value: 'user', count: activities.filter(a => a.type === 'user').length },
    { label: 'Billing', value: 'billing', count: activities.filter(a => a.type === 'billing').length },
    { label: 'Settings', value: 'settings', count: activities.filter(a => a.type === 'settings').length },
  ];

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
            <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition">
              Export Log
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-${activity.color}-100`}>
                    <span className="text-2xl">{activity.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{activity.user}</p>
                      <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{activity.action}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <span className="mr-1">🌐</span>
                        IP: {activity.ip}
                      </span>
                      <span className={`px-2 py-1 rounded-full bg-${activity.color}-100 text-${activity.color}-800 font-medium`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button className="text-gray-400 hover:text-gray-600 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredActivities.length}</span> of{' '}
            <span className="font-medium">{activities.length}</span> activities
          </p>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Previous
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-medium hover:from-primary-600 hover:to-secondary-600 transition">
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLogPage;