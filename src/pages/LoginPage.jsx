// frontend/src/pages/LoginPage.jsx - WITH 2FA SUPPORT

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import authService from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const inputRefs = React.useRef([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Logging in:', email);
      const result = await authService.login(email, password);
      
      // Check if 2FA is required
      if (result.requiresTwoFactor) {
        console.log('🔒 2FA required');
        setRequires2FA(true);
        setLoading(false);
        return;
      }
      
      // Normal login success
      console.log('✅ Login successful!');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login failed:', err);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Login failed. Please check your credentials.';
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    const code = twoFactorCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log('🔐 Verifying 2FA code');
      await login(email, password, code);
      console.log('✅ 2FA verification successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ 2FA verification failed:', err);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Invalid 2FA code. Please try again.';
      
      setError(errorMessage);
      setTwoFactorCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handle2FAChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...twoFactorCode];
    newCode[index] = value;
    setTwoFactorCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (index === 5 && value && newCode.every(digit => digit)) {
      setTimeout(() => {
        const code = newCode.join('');
        handle2FAVerify(code);
      }, 100);
    }
  };

  const handle2FAKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!twoFactorCode[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newCode = [...twoFactorCode];
      newCode[index] = '';
      setTwoFactorCode(newCode);
    }
  };

  const handle2FAVerify = async (code) => {
    setError('');
    setLoading(true);

    try {
      await login(email, password, code);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || 'Invalid 2FA code. Please try again.';
      
      setError(errorMessage);
      setTwoFactorCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setTwoFactorCode(['', '', '', '', '', '']);
    setError('');
  };

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
            Welcome Back to Your <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">Workspace</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-md">
            Manage your team, track projects, and collaborate seamlessly in one powerful platform.
          </p>

          <div className="space-y-4">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized for speed' },
              { icon: '🔒', title: 'Bank-Level Security', desc: 'Enterprise protection' },
              { icon: '🤝', title: 'Real-Time Collaboration', desc: 'Work together instantly' }
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

        <div className="relative z-10">
          <p className="text-gray-400 text-sm">
            Trusted by <span className="font-semibold text-white">10,000+</span> companies worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Login/2FA Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-0">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">SaaS Hub</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {requires2FA ? 'Verify Your Identity' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400">
              {requires2FA ? 'Enter your 2FA code' : 'Sign in to your account'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl">
            
            {/* Desktop Title */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {requires2FA ? 'Verify Your Identity' : 'Welcome Back'}
              </h2>
              <p className="text-gray-400">
                {requires2FA ? 'Enter your 2FA code' : 'Sign in to your account'}
              </p>
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

            {/* 2FA Code Input */}
            {requires2FA ? (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <p className="text-gray-500 text-xs">
                    Logging in as <strong className="text-gray-400">{email}</strong>
                  </p>
                </div>

                <form onSubmit={handle2FASubmit} className="space-y-6">
                  <div className="flex justify-center space-x-2">
                    {twoFactorCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handle2FAChange(index, e.target.value)}
                        onKeyDown={(e) => handle2FAKeyDown(index, e)}
                        disabled={loading}
                        className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white/5 ${
                          error 
                            ? 'border-red-500' 
                            : digit 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-white/20'
                        } text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || twoFactorCode.some(d => !d)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        <span>Verify Code</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="text-sm text-gray-400 hover:text-gray-300 transition"
                    >
                      ← Back to login
                    </button>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300 text-center">
                      💡 <strong>Tip:</strong> You can also use a backup code if you don't have access to your authenticator
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              /* Normal Login Form */
              <form className="space-y-5" onSubmit={handleSubmit}>
                
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-gray-700/20 border border-white/10 dark:border-gray-600/30 rounded-xl text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-white/5 dark:bg-gray-700/20 border border-white/10 dark:border-gray-600/30 rounded-xl text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 bg-white/10 dark:bg-gray-700/20 border border-white/20 dark:border-gray-600/30 rounded text-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer transition"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition">Remember me</span>
                  </label>

                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition duration-150 flex items-center space-x-1 group"
                  >
                    <span>Forgot password?</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
                  </Link>
                </div>

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
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {!requires2FA && (
              <>
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10 dark:border-gray-700/30"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white/10 dark:bg-gray-800/50 text-gray-400 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button className="py-2.5 px-4 bg-white/5 dark:bg-gray-700/20 hover:bg-white/10 dark:hover:bg-gray-700/40 border border-white/10 dark:border-gray-600/30 rounded-lg text-white font-semibold transition duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm">
                      <span className="text-lg">🔷</span>
                      <span className="text-sm">Google</span>
                    </button>
                    <button className="py-2.5 px-4 bg-white/5 dark:bg-gray-700/20 hover:bg-white/10 dark:hover:bg-gray-700/40 border border-white/10 dark:border-gray-600/30 rounded-lg text-white font-semibold transition duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm">
                      <span className="text-lg">💼</span>
                      <span className="text-sm">GitHub</span>
                    </button>
                  </div>
                </div>

                <div className="mt-8 text-center border-t border-white/10 dark:border-gray-700/30 pt-6">
                  <p className="text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition duration-150">
                      Create one for free
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            By signing in, you agree to our <Link to="#" className="hover:text-gray-400 transition">Terms of Service</Link> and <Link to="#" className="hover:text-gray-400 transition">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;