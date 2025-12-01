import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/password-reset/request', {
        email: email
      });

      console.log('Password reset response:', response.data);
      setSuccess(true);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success State
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
              Check Your <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Email!</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-md">
              We've sent a password reset link to your email address. Click the link to create a new password.
            </p>

            <div className="space-y-4">
              {[
                { icon: '📧', title: 'Check Your Inbox', desc: 'Look for our email' },
                { icon: '⏰', title: 'Link Expires Soon', desc: 'Valid for 24 hours' },
                { icon: '🔒', title: 'Secure Process', desc: 'Your account is protected' }
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

        {/* Right Side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-0">
          <div className="w-full max-w-md">
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">SaaS Hub</span>
              </div>
            </div>

            {/* Card */}
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl text-center">
              
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 dark:bg-green-900/40 rounded-full mb-6 border-2 border-green-500/50 mx-auto">
                <CheckCircle className="w-12 h-12 text-green-400 animate-bounce" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Email Sent! 🎉
              </h2>

              <p className="text-gray-300 mb-2">
                We've sent a password reset link to:
              </p>
              <p className="text-purple-300 font-semibold mb-6 break-all">
                {email}
              </p>

              <div className="bg-blue-500/10 dark:bg-blue-900/20 border border-blue-500/30 dark:border-blue-800/50 backdrop-blur-sm p-4 rounded-xl mb-8">
                <div className="space-y-2 text-left">
                  <p className="text-sm text-blue-300 dark:text-blue-200">
                    <strong>📋 What to do next:</strong>
                  </p>
                  <ul className="text-xs text-blue-300 dark:text-blue-200 space-y-1 ml-2">
                    <li>✓ Check your inbox for our email</li>
                    <li>✓ Click the reset link (valid for 24 hours)</li>
                    <li>✓ Create a new password</li>
                    <li>✓ Sign in with your new password</li>
                  </ul>
                  <p className="text-xs text-blue-300 dark:text-blue-200 mt-3 pt-3 border-t border-blue-500/30">
                    💡 <strong>Tip:</strong> Check your spam or promotions folder if you don't see the email
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                    setError('');
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold transition transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Send Another Email</span>
                  <Mail className="w-5 h-5" />
                </button>

                <Link
                  to="/login"
                  className="block w-full border-2 border-white/20 dark:border-gray-600 text-white dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 py-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>

            {/* Bottom Info */}
            <p className="text-center text-gray-500 text-xs mt-6">
              Didn't receive the email? Try checking your spam folder or requesting a new link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form State
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
            Password <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">Recovery</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-md">
            Don't worry! It happens to the best of us. We'll help you reset your password in just a few steps.
          </p>

          <div className="space-y-4">
            {[
              { icon: '📧', title: 'Enter Your Email', desc: 'We\'ll send a reset link' },
              { icon: '🔗', title: 'Click the Link', desc: 'Valid for 24 hours' },
              { icon: '🔐', title: 'Create New Password', desc: 'Make it strong & unique' }
            ].map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <p className="font-semibold text-white">{step.title}</p>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="relative z-10">
          <p className="text-gray-400 text-sm">
            Remember your password? <Link to="/login" className="text-purple-300 hover:text-purple-200 font-semibold transition">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-gray-400">We'll help you recover your account</p>
          </div>

          {/* Card */}
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-8 shadow-2xl">
            
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 dark:bg-purple-900/40 rounded-xl mb-4 border-2 border-purple-500/30">
                <Mail className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-400">No worries! Enter your email and we'll send you reset instructions.</p>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 dark:text-gray-200 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-gray-700/20 border border-white/10 dark:border-gray-600/30 rounded-xl text-white dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition duration-200 backdrop-blur-sm"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Enter the email address associated with your account</p>
              </div>

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
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-500/10 dark:bg-blue-900/20 border border-blue-500/30 dark:border-blue-800/50 p-4 rounded-lg">
              <p className="text-xs text-blue-300 dark:text-blue-200">
                💡 <strong>Note:</strong> You'll receive an email with a reset link that expires in 24 hours. Check your spam folder if you don't see it.
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
            🔒 Your email is safe and secure. We never share it with anyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;