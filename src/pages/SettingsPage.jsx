// frontend/src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import settingsService from '../services/settingsService';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Company Settings
  // NOTE: backend Tenant entity expects `name` field (not companyName)
  const [companyData, setCompanyData] = useState({
    name: user?.tenantName || '',
    subdomain: user?.subdomain || '',
    website: '',
    phone: '',
  });

  // Branding Settings
  const [brandingData, setBrandingData] = useState({
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    logo: null,
  });



  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
      setCompanyData({
        name: user.tenantName || '',
        subdomain: user.subdomain || '',
        website: '',
        phone: '',
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
  e.preventDefault();

  try {
    // 1️⃣ GET existing user from backend
    const existingUserRes = await fetch(`http://localhost:8080/api/users/${user.userId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      }
    });

    const existingUser = await existingUserRes.json();

    // 2️⃣ MERGE old + new fields
    const payload = {
      id: existingUser.id,
      email: profileData.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,

      // REQUIRED FIELDS FROM EXISTING USER
      role: existingUser.role,
      password: existingUser.password,
      tenantId: existingUser.tenantId,
      active: existingUser.active,
      lastLogin: existingUser.lastLogin,
    };

    // 3️⃣ SEND PUT REQUEST
    const response = await fetch(`http://localhost:8080/api/users/${user.userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Profile update failed");

    const updatedUser = await response.json();

    // 4️⃣ UPDATE AUTH CONTEXT
    updateUser({
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
    });

    // 5️⃣ UPDATE LOCAL STORAGE
    localStorage.setItem("firstName", updatedUser.firstName);
    localStorage.setItem("lastName", updatedUser.lastName);
    localStorage.setItem("email", updatedUser.email);

    addToast("Profile updated successfully!", "success");

  } catch (error) {
    console.error("Error updating profile:", error);
    addToast("Failed: " + error.message, "error");
  }
};


  // === FIXED: real API call to update tenant/company ===
 const handleCompanySave = async (e) => {
  e.preventDefault();
  try {
    const tenantId = user?.tenantId;

    // STEP 1: GET EXISTING TENANT
    const existingRes = await fetch(`http://localhost:8080/api/tenants/${tenantId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      }
    });

    if (!existingRes.ok) throw new Error("Failed to load tenant");

    const existingTenant = await existingRes.json();

    // STEP 2: MERGE NEW + EXISTING REQUIRED FIELDS
    const payload = {
      id: existingTenant.id,
      name: companyData.name,
      subdomain: existingTenant.subdomain,
      databaseName: existingTenant.databaseName,
      status: existingTenant.status,
      createdAt: existingTenant.createdAt,
      updatedAt: existingTenant.updatedAt,
    };

    // STEP 3: SEND FULL OBJECT TO BACKEND
    const updateRes = await fetch(`http://localhost:8080/api/tenants/${tenantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!updateRes.ok) throw new Error("Failed to update company");

    const updatedTenant = await updateRes.json();

    // STEP 4: UPDATE AUTH CONTEXT (UI refresh everywhere)
    updateUser({ tenantName: updatedTenant.name });
    localStorage.setItem("tenantName", updatedTenant.name);

    addToast("Company updated successfully!", "success");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

  } catch (err) {
    console.error("Company update error:", err);
    addToast("Error: " + err.message, "error");
  }
};



  const handleBrandingSave = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating branding:', brandingData);
      setSaved(true);
      addToast('Branding saved successfully!', 'success');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating branding:', error);
      addToast('Failed to update branding: ' + error.message, 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const currentPassword = formData.get('currentPassword');
      const newPassword = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');

      if (newPassword !== confirmPassword) {
        addToast('Passwords do not match', 'error');
        return;
      }

      if (newPassword.length < 6) {
        addToast('Password must be at least 6 characters', 'error');
        return;
      }

      // Call API to change password
      const response = await fetch(`http://localhost:8080/api/users/${user.userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response.ok) {
        // attempt to read error body
        let message = 'Failed to change password';
        try {
          const err = await response.json();
          message = err.message || message;
        } catch (parseErr) {}
        throw new Error(message);
      }

      setSaved(true);
      addToast('Password changed successfully!', 'success');
      e.target.reset();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      addToast('Failed to change password: ' + error.message, 'error');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'company', name: 'Company', icon: '🏢' },
    { id: 'branding', name: 'Branding', icon: '🎨' },
    { id: 'security', name: 'Security', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 flex items-center transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl mr-3">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>

            {/* Help Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-primary-500">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Need Help?</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Check our documentation or contact support for assistance.
              </p>
              <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition">
                📧 Contact Support
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
              {/* Success Message */}
              {saved && (
                <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg animate-in">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-700 dark:text-green-300 font-medium">Settings saved successfully!</p>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Update your personal information</p>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Tip:</strong> Keep your profile information up to date to help your team members recognize you.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105 shadow-lg"
                      >
                        💾 Save Profile
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Company Tab */}
              {activeTab === 'company' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Company Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Manage your company information</p>
                  <form onSubmit={handleCompanySave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Subdomain
                      </label>
                      <div className="flex rounded-lg shadow-sm overflow-hidden">
                        <input
                          type="text"
                          value={companyData.subdomain}
                          disabled
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="inline-flex items-center px-4 py-3 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                          .saas.com
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">🔒 Subdomain cannot be changed for security reasons</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={companyData.website}
                          onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                          placeholder="https://example.com"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={companyData.phone}
                          onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Note:</strong> Company information is visible to team members and in public profiles.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105 shadow-lg"
                      >
                        💾 Save Company Info
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Branding</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Customize your brand appearance</p>
                  <form onSubmit={handleBrandingSave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Logo
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center text-5xl shadow-lg">
                          🏢
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            type="button"
                            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-gray-900 dark:text-white font-medium"
                          >
                            📤 Upload Logo
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or SVG • Max 5MB</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Colors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Primary Color
                          </label>
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <input
                                type="color"
                                value={brandingData.primaryColor}
                                onChange={(e) => setBrandingData({...brandingData, primaryColor: e.target.value})}
                                className="h-14 w-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition"
                              />
                            </div>
                            <input
                              type="text"
                              value={brandingData.primaryColor}
                              onChange={(e) => setBrandingData({...brandingData, primaryColor: e.target.value})}
                              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono transition"
                            />
                          </div>
                          <div className="mt-3 flex items-center space-x-2">
                            <div 
                              className="w-12 h-12 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600"
                              style={{ backgroundColor: brandingData.primaryColor }}
                            ></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Preview</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Secondary Color
                          </label>
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <input
                                type="color"
                                value={brandingData.secondaryColor}
                                onChange={(e) => setBrandingData({...brandingData, secondaryColor: e.target.value})}
                                className="h-14 w-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition"
                              />
                            </div>
                            <input
                              type="text"
                              value={brandingData.secondaryColor}
                              onChange={(e) => setBrandingData({...brandingData, secondaryColor: e.target.value})}
                              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono transition"
                            />
                          </div>
                          <div className="mt-3 flex items-center space-x-2">
                            <div 
                              className="w-12 h-12 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-600"
                              style={{ backgroundColor: brandingData.secondaryColor }}
                            ></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Preview</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Branding Impact:</strong> These colors will be used throughout your application for buttons, links, and highlights.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105 shadow-lg"
                      >
                        💾 Save Branding
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Manage your account security settings</p>
                  <div className="space-y-6">
                    {/* 2FA Status */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">🔒</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Two-Factor Authentication</h3>
                          <p className="text-yellow-700 dark:text-yellow-200 text-sm mb-3">
                            Two-factor authentication is currently <strong>disabled</strong>. Enable it for enhanced security.
                          </p>
                          <button className="px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition text-sm font-medium">
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <span className="text-lg mr-2">💻</span>
                        Active Sessions
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Windows • Chrome • Last active: now</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <span className="text-lg mr-2">🔐</span>
                        Change Password
                      </h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                            placeholder="Enter your current password"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                            placeholder="Enter a new password"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                            placeholder="Confirm your new password"
                            required
                          />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            💡 <strong>Security Tip:</strong> Use a strong password with uppercase, lowercase, numbers, and symbols.
                          </p>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105 shadow-lg"
                          >
                            🔐 Update Password
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-2 border-red-200 dark:border-red-900/40 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                      <h3 className="font-semibold text-red-900 dark:text-red-300 mb-3 flex items-center">
                        <span className="text-lg mr-2">⚠️</span>
                        Danger Zone
                      </h3>
                      <button className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition font-medium">
                        🗑️ Delete Account
                      </button>
                      <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
