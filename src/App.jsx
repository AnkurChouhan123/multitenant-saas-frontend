// frontend/src/App.jsx - SUPER ADMIN ENABLED VERSION

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/common/Toast";
import AppErrorBoundary from "./components/common/AppErrorBoundary";
import CommandPalette from "./components/common/CommandPalette";

// Layout
import MainLayout from "./components/layout/MainLayout";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import TenantsPage from "./pages/superadmin/TenantsPage";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Protected Tenant Pages
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SettingsPage from "./pages/SettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import ApiKeysPage from "./pages/ApiKeysPage";
import WebhooksPage from "./pages/WebhooksPage";
import FileManagerPage from "./pages/FileManagerPage";

// ==========================================================
// 🔐 PROTECTED ROUTES FOR TENANT USERS
// ==========================================================
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <MainLayout navigate={navigate} location={location}>
        {children}
      </MainLayout>
      <CommandPalette navigate={navigate} />
    </>
  );
};

// ==========================================================
// 🔐 SUPER ADMIN PROTECTED ROUTE
// ==========================================================
const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ==========================================================
// MAIN APP
// ==========================================================
function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Routes>

                {/* PUBLIC ROUTES */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ================================
                     SUPER ADMIN ROUTES 
                   ================================ */}
                <Route
                  path="/superadmin/dashboard"
                  element={
                    <SuperAdminRoute>
                      <SuperAdminDashboard />
                    </SuperAdminRoute>
                  }
                />

                <Route
                  path="/superadmin/tenants"
                  element={
                    <SuperAdminRoute>
                      <TenantsPage />
                    </SuperAdminRoute>
                  }
                />

                {/* ================================
                     TENANT PROTECTED ROUTES 
                   ================================ */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute>
                      <ActivityLogPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/api-keys"
                  element={
                    <ProtectedRoute>
                      <ApiKeysPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/webhooks"
                  element={
                    <ProtectedRoute>
                      <WebhooksPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/files"
                  element={
                    <ProtectedRoute>
                      <FileManagerPage />
                    </ProtectedRoute>
                  }
                />

                {/* DEFAULT ROUTES */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />

              </Routes>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
