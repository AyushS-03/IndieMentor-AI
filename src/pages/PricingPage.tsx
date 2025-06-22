import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Check, 
  X, 
  Zap, 
  Crown, 
  Rocket, 
  ArrowRight,
  Users,
  MessageCircle,
  Video,
  Mic,
  BarChart3,
  Shield
} from 'lucide-react';

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Determine the correct action link based on user state
  const getActionLink = (isFreePlan = false) => {
    if (!user) {
      return '/signup';
    }
    if (user.isCreator) {
      return isFreePlan ? '/dashboard' : '/dashboard'; // Already a creator
    }
    return '/pricing'; // Authenticated but not a creator - stay on pricing to upgrade
  };

  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      description: 'Perfect for individuals getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: 'gray',
      popular: false,
      features: [
        { name: 'Access to 3 AI mentors', included: true },
        { name: '50 messages per month', included: true },
        { name: 'Text conversations only', included: true },
        { name: 'Basic support', included: true },
        { name: 'Voice conversations', included: false },
        { name: 'Video conversations', included: false },
        { name: 'Create AI mentors', included: false },
        { name: 'Analytics dashboard', included: false }
      ]
    },
    {
      name: 'Pro',
      icon: Crown,
      description: 'Ideal for serious learners and professionals',
      monthlyPrice: 29,
      yearlyPrice: 290,
      color: 'primary',
      popular: true,
      features: [
        { name: 'Access to all AI mentors', included: true },
        { name: 'Unlimited messages', included: true },
        { name: 'Text, voice & video conversations', included: true },
        { name: 'Priority support', included: true },
        { name: 'Conversation history', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Create AI mentors', included: false },
        { name: 'Analytics dashboard', included: false }
      ]
    },
    {
      name: 'Creator',
      icon: Rocket,
      description: 'For creators building and monetizing AI mentors',
      monthlyPrice: 99,
      yearlyPrice: 990,
      color: 'secondary',
      popular: false,
      features: [
        { name: 'Everything in Pro', included: true },
        { name: 'Create unlimited AI mentors', included: true },
        { name: 'Voice & video cloning', included: true },
        { name: 'Custom branding', included: true },
        { name: 'Revenue analytics', included: true },
        { name: 'Subscriber management', included: true },
        { name: 'API access', included: true },
        { name: '24/7 priority support', included: true }
      ]
    }
  ];

  const faqs = [
    {
      question: 'How does the AI mentor creation work?',
      answer: 'Our platform uses advanced AI to analyze your content, voice samples, and video to create a personalized AI mentor that captures your expertise and communication style.'
    },
    {
      question: 'Can I monetize my AI mentor?',
      answer: 'Yes! Creator plan subscribers can set subscription prices for their AI mentors and earn revenue from subscribers who interact with their AI.'
    },
    {
      question: 'What kind of content can I upload?',
      answer: 'You can upload videos, audio recordings, documents, presentations, and other materials that represent your expertise and knowledge.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All paid plans come with a 14-day free trial. You can also start with our free Starter plan to explore the platform.'
    },
    {
      question: 'How realistic are the AI conversations?',
      answer: 'Our AI mentors use state-of-the-art voice cloning and video generation to provide highly realistic and personalized interactions that feel natural.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely! You can cancel your subscription at any time. Your access will continue until the end of your billing period.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent block">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're here to learn from AI mentors or create your own, we have a plan that fits your needs and budget.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                billingCycle === 'yearly'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-secondary-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const monthlyPrice = billingCycle === 'yearly' ? Math.round(price / 12) : price;
              
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 ${
                    plan.popular
                      ? 'border-primary-500 ring-4 ring-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 rounded-lg ${
                        plan.color === 'gray' ? 'bg-gray-100' :
                        plan.color === 'primary' ? 'bg-primary-100' :
                        'bg-secondary-100'
                      }`}>
                        <plan.icon className={`h-6 w-6 ${
                          plan.color === 'gray' ? 'text-gray-600' :
                          plan.color === 'primary' ? 'text-primary-600' :
                          'text-secondary-600'
                        }`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    </div>

                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      {price === 0 ? (
                        <div className="text-4xl font-bold text-gray-900">Free</div>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-gray-900">
                            ${monthlyPrice}
                            <span className="text-lg font-normal text-gray-500">/month</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <p className="text-sm text-gray-500 mt-1">
                              Billed annually (${price}/year)
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <Link
                      to={getActionLink(price === 0)}
                      className={`block w-full px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300 mb-8 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                    </Link>

                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <div className={`mt-1 flex-shrink-0 ${
                            feature.included ? 'text-secondary-500' : 'text-gray-300'
                          }`}>
                            {feature.included ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </div>
                          <span className={`text-sm ${
                            feature.included ? 'text-gray-700' : 'text-gray-400'
                          }`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to help you learn and create with AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: 'Intelligent Conversations',
                description: 'Natural, context-aware conversations that feel real and provide genuine value.'
              },
              {
                icon: Video,
                title: 'Realistic Video Avatars',
                description: 'Lifelike video responses using advanced AI that captures appearance and mannerisms.'
              },
              {
                icon: Mic,
                title: 'Voice Cloning',
                description: 'Perfect voice replication that maintains unique tone and speech patterns.'
              },
              {
                icon: Users,
                title: 'Community Building',
                description: 'Build engaged communities around your expertise with group features.'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Detailed insights into engagement, revenue, and mentor performance.'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level security and privacy protection for all your data.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="inline-flex p-2 bg-primary-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about IndieMentor AI
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users already transforming their learning and teaching experience with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={getActionLink(false)}
              className="group px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/mentors"
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-300 font-semibold text-lg"
            >
              Explore Mentors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;