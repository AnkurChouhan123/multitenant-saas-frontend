// frontend/src/components/DebugAuth.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';

const DebugAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <p>Loading: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>{loading ? 'Yes' : 'No'}</span></p>
        <p>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'Yes' : 'No'}</span></p>
        <p>User: <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? 'Exists' : 'Null'}</span></p>
        {user && (
          <>
            <p>Email: {user.email}</p>
            <p>TenantID: {user.tenantId}</p>
            <p>Token: {user.token ? '✓' : '✗'}</p>
          </>
        )}
        <p className="pt-2 border-t border-gray-600">LocalStorage:</p>
        <p>Token: {localStorage.getItem('token') ? '✓' : '✗'}</p>
        <p>TenantID: {localStorage.getItem('tenantId') || 'None'}</p>
      </div>
    </div>
  );
};

export default DebugAuth;