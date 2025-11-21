// src/components/auth/TwoFactorAuth.jsx

import React, { useState, useRef, useEffect } from 'react';

const TwoFactorAuth = ({ onVerify, onResend, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (index === 5 && value) {
      handleVerify([...newCode.slice(0, 5), value].join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit;
        });
        setCode(newCode);
        
        // Focus last filled input
        const lastIndex = Math.min(digits.length, 5);
        inputRefs.current[lastIndex]?.focus();
        
        // Auto-submit if complete
        if (digits.length === 6) {
          handleVerify(newCode.join(''));
        }
      });
    }
  };

  const handleVerify = async (codeString) => {
    setLoading(true);
    setError('');

    try {
      await onVerify(codeString);
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    try {
      await onResend();
      setResendTimer(60);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const handleManualSubmit = () => {
    const codeString = code.join('');
    if (codeString.length === 6) {
      handleVerify(codeString);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Code Input */}
      <div className="flex justify-center space-x-2 mb-6">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              error 
                ? 'border-red-500' 
                : digit 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleManualSubmit}
        disabled={loading || code.join('').length !== 6}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mb-4"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        ) : (
          'Verify Code'
        )}
      </button>

      {/* Resend Code */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in <span className="font-semibold">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Didn't receive the code? Resend
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          💡 <strong>Tip:</strong> You can paste the 6-digit code directly
        </p>
      </div>
    </div>
  );
};

// 2FA Setup Component (for enabling 2FA)
export const TwoFactorSetup = ({ onEnable, qrCode, secret }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnable = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onEnable(verificationCode);
    } catch (err) {
      setError(err.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Enable Two-Factor Authentication
      </h3>

      <div className="space-y-6">
        {/* Step 1: Scan QR Code */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
              1
            </div>
            <h4 className="font-semibold text-gray-900">Scan QR Code</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Use Google Authenticator, Authy, or any TOTP app to scan this QR code:
          </p>
          {qrCode && (
            <div className="flex justify-center p-4 bg-white border border-gray-300 rounded">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}
        </div>

        {/* Step 2: Manual Entry (Alternative) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
              2
            </div>
            <h4 className="font-semibold text-gray-900">Or Enter Manually</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            If you can't scan the QR code, enter this key manually:
          </p>
          <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-300">
            <code className="flex-1 text-sm font-mono">{secret}</code>
            <button
              onClick={() => navigator.clipboard.writeText(secret)}
              className="ml-2 text-blue-600 hover:text-blue-700"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>

        {/* Step 3: Verify */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
              3
            </div>
            <h4 className="font-semibold text-gray-900">Verify Code</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Enter the 6-digit code from your authenticator app:
          </p>
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />

          <button
            onClick={handleEnable}
            disabled={loading || verificationCode.length !== 6}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Enabling...' : 'Enable 2FA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;