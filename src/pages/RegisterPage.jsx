// frontend/src/pages/RegisterPage.jsx - MODERN UI VERSION

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building, Globe, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    subdomain: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    
    if (!formData.subdomain.trim()) {
      errors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      errors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate subdomain from company name
    if (name === 'companyName' && !formData.subdomain) {
      const autoSubdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setFormData(prev => ({
        ...prev,
        companyName: value,
        subdomain: autoSubdomain
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    setLoading(true);

    try {
      console.log('📝 Registering with data:', {
        ...formData,
        password: '***hidden***'
      });
      
      await register(formData);
      
      console.log('✅ Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Registration failed:', err);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Registration failed. Please try again.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-16">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">SaaS Hub</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Join <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">thousands of teams</span> already using SaaS Hub
          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-md">
            Get started for free. No credit card required. Start your 14-day trial today.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: '✨', title: '14-Day Free Trial', desc: 'Full access to all features' },
              { icon: '🔒', title: 'Bank-Level Security', desc: 'Your data is protected' },
              { icon: '📊', title: 'Advanced Analytics', desc: 'Real-time insights' }
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <span className="text-2xl">{benefit.icon}</span>
                <div>
                  <p className="font-semibold text-white">{benefit.title}</p>
                  <p className="text-sm text-gray-400">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="relative z-10">
          <p className="text-gray-400 text-sm">
            Trusted by <span className="font-semibold text-white">10,000+</span> companies worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Start your free 14-day trial</p>
          </div>

          {/* Card */}
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl">
            
            {/* Desktop Title */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-gray-400">Start your free 14-day trial</p>
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

            {/* Register Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="group">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-1.5">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2.5 bg-white/5 dark:bg-gray-700/20 border ${
                        validationErrors.firstName ? 'border-red-500/50' : 'border-white/10 dark:border-gray-600/30'
                      } rounded-lg text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm`}
                      placeholder="John"
                      required
                    />
                  </div>
                  {validationErrors.firstName && (
                    <p className="mt-1 text-xs text-red-400">{validationErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="group">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-1.5">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2.5 bg-white/5 dark:bg-gray-700/20 border ${
                        validationErrors.lastName ? 'border-red-500/50' : 'border-white/10 dark:border-gray-600/30'
                      } rounded-lg text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm`}
                      placeholder="Doe"
                      required
                    />
                  </div>
                  {validationErrors.lastName && (
                    <p className="mt-1 text-xs text-red-400">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white/5 dark:bg-gray-700/20 border ${
                      validationErrors.email ? 'border-red-500/50' : 'border-white/10 dark:border-gray-600/30'
                    } rounded-lg text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm`}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                    className={`w-full pl-10 pr-12 py-2.5 bg-white/5 dark:bg-gray-700/20 border ${
                      validationErrors.password ? 'border-red-500/50' : 'border-white/10 dark:border-gray-600/30'
                    } rounded-lg text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">Min. 6 characters</p>
              </div>

              {/* Company Name */}
              <div className="group">
                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-1.5">
                  Company Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white/5 dark:bg-gray-700/20 border ${
                      validationErrors.companyName ? 'border-red-500/50' : 'border-white/10 dark:border-gray-600/30'
                    } rounded-lg text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm`}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
                {validationErrors.companyName && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.companyName}</p>
                )}
              </div>

              {/* Subdomain */}
              <div className="group">
                <label htmlFor="subdomain" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-1.5">
                  Subdomain *
                </label>
                <div className="flex rounded-lg shadow-sm overflow-hidden">
                  <div className="inline-flex items-center px-3 bg-white/5 dark:bg-gray-700/20 border border-r-0 border-white/10 dark:border-gray-600/30 backdrop-blur-sm">
                    <Globe className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    id="subdomain"
                    name="subdomain"
                    type="text"
                    value={formData.subdomain}
                    onChange={handleChange}
                    pattern="[a-z0-9-]+"
                    className={`flex-1 px-3 py-2.5 bg-white/5 dark:bg-gray-700/20 border ${
                      validationErrors.subdomain ? 'border-red-500/50' : 'border-white/10 dark:border-gray-600/30'
                    } text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm`}
                    placeholder="acme"
                    required
                  />
                  <div className="inline-flex items-center px-3 bg-white/5 dark:bg-gray-700/20 border border-l-0 border-white/10 dark:border-gray-600/30 text-gray-400 text-sm font-medium backdrop-blur-sm">
                    .saas.com
                  </div>
                </div>
                {validationErrors.subdomain && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.subdomain}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">Your URL: <span className="text-purple-300">{formData.subdomain || 'your-company'}</span>.saas.com</p>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-2 cursor-pointer group mt-6 pt-2">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 bg-white/5 dark:bg-gray-700/20 border border-white/10 dark:border-gray-600/30 rounded text-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer transition"
                />
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition">
                  I agree to the <Link to="#" className="text-purple-400 hover:text-purple-300 transition font-semibold">Terms of Service</Link> and <Link to="#" className="text-purple-400 hover:text-purple-300 transition font-semibold">Privacy Policy</Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10 dark:border-gray-700/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/10 dark:bg-gray-800/50 text-gray-400 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
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

            {/* Footer */}
            <div className="mt-6 text-center border-t border-white/10 dark:border-gray-700/30 pt-6">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition duration-150 flex items-center justify-center space-x-1 mt-1 group">
                  <span>Sign in instead</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition transform" />
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Info */}
          <p className="text-center text-gray-500 text-xs mt-6">
            🔒 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;