import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Users, 
  Clock, 
  Send, 
  Mic, 
  Video, 
  Phone,
  CheckCircle,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations';
import toast from 'react-hot-toast';

const MentorDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false);
  
  const { messages, isTyping, sendMessage, loadOrCreateConversation } = useConversations(id);

  useEffect(() => {
    if (id) {
      fetchMentor();
      if (user) {
        checkSubscription();
      }
    }
  }, [id, user]);

  const fetchMentor = async () => {
    try {
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

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (!hasSubscription) {
      toast.error('Please subscribe to chat with this mentor');
      return;
    }

    await sendMessage(message);
    setMessage('');
  };

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
                      ✓ Subscribed
                    </div>
                  ) : (
                    <button 
                      onClick={handleSubscribe}
                      className="w-full px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 font-semibold"
                    >
                      Subscribe Now
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <img
                    src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop`}
                    alt={mentor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{mentor.name} AI</h3>
                    <p className="text-sm text-gray-500">Responds instantly</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200">
                    <Phone className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!hasSubscription ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscribe to Start Chatting</h3>
                    <p className="text-gray-600 mb-4">
                      Subscribe to {mentor.name} to start having conversations and get personalized mentorship.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.length === 0 && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                          <img
                            src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop`}
                            alt={mentor.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-900">
                            <p className="text-sm leading-relaxed">
                              Hi! I'm {mentor.name}'s AI mentor. I'm here to help you with {mentor.expertise[0].toLowerCase()}. What would you like to discuss today?
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                          {msg.sender === 'mentor' && (
                            <img
                              src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop`}
                              alt={mentor.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              msg.sender === 'user'
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3">
                          <img
                            src={mentor.avatar_url || `https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop`}
                            alt={mentor.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={hasSubscription ? `Ask ${mentor.name} anything...` : "Subscribe to start chatting..."}
                      disabled={!hasSubscription}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-primary-600 transition-colors duration-200">
                      <Mic className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || !hasSubscription}
                    className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {hasSubscription 
                    ? `Press Enter to send • This AI mentor is trained on ${mentor.name}'s expertise`
                    : 'Subscribe to start chatting with this AI mentor'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;