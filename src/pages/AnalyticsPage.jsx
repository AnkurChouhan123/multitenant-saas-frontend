// frontend/src/pages/AnalyticsPage.jsx - WITH FULL DARK MODE

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import analyticsService from "../services/analyticsService";
import activityService from "../services/activityService";
import userService from "../services/userService";
import subscriptionService from "../services/subscriptionService";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [subscription, setSubscription] = useState(null);
  
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [apiUsageData, setApiUsageData] = useState([]);
  const [featureUsageData, setFeatureUsageData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe"];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        metricsData,
        usersData,
        activitiesData,
        subscriptionData
      ] = await Promise.allSettled([
        analyticsService.getDashboardMetrics(user.tenantId),
        userService.getUsersByTenant(user.tenantId),
        activityService.getActivitiesByTenant(user.tenantId),
        subscriptionService.getSubscription(user.tenantId)
      ]);

      if (metricsData.status === 'fulfilled') {
        setDashboardMetrics(metricsData.value);
      }

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value);
        processUserGrowthData(usersData.value);
      }

      if (activitiesData.status === 'fulfilled') {
        setActivities(activitiesData.value);
        processActivityData(activitiesData.value);
        processFeatureUsageData(activitiesData.value);
      }

      if (subscriptionData.status === 'fulfilled') {
        setSubscription(subscriptionData.value);
      } else {
        setSubscription({ plan: 'FREE', currentApiCalls: 0 });
      }

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processUserGrowthData = (usersData) => {
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[key] = 0;
    }

    usersData.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyData.hasOwnProperty(key)) {
          monthlyData[key]++;
        }
      }
    });

    let cumulative = 0;
    const chartData = Object.entries(monthlyData).map(([month, count]) => {
      cumulative += count;
      return { month: month.split(' ')[0], users: cumulative };
    });

    setUserGrowthData(chartData);
  };

  const processActivityData = (activitiesData) => {
    const last7Days = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = dayNames[date.getDay()];
      last7Days[key] = 0;
    }

    activitiesData.forEach(activity => {
      const date = new Date(activity.createdAt);
      const dayKey = dayNames[date.getDay()];
      if (last7Days.hasOwnProperty(dayKey)) {
        last7Days[dayKey]++;
      }
    });

    const chartData = Object.entries(last7Days).map(([day, calls]) => ({ day, calls }));
    setApiUsageData(chartData);
  };

  const processFeatureUsageData = (activitiesData) => {
    const featureCounts = {};
    
    activitiesData.forEach(activity => {
      const feature = activity.actionType || 'unknown';
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    const chartData = Object.entries(featureCounts)
      .map(([name, value]) => ({
        name: name.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setFeatureUsageData(chartData);
  };

  useEffect(() => {
    if (activities.length > 0) {
      const recent = activities
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(activity => ({
          user: activity.userName || 'Unknown User',
          action: activity.action || 'Unknown action',
          time: formatRelativeTime(activity.createdAt),
          icon: getActivityIcon(activity.actionType)
        }));
      
      setRecentActivity(recent);
    }
  }, [activities]);

  const getActivityIcon = (actionType) => {
    const icons = {
      'auth': '🔑',
      'user': '👤',
      'billing': '💳',
      'settings': '⚙️',
      'data': '📥',
      'security': '🔐'
    };
    return icons[actionType?.toLowerCase()] || '📝';
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getTotalUsers = () => users.length;
  const getApiCalls = () => subscription?.currentApiCalls || activities.length;
  const getActiveSessions = () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Set(
      activities
        .filter(a => new Date(a.createdAt) > oneHourAgo)
        .map(a => a.userName)
    ).size;
  };
  const getAvgResponseTime = () => '145ms';

  const getUserGrowthPercentage = () => {
    if (userGrowthData.length < 2) return 0;
    const current = userGrowthData[userGrowthData.length - 1].users;
    const previous = userGrowthData[userGrowthData.length - 2].users;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getApiGrowthPercentage = () => {
    if (apiUsageData.length < 2) return 0;
    const current = apiUsageData[apiUsageData.length - 1].calls;
    const previous = apiUsageData[apiUsageData.length - 2].calls;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics & Insights</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Track your platform usage and growth
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getTotalUsers()}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  ↑ {getUserGrowthPercentage()}% vs last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">API Calls</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getApiCalls().toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  ↑ {getApiGrowthPercentage()}% vs last week
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getActiveSessions()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Currently online</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getAvgResponseTime()}</p>
                <p className="text-xs text-green-600 dark:text-green-400">↓ 5% faster</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              User Growth (Last 6 Months)
            </h3>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    name="Total Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                No user growth data available
              </div>
            )}
          </div>

          {/* API Usage Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Activity (Last 7 Days)
            </h3>
            {apiUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={apiUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="calls" fill="#764ba2" name="Activities" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                No activity data available
              </div>
            )}
          </div>

          {/* Feature Usage Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Feature Usage Distribution
            </h3>
            {featureUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={featureUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {featureUsageData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                No feature usage data available
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.user}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database Queries</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {activities.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">94%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: "94%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: "99.9%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;