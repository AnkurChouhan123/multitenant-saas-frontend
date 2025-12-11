import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
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
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { USER_ROLES } from "../utils/roleUtils";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [subscription, setSubscription] = useState(null);

  const [userGrowthData, setUserGrowthData] = useState([]);
  const [apiUsageData, setApiUsageData] = useState([]);
  const [featureUsageData, setFeatureUsageData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe"];

  // Check permissions
  const isTenantOwner = user?.role === USER_ROLES.TENANT_OWNER;
  const isTenantAdmin = user?.role === USER_ROLES.TENANT_ADMIN;
  const canAccess = isTenantOwner || isTenantAdmin;

  useEffect(() => {
    // Wait for auth to load
    if (!user) return;

    // If user can access, fetch data
    if (canAccess) {
      fetchAllData();
      return;
    }

    // User loaded but doesn't have permission -> stop loading and show Access Denied UI
    setLoading(false);
    // Do not redirect - show the Access Denied page instead
  }, [user, canAccess]);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      setError(null);

      const [metricsData, usersData, activitiesData, subscriptionData] =
        await Promise.allSettled([
          analyticsService.getDashboardMetrics(user.tenantId),
          userService.getUsersByTenant(user.tenantId),
          activityService.getActivitiesByTenant(user.tenantId),
          subscriptionService.getSubscription(user.tenantId),
        ]);

      if (metricsData.status === "fulfilled") {
        setDashboardMetrics(metricsData.value);
      }

      if (usersData.status === "fulfilled") {
        setUsers(usersData.value);
        processUserGrowthData(usersData.value);
      }

      if (activitiesData.status === "fulfilled") {
        setActivities(activitiesData.value);
        processActivityData(activitiesData.value);
        processFeatureUsageData(activitiesData.value);
      }

      if (subscriptionData.status === "fulfilled") {
        setSubscription(subscriptionData.value);
      } else {
        setSubscription({ plan: "FREE", currentApiCalls: 0 });
      }
    } catch (err) {
      console.error("❌ Error fetching analytics data:", err);
      setError("Failed to load analytics data");
      // addToast("Failed to load analytics data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processUserGrowthData = (usersData) => {
    const monthlyData = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[key] = 0;
    }

    usersData.forEach((user) => {
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
      return { month: month.split(" ")[0], users: cumulative };
    });

    setUserGrowthData(chartData);
  };

  const processActivityData = (activitiesData) => {
    const last7Days = {};
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = dayNames[date.getDay()];
      last7Days[key] = 0;
    }

    activitiesData.forEach((activity) => {
      const date = new Date(activity.createdAt);
      const dayKey = dayNames[date.getDay()];
      if (last7Days.hasOwnProperty(dayKey)) {
        last7Days[dayKey]++;
      }
    });

    const chartData = Object.entries(last7Days).map(([day, calls]) => ({
      day,
      calls,
    }));
    setApiUsageData(chartData);
  };

  const processFeatureUsageData = (activitiesData) => {
    const featureCounts = {};

    activitiesData.forEach((activity) => {
      const feature = activity.actionType || "unknown";
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    const chartData = Object.entries(featureCounts)
      .map(([name, value]) => ({
        name: name
          .replace("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value,
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
        .map((activity) => ({
          user: activity.userName || "Unknown User",
          action: activity.action || "Unknown action",
          time: formatRelativeTime(activity.createdAt),
          icon: getActivityIcon(activity.actionType),
        }));

      setRecentActivity(recent);
    }
  }, [activities]);

  const getActivityIcon = (actionType) => {
    const icons = {
      auth: "🔑",
      user: "👤",
      billing: "💳",
      settings: "⚙️",
      data: "📥",
      security: "🔐",
    };
    return icons[actionType?.toLowerCase()] || "📝";
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getTotalUsers = () => users.length;
  const getApiCalls = () => subscription?.currentApiCalls || activities.length;
  const getActiveSessions = () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Set(
      activities
        .filter((a) => new Date(a.createdAt) > oneHourAgo)
        .map((a) => a.userName)
    ).size;
  };
  const getAvgResponseTime = () => "145ms";

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

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <svg
            className="animate-spin h-16 w-16 text-purple-500 dark:text-purple-400 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Loading analytics...
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  // ✅ Access Denied UI (Same as WebhooksPage - shows page without redirecting)
  if (!canAccess) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen">
        {/* Page Header (same look as normal header to keep context) */}
        <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition transform" />
              Back to Dashboard
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  📊 Analytics & Insights
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Track your platform usage and growth metrics
                </p>
              </div>

              <button
                onClick={fetchAllData}
                disabled
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-400 font-semibold rounded-xl transition opacity-50 cursor-not-allowed"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Access Denied Card */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-10 text-center shadow-lg max-w-2xl mx-auto">
            <div className="text-6xl mb-4">⛔</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have permission to view analytics for this tenant.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Only Tenant Owners and Tenant Admins can access analytics. Please
              contact your Tenant Owner if you believe this is an error.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition shadow-md"
            >
              Go Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Main Analytics Page - Only visible if user has access
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Page Title */}
      <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                📊 Analytics & Insights
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                Track your platform usage and growth metrics
              </p>
            </div>
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-lg backdrop-blur-sm animate-in slide-in-from-top">
            <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            {
              icon: "👥",
              label: "Total Users",
              value: getTotalUsers(),
              trend: `↑ ${getUserGrowthPercentage()}%`,
              color:
                "from-blue-500/20 to-blue-600/20 dark:from-blue-900/40 dark:to-blue-800/40",
              trendColor: "text-green-600 dark:text-green-400",
            },
            {
              icon: "📊",
              label: "API Calls",
              value: getApiCalls().toLocaleString(),
              trend: `↑ ${getApiGrowthPercentage()}%`,
              color:
                "from-purple-500/20 to-purple-600/20 dark:from-purple-900/40 dark:to-purple-800/40",
              trendColor: "text-green-600 dark:text-green-400",
            },
            {
              icon: "⚡",
              label: "Active Sessions",
              value: getActiveSessions(),
              trend: "Currently online",
              color:
                "from-green-500/20 to-green-600/20 dark:from-green-900/40 dark:to-green-800/40",
              trendColor: "text-gray-600 dark:text-gray-400",
            },
            {
              icon: "⏱️",
              label: "Avg Response",
              value: getAvgResponseTime(),
              trend: "↓ 5% faster",
              color:
                "from-yellow-500/20 to-yellow-600/20 dark:from-yellow-900/40 dark:to-yellow-800/40",
              trendColor: "text-green-600 dark:text-green-400",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words">
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs sm:text-sm font-semibold ${stat.trendColor}`}
                  >
                    {stat.trend}
                  </p>
                </div>
                <span className="text-3xl sm:text-4xl flex-shrink-0">
                  {stat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                📈 User Growth (Last 6 Months)
              </h3>
            </div>
            <div className="px-4 sm:px-6 py-6">
              {userGrowthData.length > 0 ? (
                <div className="h-72 sm:h-80 lg:h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="month"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#667eea"
                        strokeWidth={3}
                        name="Total Users"
                        dot={{ fill: "#667eea", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 sm:h-80 lg:h-96 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <p className="text-sm sm:text-base">
                    No user growth data available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* API Usage Chart */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                📊 Activity (Last 7 Days)
              </h3>
            </div>
            <div className="px-4 sm:px-6 py-6">
              {apiUsageData.length > 0 ? (
                <div className="h-72 sm:h-80 lg:h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={apiUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="day"
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="calls"
                        fill="#764ba2"
                        name="Activities"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 sm:h-80 lg:h-96 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <p className="text-sm sm:text-base">
                    No activity data available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Feature Usage Distribution */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                🎯 Feature Usage Distribution
              </h3>
            </div>
            <div className="px-4 sm:px-6 py-6">
              {featureUsageData.length > 0 ? (
                <div className="h-72 sm:h-80 lg:h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={featureUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {featureUsageData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F3F4F6",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 sm:h-80 lg:h-96 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <p className="text-sm sm:text-base">
                    No feature usage data available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                ⏱️ Recent Activity
              </h3>
            </div>
            <div className="px-4 sm:px-6 py-6">
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition transform hover:scale-102"
                    >
                      <span className="text-xl sm:text-2xl flex-shrink-0">
                        {activity.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {activity.user}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {activity.action}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0 whitespace-nowrap ml-2">
                        {activity.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <p className="text-sm sm:text-base">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
              ⚙️ Performance Metrics
            </h3>
          </div>

          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  label: "Database Queries",
                  value: activities.length,
                  percentage: 78,
                  color: "bg-green-500",
                },
                {
                  label: "Cache Hit Rate",
                  value: "94%",
                  percentage: 94,
                  color: "bg-blue-500",
                },
                {
                  label: "Uptime",
                  value: "99.9%",
                  percentage: 99.9,
                  color: "bg-green-500",
                },
              ].map((metric, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                      {metric.label}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                      {metric.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner">
                    <div
                      className={`${metric.color} h-full rounded-full transition-all duration-500 shadow-lg`}
                      style={{ width: `${metric.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {metric.percentage}% utilization
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;