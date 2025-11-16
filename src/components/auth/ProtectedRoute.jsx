// frontend/src/components/auth/ProtectedRoute.jsx - FIXED

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  console.log('🛡️ ProtectedRoute Check:', { isAuthenticated, hasUser: !!user });

  if (!isAuthenticated || !user) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;