// frontend/src/pages/AnalyticsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ✅ Proper Recharts Import (IMPORTANT)
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

  console.log("AnalyticsPage loaded for user:", user);

  // 🔹 Mock Data (Replace with API later)
  const userGrowthData = [
    { month: "Jan", users: 5 },
    { month: "Feb", users: 8 },
    { month: "Mar", users: 12 },
    { month: "Apr", users: 18 },
    { month: "May", users: 25 },
    { month: "Jun", users: 30 }
  ];

  const apiUsageData = [
    { day: "Mon", calls: 450 },
    { day: "Tue", calls: 680 },
    { day: "Wed", calls: 520 },
    { day: "Thu", calls: 790 },
    { day: "Fri", calls: 920 },
    { day: "Sat", calls: 340 },
    { day: "Sun", calls: 180 }
  ];

  const featureUsageData = [
    { name: "User Management", value: 400 },
    { name: "Dashboard", value: 300 },
    { name: "Settings", value: 200 },
    { name: "Analytics", value: 100 }
  ];

  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe"];

  useEffect(() => {
    console.log("AnalyticsPage mounted...");
    setTimeout(() => setLoading(false), 500);
  }, []);

  // 🔄 Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-500 mx-auto"
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
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your platform usage and growth
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">30</p>
                <p className="text-xs text-green-600">↑ 20% vs last month</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">API Calls</p>
                <p className="text-2xl font-bold text-gray-900">3.8K</p>
                <p className="text-xs text-green-600">↑ 15% vs last week</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">Currently online</p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">145ms</p>
                <p className="text-xs text-green-600">↓ 5% faster</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* API Usage */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              API Usage (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apiUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calls" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature Usage Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Feature Usage Distribution
            </h3>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { user: "John Doe", action: "Created new user", time: "5 min ago", icon: "👤" },
                { user: "Jane Smith", action: "Updated settings", time: "15 min ago", icon: "⚙️" },
                { user: "Mike Johnson", action: "Exported data", time: "1 hour ago", icon: "📥" },
                { user: "Sarah Wilson", action: "Changed plan", time: "2 hours ago", icon: "💳" },
                { user: "Tom Brown", action: "Logged in", time: "3 hours ago", icon: "🔑" }
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DB Queries */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Database Queries</span>
                <span className="text-sm font-semibold text-gray-900">2,345</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>

            {/* Cache Hit */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
                <span className="text-sm font-semibold text-gray-900">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "94%" }}></div>
              </div>
            </div>

            {/* Uptime */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-semibold text-gray-900">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "99.9%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
