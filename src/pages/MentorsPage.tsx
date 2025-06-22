import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Users, Clock, ArrowRight, Loader2, Plus, BarChart3, MessageCircle } from 'lucide-react';
import { useMentors } from '../hooks/useMentors';
import { useAuth } from '../contexts/AuthContext';

const MentorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState<'pre-built' | 'personalized'>('pre-built');
  const { mentors, loading } = useMentors();
  const { user } = useAuth();

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'business', name: 'Business' },
    { id: 'tech', name: 'Technology' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'creative', name: 'Creative' },
    { id: 'education', name: 'Education' }
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           mentor.expertise.some(skill => 
                             skill.toLowerCase().includes(selectedCategory.toLowerCase())
                           );
    
    return matchesSearch && matchesCategory;
  });

  // Calculate user's mentor count for creators
  const userMentorCount = user?.isCreator 
    ? mentors.filter(mentor => mentor.creator_id === user.id).length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI
            <span className="text-primary-600"> Mentors</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your path: Learn from expert AI mentors or create your own personalized mentor experience.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveSection('pre-built')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeSection === 'pre-built'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Expert Mentors
              </button>
              <button
                onClick={() => setActiveSection('personalized')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeSection === 'personalized'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Create Your Own
              </button>
            </div>
          </div>
        </div>

        {/* Pre-built Mentors Section */}
        {activeSection === 'pre-built' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Expert AI Mentors</h2>
              <p className="text-gray-600">Learn from the best. Connect with AI mentors ready to share their expertise.</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mentors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-8">
              <p className="text-gray-600">
                {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Mentors Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMentors.map((mentor) => (
                <div key={mentor.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2 overflow-hidden">
                  <div className="relative">
                    <img
                      src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop`}
                      alt={mentor.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
                      <Star className="h-4 w-4 text-accent-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">4.9</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{mentor.name}</h3>
                      <p className="text-primary-600 font-medium">{mentor.title}</p>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {mentor.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.expertise.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{mentor.subscribers_count} subscribers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Available now</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                        ${mentor.price}
                        <span className="text-sm font-normal text-gray-500">/month</span>
                      </div>
                      <Link
                        to={`/mentors/${mentor.id}`}
                        className="group flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 font-medium"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for Pre-built Mentors */}
            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters to find more mentors.'
                    : 'No expert mentors available yet. Check back soon!'
                  }
                </p>
                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Personalized Mentors Section */}
        {activeSection === 'personalized' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Personalized AI Mentor</h2>
              <p className="text-gray-600">Build a custom AI mentor tailored to your specific needs and goals.</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Conversations</h3>
                  <p className="text-gray-600 text-sm">Train your AI mentor to communicate in your preferred style and focus on your specific interests.</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Learning</h3>
                  <p className="text-gray-600 text-sm">Get advice and guidance that adapts to your learning pace and personal goals.</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
                  <p className="text-gray-600 text-sm">Monitor your learning journey with insights and recommendations from your personal AI mentor.</p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Create Your Personal AI Mentor?</h3>
                <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                  Whether you're learning a new skill, advancing your career, or pursuing personal growth, 
                  a personalized AI mentor can provide the guidance you need, when you need it.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {user ? (
                    <button
                      className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold shadow-lg"
                      onClick={() => {
                        // TODO: Implement personalized mentor creation
                        alert('Personalized mentor creation coming soon!');
                      }}
                    >
                      Create My Mentor
                    </button>
                  ) : (
                    <Link
                      to="/signup"
                      className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold shadow-lg"
                    >
                      Get Started
                    </Link>
                  )}
                  <button
                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-300 font-semibold"
                    onClick={() => {
                      // TODO: Implement learn more functionality
                      alert('Learn more functionality coming soon!');
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </div>

              {/* Creator Section */}
              {user?.isCreator && (
                <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="text-center md:text-left">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Creator Tools
                        {userMentorCount > 0 && (
                          <span className="ml-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                            {userMentorCount} mentor{userMentorCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600">
                        {userMentorCount > 0 
                          ? `Manage your ${userMentorCount} mentor${userMentorCount !== 1 ? 's' : ''} or create a new expert mentor`
                          : 'Create an AI mentor to share your expertise and monetize your knowledge'
                        }
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/create-mentor"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Create Expert Mentor</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsPage;
