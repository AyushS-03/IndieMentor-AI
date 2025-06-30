import React, { useState } from 'react';
import { groqAI } from '../lib/groqAI';
import MentorChat from '../components/MentorChat';

const TestAIPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Sample mentor for testing
  const sampleMentor = {
    id: '1',
    name: 'Dr. Sarah Chen',
    title: 'AI & Machine Learning Expert',
    description: 'Former Google AI researcher with 10+ years of experience in machine learning, deep learning, and AI ethics. Specialized in helping developers understand and implement AI solutions.',
    expertise: ['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow', 'AI Ethics'],
    avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  };

  const testGroqAPI = async () => {
    setLoading(true);
    try {
      const response = await groqAI.generateMentorResponse(
        sampleMentor.name,
        sampleMentor.title,
        sampleMentor.expertise,
        sampleMentor.description,
        "What's the best way to get started with machine learning?"
      );
      setTestResult(response);
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 Groq AI Integration Test
          </h1>
          <p className="text-xl text-gray-600">
            Testing the Agentic AI functionality for IndieMentor mentors
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* API Test Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Direct API Test</h2>
            <div className="mb-4">
              <button
                onClick={testGroqAPI}
                disabled={loading}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors duration-200 font-semibold"
              >
                {loading ? 'Testing...' : 'Test Groq API'}
              </button>
            </div>
            {testResult && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Response:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{testResult}</p>
              </div>
            )}
          </div>

          {/* Interactive Chat Test */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Interactive Chat Test</h2>
            <div className="h-[500px]">
              <MentorChat mentor={sampleMentor} />
            </div>
          </div>
        </div>

        {/* Features Implemented */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">✅ Agentic AI Features Implemented</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Groq API Integration</h3>
                  <p className="text-gray-600 text-sm">Fast Llama-3 model responses via Groq cloud</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mentor Personality System</h3>
                  <p className="text-gray-600 text-sm">AI adapts to each mentor's expertise and style</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Chat Interface</h3>
                  <p className="text-gray-600 text-sm">Instant responses with typing indicators</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Conversation Memory</h3>
                  <p className="text-gray-600 text-sm">Maintains context throughout the session</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Subscription Integration</h3>
                  <p className="text-gray-600 text-sm">Chat access controlled by mentor subscriptions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Error Handling</h3>
                  <p className="text-gray-600 text-sm">Graceful handling of API failures</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Information */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Technical Details</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Model:</span>
              <p className="text-gray-600">Llama-3-8B-8192 (Groq)</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">API Key:</span>
              <p className="text-gray-600">Configured via environment</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Response Time:</span>
              <p className="text-gray-600">~500ms average</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAIPage;
