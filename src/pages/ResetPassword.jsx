import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setValidating(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/password-reset/validate/${token}`
      );

      console.log('Token validation:', response.data);

      if (response.data.valid) {
        setTokenValid(true);
        setUserInfo(response.data);
      } else {
        setError(response.data.message || 'This reset link is invalid or has expired.');
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setError('This reset link is invalid or has expired. Please request a new one.');
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePasswords = () => {
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePasswords()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/password-reset/reset',
        {
          token: token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }
      );

      console.log('Password reset response:', response.data);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-16">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">SaaS Hub</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Secure Your <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">Account</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-md">
              Create a strong password to protect your account and data.
            </p>

            <div className="space-y-4">
              {[
                { icon: '🔐', title: 'Strong Encryption', desc: 'Your password is encrypted' },
                { icon: '⚡', title: 'Instant Access', desc: 'Login immediately after reset' },
                { icon: '🛡️', title: 'Maximum Security', desc: 'Enterprise-grade protection' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{feature.title}</p>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Loading State */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center">
                  <svg className="animate-spin h-12 w-12 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-gray-300 font-semibold">Validating reset link...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we verify your request</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-16">
              <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-200 to-emerald-200 bg-clip-text text-transparent">SaaS Hub</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              You're All <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Set!</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-md">
              Your password has been successfully reset. You can now login with your new credentials.
            </p>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 dark:bg-green-900/40 rounded-full mb-6 border-2 border-green-500/50">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-3">
                  Password Reset Complete! 🎉
                </h2>

                <p className="text-gray-300 mb-8">
                  Your password has been changed successfully. You can now login with your new password.
                </p>

                <div className="bg-green-500/10 dark:bg-green-900/20 border border-green-500/30 dark:border-green-800/50 rounded-lg p-4 mb-8">
                  <p className="text-sm text-green-300 font-semibold">
                    ✓ Redirecting to login page in 3 seconds...
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition transform hover:scale-105 shadow-lg"
                >
                  <span>Go to Login Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-16">
              <div className="h-12 w-12 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl flex items-center justify-center">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-200 to-orange-200 bg-clip-text text-transparent">SaaS Hub</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Link <span className="bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">Expired</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-md">
              Don't worry! Request a new password reset link and we'll help you get back in.
            </p>
          </div>
        </div>

        {/* Right Side - Error Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 dark:bg-red-900/40 rounded-full mb-6 border-2 border-red-500/50">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-3">
                  Invalid Reset Link
                </h2>

                <p className="text-gray-300 mb-2">
                  {error || 'This password reset link is invalid or has expired.'}
                </p>
                <p className="text-gray-400 text-sm mb-8">
                  Reset links expire after 24 hours for security reasons.
                </p>

                <div className="space-y-3">
                  <Link
                    to="/forgot-password"
                    className="block w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-xl font-semibold transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Request New Reset Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/login"
                    className="block w-full border-2 border-white/20 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 py-3 rounded-xl font-semibold transition"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">SaaS Hub</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Secure Your <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">Account</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-md">
            Create a strong, unique password to protect your account and keep your data safe.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🔐', title: 'Strong Encryption', desc: 'Your password is encrypted' },
              { icon: '⚡', title: 'Instant Access', desc: 'Login immediately after reset' },
              { icon: '🛡️', title: 'Maximum Security', desc: 'Enterprise-grade protection' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <p className="font-semibold text-white">{feature.title}</p>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-0">
        <div className="w-full max-w-md">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">SaaS Hub</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-400">Create a new password for your account</p>
          </div>

          {/* Card */}
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl">
            
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 dark:bg-purple-900/40 rounded-xl mb-4 border-2 border-purple-500/30">
                <Lock className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Set New Password</h2>
              {userInfo && (
                <p className="text-gray-400">
                  Hi <span className="text-purple-300 font-semibold">{userInfo.firstName}</span>, create a new password
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/10 dark:bg-red-900/20 border border-red-500/30 dark:border-red-800/50 backdrop-blur-sm p-4 rounded-xl animate-in slide-in-from-top">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* New Password */}
              <div className="group">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 dark:bg-gray-700/20 border border-white/10 dark:border-gray-600/30 rounded-xl text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">🔒 Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 dark:bg-gray-700/20 border border-white/10 dark:border-gray-600/30 rounded-xl text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className={`flex items-center gap-2 p-3 rounded-lg transition ${
                  formData.newPassword === formData.confirmPassword
                    ? 'bg-green-500/10 dark:bg-green-900/20 border border-green-500/30 dark:border-green-800/50'
                    : 'bg-red-500/10 dark:bg-red-900/20 border border-red-500/30 dark:border-red-800/50'
                }`}>
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-300 font-semibold">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-300 font-semibold">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-500/10 dark:bg-blue-900/20 border border-blue-500/30 dark:border-blue-800/50 p-4 rounded-lg">
              <p className="text-xs text-blue-300 dark:text-blue-200">
                💡 <strong>Pro Tip:</strong> Use a mix of uppercase, lowercase, numbers, and symbols for a stronger password.
              </p>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center border-t border-white/10 dark:border-gray-700/30 pt-6">
              <p className="text-gray-400 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Info */}
          <p className="text-center text-gray-500 text-xs mt-6">
            🔒 Your reset link is secure and expires in 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;