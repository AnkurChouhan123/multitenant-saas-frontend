// frontend/src/pages/DashboardPage.jsx - MODERN RESPONSIVE UI

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import userService from '../services/userService';
import { ThemeToggle } from '../context/ThemeContext';
import { Settings, LogOut, Users, CreditCard, BarChart3, Activity, ArrowRight, Zap } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <svg className="animate-spin h-16 w-16 text-purple-500 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{user.tenantName}</p>
            </div>
            <div className="w-full sm:w-auto flex flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-3">
              <ThemeToggle />
              <button
                onClick={() => navigate('/settings')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={logout}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-lg hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">⚡ Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Users, label: 'Manage Users', desc: 'Add or edit team', path: '/users', color: 'from-blue-500 to-blue-600' },
              { icon: CreditCard, label: 'Subscription', desc: 'Manage your plan', path: '/subscription', color: 'from-green-500 to-green-600' },
              { icon: BarChart3, label: 'Analytics', desc: 'View insights', path: '/analytics', color: 'from-purple-500 to-purple-600' },
              { icon: Activity, label: 'Activity Log', desc: 'Track all actions', path: '/activity', color: 'from-orange-500 to-orange-600' }
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="group p-4 sm:p-5 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
                >
                  <div className={`inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-br ${action.color} text-white mb-3 group-hover:scale-110 transition transform`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{action.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{action.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { icon: '🏢', label: 'Company', value: user.tenantName, color: 'from-blue-500/20 to-blue-600/20 dark:from-blue-900/40 dark:to-blue-800/40' },
            { icon: '💳', label: 'Current Plan', value: subscription?.plan || 'FREE', color: 'from-green-500/20 to-green-600/20 dark:from-green-900/40 dark:to-green-800/40' },
            { icon: '👥', label: 'Total Users', value: users.length, color: 'from-blue-500/20 to-blue-600/20 dark:from-blue-900/40 dark:to-blue-800/40' },
            { icon: '📊', label: 'API Calls', value: subscription?.currentApiCalls || 0, color: 'from-purple-500/20 to-purple-600/20 dark:from-purple-900/40 dark:to-purple-800/40' }
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 break-words">
                    {stat.value}
                  </p>
                </div>
                <span className="text-3xl sm:text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Details Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-xl mb-8 overflow-hidden hover:shadow-2xl transition-shadow">
          <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                Subscription Details
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold transition-all ${
                subscription?.isActive
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${subscription?.isActive ? 'bg-green-600 dark:bg-green-400 animate-pulse' : 'bg-red-600 dark:bg-red-400'}`}></span>
                {subscription?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="px-5 sm:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[
                { label: 'Plan', value: subscription?.plan, icon: '📦' },
                { label: 'Users', value: `${subscription?.currentUsers}/${subscription?.plan === 'ENTERPRISE' ? '∞' : '100'}`, icon: '👥' },
                { label: 'API Calls', value: `${subscription?.currentApiCalls}/${subscription?.plan === 'ENTERPRISE' ? '∞' : '50K'}`, icon: '🔌' },
                { label: 'Status', value: subscription?.isActive ? 'Active' : 'Inactive', icon: '✅' }
              ].map((item, idx) => (
                <div key={idx} className="text-center sm:text-left">
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700/50">
              <button
                onClick={() => navigate('/subscription')}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>Upgrade Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">👥 Team Members</h3>
            <button
              onClick={() => navigate('/users')}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95 text-sm"
            >
              Manage Users
            </button>
          </div>

          {/* Table - Responsive */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                {users.slice(0, 8).map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition duration-200 group"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-bold rounded-full transition-all ${
                          user.active
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {user.active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* View All Button */}
          {users.length > 8 && (
            <div className="px-4 sm:px-8 py-4 border-t border-gray-200 dark:border-gray-700/50 text-center">
              <button
                onClick={() => navigate('/users')}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition flex items-center justify-center gap-1 mx-auto"
              >
                <span>View all {users.length} team members</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;