import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('email');
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');
        const role = localStorage.getItem('role');
        const tenantId = localStorage.getItem('tenantId');
        const tenantName = localStorage.getItem('tenantName');
        const subdomain = localStorage.getItem('subdomain');

        if (token && userId && tenantId) {
          const currentUser = {
            token,
            userId: parseInt(userId),
            email,
            firstName,
            lastName,
            role,
            tenantId: parseInt(tenantId),
            tenantName,
            subdomain,
          };
          
          console.log('✅ User loaded from localStorage:', currentUser);
          setUser(currentUser);
        } else {
          console.log('❌ No valid session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, twoFactorCode = null) => {
    const response = await authService.login(email, password, twoFactorCode);
    
    // If 2FA is required, return without setting user
    if (response.requiresTwoFactor) {
      return response;
    }

    // Store user data
    localStorage.setItem("token", response.token);
    localStorage.setItem("userId", response.userId);
    localStorage.setItem("email", response.email);
    localStorage.setItem("firstName", response.firstName);
    localStorage.setItem("lastName", response.lastName);
    localStorage.setItem("role", response.role);
    localStorage.setItem("tenantId", response.tenantId);
    localStorage.setItem("tenantName", response.tenantName || "");
    localStorage.setItem("subdomain", response.subdomain || "");
    localStorage.setItem("user", JSON.stringify(response));

    setUser({
      token: response.token,
      userId: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      tenantId: response.tenantId,
      tenantName: response.tenantName || "",
      subdomain: response.subdomain || ""
    });

    return response;
  };

  const register = async (formData) => {
    try {
      const response = await authService.register(formData);
      console.log('✅ Registration successful:', response);
      setUser(response);
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔓 Logging out');
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);

    try {
      if (updatedUser.token !== undefined) {
        localStorage.setItem("token", updatedUser.token || "");
      }
      if (updatedUser.userId !== undefined) {
        localStorage.setItem("userId", updatedUser.userId !== null ? String(updatedUser.userId) : "");
      }
      if (updatedUser.email !== undefined) {
        localStorage.setItem("email", updatedUser.email || "");
      }
      if (updatedUser.firstName !== undefined) {
        localStorage.setItem("firstName", updatedUser.firstName || "");
      }
      if (updatedUser.lastName !== undefined) {
        localStorage.setItem("lastName", updatedUser.lastName || "");
      }
      if (updatedUser.role !== undefined) {
        localStorage.setItem("role", updatedUser.role || "");
      }
      if (updatedUser.tenantId !== undefined) {
        localStorage.setItem("tenantId", updatedUser.tenantId !== null ? String(updatedUser.tenantId) : "");
      }
      if (updatedUser.tenantName !== undefined) {
        localStorage.setItem("tenantName", updatedUser.tenantName || "");
      }
      if (updatedUser.subdomain !== undefined) {
        localStorage.setItem("subdomain", updatedUser.subdomain || "");
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to sync user to localStorage', err);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user && !!user.token,
    loading,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};