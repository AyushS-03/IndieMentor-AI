import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  BarChart3, 
  Users, 
  DollarSign, 
  MessageCircle,
  Video,
  Settings,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mentors' | 'analytics' | 'settings'>('overview');
  const [mentors, setMentors] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    subscribers: 0,
    conversations: 0,
    mentors: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch user's mentors
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (mentorsError) throw mentorsError;

      setMentors(mentorsData || []);

      // Calculate stats
      const totalRevenue = mentorsData?.reduce((sum, mentor) => sum + mentor.revenue, 0) || 0;
      const totalSubscribers = mentorsData?.reduce((sum, mentor) => sum + mentor.subscribers_count, 0) || 0;
      const totalConversations = mentorsData?.reduce((sum, mentor) => sum + mentor.conversations_count, 0) || 0;

      setStats({
        totalRevenue,
        subscribers: totalSubscribers,
        conversations: totalConversations,
        mentors: mentorsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const toggleMentorStatus = async (mentorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('mentors')
        .update({ status: newStatus })
        .eq('id', mentorId);

      if (error) throw error;

      toast.success(`Mentor ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating mentor status:', error);
      toast.error('Error updating mentor status');
    }
  };

  const deleteMentor = async (mentorId: string) => {
    if (!confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mentors')
        .delete()
        .eq('id', mentorId);

      if (error) throw error;

      toast.success('Mentor deleted successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting mentor:', error);
      toast.error('Error deleting mentor');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'mentors', name: 'My Mentors', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Dashboard</h1>
            <p className="text-gray-600">Manage your AI mentors and track your success</p>
          </div>
          <Link
            to="/create-mentor"
            className="group mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Mentor</span>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-primary-600 bg-primary-50'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-secondary-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-secondary-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-secondary-500 mr-1" />
                  <span className="text-sm text-secondary-600 font-medium">+12% from last month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subscribers</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.subscribers}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-secondary-500 mr-1" />
                  <span className="text-sm text-secondary-600 font-medium">+8% from last month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversations</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.conversations.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-accent-100 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-secondary-500 mr-1" />
                  <span className="text-sm text-secondary-600 font-medium">+15% from last month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Mentors</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.mentors}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">
                    {mentors.filter(m => m.status === 'active').length} active, {mentors.filter(m => m.status === 'draft').length} draft
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {mentors.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your First AI Mentor</h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first AI mentor and start monetizing your expertise.
                </p>
                <Link
                  to="/create-mentor"
                  className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Mentor
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="space-y-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop`}
                      alt={mentor.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                      <p className="text-primary-600 font-medium">{mentor.title}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{mentor.subscribers_count} subscribers</span>
                        <span>${mentor.revenue} revenue</span>
                        <span>{mentor.conversations_count} conversations</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      mentor.status === 'active'
                        ? 'bg-secondary-100 text-secondary-800'
                        : mentor.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mentor.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/mentor/${mentor.id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button 
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleMentorStatus(mentor.id, mentor.status)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                        title={mentor.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {mentor.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => deleteMentor(mentor.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {mentors.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mentors Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first AI mentor to start earning from your expertise.
                </p>
                <Link
                  to="/create-mentor"
                  className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Mentor
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 mb-6">
              Detailed insights and performance metrics for your AI mentors coming soon.
            </p>
            <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium">
              Request Early Access
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
            <p className="text-gray-600 mb-6">
              Manage your profile, billing, and notification preferences.
            </p>
            <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium">
              Update Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;