// frontend/src/components/auth/TwoFactorSettings.jsx

import React, { useState, useEffect } from 'react';
import { Shield, QrCode, Download, RefreshCw, X, Check } from 'lucide-react';
import authService from '../../services/authService';
import { useToast } from '../common/Toast';

const TwoFactorSettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const status = await authService.get2FAStatus();
      setTwoFactorEnabled(status.enabled || false);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const data = await authService.setup2FA('TOTP');
      setSetupData(data);
      setShowSetupModal(true);
    } catch (error) {
      addToast('Failed to initialize 2FA setup', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      addToast('Please enter a 6-digit code', 'error');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.verify2FA(verificationCode);
      
      if (result.success) {
        setBackupCodes(result.backupCodes || []);
        setShowBackupCodes(true);
        setShowSetupModal(false);
        setTwoFactorEnabled(true);
        addToast('2FA enabled successfully!', 'success');
      }
    } catch (error) {
      addToast('Invalid code. Please try again.', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }

    try {
      setLoading(true);
      await authService.disable2FA();
      setTwoFactorEnabled(false);
      addToast('2FA disabled successfully', 'success');
    } catch (error) {
      addToast('Failed to disable 2FA', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!confirm('This will invalidate your existing backup codes. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await authService.regenerateBackupCodes();
      setBackupCodes(result.backupCodes || []);
      setShowBackupCodes(true);
      addToast('Backup codes regenerated successfully', 'success');
    } catch (error) {
      addToast('Failed to regenerate backup codes', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Backup codes downloaded', 'success');
  };

  if (loading && !setupData) {
    return (
      <div className="flex justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2FA Status Card */}
      <div className={`border-2 rounded-xl p-6 ${twoFactorEnabled ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${twoFactorEnabled ? 'bg-green-500' : 'bg-gray-400'}`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {twoFactorEnabled 
                  ? 'Your account is protected with 2FA' 
                  : 'Add an extra layer of security to your account'}
              </p>
              {twoFactorEnabled && (
                <div className="mt-3 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                  <Check className="w-4 h-4" />
                  Active
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {twoFactorEnabled ? (
              <>
                <button
                  onClick={handleRegenerateBackupCodes}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Backup Codes
                </button>
                <button
                  onClick={handleDisable2FA}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition"
                >
                  Disable
                </button>
              </>
            ) : (
              <button
                onClick={handleEnable2FA}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition transform hover:scale-105"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              How does 2FA work?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              When enabled, you'll need to enter a 6-digit code from your authenticator app each time you log in. 
              Compatible with Google Authenticator, Authy, Microsoft Authenticator, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetupModal && setupData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Enable Two-Factor Authentication
              </h2>
              <button
                onClick={() => setShowSetupModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Scan QR Code */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Scan QR Code
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Open your authenticator app and scan this QR code:
                </p>
                <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {setupData.qrCode && (
                    <img src={setupData.qrCode} alt="QR Code" className="w-64 h-64" />
                  )}
                </div>
              </div>

              {/* Step 2: Manual Entry */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Or Enter Key Manually
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Can't scan? Enter this key in your authenticator app:
                </p>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
                  <code className="flex-1 text-sm font-mono text-gray-900 dark:text-white break-all">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(setupData.secret);
                      addToast('Secret key copied!', 'success');
                    }}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Step 3: Verify */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Verify Code
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter the 6-digit code from your authenticator app:
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                />
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
                >
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Save Your Backup Codes
              </h2>
              <button
                onClick={() => setShowBackupCodes(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Important: Save these codes now!
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      You won't be able to see these codes again. Each code can only be used once.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadBackupCodes}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Codes
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join('\n'));
                    addToast('Backup codes copied!', 'success');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Copy to Clipboard
                </button>
              </div>

              <button
                onClick={() => setShowBackupCodes(false)}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                I've Saved My Codes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;