// frontend/src/pages/SubscriptionPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import subscriptionService from '../services/subscriptionService';

const SubscriptionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const planDetails = {
    FREE: {
      name: 'Free',
      price: 0,
      billing: '/month',
      description: 'Perfect for getting started',
      features: [
        '5 Users',
        '1,000 API Calls/month',
        'Basic Support',
        'Community Access',
      ],
      color: 'gray',
      popular: false,
    },
    BASIC: {
      name: 'Basic',
      price: 29.99,
      billing: '/month',
      description: 'Great for small teams',
      features: [
        '25 Users',
        '10,000 API Calls/month',
        'Email Support',
        'Basic Analytics',
        'Custom Branding',
      ],
      color: 'blue',
      popular: false,
    },
    PRO: {
      name: 'Pro',
      price: 99.99,
      billing: '/month',
      description: 'Best for growing businesses',
      features: [
        '100 Users',
        '50,000 API Calls/month',
        'Priority Support',
        'Advanced Analytics',
        'Custom Branding',
        'API Access',
        'Webhooks',
      ],
      color: 'purple',
      popular: true,
    },
    ENTERPRISE: {
      name: 'Enterprise',
      price: 299.99,
      billing: '/month',
      description: 'For large-scale operations',
      features: [
        'Unlimited Users',
        'Unlimited API Calls',
        '24/7 Phone Support',
        'Advanced Analytics',
        'Custom Branding',
        'Full API Access',
        'Webhooks',
        'Dedicated Account Manager',
        'Custom Integrations',
        'SLA Guarantee',
      ],
      color: 'gradient',
      popular: false,
    },
  };

  useEffect(() => {
    if (user && user.tenantId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [subData, plansData] = await Promise.all([
        subscriptionService.getSubscription(user.tenantId),
        subscriptionService.getPlans()
      ]);
      
      setCurrentSubscription(subData);
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching data:', error);
      addToast('Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName) => {
    if (window.confirm(`Upgrade to ${planDetails[planName].name} plan?`)) {
      setUpgrading(true);
      try {
        await subscriptionService.changePlan(user.tenantId, planName);
        addToast(`Successfully upgraded to ${planDetails[planName].name} plan!`, 'success');
        fetchData();
      } catch (error) {
        console.error('Error upgrading plan:', error);
        addToast('Failed to upgrade plan. Please try again.', 'error');
      } finally {
        setUpgrading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Current Plan:{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
                {currentSubscription?.plan || 'Loading...'}
              </span>
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {currentSubscription && `Renewal Date: ${new Date(currentSubscription.renewalDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      </header>

      {/* Pricing Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading plans...</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 md:grid-cols-2">
              {plans.map((plan) => {
                const details = planDetails[plan];
                const isCurrent = currentSubscription?.plan === plan;
                const currentPlanPrice = planDetails[currentSubscription?.plan]?.price || 0;
                const isUpgrade = currentPlanPrice < details.price;
                
                return (
                  <div
                    key={plan}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                      details.popular ? 'ring-4 ring-primary-500 md:scale-105' : ''
                    }`}
                  >
                    {/* Popular Badge */}
                    {details.popular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 text-sm font-bold rounded-bl-lg shadow-lg">
                        🌟 POPULAR
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {isCurrent && (
                      <div className="absolute top-0 left-0 bg-green-500 dark:bg-green-600 text-white px-4 py-2 text-sm font-bold rounded-br-lg shadow-lg">
                        ✓ CURRENT
                      </div>
                    )}

                    <div className="p-8">
                      {/* Plan Name */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {details.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {details.description}
                      </p>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline">
                          <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                            ${details.price.toFixed(2)}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            {details.billing}
                          </span>
                        </div>
                        {details.price > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Billed monthly • Cancel anytime
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {details.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleUpgrade(plan)}
                        disabled={isCurrent || upgrading || !isUpgrade}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                          isCurrent
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : isUpgrade
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {upgrading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            </svg>
                            Upgrading...
                          </>
                        ) : isCurrent ? (
                          '✓ Current Plan'
                        ) : isUpgrade ? (
                          '⬆️ Upgrade Now'
                        ) : (
                          '⬇️ Downgrade'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Table */}
            <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📊 Detailed Comparison
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Feature
                      </th>
                      {plans.map((plan) => (
                        <th 
                          key={plan} 
                          className={`px-8 py-4 text-center text-sm font-semibold ${
                            planDetails[plan].popular
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-300'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {planDetails[plan].name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-8 py-4 text-sm font-medium text-gray-900 dark:text-white">Price</td>
                      {plans.map((plan) => (
                        <td 
                          key={plan}
                          className={`px-8 py-4 text-center text-sm font-bold ${
                            planDetails[plan].popular
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          ${planDetails[plan].price.toFixed(2)}/mo
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-8 py-4 text-sm font-medium text-gray-900 dark:text-white">Users</td>
                      {plans.map((plan) => (
                        <td 
                          key={plan}
                          className={`px-8 py-4 text-center text-sm ${
                            planDetails[plan].popular
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {planDetails[plan].features[0]}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-8 py-4 text-sm font-medium text-gray-900 dark:text-white">API Calls</td>
                      {plans.map((plan) => (
                        <td 
                          key={plan}
                          className={`px-8 py-4 text-center text-sm ${
                            planDetails[plan].popular
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {planDetails[plan].features[1]}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-8 py-4 text-sm font-medium text-gray-900 dark:text-white">Support</td>
                      {plans.map((plan) => (
                        <td 
                          key={plan}
                          className={`px-8 py-4 text-center text-sm ${
                            planDetails[plan].popular
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {planDetails[plan].features[2]}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Current Usage Section */}
            {currentSubscription && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {currentSubscription.usersCount || 0}
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-3">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 19H9a6 6 0 016-6v0a6 6 0 016 6v0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Calls (This Month)</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {currentSubscription.apiCallsThisMonth || 0}
                      </p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-3">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Renewal Date</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {new Date(currentSubscription.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/40 rounded-full p-3">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            ❓ Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Can I change plans anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! All new accounts get a 14-day free trial on any paid plan, no credit card required.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Can I cancel anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely! There are no long-term contracts or cancellation fees. Cancel anytime from your account settings.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">What happens if I exceed my API calls?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We'll notify you when you're approaching your limit. You can upgrade to a higher plan or purchase additional calls.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Do you offer bulk discounts?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! Contact our sales team for custom pricing on Enterprise plans and large commitments.
              </p>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Need Help Choosing?</h3>
          <p className="text-primary-100 mb-6">
            Our team is here to help you find the perfect plan for your needs.
          </p>
          <button className="px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
            📧 Contact Our Team
          </button>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;