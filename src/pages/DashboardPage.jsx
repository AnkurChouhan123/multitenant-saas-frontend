// frontend/src/pages/DashboardPage.jsx - WITH FULL DARK MODE

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import userService from '../services/userService';
import { ThemeToggle } from '../context/ThemeContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersData = await userService.getUsersByTenant(user.tenantId);
      setUsers(usersData);
      
      try {
        const subData = await subscriptionService.getSubscription(user.tenantId);
        setSubscription(subData);
      } catch (subError) {
        console.warn('No subscription found, using default');
        setSubscription({
          plan: 'FREE',
          isActive: true,
          currentUsers: usersData.length,
          currentApiCalls: 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user.tenantName}</p>
            </div>
            <div className="flex items-center space-x-4">
               <ThemeToggle/>
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/users')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition text-left border border-gray-200 dark:border-gray-700"
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Manage Users</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Add or edit team members</div>
            </button>
            
            <button
              onClick={() => navigate('/subscription')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition text-left border border-gray-200 dark:border-gray-700"
            >
              <div className="text-3xl mb-2">💳</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Subscription</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Manage your plan</div>
            </button>
            
            <button
              onClick={() => navigate('/analytics')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition text-left border border-gray-200 dark:border-gray-700"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Analytics</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">View insights</div>
            </button>
            
            <button
              onClick={() => navigate('/activity')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition text-left border border-gray-200 dark:border-gray-700"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Activity Log</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Track all actions</div>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                  <span className="text-3xl">🏢</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Company</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.tenantName}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                  <span className="text-3xl">💳</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Current Plan</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">{subscription?.plan || 'FREE'}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">{users.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">API Calls</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">{subscription?.currentApiCalls || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Subscription Details</h3>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{subscription?.plan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  subscription?.isActive 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {subscription?.isActive ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Users</p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {subscription?.currentUsers} / {subscription?.plan === 'ENTERPRISE' ? '∞' : '100'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">API Calls</p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {subscription?.currentApiCalls} / {subscription?.plan === 'ENTERPRISE' ? '∞' : '50K'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/subscription')}
                className="inline-block w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105 text-center"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Team Members</h3>
            <button
              onClick={() => navigate('/users')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition text-sm"
            >
              Manage Users
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;