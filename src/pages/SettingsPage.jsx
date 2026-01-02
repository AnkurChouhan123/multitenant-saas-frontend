// frontend/src/pages/SettingsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/common/Toast";
import settingsService from "../services/settingsService";
import TwoFactorSettings from "../components/auth/TwoFactorSettings";
const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [canManageSettings, setCanManageSettings] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // Company Settings
  const [companyData, setCompanyData] = useState({
    name: user?.tenantName || "",
    subdomain: user?.subdomain || "",
    website: "",
    phone: "",
  });

  // Branding Settings
  const [brandingData, setBrandingData] = useState({
    primaryColor: "#667eea",
    secondaryColor: "#764ba2",
    logo: null,
  });

  // Check if user can manage tenant settings
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Quick client-side check
        const isTenantOwner = user?.role === "TENANT_OWNER";
        setCanManageSettings(isTenantOwner);

        // Verify with backend
        if (user?.tenantId) {
          const response = await settingsService.checkSettingsPermission(
            user.tenantId
          );
          setCanManageSettings(response.canManage);
        }
      } catch (error) {
        console.error("Permission check failed:", error);
        setCanManageSettings(false);
      } finally {
        setCheckingPermission(false);
      }
    };

    if (user) {
      checkPermission();
    }
  }, [user]);

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      setCompanyData({
        name: user.tenantName || "",
        subdomain: user.subdomain || "",
        website: "",
        phone: "",
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();

    try {
      const existingUserRes = await fetch(
        `http://localhost:8080/api/users/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const existingUser = await existingUserRes.json();

      const payload = {
        id: existingUser.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: existingUser.role,
        password: existingUser.password,
        tenantId: existingUser.tenantId,
        active: existingUser.active,
        lastLogin: existingUser.lastLogin,
      };

      const response = await fetch(
        `http://localhost:8080/api/users/${user.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Profile update failed");

      const updatedUser = await response.json();

      updateUser({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
      });

      localStorage.setItem("firstName", updatedUser.firstName);
      localStorage.setItem("lastName", updatedUser.lastName);
      localStorage.setItem("email", updatedUser.email);

      addToast("Profile updated successfully!", "success");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast("Failed: " + error.message, "error");
    }
  };

  const handleCompanySave = async (e) => {
    e.preventDefault();

    if (!canManageSettings) {
      addToast(
        "Access denied: Only tenant owners can update company details",
        "error"
      );
      return;
    }

    try {
      const tenantId = user?.tenantId;

      const existingRes = await fetch(
        `http://localhost:8080/api/tenants/${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!existingRes.ok) throw new Error("Failed to load tenant");

      const existingTenant = await existingRes.json();

      const payload = {
        id: existingTenant.id,
        name: companyData.name,
        subdomain: existingTenant.subdomain,
        databaseName: existingTenant.databaseName,
        status: existingTenant.status,
        createdAt: existingTenant.createdAt,
        updatedAt: existingTenant.updatedAt,
      };

      const updateRes = await fetch(
        `http://localhost:8080/api/tenants/${tenantId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (updateRes.status === 403) {
        throw new Error(
          "Access denied: Only tenant owners can update company details"
        );
      }

      if (!updateRes.ok) throw new Error("Failed to update company");

      const updatedTenant = await updateRes.json();

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

    if (!canManageSettings) {
      addToast(
        "Access denied: Only tenant owners can update branding",
        "error"
      );
      return;
    }

    try {
      console.log("Updating branding:", brandingData);
      setSaved(true);
      addToast("Branding saved successfully!", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating branding:", error);
      addToast("Failed to update branding: " + error.message, "error");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const currentPassword = formData.get("currentPassword");
      const newPassword = formData.get("newPassword");
      const confirmPassword = formData.get("confirmPassword");

      if (newPassword !== confirmPassword) {
        addToast("Passwords do not match", "error");
        return;
      }

      if (newPassword.length < 6) {
        addToast("Password must be at least 6 characters", "error");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/users/${user.userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        let message = "Failed to change password";
        try {
          const err = await response.json();
          message = err.message || message;
        } catch (parseErr) {}
        throw new Error(message);
      }

      setSaved(true);
      addToast("Password changed successfully!", "success");
      e.target.reset();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      addToast("Failed to change password: " + error.message, "error");
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: "👤" },
    { id: "company", name: "Company", icon: "🏢" },
    { id: "branding", name: "Branding", icon: "🎨" },
    { id: "security", name: "Security", icon: "🔒" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 flex items-center transition"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your account and preferences
          </p>

          {/* Permission Badge */}
          {!checkingPermission && (
            <div className="mt-3">
              {canManageSettings ? (
                <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Full Settings Access (Tenant Owner)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View Only Access
                </span>
              )}
            </div>
          )}
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
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg scale-105"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-2xl mr-3">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>

            {/* Help Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-primary-500">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                Need Help?
              </p>
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
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      Settings saved successfully!
                    </p>
                  </div>
                </div>
              )}

              {/* Profile Tab - Everyone can edit */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Profile Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Update your personal information
                  </p>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              firstName: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              lastName: e.target.value,
                            })
                          }
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
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Tip:</strong> Keep your profile information
                        up to date to help your team members recognize you.
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

              {/* Company Tab - TENANT_OWNER only */}
              {activeTab === "company" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Company Settings
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Manage your company information
                      </p>
                    </div>
                    {!canManageSettings && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-xs font-medium">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Owner Only
                      </span>
                    )}
                  </div>

                  {!canManageSettings && (
                    <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            You have view-only access
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Only the Tenant Owner can update company settings.
                            Contact your admin if changes are needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCompanySave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyData.name}
                        onChange={(e) =>
                          setCompanyData({
                            ...companyData,
                            name: e.target.value,
                          })
                        }
                        disabled={!canManageSettings}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                          !canManageSettings
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      />
                      {!canManageSettings && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          🔒 Only tenant owner can change company name.
                        </p>
                      )}
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
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                        />
                        <span className="inline-flex items-center px-4 py-3 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                          .saas.com
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        🔒 Subdomain cannot be changed for security reasons
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={companyData.website}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              website: e.target.value,
                            })
                          }
                          placeholder="https://example.com"
                          disabled={!canManageSettings}
                          className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                            !canManageSettings
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={companyData.phone}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+1 (555) 123-4567"
                          disabled={!canManageSettings}
                          className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                            !canManageSettings
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Note:</strong> Company information is visible
                        to team members and in public profiles.
                      </p>
                    </div>

                    {canManageSettings && (
                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105 shadow-lg"
                        >
                          💾 Save Company Info
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Branding Tab - TENANT_OWNER only */}
              {activeTab === "branding" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Branding
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Customize your brand appearance
                      </p>
                    </div>
                    {!canManageSettings && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-xs font-medium">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Owner Only
                      </span>
                    )}
                  </div>

                  {!canManageSettings && (
                    <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            You have view-only access
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Only the Tenant Owner can update branding. Contact
                            your admin if changes are needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleBrandingSave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={brandingData.primaryColor}
                        disabled={!canManageSettings}
                        onChange={(e) =>
                          setBrandingData({
                            ...brandingData,
                            primaryColor: e.target.value,
                          })
                        }
                        className="h-12 w-20 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Secondary Color
                      </label>
                      <input
                        type="color"
                        value={brandingData.secondaryColor}
                        disabled={!canManageSettings}
                        onChange={(e) =>
                          setBrandingData({
                            ...brandingData,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="h-12 w-20 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Upload Logo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!canManageSettings}
                        onChange={(e) =>
                          setBrandingData({
                            ...brandingData,
                            logo: e.target.files[0],
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {canManageSettings && (
                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105 shadow-lg"
                        >
                          💾 Save Branding
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Security
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Manage your account security settings
                  </p>

                  {/* Two-Factor Authentication Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Two-Factor Authentication
                    </h3>
                    <TwoFactorSettings />
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h3>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          required
                          minLength={6}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Must be at least 6 characters long
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          💡 <strong>Password Tips:</strong> Use a mix of
                          letters, numbers, and special characters for better
                          security.
                        </p>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition transform hover:scale-105 shadow-lg"
                        >
                          🔒 Change Password
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security Tips */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Security Best Practices
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          icon: "🔐",
                          title: "Enable 2FA",
                          description:
                            "Add an extra layer of security with two-factor authentication",
                        },
                        {
                          icon: "🔑",
                          title: "Strong Password",
                          description:
                            "Use unique, complex passwords for your account",
                        },
                        {
                          icon: "🚨",
                          title: "Regular Updates",
                          description: "Keep your password updated regularly",
                        },
                        {
                          icon: "📱",
                          title: "Secure Devices",
                          description: "Only log in from trusted devices",
                        },
                      ].map((tip, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{tip.icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {tip.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {tip.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
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
