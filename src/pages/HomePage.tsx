import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Video, 
  Mic, 
  DollarSign, 
  Users, 
  Zap, 
  ArrowRight,
  Play,
  Star,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Determine where "Start Creating" should go based on auth state
  const getStartCreatingLink = () => {
    if (!user) {
      return '/signup'; // Not logged in - go to signup
    }
    if (user.isCreator) {
      return '/create-mentor'; // Already a creator - go to create mentor
    }
    return '/pricing'; // Logged in but not a creator - go to pricing
  };

  const getStartCreatingText = () => {
    if (!user) {
      return 'Start Creating';
    }
    if (user.isCreator) {
      return 'Create AI Mentor';
    }
    return 'Become a Creator';
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50`}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Clone Yourself Into an
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent block">
                AI Mentor
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your expertise into an AI-powered mentor. Let creators and learners interact with your personalized AI through voice, video, and intelligent conversations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to={getStartCreatingLink()}
                className="group px-8 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>{getStartCreatingText()}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <button className="group px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl border border-gray-200">
                <Play className="h-5 w-5 text-primary-500" />
                <span>Watch Demo</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-secondary-500" />
                <span>No coding required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-secondary-500" />
                <span>Voice & Video AI</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-secondary-500" />
                <span>Monetize instantly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Brain className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="absolute top-32 right-16 animate-float" style={{ animationDelay: '1s' }}>
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Video className="h-8 w-8 text-secondary-500" />
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Mic className="h-8 w-8 text-accent-500" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Features to
              <span className="text-primary-600"> Scale Your Expertise</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides everything you need to create, manage, and monetize your AI mentor.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Video,
                title: 'Video Conversations',
                description: 'Face-to-face interactions with lifelike video responses that capture your personality and mannerisms.',
                color: 'primary'
              },
              {
                icon: Mic,
                title: 'Voice Cloning',
                description: 'Natural voice synthesis that sounds exactly like you, enabling authentic audio conversations.',
                color: 'secondary'
              },
              {
                icon: Brain,
                title: 'Intelligent Chat',
                description: 'Advanced AI conversations that understand context, remember previous interactions, and provide personalized responses.',
                color: 'accent'
              },
              {
                icon: DollarSign,
                title: 'Monetization',
                description: 'Built-in payment processing and subscription management to start earning from your expertise immediately.',
                color: 'primary'
              },
              {
                icon: Users,
                title: 'Student Management',
                description: 'Track student progress, manage subscriptions, and build lasting relationships with your learners.',
                color: 'secondary'
              },
              {
                icon: Zap,
                title: 'Real-time Analytics',
                description: 'Comprehensive insights into student engagement, revenue, and performance metrics.',
                color: 'accent'
              }
            ].map((feature, index) => (
              <div
                key={index} 
                className="group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2"
              >
                <div className={`inline-flex p-3 rounded-xl mb-6 bg-gradient-to-r ${
                  feature.color === 'primary' ? 'from-primary-500 to-primary-600' :
                  feature.color === 'secondary' ? 'from-secondary-500 to-secondary-600' :
                  'from-accent-500 to-accent-600'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple Steps to
              <span className="text-primary-600"> Powerful Results</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your AI mentor up and running in minutes, not months.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Record Your Knowledge',
                description: 'Share your expertise through voice recordings, video sessions, or text conversations.',
                image: '🎯'
              },
              {
                step: '02',
                title: 'AI Learns Your Style',
                description: 'Our advanced AI analyzes your teaching style, personality, and expertise patterns.',
                image: '🧠'
              },
              {
                step: '03',
                title: 'Start Earning',
                description: 'Your AI mentor goes live, handling conversations and generating revenue 24/7.',
                image: '💰'
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                    {item.image}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white rounded-full px-3 py-1 text-sm font-bold text-primary-600 shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by
              <span className="text-primary-600"> Top Creators</span>
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of experts who are already scaling their impact with AI.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Business Coach',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b3c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                content: 'My AI mentor has allowed me to help 10x more clients while maintaining that personal touch. The revenue growth has been incredible.',
                rating: 5
              },
              {
                name: 'Dr. Michael Chen',
                role: 'Technology Educator',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                content: 'The voice cloning is so accurate that students think they\'re talking to me directly. It\'s revolutionized how I deliver education.',
                rating: 5
              },
              {
                name: 'Emma Rodriguez',
                role: 'Fitness Trainer',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                content: 'Now I can provide 24/7 coaching support to my clients. The platform pays for itself within the first month.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent-500 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Clone Yourself?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join the AI mentor revolution and start monetizing your expertise today. Your digital twin is waiting to be created.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={getStartCreatingLink()}
              className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {getStartCreatingText()}
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

export default HomePage;
