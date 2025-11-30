// frontend/src/App.jsx - FIXED TO USE AUTH CONTEXT INSIDE MAINLAYOUT

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

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SettingsPage from "./pages/SettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import ApiKeysPage from "./pages/ApiKeysPage";
import WebhooksPage from "./pages/Webhookspage";
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {/* MAIN LAYOUT NOW USES AUTH CONTEXT DIRECTLY */}
      <MainLayout navigate={navigate} location={location}>
        {children}
      </MainLayout>

      <CommandPalette navigate={navigate} />
    </>
  );
};

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Public Routes */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected */}
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

                {/* Default */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
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
