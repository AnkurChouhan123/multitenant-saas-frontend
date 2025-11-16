// frontend/src/pages/SubscriptionPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import subscriptionService from '../services/subscriptionService';

const SubscriptionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
      features: [
        'Unlimited Users',
        'Unlimited API Calls',
        '24/7 Support',
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName) => {
    if (window.confirm(`Upgrade to ${planName} plan?`)) {
      setUpgrading(true);
      try {
        await subscriptionService.changePlan(user.tenantId, planName);
        alert('Plan upgraded successfully!');
        fetchData();
      } catch (error) {
        alert('Failed to upgrade plan. Please try again.');
      } finally {
        setUpgrading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
            <p className="mt-2 text-lg text-gray-600">
              Current Plan: <span className="font-semibold text-primary-600">{currentSubscription?.plan}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Pricing Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 md:grid-cols-2">
            {plans.map((plan) => {
            const details = planDetails[plan];
            const isCurrent = currentSubscription?.plan === plan;
            const isUpgrade = planDetails[currentSubscription?.plan]?.price < details.price;
            
            return (
              <div
                key={plan}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  details.popular ? 'ring-4 ring-primary-500' : ''
                }`}
              >
                {/* Popular Badge */}
                {details.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    POPULAR
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-br-lg">
                    CURRENT PLAN
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {details.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold text-gray-900">
                      ${details.price}
                    </span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {details.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrent || upgrading || !isUpgrade}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      isCurrent
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isUpgrade
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 transform hover:scale-105'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isCurrent
                      ? 'Current Plan'
                      : isUpgrade
                      ? 'Upgrade Now'
                      : 'Downgrade'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards and PayPal.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">Yes! All new accounts get a 14-day free trial.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Absolutely. No long-term contracts or cancellation fees.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;