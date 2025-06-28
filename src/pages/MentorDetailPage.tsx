import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Users, 
  Clock, 
  MessageCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MentorChat from '../components/MentorChat';
import { sampleMentors } from '../lib/sampleMentors';
import toast from 'react-hot-toast';

const MentorDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMentor();
      checkSubscription();
    }
  }, [id, user]);

  const fetchMentor = async () => {
    try {
      // Check if this is a sample mentor first
      if (id?.startsWith('sample-')) {
        const sampleMentor = sampleMentors.find(m => m.id === id);
        if (sampleMentor) {
          setMentor(sampleMentor);
          setLoading(false);
          return;
        }
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          *,
          profiles:creator_id (
            name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setMentor(data);
    } catch (error) {
      console.error('Error fetching mentor:', error);
      toast.error('Mentor not found');
      navigate('/mentors');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    // For sample mentors, allow free access for demo purposes
    if (id?.startsWith('sample-')) {
      setHasSubscription(true);
      return;
    }

    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('mentor_id', id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setHasSubscription(!!data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // For sample mentors, just simulate subscription
    if (id?.startsWith('sample-')) {
      setHasSubscription(true);
      toast.success('Demo access granted! Try the AI mentor now.');
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          mentor_id: id!,
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      // Update mentor subscriber count
      await supabase.rpc('increment_mentor_subscribers', {
        mentor_id: id!
      });

      setHasSubscription(true);
      toast.success('Successfully subscribed!');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Error subscribing to mentor');
    }
  };

  // This function was moved to MentorChat component

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading mentor...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor not found</h2>
          <p className="text-gray-600">The mentor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mentor Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="relative">
                <img
                  src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop`}
                  alt={mentor.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Online</span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{mentor.name}</h1>
                  <p className="text-primary-600 font-semibold">{mentor.title}</p>
                </div>

                <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-accent-500 fill-current" />
                    <span className="font-medium">4.9</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{mentor.subscribers_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>24/7</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${mentor.price}
                    <span className="text-lg font-normal text-gray-500">/month</span>
                  </div>
                  {hasSubscription ? (
                    <div className="w-full px-6 py-3 bg-green-100 text-green-800 rounded-xl font-semibold text-center">
                      {id?.startsWith('sample-') ? '✓ Demo Access' : '✓ Subscribed'}
                    </div>
                  ) : (
                    <button 
                      onClick={handleSubscribe}
                      className="w-full px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 font-semibold"
                    >
                      {id?.startsWith('sample-') ? 'Try Free Demo' : 'Subscribe Now'}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {mentor.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {!hasSubscription ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] flex flex-col items-center justify-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {id?.startsWith('sample-') ? 'Try Free Demo' : 'Subscribe to Start Chatting'}
                </h3>
                <p className="text-gray-600 mb-4 text-center max-w-md">
                  {id?.startsWith('sample-') 
                    ? `Try ${mentor.name} AI for free! Experience the power of personalized AI mentorship.`
                    : `Subscribe to ${mentor.name} to start having AI-powered conversations and get personalized mentorship.`
                  }
                </p>
                <button 
                  onClick={handleSubscribe}
                  className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 font-semibold"
                >
                  {id?.startsWith('sample-') ? 'Start Free Demo' : `Subscribe for $${mentor.price}/month`}
                </button>
              </div>
            ) : (
              <div className="h-[600px]">
                <MentorChat mentor={mentor} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;