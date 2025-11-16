// frontend/src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import settingsService from '../services/settingsService';

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Company Settings
  const [companyData, setCompanyData] = useState({
    companyName: user?.tenantName || '',
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
        companyName: user.tenantName || '',
        subdomain: user.subdomain || '',
        website: '',
        phone: '',
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating profile:', profileData);
      
      // Call API directly
      const response = await fetch(`http://localhost:8080/api/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedUser = await response.json();
      console.log('Profile updated:', updatedUser);
      
      // Update localStorage
      localStorage.setItem('firstName', profileData.firstName);
      localStorage.setItem('lastName', profileData.lastName);
      localStorage.setItem('email', profileData.email);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    }
  };

  const handleCompanySave = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating company:', companyData);
      // For now, just show success (backend endpoint needs to be implemented)
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert('Company information saved! (Backend implementation pending)');
    } catch (error) {
      console.error('Error updating company:', error);
      alert('Failed to update company: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBrandingSave = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating branding:', brandingData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert('Branding saved! (Backend implementation pending)');
    } catch (error) {
      console.error('Error updating branding:', error);
      alert('Failed to update branding: ' + error.message);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'company', name: 'Company', icon: '🏢' },
    { id: 'branding', name: 'Branding', icon: '🎨' },
    { id: 'security', name: 'Security', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
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
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mr-3">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Success Message */}
              {saved && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-700 font-medium">✓ Settings saved successfully!</p>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105"
                    >
                      Save Profile
                    </button>
                  </form>
                </div>
              )}

              {/* Company Tab */}
              {activeTab === 'company' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Settings</h2>
                  <form onSubmit={handleCompanySave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyData.companyName}
                        onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subdomain
                      </label>
                      <div className="flex rounded-lg shadow-sm">
                        <input
                          type="text"
                          value={companyData.subdomain}
                          disabled
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-100"
                        />
                        <span className="inline-flex items-center px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                          .platform.com
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Subdomain cannot be changed</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={companyData.website}
                          onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                          placeholder="https://example.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={companyData.phone}
                          onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105"
                    >
                      Save Company Info
                    </button>
                  </form>
                </div>
              )}

              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Branding</h2>
                  <form onSubmit={handleBrandingSave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                          🏢
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Upload Logo
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={brandingData.primaryColor}
                            onChange={(e) => setBrandingData({...brandingData, primaryColor: e.target.value})}
                            className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={brandingData.primaryColor}
                            onChange={(e) => setBrandingData({...brandingData, primaryColor: e.target.value})}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={brandingData.secondaryColor}
                            onChange={(e) => setBrandingData({...brandingData, secondaryColor: e.target.value})}
                            className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={brandingData.secondaryColor}
                            onChange={(e) => setBrandingData({...brandingData, secondaryColor: e.target.value})}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105"
                    >
                      Save Branding
                    </button>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security</h2>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <p className="text-yellow-700">
                        🔒 Two-factor authentication is currently disabled
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Change Password</h3>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105"
                        >
                          Update Password
                        </button>
                      </form>
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