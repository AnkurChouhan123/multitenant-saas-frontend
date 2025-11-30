// frontend/src/components/layout/MainLayout.jsx

import React, { useState } from "react";
import { useTheme, ThemeToggle } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

import { NavLink } from "react-router-dom";
import { FolderOpen } from "lucide-react";

const MainLayout = ({ children, navigate, location }) => {
  const { user, logout } = useAuth(); // <-- FIXED: using AuthContext
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: "Dashboard", icon: "📊", path: "/dashboard" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Analytics", icon: "📈", path: "/analytics" },
    { name: "Activity Log", icon: "📋", path: "/activity" },
    { name: "API Keys", icon: "🔑", path: "/api-keys", adminOnly: true },
    { name: "Webhooks", icon: "🔗", path: "/webhooks" },
    { name: "Subscription", icon: "💳", path: "/subscription" },
    { name: "Settings", icon: "⚙️", path: "/settings" },
  ];

  const isAdmin = ["TENANT_ADMIN", "SUPER_ADMIN"].includes(user?.role);

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const isActive = (path) => location.pathname === path;

  // Theme-aware classes
  const bgPrimary = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgSecondary = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const textPrimary = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100";

  return (
    <div
      className={`
        min-h-screen transition-colors duration-300 
        bg-gray-50 dark:bg-gray-900
        text-gray-900 dark:text-gray-100
      `}
    >
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full ${bgPrimary} shadow-xl transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-20"}
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          border-r ${borderColor}
        `}
      >
        <div className="flex flex-col h-full">

          {/* Logo + Tenant Name */}
          <div
            className={`flex items-center justify-between p-4 border-b ${borderColor}`}
          >
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {user?.tenantName?.charAt(0) || "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`text-sm font-bold ${textPrimary} truncate`}>
                    {user?.tenantName || "SaaS Platform"}
                  </h2>
                  <p className={`text-xs ${textSecondary} truncate`}>
                    {user?.subdomain}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto">
                {user?.tenantName?.charAt(0) || "S"}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
            <ul className="space-y-1 px-3">
              {filteredNavigation.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all
                      ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : `${textPrimary} ${hoverBg}`
                      }
                    `}
                    title={!sidebarOpen ? item.name : ""}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {sidebarOpen && (
                      <span className="font-medium text-sm truncate">
                        {item.name}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Keyboard Shortcut Hint */}
          {sidebarOpen && (
            <div className={`px-4 py-3 border-t ${borderColor}`}>
              <div
                className={`text-xs ${textSecondary} flex items-center justify-center`}
              >
                <kbd
                  className={`px-2 py-1 ${bgSecondary} rounded text-xs mr-1`}
                >
                  ⌘
                </kbd>
                +
                <kbd className={`px-2 py-1 ${bgSecondary} rounded text-xs ml-1`}>
                  K
                </kbd>
                <span className="ml-2">Quick Search</span>
              </div>
            </div>
          )}

          {/* User Section */}
          <div className={`border-t ${borderColor} p-4 relative`}>
             
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center ${
                sidebarOpen ? "space-x-3" : "justify-center"
              } p-2 rounded-lg ${hoverBg} transition`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
              {sidebarOpen && (
                <div className="text-left">
                  <p className={`text-sm font-medium ${textPrimary} truncate`}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className={`text-xs ${textSecondary} truncate`}>
                    {user?.role}
                  </p>
                </div>
              )}
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  className={`absolute bottom-full left-0 right-0 mb-2 ${bgPrimary} rounded-lg shadow-xl z-50 overflow-hidden border ${borderColor}`}
                >
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 ${hoverBg} transition`}
                  >
                    ⚙️ <span className="ml-2">Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 ${hoverBg} text-red-600 transition`}
                  >
                    🚪 <span className="ml-2">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hidden lg:flex items-center justify-center p-2 border-t ${borderColor} ${hoverBg} transition`}
          >
            {sidebarOpen ? "◀️" : "▶️"}
          </button>
        </div>
      </aside>

     
      

      

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
         
        {/* MOBILE TOP BAR */}
        <div
          className={`lg:hidden ${bgPrimary} border-b ${borderColor} px-4 py-3 flex items-center justify-between sticky top-0 z-30`}
        >
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              {user?.tenantName?.charAt(0) || "S"}
            </div>
            <span className={`font-semibold ${textPrimary}`}>
              {user?.tenantName}
            </span>
          </div>

          {/* MOBILE THEME TOGGLE (RESTORED) */}
          <ThemeToggle />
        </div>

        

        {/* PAGE CONTENT */}
        <main className="min-h-screen">{children}</main>
         
        {/* Footer */}
        <footer className={`${bgPrimary} border-t ${borderColor} py-4`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className={`text-sm ${textSecondary}`}>
                © {new Date().getFullYear()} {user?.tenantName}. All rights
                reserved.
              </p>
              <div className="flex space-x-4 mt-2 md:mt-0">
                <a className={`text-sm ${textSecondary} hover:text-primary-500`}>
                  Privacy
                </a>
                <a className={`text-sm ${textSecondary} hover:text-primary-500`}>
                  Terms
                </a>
                <a className={`text-sm ${textSecondary} hover:text-primary-500`}>
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
